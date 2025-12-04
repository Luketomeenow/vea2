import { useState, useEffect, useRef } from "react";
import { Send, Bot, User, Loader2, AlertCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth";
import { chatApi } from "@/services/api";
import { generateAIResponse } from "@/services/aiService";
import { toast } from "sonner";

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

const sampleQueries = [
  "What should I focus on today?",
  "How is my business performing?",
  "Show me key metrics",
  "What are my priorities?",
];

export function AIChat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  const loadOrCreateSession = async () => {
    if (!user?.id) return;

    try {
      setIsLoadingHistory(true);
      setError(null);

      // Get user's most recent session
      const { data: sessions, error: sessionError } = await chatApi.getSessions(user.id);

      if (sessionError) throw sessionError;

      let sessionId: string;

      if (sessions && sessions.length > 0) {
        // Use most recent session
        sessionId = sessions[0].id;
        setCurrentSessionId(sessionId);

        // Load messages for this session
        const { data: sessionMessages, error: messagesError } = await chatApi.getMessages(sessionId);
        
        if (messagesError) throw messagesError;

        if (sessionMessages && sessionMessages.length > 0) {
          setMessages(sessionMessages);
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

        if (createError) throw createError;

        sessionId = newSession.id;
        setCurrentSessionId(sessionId);
        addWelcomeMessage();
      }
    } catch (err: any) {
      console.error('Failed to load chat session:', err);
      setError(err.message || 'Failed to load chat history');
      addWelcomeMessage(); // Still show welcome message
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const addWelcomeMessage = () => {
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: "Hello! I'm your AI Assistant. I can help you analyze your business data, prioritize tasks, and provide strategic insights. What would you like to know?",
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

      // Get AI response
      const aiResponse = await generateAIResponse(conversationHistory);

      // Save AI response to database
      const { data: savedMessage } = await chatApi.sendMessage(
        currentSessionId,
        user.id,
        aiResponse,
        'assistant'
      );

      const aiMessage: Message = {
        id: savedMessage?.id || `ai-${Date.now()}`,
        role: 'assistant',
        content: aiResponse,
        created_at: new Date().toISOString(),
      };

      setMessages(prev => [...prev, aiMessage]);

    } catch (err: any) {
      console.error('Chat error:', err);
      setError(err.message || 'Failed to get response from AI. Please check your OpenAI API key.');
      
      // Show error message to user
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ ${err.message || 'Sorry, I encountered an error. Please try again.'}`,
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSampleQuery = (query: string) => {
    setInput(query);
    handleSend(query);
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
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
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

        {/* Input */}
        <div className="flex space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me about your business..."
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            disabled={isTyping || !currentSessionId}
            className="bg-background/50"
          />
          <Button 
            onClick={() => handleSend()} 
            disabled={!input.trim() || isTyping || !currentSessionId}
          >
            {isTyping ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>

        {!currentSessionId && (
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Creating chat session...
          </p>
        )}
      </CardContent>
    </Card>
  );
}


















