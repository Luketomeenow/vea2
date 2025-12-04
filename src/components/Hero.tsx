import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, Sparkles, TrendingUp, Users, Zap } from "lucide-react";
import heroBackground from "@/assets/Hero.jpg";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import DemoAIChat from "@/components/DemoAIChat";

const Hero = () => {
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
    <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src={heroBackground} 
          alt="Hero Background" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800/75 via-slate-700/70 to-cyan-900/75" />
      </div>
      
      {/* Animated background elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-400/15 rounded-full blur-3xl motion-safe:animate-float-slower" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-400/15 rounded-full blur-3xl motion-safe:animate-float-slow" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          {/* Main Headline */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <span className="text-white drop-shadow-lg">
              Scale Your Empire
            </span>
            <br />
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent drop-shadow-lg">
              With AI Agents
            </span>
          </h1>

          {/* Sub-headline */}
          <p className="text-xl md:text-2xl text-gray-100 mb-12 max-w-3xl mx-auto animate-fade-in-up drop-shadow-lg" style={{ animationDelay: '0.2s' }}>
            Stop trading time for money. Let AI agents run your business 24/7 while you focus on{" "}
            <span className="font-semibold text-cyan-300 underline decoration-cyan-300/40">building your legacy</span>
          </p>

          {/* AI Chat Input - Main Feature */}
          <div className="max-w-3xl mx-auto mb-8 animate-fade-in-up pt-6" style={{ animationDelay: '0.3s' }}>
            {/* Try it now badge */}
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-5 py-2 rounded-full text-sm font-semibold shadow-lg flex items-center space-x-2 animate-pulse backdrop-blur-sm">
                <Sparkles className="w-4 h-4" />
                <span>Try it now - No signup required!</span>
              </div>
            </div>
            
            <div className="relative bg-white/20 backdrop-blur-2xl rounded-3xl border border-white/30 shadow-2xl overflow-hidden">
              {/* Glass morphism shine effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-white/10 to-transparent pointer-events-none" />

              <div className="p-8 relative">
                <div className="flex items-center space-x-4 mb-5">
                  <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl shadow-lg backdrop-blur-sm">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="What can I build for you today?"
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    className="flex-1 bg-white/90 backdrop-blur-sm border-2 border-white/30 text-gray-900 placeholder:text-gray-600 text-lg h-16 px-6 rounded-2xl focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 focus:bg-white transition-all shadow-inner"
                  />
                  <Button 
                    onClick={handleSend}
                    disabled={!input.trim()}
                    size="lg"
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white h-16 px-10 rounded-2xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 backdrop-blur-sm"
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
                      className="text-sm bg-white/20 backdrop-blur-md hover:bg-white/30 text-white border border-white/30 hover:border-white/50 rounded-full px-4 py-2 transition-all hover:shadow-lg"
                    >
                      {query}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Key Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <div className="relative bg-white/15 backdrop-blur-xl rounded-2xl p-6 border border-white/30 hover:border-white/40 hover:shadow-2xl transition-all hover:scale-105 group">
              <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-transparent rounded-2xl pointer-events-none" />
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4 mx-auto shadow-lg">
                  <TrendingUp className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2 text-white">47% Revenue Growth</h3>
                <p className="text-sm text-gray-300">AI-powered insights that drive results</p>
              </div>
            </div>

            <div className="relative bg-white/15 backdrop-blur-xl rounded-2xl p-6 border border-white/30 hover:border-white/40 hover:shadow-2xl transition-all hover:scale-105 group">
              <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-transparent rounded-2xl pointer-events-none" />
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4 mx-auto shadow-lg">
                  <Zap className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2 text-white">85% Time Savings</h3>
                <p className="text-sm text-gray-300">Automate your business operations</p>
              </div>
            </div>

            <div className="relative bg-white/15 backdrop-blur-xl rounded-2xl p-6 border border-white/30 hover:border-white/40 hover:shadow-2xl transition-all hover:scale-105 group">
              <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-transparent rounded-2xl pointer-events-none" />
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4 mx-auto shadow-lg">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2 text-white">10,000+ Users</h3>
                <p className="text-sm text-gray-300">Trusted by business leaders</p>
              </div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="text-gray-300 text-sm font-medium animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            <p>✓ No Contracts &nbsp;&nbsp;•&nbsp;&nbsp; ✓ No Setup Fees &nbsp;&nbsp;•&nbsp;&nbsp; ✓ Cancel Anytime</p>
          </div>
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
    </section>
  );
};

export default Hero;