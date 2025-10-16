import { Button } from "@/components/ui/button";
import { ArrowRight, Star, Users, TrendingUp } from "lucide-react";
import dashboardHero from "@/assets/vea-dashboard-hero.jpg";
import ParticleBackground from "./ParticleBackground";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();
  
  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Enhanced Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-primary/5" />
      <ParticleBackground />
      
      {/* Animated background elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl motion-safe:animate-float-slower" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary-light/10 rounded-full blur-3xl motion-safe:animate-float-slow" />
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-accent/5 rounded-full blur-2xl motion-safe:animate-soft-pulse" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left animate-fade-in-left">
            {/* Social Proof Badge */}
            <div className="inline-flex items-center bg-card/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-primary/20 shadow-soft">
              <Star className="w-4 h-4 text-primary-light mr-2" />
              <span className="text-foreground/90 text-sm font-medium">
                Trusted by 10,000+ Business Owners
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-foreground via-primary-light to-primary bg-clip-text text-transparent">
                The Ultimate
              </span>
              <span className="block bg-gradient-to-r from-primary-light to-accent bg-clip-text text-transparent">
                Executive Assistant
              </span>
              <span className="bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                for Modern CEOs
              </span>
            </h1>

            {/* Sub-headline */}
            <p className="text-xl md:text-2xl text-foreground/80 mb-8 max-w-2xl mx-auto lg:mx-0">
              Stop drowning in spreadsheets. VEA transforms successful entrepreneurs into unstoppable business tycoons with AI-powered insights and seamless operations.
            </p>

            {/* Statistics */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-8 mb-8">
              <div className="flex items-center text-foreground/90 bg-card/20 backdrop-blur-sm rounded-lg px-3 py-2 border border-primary/10">
                <TrendingUp className="w-5 h-5 mr-2 text-accent" />
                <span className="text-sm font-medium">47% Revenue Increase</span>
              </div>
              <div className="flex items-center text-foreground/90 bg-card/20 backdrop-blur-sm rounded-lg px-3 py-2 border border-primary/10">
                <Users className="w-5 h-5 mr-2 text-primary-light" />
                <span className="text-sm font-medium">85% Time Savings</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button 
                size="lg" 
                className="cta-primary group text-lg px-8 py-4 shadow-strong hover:shadow-strong focus-visible:ring-offset-2"
                onClick={() => navigate('/signup')}
              >
                Start Your Free Trial
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-primary/40 text-foreground hover:bg-primary/10 hover:text-foreground backdrop-blur-sm text-lg px-8 py-4 shadow-soft focus-visible:ring-offset-2"
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Watch Demo
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="mt-8 text-foreground/70 text-sm">
              <p>✓ No Contracts &nbsp;&nbsp; ✓ No Setup Fees &nbsp;&nbsp; ✓ Cancel Anytime</p>
            </div>
          </div>

          {/* Right Content - Dashboard Preview */}
          <div className="relative animate-fade-in-right">
            <div className="relative rounded-2xl overflow-hidden shadow-strong border border-primary/20 backdrop-blur-sm bg-card/20">
              <img
                src={dashboardHero}
                alt="VEA Dashboard Preview"
                className="w-full h-auto transform hover:scale-105 transition-transform duration-700"
              />
              
              {/* Floating Cards */}
              <div className="absolute -top-4 -left-4 bg-card/90 backdrop-blur-sm rounded-lg p-4 shadow-strong animate-fade-in-up border border-primary/20">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-accent rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold text-foreground">Revenue Up 47%</span>
                </div>
              </div>
              
              <div className="absolute -bottom-4 -right-4 bg-card/90 backdrop-blur-sm rounded-lg p-4 shadow-strong animate-fade-in-up border border-primary/20" style={{animationDelay: '0.2s'}}>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-primary-light rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold text-foreground">1,247 Tasks Completed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;