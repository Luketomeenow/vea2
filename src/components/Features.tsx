import { 
  BarChart3, 
  Users, 
  Calendar, 
  Ticket, 
  Settings, 
  CheckSquare, 
  CreditCard, 
  UserCheck,
  Target,
  Zap
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

const features = [
  {
    icon: BarChart3,
    title: "Strategy Insights",
    description: "Make smarter decisions with intuitive real-time analytics. Track every aspect of your business and achieve greater success in a fraction of the time.",
  },
  {
    icon: Users,
    title: "Customer Database",
    description: "Centralize all customer information with linked assets, work orders, quotes, invoices, geo-location data, and quality reports.",
  },
  {
    icon: Ticket,
    title: "Smart Tickets",
    description: "Stay on top of every customer request with collaborative work orders, customized priorities, and real-time tracking for your team.",
  },
  {
    icon: Calendar,
    title: "Appointments",
    description: "Built-in calendar for seamless scheduling. Automatically link appointments to service tickets for perfect back-office coordination.",
  },
  {
    icon: UserCheck,
    title: "B2B Contacts",
    description: "Manage corporate clients effectively. Link tickets to specific employees, allocate assets, and track support patterns.",
  },
  {
    icon: Settings,
    title: "Fully Customizable", 
    description: "Pin favorites, create custom ticket types, set business goals, manage permissions, and apply dynamic pricing rules.",
  },
  {
    icon: CheckSquare,
    title: "Task Management",
    description: "Assign and track prioritized internal tasks. Maximize staff productivity with clear accountability and progress tracking.",
  },
  {
    icon: CreditCard,
    title: "Point of Sale",
    description: "Quick checkout for walk-in customers without the complexity of full invoicing. Perfect for retail transactions.",
  },
  {
    icon: Target,
    title: "User-Driven Development",
    description: "Features built from real user requests. Vote on improvements and interact directly with our development team.",
  },
  {
    icon: Zap,
    title: "Executive-First Design",
    description: "Purpose-built for business owners, not accountants. Get insights that matter for strategic decision-making.",
  },
];

const Features = () => {
  const [isHovering, setIsHovering] = useState(false);
  const carouselApiRef = useRef<import("@/components/ui/carousel").CarouselApi | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [snapCount, setSnapCount] = useState(0);

  // Simple autoplay that respects hover and reduced motion
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!carouselApiRef.current || prefersReduced) return;

    const interval = setInterval(() => {
      if (!isHovering) {
        carouselApiRef.current?.scrollNext();
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [isHovering]);

  // Track selected index for indicators
  useEffect(() => {
    const api = carouselApiRef.current;
    if (!api) return;
    const onSelect = () => setSelectedIndex(api.selectedScrollSnap());
    setSnapCount(api.scrollSnapList().length);
    onSelect();
    api.on('select', onSelect);
    api.on('reInit', () => {
      setSnapCount(api.scrollSnapList().length);
      onSelect();
    });
    return () => {
      api.off('select', onSelect);
    };
  }, []);

  return (
    <section 
      id="features" 
      className="py-24 bg-gradient-to-br from-background to-muted/30 overflow-hidden"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="container mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-foreground">
            Everything You Need to
            <span className="block bg-gradient-primary bg-clip-text text-transparent">
              Dominate Your Industry
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            VEA isn't just software—it's your strategic advantage. Every feature is designed to give you the executive insights that separate industry leaders from the competition.
          </p>
        </div>

        {/* Carousel (Embla) */}
        <div className="relative">
          <Carousel
            opts={{ loop: true, align: "start", skipSnaps: true }}
            setApi={(api) => (carouselApiRef.current = api)}
            className="w-full"
          >
            <CarouselContent>
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <CarouselItem key={feature.title} className="md:basis-1/2 lg:basis-1/3">
                    <div className="feature-card h-full will-change-transform">
                      <div className="feature-icon">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors text-foreground">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <CarouselPrevious className="carousel-nav-button prev left-4" />
            <CarouselNext className="carousel-nav-button next right-4" />
          </Carousel>

          {/* Indicators */}
          <div className="carousel-indicators">
            {Array.from({ length: snapCount }).map((_, i) => (
              <span key={i} className={`carousel-dot ${i === selectedIndex ? 'active' : ''}`} />
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16 animate-fade-in-up">
          <div className="bg-gradient-feature rounded-2xl p-8 border border-white/10">
            <h3 className="text-2xl md:text-3xl font-bold mb-4 text-white">
              Ready to Transform Your Business?
            </h3>
            <p className="text-white/80 mb-6 max-w-2xl mx-auto">
              Join thousands of successful entrepreneurs who've already discovered their secret weapon.
            </p>
            <button className="cta-primary">
              Start Your Transformation Today
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;