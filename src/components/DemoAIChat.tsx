import { useState, useEffect, useRef } from "react";
import { X, Send, Bot, Sparkles, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";

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

  const getDemoResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('pricing') || lowerMessage.includes('cost') || lowerMessage.includes('price')) {
      return "💰 **VEA Pricing Plans:**\n\n**Starter** - $14.90/month\n• Customer Database\n• Smart Tickets\n• Calendar & Appointments\n\n**VEA Executive** - $29.90/month (Most Popular)\n• Real-time Strategy Insights\n• Full Customer Database\n• Smart Tickets & Work Orders\n• B2B Contacts & Assets\n\n**Enterprise** - Custom pricing\n• Dedicated Success Manager\n• SSO & Advanced Security\n• Custom Integrations\n\n🎉 **14-day free trial available!** No credit card required.";
    }

    if (lowerMessage.includes('feature') || lowerMessage.includes('what') || lowerMessage.includes('capabilities')) {
      return "🚀 **VEA Core Features:**\n\n📊 **Strategy Insights** - Real-time analytics and business intelligence\n\n👥 **Customer Database** - Centralized customer information with linked assets\n\n🎫 **Smart Tickets** - Collaborative work orders with real-time tracking\n\n📅 **Appointments** - Built-in calendar for seamless scheduling\n\n💼 **B2B Contacts** - Manage corporate clients effectively\n\n⚡ **AI-Powered** - Intelligent automation and insights\n\n✨ Plus much more! Would you like to know about any specific feature?";
    }

    if (lowerMessage.includes('how') && (lowerMessage.includes('work') || lowerMessage.includes('ai'))) {
      return "🤖 **How VEA Works:**\n\n**1. One Prompt In** → Describe your needs in plain English\n\n**2. AI Analysis** → VEA understands your business context and requirements\n\n**3. Smart Setup** → Automatic configuration and customization\n\n**4. Launch** → Start using VEA immediately, no technical knowledge required\n\n**AI Assistance includes:**\n• Automated data analysis\n• Intelligent recommendations\n• Task prioritization\n• Business insights\n• Predictive analytics\n\nIt's like having a senior executive on your team 24/7!";
    }

    if (lowerMessage.includes('success') || lowerMessage.includes('result') || lowerMessage.includes('testimonial')) {
      return "⭐ **VEA Success Stories:**\n\n📈 **Average Results:**\n• 47% revenue increase\n• 85% time savings\n• 99.9% customer satisfaction\n\n💬 **What users say:**\n\n\"VEA transformed our business operations completely. We've seen incredible growth in just 3 months!\" - Sarah J., CEO\n\n\"The AI insights are game-changing. It's like having a seasoned advisor available 24/7.\" - Michael C., Founder\n\n🌟 Trusted by 10,000+ business owners in 180+ countries!";
    }

    if (lowerMessage.includes('start') || lowerMessage.includes('trial') || lowerMessage.includes('signup') || lowerMessage.includes('sign up')) {
      return "🎉 **Ready to Get Started?**\n\n✅ **14-day free trial** - No credit card required\n✅ **No contracts** - Cancel anytime\n✅ **Instant setup** - Start in minutes\n\n**What you'll get:**\n• Full access to all features\n• Personalized onboarding\n• 24/7 support\n• AI-powered insights\n\nClick the button below to start your transformation today! 🚀";
    }

    if (lowerMessage.includes('help') || lowerMessage.includes('support')) {
      return "💬 **VEA Support:**\n\n📧 **Email:** support@vea.ai\n📞 **Phone:** 1-800-VEA-HELP\n🌍 **Available:** Worldwide, 24/7\n\n**We offer:**\n• Live chat support\n• Video call assistance\n• Comprehensive documentation\n• Community forums\n• Onboarding sessions\n\nOur team is always ready to help you succeed!";
    }

    // Default response
    return "I'd be happy to help you learn more about VEA! 😊\n\n**Popular topics:**\n• Features and capabilities\n• Pricing and plans\n• How VEA works\n• Success stories\n• Getting started\n\nWhat specific aspect of VEA interests you most? Or feel free to ask me anything!";
  };

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

    // Simulate AI thinking time
    setTimeout(() => {
      const response = getDemoResponse(message);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
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
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
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

