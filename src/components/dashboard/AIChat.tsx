import { useState, useEffect, useRef } from "react";
import { Send, Bot, User, Loader2, AlertCircle, Plus, ImageIcon, Video, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { chatApi } from "@/services/api";
import { generateAIResponse } from "@/services/aiService";
import { checkVideoStatus } from "@/services/kieService";
import { uploadMediaFromUrl, generateMediaFileName } from "@/services/storageService";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { MessageContent } from "./MessageContent";

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
  mediaType?: 'image' | 'video';
  mediaUrl?: string;
  isGenerating?: boolean;
  progress?: number;
  isUploadedImage?: boolean;
}

const sampleQueries = [
  "Show me my projects and their status",
  "How's my business health overall?",
  "What tasks do I have pending?",
  "Create a task: Prepare Q1 report",
  "Show me pending invoices",
  "Generate an image of a modern office",
  "Create a video of a business presentation",
  "Upload images and create content from them",
  "Drag & drop multiple images for reference",
];

interface AIChatProps {
  initialQuery?: string | null;
}

export function AIChat({ initialQuery }: AIChatProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasProcessedInitialQuery = useRef(false);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load or create chat session
  useEffect(() => {
    if (user?.id) {
      loadOrCreateSession();
    }
  }, [user]);

  // Handle initial query from Hero section
  useEffect(() => {
    if (initialQuery && currentSessionId && !hasProcessedInitialQuery.current && !isLoadingHistory) {
      hasProcessedInitialQuery.current = true;
      setInput(initialQuery);
      // Auto-send the query after a short delay
      setTimeout(() => {
        handleSend(initialQuery);
      }, 500);
    }
  }, [initialQuery, currentSessionId, isLoadingHistory]);

  const loadOrCreateSession = async () => {
    if (!user?.id) return;

    try {
      setIsLoadingHistory(true);
      setError(null);

      // Get user's most recent session
      const { data: sessions, error: sessionError } = await chatApi.getSessions(user.id);

      if (sessionError) {
        console.error('Session error:', sessionError);
        // Don't block - use temp session
        setCurrentSessionId('temp-session-' + Date.now());
        addWelcomeMessage();
        return;
      }

      let sessionId: string;

      if (sessions && sessions.length > 0) {
        // Use most recent session
        sessionId = sessions[0].id;
        setCurrentSessionId(sessionId);

        // Load messages for this session
        const { data: sessionMessages, error: messagesError } = await chatApi.getMessages(sessionId);
        
        if (messagesError) {
          console.error('Messages error:', messagesError);
          addWelcomeMessage();
          return;
        }

        if (sessionMessages && sessionMessages.length > 0) {
          // Parse metadata to extract media URLs
          const messagesWithMedia = sessionMessages.map(msg => ({
            ...msg,
            mediaType: msg.metadata?.mediaType,
            mediaUrl: msg.metadata?.mediaUrl,
          }));
          setMessages(messagesWithMedia);
        } else {
          // Add welcome message
          addWelcomeMessage();
        }
      } else {
        // Create new session
        const { data: newSession, error: createError } = await chatApi.createSession(
          user.id,
          'New Chat'
        );

        if (createError) {
          console.error('Create session error:', createError);
          // Use temp session instead of blocking
          setCurrentSessionId('temp-session-' + Date.now());
        } else {
          sessionId = newSession.id;
          setCurrentSessionId(sessionId);
        }
        addWelcomeMessage();
      }
    } catch (err: any) {
      console.error('Failed to load chat session:', err);
      // Don't show error banner - just use temp session
      setCurrentSessionId('temp-session-' + Date.now());
      addWelcomeMessage(); // Still show welcome message
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const addWelcomeMessage = () => {
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: "👋 Hello! I'm your AI Assistant with full access to your business data.\n\n✨ I can:\n• Show your projects, tasks, customers, and finances\n• Create tasks and projects for you\n• Analyze your business health\n• Generate images with Kie.ai\n• Create videos with Veo 3\n• Upload multiple images as references\n• Use uploaded images for both image and video generation\n• Provide strategic insights\n\n📎 Tips:\n• Click the upload button or drag & drop images\n• Upload multiple images for better reference\n• Use images as references for both image and video generation\n\nWhat would you like to know?",
      created_at: new Date().toISOString(),
    }]);
  };

  const handleNewChat = async () => {
    if (!user?.id) return;

    try {
      const { data: newSession, error } = await chatApi.createSession(
        user.id,
        'New Chat'
      );

      if (error) throw error;

      setCurrentSessionId(newSession.id);
      addWelcomeMessage();
      toast.success('New chat started');
    } catch (err: any) {
      toast.error('Failed to create new chat');
      console.error(err);
    }
  };

  const handleSend = async (message: string = input) => {
    if (!message.trim() || !user?.id || !currentSessionId) return;

    setError(null); // Clear any previous errors

    const userMessage: Message = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: message,
      created_at: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);
    setError(null);

    try {
      // Save user message to database
      await chatApi.sendMessage(currentSessionId, user.id, message, 'user');

      // Prepare conversation history for AI
      const conversationHistory = messages.slice(-5).map(msg => ({
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content
      }));

      conversationHistory.push({
        role: 'user',
        content: message
      });

      // Get AI response (can be text, image, or video) with function calling support
      // Pass uploaded images as reference if available
      const aiResponse = await generateAIResponse(conversationHistory, user.id, undefined, uploadedImages.length > 0 ? uploadedImages : undefined);

      // Save AI response to database (if session is real)
      let savedMessage = null;
      if (!currentSessionId.startsWith('temp-session-')) {
        const result = await chatApi.sendMessage(
          currentSessionId,
          user.id,
          aiResponse.content,
          'assistant'
        );
        savedMessage = result.data;
      }

      const aiMessage: Message = {
        id: savedMessage?.id || `ai-${Date.now()}`,
        role: 'assistant',
        content: aiResponse.content,
        mediaType: aiResponse.type !== 'text' ? aiResponse.type : undefined,
        mediaUrl: aiResponse.mediaUrl,
        created_at: new Date().toISOString(),
        isGenerating: aiResponse.type === 'video', // Mark video as generating
        progress: 0,
      };

      setMessages(prev => [...prev, aiMessage]);

      // Save image to storage immediately
      if (aiResponse.type === 'image' && aiResponse.mediaUrl && savedMessage) {
        const storageUrl = await saveMediaToStorage(
          savedMessage.id,
          aiResponse.mediaUrl,
          'image'
        );

        if (storageUrl) {
          // Update message with storage URL
          setMessages(prev => prev.map(msg => 
            msg.id === aiMessage.id ? { ...msg, mediaUrl: storageUrl } : msg
          ));
        }
      }

      // If video, start polling for status
      if (aiResponse.type === 'video' && aiResponse.mediaUrl) {
        pollVideoStatus(aiMessage.id, aiResponse.mediaUrl);
      }

    } catch (err: any) {
      console.error('Chat error:', err);
      
      // Show error message in chat (not as a banner)
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ ${err.message || 'Sorry, I encountered an error. Please try again.'}`,
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
      
      // Show toast notification
      toast.error(err.message || 'Failed to get AI response');
    } finally {
      setIsTyping(false);
    }
  };

  const handleSampleQuery = (query: string) => {
    setInput(query);
    handleSend(query);
  };

  // Handle image upload (single or multiple files)
  const handleImageUpload = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    
    // Validate all files
    for (const file of fileArray) {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`);
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 10MB)`);
        return;
      }
    }

    setIsUploading(true);

    try {
      const newImages: string[] = [];
      
      // Process each file
      for (const file of fileArray) {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        newImages.push(dataUrl);
      }

      setUploadedImages(prev => [...prev, ...newImages]);
      setIsUploading(false);
      toast.success(`${newImages.length} image(s) uploaded successfully! You can now use them as references for generation.`);
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Failed to upload images');
      setIsUploading(false);
    }
  };

  // Handle file input change
  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      handleImageUpload(files);
    }
  };

  // Remove uploaded image by index
  const removeUploadedImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  // Clear all uploaded images
  const clearAllUploadedImages = () => {
    setUploadedImages([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle sending message with uploaded images
  const handleSendWithImage = async (message: string = input) => {
    if (!message.trim() || !user?.id || !currentSessionId) return;

    // Store reference images before clearing them
    const currentReferenceImages = [...uploadedImages];

    // If there are uploaded images, add them to the message
    if (uploadedImages.length > 0) {
      // Add each uploaded image as a separate message
      for (const imageUrl of uploadedImages) {
        const userMessage: Message = {
          id: `temp-${Date.now()}-${Math.random()}`,
          role: 'user',
          content: message,
          created_at: new Date().toISOString(),
          mediaType: 'image',
          mediaUrl: imageUrl,
          isUploadedImage: true,
        };

        setMessages(prev => [...prev, userMessage]);
      }
      
      // Clear the uploaded images after sending
      setUploadedImages([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }

    // Continue with normal message handling, but pass reference images
    await handleSendWithReferenceImages(message, currentReferenceImages);
  };

  // Handle sending message with reference images
  const handleSendWithReferenceImages = async (message: string, referenceImages: string[]) => {
    if (!message.trim() || !user?.id || !currentSessionId) return;

    const userMessage: Message = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: message,
      created_at: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);
    setError(null);

    try {
      // Save user message to database
      await chatApi.sendMessage(currentSessionId, user.id, message, 'user');

      // Prepare conversation history for AI
      const conversationHistory = messages.slice(-5).map(msg => ({
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content
      }));

      conversationHistory.push({
        role: 'user',
        content: message
      });

      // Get AI response with reference images
      const aiResponse = await generateAIResponse(conversationHistory, user.id, undefined, referenceImages.length > 0 ? referenceImages : undefined);

      // Save AI response to database (if session is real)
      let savedMessage = null;
      if (!currentSessionId.startsWith('temp-session-')) {
        const result = await chatApi.sendMessage(
          currentSessionId,
          user.id,
          aiResponse.content,
          'assistant'
        );
        savedMessage = result.data;
      }

      const aiMessage: Message = {
        id: savedMessage?.id || `ai-${Date.now()}`,
        role: 'assistant',
        content: aiResponse.content,
        mediaType: aiResponse.type !== 'text' ? aiResponse.type : undefined,
        mediaUrl: aiResponse.mediaUrl,
        created_at: new Date().toISOString(),
        isGenerating: aiResponse.type === 'video', // Mark video as generating
        progress: 0,
      };

      setMessages(prev => [...prev, aiMessage]);

      // Save image to storage immediately
      if (aiResponse.type === 'image' && aiResponse.mediaUrl && savedMessage) {
        const storageUrl = await saveMediaToStorage(
          savedMessage.id,
          aiResponse.mediaUrl,
          'image'
        );

        if (storageUrl) {
          // Update message with storage URL
          setMessages(prev => prev.map(msg => 
            msg.id === aiMessage.id ? { ...msg, mediaUrl: storageUrl } : msg
          ));
        }
      }

      // If video, start polling for status
      if (aiResponse.type === 'video' && aiResponse.mediaUrl) {
        pollVideoStatus(aiMessage.id, aiResponse.mediaUrl);
      }

    } catch (err: any) {
      console.error('Chat error:', err);
      
      // Show error message in chat (not as a banner)
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ ${err.message || 'Sorry, I encountered an error. Please try again.'}`,
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
      
      // Show toast notification
      toast.error(err.message || 'Failed to get AI response');
    } finally {
      setIsTyping(false);
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleImageUpload(files);
    }
  };

  // Helper function to save media to storage and update database
  const saveMediaToStorage = async (
    messageId: string,
    mediaUrl: string,
    mediaType: 'image' | 'video'
  ): Promise<string | null> => {
    if (!user?.id || !currentSessionId || currentSessionId.startsWith('temp-session-')) {
      return null;
    }

    try {
      console.log(`💾 Saving ${mediaType} to storage...`);

      // Determine file extension
      const extension = mediaType === 'image' ? 'png' : 'mp4';
      const bucket = mediaType === 'image' ? 'photos' : 'video';
      
      // Generate unique filename
      const fileName = generateMediaFileName(user.id, mediaType, extension);

      // Upload to Supabase Storage
      const { url: storageUrl, error } = await uploadMediaFromUrl(mediaUrl, bucket, fileName);

      if (error || !storageUrl) {
        console.error('Failed to upload media:', error);
        toast.error(`Failed to save ${mediaType} to storage`);
        return null;
      }

      // Update chat message in database with storage URL
      const { error: updateError } = await supabase
        .from('chat_messages')
        .update({
          metadata: {
            mediaType,
            mediaUrl: storageUrl,
            originalUrl: mediaUrl,
          }
        })
        .eq('id', messageId);

      if (updateError) {
        console.error('Failed to update message with storage URL:', updateError);
        toast.error('Failed to save media to chat history');
        return null;
      }

      console.log(`✅ ${mediaType} saved to storage: ${storageUrl}`);
      toast.success(`${mediaType === 'image' ? 'Image' : 'Video'} saved to your library`);

      return storageUrl;
    } catch (err: any) {
      console.error('Error saving media:', err);
      return null;
    }
  };

  // Poll video generation status
  const pollVideoStatus = async (messageId: string, taskId: string) => {
    const maxAttempts = 30; // 5 minutes max (30 * 10 seconds)
    let attempt = 0;

    const poll = async () => {
      if (attempt >= maxAttempts) {
        // Timeout
        setMessages(prev => prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, isGenerating: false, content: msg.content + '\n\n⏱️ Video generation timed out. Please try again.' }
            : msg
        ));
        return;
      }

      attempt++;

      try {
        // Wait 10 seconds before checking
        await new Promise(resolve => setTimeout(resolve, 10000));

        const statusResult = await checkVideoStatus(taskId);
        console.log(`Video status check ${attempt}/${maxAttempts}:`, statusResult);

        if (statusResult.success && statusResult.data) {
          const status = statusResult.data.status;
          const progress = statusResult.data.progress || 0;

          // Update progress
          setMessages(prev => prev.map(msg => 
            msg.id === messageId 
              ? { ...msg, progress: Math.round(progress * 100) }
              : msg
          ));

          // Check if complete
          if (status === 'SUCCESS' || status === 'completed') {
            const videoUrl = statusResult.data.videoUrl || statusResult.data.url;
            
            if (videoUrl) {
              // Update with original URL first
              setMessages(prev => prev.map(msg => 
                msg.id === messageId 
                  ? { ...msg, isGenerating: false, mediaUrl: videoUrl, progress: 100 }
                  : msg
              ));
              toast.success('Video generated successfully!');

              // Save to storage in background
              if (user?.id && currentSessionId && !currentSessionId.startsWith('temp-session-')) {
                saveMediaToStorage(messageId, videoUrl, 'video').then(storageUrl => {
                  if (storageUrl) {
                    // Update with storage URL
                    setMessages(prev => prev.map(msg => 
                      msg.id === messageId ? { ...msg, mediaUrl: storageUrl } : msg
                    ));
                  }
                });
              }

              return;
            }
          } else if (status === 'FAILED' || status === 'failed') {
            setMessages(prev => prev.map(msg => 
              msg.id === messageId 
                ? { ...msg, isGenerating: false, content: msg.content + '\n\n❌ Video generation failed.' }
                : msg
            ));
            toast.error('Video generation failed');
            return;
          }
        }

        // Continue polling
        poll();
      } catch (error) {
        console.error('Error polling video status:', error);
        poll(); // Retry
      }
    };

    poll();
  };

  if (isLoadingHistory) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border border-border/50">
        <CardContent className="p-6 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading chat history...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 backdrop-blur-sm border border-border/50">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-primary rounded-lg">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">AI Assistant</h2>
              <p className="text-sm text-muted-foreground">Your intelligent business advisor</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleNewChat}>
            <Plus className="w-4 h-4 mr-2" />
            New Chat
          </Button>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Sample Queries */}
        {messages.length <= 1 && (
          <div className="mb-6">
            <p className="text-sm text-muted-foreground mb-3">Try asking me:</p>
            <div className="flex flex-wrap gap-2">
              {sampleQueries.map((query, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSampleQuery(query)}
                  disabled={isTyping}
                  className="text-xs hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  {query}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Chat Messages */}
        <div className="space-y-4 mb-6 max-h-[500px] overflow-y-auto pr-2">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                <div className="flex items-start space-x-2">
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div className={`p-3 rounded-lg ${
                    message.role === 'user' 
                      ? 'bg-primary text-primary-foreground ml-auto' 
                      : 'bg-muted'
                  }`}>
                    <MessageContent 
                      content={message.content} 
                      className="text-sm whitespace-pre-wrap"
                    />
                    
                    {/* Progress indicator for generating media */}
                    {message.isGenerating && (
                      <div className="mt-4 p-4 bg-background/50 rounded-lg border border-border/50">
                        <div className="flex items-center space-x-3 mb-3">
                          {message.mediaType === 'video' ? (
                            <Video className="w-5 h-5 text-primary animate-pulse" />
                          ) : (
                            <ImageIcon className="w-5 h-5 text-primary animate-pulse" />
                          )}
                          <span className="text-sm font-medium">
                            Generating {message.mediaType}... {message.progress || 0}%
                          </span>
                        </div>
                        <Progress value={message.progress || 0} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-2">
                          This may take 30-90 seconds. Please wait...
                        </p>
                      </div>
                    )}
                    
                    {/* Display generated or uploaded image */}
                    {message.mediaType === 'image' && message.mediaUrl && !message.isGenerating && (
                      <div className="mt-3">
                        <img 
                          src={message.mediaUrl} 
                          alt={message.isUploadedImage ? "Uploaded image" : "Generated content"} 
                          className="rounded-lg max-w-full h-auto border border-border"
                          loading="lazy"
                        />
                        {message.isUploadedImage && (
                          <p className="text-xs text-muted-foreground mt-1">
                            📎 Uploaded image - can be used as reference for video generation
                          </p>
                        )}
                      </div>
                    )}
                    
                    {/* Display generated video */}
                    {message.mediaType === 'video' && message.mediaUrl && !message.isGenerating && (
                      <div className="mt-3">
                        <video 
                          src={message.mediaUrl} 
                          controls 
                          className="rounded-lg max-w-full h-auto border border-border"
                          preload="metadata"
                        >
                          Your browser doesn't support video playback.
                        </video>
                      </div>
                    )}
                  </div>
                  {message.role === 'user' && (
                    <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-2">
                <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-muted p-3 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Uploaded Images Preview */}
        {uploadedImages.length > 0 && (
          <div className="mb-4 p-3 bg-muted/50 rounded-lg border border-border/50">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-muted-foreground">
                📎 Uploaded Images ({uploadedImages.length})
              </span>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllUploadedImages}
                  className="h-6 px-2 text-xs"
                >
                  Clear All
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {uploadedImages.map((imageUrl, index) => (
                <div key={index} className="relative group">
                  <img 
                    src={imageUrl} 
                    alt={`Uploaded ${index + 1}`} 
                    className="rounded-lg w-full h-24 object-cover border border-border"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeUploadedImage(index)}
                    className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600 text-white"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              These images will be used as references for generation
            </p>
          </div>
        )}

        {/* Input */}
        <div 
          className={`flex space-x-2 ${isDragOver ? 'ring-2 ring-primary ring-offset-2' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex-1 relative">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                uploadedImages.length > 0 
                  ? `Describe what you want to create using ${uploadedImages.length} reference image(s)...` 
                  : "Ask me about your business or drag & drop images here..."
              }
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendWithImage()}
              disabled={isTyping || !currentSessionId}
              className={`bg-background/50 pr-10 ${isDragOver ? 'border-primary' : ''}`}
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileInputChange}
              className="hidden"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isTyping || isUploading}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
              title="Upload images (multiple supported)"
            >
              {isUploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
            </Button>
          </div>
          <Button 
            onClick={() => handleSendWithImage()} 
            disabled={!input.trim() || isTyping || !currentSessionId}
          >
            {isTyping ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Drag & Drop Overlay */}
        {isDragOver && (
          <div className="absolute inset-0 bg-primary/10 border-2 border-dashed border-primary rounded-lg flex items-center justify-center z-10">
            <div className="text-center">
              <Upload className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium text-primary">Drop images here to upload</p>
            </div>
          </div>
        )}

        {!currentSessionId && (
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Creating chat session...
          </p>
        )}
      </CardContent>
    </Card>
  );
}

