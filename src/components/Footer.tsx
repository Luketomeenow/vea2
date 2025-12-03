import { useState } from "react";
import { useNavigate } from "react-router-dom";
import veaLogo from "@/assets/vea-logo-2.webp";
import footerBackground from "@/assets/Footer.jpg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, Youtube, Twitter, Github, Linkedin, Instagram, MessageCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import DemoAIChat from "@/components/DemoAIChat";

const Footer = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [input, setInput] = useState("");
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [demoQuery, setDemoQuery] = useState("");

  const sampleQueries = [
    "How's my business health?",
    "Show me my projects",
    "Create a task for Q1 report",
    "Generate an image of modern office",
    "What's my revenue trend?",
    "Show pending invoices",
  ];

  const handleSend = () => {
    if (!input.trim()) return;
    
    // If user is logged in, go to full AI Assistant
    if (user) {
      navigate('/ai-assistant', { state: { aiQuery: input } });
      return;
    }
    
    // Otherwise, open demo modal
    setDemoQuery(input);
    setIsDemoOpen(true);
    setInput("");
  };

  const handleSampleQuery = (query: string) => {
    // If user is logged in, go to full AI Assistant
    if (user) {
      navigate('/ai-assistant', { state: { aiQuery: query } });
      return;
    }
    
    // Otherwise, open demo modal
    setDemoQuery(query);
    setIsDemoOpen(true);
  };

  return (
    <footer className="relative w-full min-h-screen flex flex-col items-center justify-center border-t border-border/20">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src={footerBackground} 
          alt="Footer Background" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/70 via-slate-800/70 to-cyan-900/70" />
      </div>
      
      <div className="relative w-full px-4 sm:px-6 py-24 flex flex-col items-center justify-center flex-1">
        {/* VEA Logo */}
        <div className="mb-16 text-center">
          <div className="flex items-center justify-center mb-6">
            <img src={veaLogo} alt="VEA Logo" className="h-20 w-auto" />
          </div>
          <p className="text-gray-400 text-lg">Your Virtual Executive Assistant</p>
        </div>

        {/* AI Chat Input */}
        <div className="max-w-3xl w-full mx-auto mb-16">
          <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl border-2 border-cyan-200/50 shadow-2xl overflow-hidden">
              <div className="p-8">
              <div className="flex items-center space-x-4 mb-5">
                <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl shadow-lg">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="What can I build for you today?"
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  className="flex-1 bg-gray-50 border-2 border-gray-200 text-gray-900 placeholder:text-gray-500 text-lg h-16 px-6 rounded-2xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                />
                <Button 
                  onClick={handleSend}
                  disabled={!input.trim()}
                  size="lg"
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white h-16 px-10 rounded-2xl shadow-lg hover:shadow-xl transition-all"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>

              {/* Sample Queries */}
              <div className="flex flex-wrap gap-2 justify-center">
                {sampleQueries.map((query, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSampleQuery(query)}
                    className="text-sm bg-gradient-to-r from-cyan-50 to-blue-50 hover:from-cyan-100 hover:to-blue-100 text-gray-700 border-2 border-cyan-200/50 hover:border-cyan-300 rounded-full px-4 py-2 transition-all hover:shadow-md"
                  >
                    {query}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Social Icons & Links */}
        <div className="flex flex-col items-center space-y-6">
          {/* Social Icons */}
          <div className="flex items-center space-x-4">
            <a 
              href="https://youtube.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
            >
              <Youtube className="w-5 h-5 text-white" />
            </a>
            <a 
              href="https://twitter.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
            >
              <Twitter className="w-5 h-5 text-white" />
            </a>
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
            >
              <Github className="w-5 h-5 text-white" />
            </a>
            <a 
              href="https://linkedin.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
            >
              <Linkedin className="w-5 h-5 text-white" />
            </a>
            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
            >
              <Instagram className="w-5 h-5 text-white" />
            </a>
            <a 
              href="#" 
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
            >
              <MessageCircle className="w-5 h-5 text-white" />
            </a>
          </div>

          {/* Terms & Privacy */}
          <div className="flex items-center space-x-4 text-sm">
            <span className="text-gray-500">|</span>
            <a href="#terms" className="text-gray-400 hover:text-white transition-colors">
              Terms
            </a>
            <a href="#privacy" className="text-gray-400 hover:text-white transition-colors">
              Privacy
            </a>
          </div>

          {/* Copyright */}
          <p className="text-gray-500 text-sm">© 2025 VEA. All rights reserved.</p>
        </div>
      </div>

      {/* Demo AI Chat Modal */}
      <DemoAIChat 
        isOpen={isDemoOpen} 
        onClose={() => {
          setIsDemoOpen(false);
          setDemoQuery("");
        }}
        initialQuery={demoQuery}
      />
    </footer>
  );
};

export default Footer;