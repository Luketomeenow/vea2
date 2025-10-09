import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, MessageSquare } from "lucide-react";
import businessGrowth from "@/assets/business-growth.jpg";

const Contact = () => {
  return (
    <section id="contact" className="py-24 bg-gradient-to-br from-secondary to-background">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left Content */}
          <div className="animate-fade-in-left">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
              Ready to Transform
              <span className="block text-white">
                Your Business?
              </span>
            </h2>
            <p className="text-xl text-white/80 mb-8">
              Join thousands of successful entrepreneurs who've discovered their secret weapon. Get started in minutes, not months.
            </p>

            {/* Contact Info */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center">
                <div className="feature-icon mr-4">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <span className="text-white/80">support@vea.ai</span>
              </div>
              <div className="flex items-center">
                <div className="feature-icon mr-4">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <span className="text-white/80">1-800-VEA-HELP</span>
              </div>
              <div className="flex items-center">
                <div className="feature-icon mr-4">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <span className="text-white/80">Available Worldwide</span>
              </div>
            </div>

            {/* Business Growth Image */}
            <div className="relative rounded-xl overflow-hidden shadow-medium">
              <img
                src={businessGrowth}
                alt="Business Growth"
                className="w-full h-64 md:h-72 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-primary/20" />
            </div>
          </div>

          {/* Right Content - Contact Form */}
          <div className="animate-fade-in-right">
            <div className="feature-card bg-card/40 border border-white/10">
              <div className="feature-icon mx-auto mb-6">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-center mb-6 text-white">
                Get Your Free Demo
              </h3>

              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium mb-2 text-foreground">
                      First Name
                    </label>
                    <Input 
                      id="firstName" 
                      placeholder="John" 
                    className="bg-background/80 border-white/10 text-white placeholder:text-white/50" 
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium mb-2 text-foreground">
                      Last Name
                    </label>
                    <Input 
                      id="lastName" 
                      placeholder="Doe" 
                    className="bg-background/80 border-white/10 text-white placeholder:text-white/50" 
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2 text-foreground">
                    Business Email
                  </label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="john@company.com" 
                    className="bg-background/80 border-white/10 text-white placeholder:text-white/50" 
                  />
                </div>

                <div>
                  <label htmlFor="company" className="block text-sm font-medium mb-2 text-foreground">
                    Company Name
                  </label>
                  <Input 
                    id="company" 
                    placeholder="Acme Corp" 
                    className="bg-background/80 border-white/10 text-white placeholder:text-white/50" 
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-2 text-foreground">
                    Tell us about your business
                  </label>
                  <Textarea 
                    id="message" 
                    placeholder="What challenges are you looking to solve with VEA?"
                    className="bg-background/80 border-white/10 text-white placeholder:text-white/50 min-h-[120px]"
                  />
                </div>

                <Button className="cta-primary w-full">
                  Schedule My Free Demo
                </Button>

                <p className="text-xs text-white/60 text-center">
                  By submitting this form, you agree to receive communications from VEA. 
                  We respect your privacy and will never share your information.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;