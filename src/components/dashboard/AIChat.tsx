import { useState } from "react";
import { Send, Bot, User, TrendingUp, CheckSquare, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  widgets?: React.ReactNode;
}

const sampleQueries = [
  "What are my most urgent tasks for today?",
  "Show me my revenue for this month",
  "Which customers have overdue invoices?",
  "What's the status of active projects?",
];

export function AIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: "Hello! I'm your AI Assistant. I can help you analyze your business data, prioritize tasks, and provide strategic insights. What would you like to know?",
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSampleQuery = (query: string) => {
    setInput(query);
    handleSend(query);
  };

  const handleSend = (message: string = input) => {
    if (!message.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(message);
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const generateAIResponse = (query: string): Message => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('task') || lowerQuery.includes('urgent')) {
      return {
        id: Date.now().toString(),
        type: 'ai',
        content: "📋 **Task Analysis**: Here are your most urgent priorities with smart recommendations:",
        timestamp: new Date(),
        widgets: (
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between p-3 bg-card border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center space-x-3">
                <CheckSquare className="w-4 h-4 text-destructive" />
                <div>
                  <span className="font-medium">Complete client proposal for ABC Corp</span>
                  <p className="text-xs text-muted-foreground">Due: Today, 5:00 PM</p>
                </div>
              </div>
              <Badge variant="destructive">High</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-card border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center space-x-3">
                <CheckSquare className="w-4 h-4 text-yellow-500" />
                <div>
                  <span className="font-medium">Review marketing campaign metrics</span>
                  <p className="text-xs text-muted-foreground">Due: Tomorrow</p>
                </div>
              </div>
              <Badge variant="secondary">Medium</Badge>
            </div>
            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                💡 <strong>AI Tip:</strong> Focus on the ABC Corp proposal first - it's your highest revenue opportunity this week.
              </p>
            </div>
          </div>
        )
      };
    }
    
    if (lowerQuery.includes('revenue') || lowerQuery.includes('money') || lowerQuery.includes('sales')) {
      return {
        id: Date.now().toString(),
        type: 'ai',
        content: "📊 **Revenue Intelligence**: Your financial performance is strong! Here's the breakdown:",
        timestamp: new Date(),
        widgets: (
          <div className="mt-4 space-y-4">
            <div className="p-4 bg-card border rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">$47,250</p>
                  <p className="text-sm text-muted-foreground">This month's revenue</p>
                  <p className="text-sm text-green-600 dark:text-green-400 font-medium">+12% vs last month</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-card border rounded-lg text-center">
                <p className="text-lg font-semibold">$15,000</p>
                <p className="text-xs text-muted-foreground">Pending invoices</p>
              </div>
              <div className="p-3 bg-card border rounded-lg text-center">
                <p className="text-lg font-semibold">94%</p>
                <p className="text-xs text-muted-foreground">Collection rate</p>
              </div>
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                ⚡ <strong>Action Item:</strong> Follow up on 3 overdue invoices worth $8,500 total.
              </p>
            </div>
          </div>
        )
      };
    }

    if (lowerQuery.includes('customer') || lowerQuery.includes('client')) {
      return {
        id: Date.now().toString(),
        type: 'ai',
        content: "👥 **Customer Intelligence**: Your client relationships are performing excellently!",
        timestamp: new Date(),
        widgets: (
          <div className="mt-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-card border rounded-lg text-center">
                <p className="text-lg font-semibold">23</p>
                <p className="text-xs text-muted-foreground">Active clients</p>
                <p className="text-xs text-green-600">+3 this month</p>
              </div>
              <div className="p-3 bg-card border rounded-lg text-center">
                <p className="text-lg font-semibold">4.8/5</p>
                <p className="text-xs text-muted-foreground">Satisfaction</p>
                <p className="text-xs text-green-600">+0.2 improvement</p>
              </div>
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded-lg">
              <p className="text-sm text-emerald-800 dark:text-emerald-200">
                🎯 <strong>Opportunity:</strong> 2 clients ready for service upgrades - potential $12K revenue.
              </p>
            </div>
          </div>
        )
      };
    }
    
    return {
      id: Date.now().toString(),
      type: 'ai',
      content: "🤖 I'm analyzing your business data for insights on: " + query + ". I can help with revenue analysis, task prioritization, customer intelligence, and strategic recommendations. What specific area interests you most?",
      timestamp: new Date(),
      widgets: (
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" className="text-xs">
            📊 Revenue trends
          </Button>
          <Button variant="outline" size="sm" className="text-xs">
            📋 Task priorities
          </Button>
          <Button variant="outline" size="sm" className="text-xs">
            👥 Customer insights
          </Button>
          <Button variant="outline" size="sm" className="text-xs">
            🎯 Growth opportunities
          </Button>
        </div>
      )
    };
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border border-border/50">
      <CardContent className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-gradient-primary rounded-lg">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">AI Assistant</h2>
            <p className="text-sm text-muted-foreground">Your intelligent business advisor</p>
          </div>
        </div>

        {/* Sample Queries */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground mb-3">Try asking me:</p>
          <div className="flex flex-wrap gap-2">
            {sampleQueries.map((query, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleSampleQuery(query)}
            className="text-xs hover:bg-primary hover:text-primary-foreground transition-colors flex-shrink-0"
          >
            {query}
          </Button>
            ))}
          </div>
        </div>

        {/* Chat Messages */}
        <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                <div className="flex items-start space-x-2">
                  {message.type === 'ai' && (
                    <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div className={`p-3 rounded-lg ${
                    message.type === 'user' 
                      ? 'bg-primary text-primary-foreground ml-auto' 
                      : 'bg-muted'
                  }`}>
                    <p className="text-sm">{message.content}</p>
                    {message.widgets && message.widgets}
                  </div>
                  {message.type === 'user' && (
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
        </div>

        {/* Input */}
        <div className="flex space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me about your business..."
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            className="bg-background/50"
          />
          <Button onClick={() => handleSend()} disabled={!input.trim() || isTyping}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}




