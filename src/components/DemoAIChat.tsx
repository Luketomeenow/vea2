import { useState, useEffect, useRef } from "react";
import { X, Send, Bot, Sparkles, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { MessageContent } from "@/components/dashboard/MessageContent";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface DemoAIChatProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

const DemoAIChat = ({ isOpen, onClose, initialQuery }: DemoAIChatProps) => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState(initialQuery || "");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sampleQueries = [
    "How can VEA help my business?",
    "What features does VEA offer?",
    "Show me pricing information",
    "How does AI assistance work?",
  ];

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Add welcome message when modal opens
      setMessages([{
        id: '1',
        role: 'assistant',
        content: "👋 Hello! I'm VEA's AI Assistant. I can help you understand how VEA can transform your business.\n\n✨ Try asking me about:\n• Features and capabilities\n• Pricing and plans\n• How VEA works\n• Success stories\n\nWhat would you like to know?",
        timestamp: new Date(),
      }]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (initialQuery && isOpen) {
      handleSend(initialQuery);
    }
  }, [isOpen, initialQuery]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (message: string = input) => {
    if (!message.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      // Call n8n webhook (Production)
      const N8N_WEBHOOK_URL = 'https://veaai.app.n8n.cloud/webhook/2cf27f74-6eb7-4bb4-94e9-c03388270e89';
      
      // Generate a demo session ID (persists for this chat session)
      const sessionId = sessionStorage.getItem('demo-chat-session') || `demo-${Date.now()}`;
      sessionStorage.setItem('demo-chat-session', sessionId);

      console.log('🚀 Sending to n8n:', {
        url: N8N_WEBHOOK_URL,
        payload: { message, sessionId }
      });

      // Create AbortController with 5 minute timeout for long-running n8n workflows
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minutes

      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          sessionId: sessionId
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      console.log('📡 n8n Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ n8n Error response:', errorText);
        throw new Error(`n8n responded with ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ n8n Response data:', data);
      console.log('✅ n8n Response type:', Array.isArray(data) ? 'Array' : typeof data);
      console.log('✅ n8n Response structure:', JSON.stringify(data, null, 2));
      
      // Handle different response formats
      let aiResponse = '';
      let imageUrls: string[] = [];
      
      if (Array.isArray(data)) {
        // If it's an array, try to extract the message
        console.log('📦 Response is an array, extracting...');
        const firstItem = data[0];
        console.log('📦 First item:', firstItem);
        
        // Check for images/files from Code Interpreter
        if (firstItem?.images) {
          imageUrls = Array.isArray(firstItem.images) ? firstItem.images : [firstItem.images];
        } else if (firstItem?.files) {
          imageUrls = Array.isArray(firstItem.files) ? firstItem.files : [firstItem.files];
        }
        
        // Try different possible field names
        aiResponse = firstItem?.message || firstItem?.output || firstItem?.text || firstItem?.content || firstItem?.response || JSON.stringify(firstItem);
      } else {
        // Check for images/files in the response
        if (data?.images) {
          imageUrls = Array.isArray(data.images) ? data.images : [data.images];
        } else if (data?.files) {
          imageUrls = Array.isArray(data.files) ? data.files : [data.files];
        }
        
        aiResponse = data?.message || data?.output || data?.text;
        
        if (!aiResponse) {
          console.error('❌ No recognized message field in response:', data);
          throw new Error('No response from AI - unexpected format');
        }
      }

      // If there are images from Code Interpreter, append them to the response
      if (imageUrls.length > 0) {
        console.log('📊 Found Code Interpreter outputs:', imageUrls);
        aiResponse += '\n\n';
        imageUrls.forEach((url, index) => {
          aiResponse += `![Generated Graph ${index + 1}](${url})\n`;
        });
      }

      console.log('💬 Extracted message:', aiResponse);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error: any) {
      console.error('❌ AI Error:', error);
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      // Determine error type and show appropriate message
      let errorContent = '';
      if (error.name === 'AbortError') {
        errorContent = `⏱️ Request Timeout\n\nThe AI is still processing your request but it's taking longer than expected. This can happen with complex queries.\n\nPlease wait a moment and try again, or try a simpler question.`;
      } else {
        errorContent = `⚠️ Connection Error: ${error.message}\n\nPlease check:\n1. Your n8n workflow is active\n2. CORS is enabled in n8n webhook settings\n3. The webhook is returning a JSON response with a "message" field\n\nCheck the browser console for more details.`;
      }
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: errorContent,
        timestamp: new Date(),
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

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div 
          className="bg-slate-900 rounded-2xl shadow-2xl border border-cyan-400/20 w-full max-w-3xl max-h-[85vh] flex flex-col pointer-events-auto animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">VEA AI Assistant</h2>
                <p className="text-sm text-gray-400">Experience the power of VEA</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}
              >
                <div className={`max-w-[80%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                  <div className="flex items-start space-x-2">
                    {message.role === 'assistant' && (
                      <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div className={`p-4 rounded-2xl ${
                      message.role === 'user' 
                        ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white ml-auto' 
                        : 'bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 text-gray-200'
                    }`}>
                      <MessageContent 
                        content={message.content} 
                        className="text-sm whitespace-pre-wrap leading-relaxed"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start animate-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-start space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 p-4 rounded-2xl">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Sample Queries (show only when few messages) */}
          {messages.length <= 2 && (
            <div className="px-6 pb-4">
              <div className="flex flex-wrap gap-2">
                {sampleQueries.map((query, index) => (
                  <button
                    key={index}
                    onClick={() => handleSampleQuery(query)}
                    disabled={isTyping}
                    className="text-xs bg-slate-800/60 hover:bg-slate-700/60 text-gray-300 border border-slate-700/50 rounded-full px-4 py-2 transition-all duration-200 hover:scale-105 disabled:opacity-50"
                  >
                    {query}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-6 border-t border-slate-700/50">
            <div className="flex items-center space-x-3 mb-4">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything about VEA..."
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                disabled={isTyping}
                className="flex-1 bg-slate-800/80 border-slate-700 text-white placeholder:text-gray-500 h-12 px-4 rounded-xl focus:ring-2 focus:ring-cyan-400"
              />
              <Button 
                onClick={() => handleSend()}
                disabled={!input.trim() || isTyping}
                className="bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white h-12 px-6 rounded-xl"
              >
                {isTyping ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </div>

            {/* CTA */}
            <div className="bg-gradient-to-r from-cyan-400/10 to-blue-500/10 rounded-xl p-4 border border-cyan-400/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white mb-1">Love what you see?</p>
                  <p className="text-xs text-gray-400">Sign up now for full access to VEA's AI-powered features!</p>
                </div>
                <Button
                  onClick={() => navigate('/signup')}
                  className="bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white rounded-xl px-6"
                >
                  Start Free Trial
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DemoAIChat;

