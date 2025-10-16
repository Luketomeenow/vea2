import { Button } from "@/components/ui/button";
import { Check, Zap, Crown, Rocket, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Pricing = () => {
  const navigate = useNavigate();
  
  return (
    <section id="pricing" className="py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-white">
            Simple, Transparent
            <span className="block text-white">
              Pricing That Scales
            </span>
          </h2>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            No hidden fees, no complex tiers, no sales calls. Just powerful business management software at a price that makes sense.
          </p>
        </div>

        {/* Pricing Grid: show three plans */}
        <div className="grid md:grid-cols-3 gap-8 animate-fade-in-up">
          {[
            {
              name: "Starter",
              price: "$14.90",
              tagline: "For solopreneurs getting organized",
              icon: Sparkles,
              popular: false,
              features: [
                "Customer Database",
                "Smart Tickets",
                "Calendar & Appointments",
                "Basic Analytics",
              ],
            },
            {
              name: "VEA Executive",
              price: "$29.90",
              tagline: "Complete business management platform",
              icon: Zap,
              popular: true,
              features: [
                "Real-time Strategy Insights",
                "Full Customer Database",
                "Smart Tickets & Work Orders",
                "Calendar & Appointments",
                "B2B Contacts & Assets",
                "Customizable Workflows",
              ],
            },
            {
              name: "Enterprise",
              price: "Custom",
              tagline: "For teams with advanced needs",
              icon: Crown,
              popular: false,
              features: [
                "Dedicated Success Manager",
                "SSO & Advanced Security",
                "Custom Integrations",
                "Priority SLA Support",
              ],
            },
          ].map((plan, idx) => {
            const Icon = plan.icon;
            return (
              <div key={plan.name} className={`relative ${plan.popular ? 'md:scale-105' : ''}`} style={{animationDelay: `${idx * 0.05}s`}}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                    <div className="bg-gradient-primary text-primary-foreground px-6 py-2 rounded-full text-sm font-semibold shadow-lg flex items-center">
                      <Crown className="w-4 h-4 mr-1" /> Most Popular
                    </div>
                  </div>
                )}
                <div className="bg-gradient-to-br from-card/90 to-card/50 backdrop-blur-md border border-primary/20 rounded-2xl text-center overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 h-full flex flex-col">
                  <div className="pt-12 pb-8 px-8 flex-1 flex flex-col">
                    <div className="feature-icon mx-auto mb-6">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2 text-foreground">{plan.name}</h3>
                    <p className="text-muted-foreground mb-6">{plan.tagline}</p>
                    <div className="mb-8">
                      <div className="flex items-baseline justify-center">
                        <span className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">{plan.price}</span>
                        {plan.price !== 'Custom' && <span className="text-muted-foreground ml-2">/month/user</span>}
                      </div>
                    </div>
                    <div className="space-y-3 text-left mx-auto max-w-xs flex-1">
                      {plan.features.map((f) => (
                        <div key={f} className="flex items-start">
                          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-accent flex items-center justify-center mt-0.5 mr-3">
                            <Check className="w-3 h-3 text-accent-foreground" />
                          </div>
                          <span className="text-sm text-foreground leading-relaxed">{f}</span>
                        </div>
                      ))}
                    </div>
                    <Button 
                      className="cta-primary w-full mt-8 group py-4 text-lg font-semibold"
                      onClick={() => plan.popular ? navigate('/signup') : window.location.href = 'mailto:sales@vea.com'}
                    >
                      <Rocket className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
                      {plan.popular ? 'Start Your Free Trial' : 'Contact Sales'}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Value Props */}
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          {[
            {
              icon: "✓",
              title: "No Contracts",
              description: "Cancel anytime without penalties or hidden fees"
            },
            {
              icon: "✓", 
              title: "No Sales Reps",
              description: "Sign up instantly and start using VEA immediately"
            },
            {
              icon: "✓",
              title: "Up-Front Pricing", 
              description: "What you see is what you pay. No surprises ever."
            }
          ].map((item, index) => (
            <div 
              key={item.title}
              className="text-center animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                {item.icon}
              </div>
              <h4 className="font-semibold mb-2 text-foreground">{item.title}</h4>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;