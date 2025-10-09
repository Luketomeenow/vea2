import veaLogo from "@/assets/vea-logo.png";
import { ChevronRight } from "lucide-react";

const Footer = () => {
  return (
    <footer className="relative bg-gradient-to-br from-secondary to-background border-t border-border/20">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, hsl(var(--primary)) 2px, transparent 2px), 
                           radial-gradient(circle at 75% 75%, hsl(var(--primary)) 1px, transparent 1px)`, 
          backgroundSize: '50px 50px'
        }} />
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 py-16 relative">
        <div className="grid lg:grid-cols-4 md:grid-cols-3 gap-8 mb-12">
          {/* Logo & Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg">
                <img src={veaLogo} alt="VEA Logo" className="h-8 w-8 brightness-0 invert" />
              </div>
              <span className="text-3xl font-bold text-white">VEA</span>
            </div>
            <p className="text-white/80 mb-6 max-w-lg text-lg leading-relaxed">
              The most qualified Executive Assistant for modern business owners. Transform your operations and dominate your industry with AI-powered insights.
            </p>
            
            {/* Key Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 rounded-xl bg-card/50 border border-border/30">
                <div className="text-2xl font-bold text-primary">10K+</div>
                <div className="text-xs text-white/70">Active Users</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-card/50 border border-border/30">
                <div className="text-2xl font-bold text-primary">99.9%</div>
                <div className="text-xs text-white/70">Uptime</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-card/50 border border-border/30">
                <div className="text-2xl font-bold text-primary">24/7</div>
                <div className="text-xs text-white/70">Support</div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-6 text-white text-lg flex items-center">
              <div className="w-2 h-6 bg-gradient-primary rounded-full mr-3" />
              Product
            </h4>
            <ul className="space-y-3">
              {[
                { label: "Features", href: "#features" },
                { label: "Pricing", href: "#pricing" },
                { label: "Demo", href: "#" },
                { label: "API Docs", href: "#" },
                { label: "Integrations", href: "#" }
              ].map((link) => (
                <li key={link.label}>
                  <a 
                    href={link.href} 
                    className="text-white/70 hover:text-primary transition-all duration-300 hover:translate-x-1 inline-block group"
                  >
                    <span className="flex items-center">
                      {link.label}
                      <ChevronRight className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-bold mb-6 text-white text-lg flex items-center">
              <div className="w-2 h-6 bg-gradient-primary rounded-full mr-3" />
              Support
            </h4>
            <ul className="space-y-3">
              {[
                { label: "Contact Us", href: "#contact" },
                { label: "Help Center", href: "#" },
                { label: "Community", href: "#" },
                { label: "Status Page", href: "#" },
                { label: "Bug Reports", href: "#" }
              ].map((link) => (
                <li key={link.label}>
                  <a 
                    href={link.href} 
                    className="text-white/70 hover:text-primary transition-all duration-300 hover:translate-x-1 inline-block group"
                  >
                    <span className="flex items-center">
                      {link.label}
                      <ChevronRight className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border/30 pt-8">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
            <div className="text-white/70">
              <p className="text-sm">© 2024 VEA. All rights reserved.</p>
              <p className="text-xs mt-1">Built for business owners, by business owners.</p>
            </div>
            
            <div className="flex items-center space-x-6">
              {[
                { label: "Privacy Policy", href: "#" },
                { label: "Terms of Service", href: "#" },
                { label: "Security", href: "#" },
                { label: "Changelog", href: "#" }
              ].map((link) => (
                <a 
                  key={link.label}
                  href={link.href} 
                  className="text-sm text-white/70 hover:text-primary transition-colors duration-300 hover:underline"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;