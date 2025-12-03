import { Star, Quote } from "lucide-react";
import testimonialsImage from "../assets/Testimonials.jpg";

const Testimonials = () => {
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "CEO, TechStart Inc",
      image: "👩‍💼",
      content: "VEA transformed our business operations completely. We've seen a 47% increase in revenue and saved countless hours on manual tasks. The AI assistant is like having a seasoned executive on your team 24/7.",
      rating: 5,
      company: "TechStart",
    },
    {
      name: "Michael Chen",
      role: "Founder, GrowthLabs",
      image: "👨‍💻",
      content: "I can't put into words how astronomically better VEA is than any other AI tool. Actually made me question why I ever paid for other tools when this tool puts them all to shame. Incredibly impressed, wow.",
      rating: 5,
      company: "GrowthLabs",
    },
    {
      name: "Emily Rodriguez",
      role: "Operations Director",
      image: "👩‍🔬",
      content: "Yesterday I gave a try to what you guys have built... simply magical, beautiful and definitely the best experience I had so far compared to the competitors!!! The automation features alone have saved us 85% of our time.",
      rating: 5,
      company: "OptiScale",
    },
    {
      name: "David Park",
      role: "Entrepreneur",
      image: "👨‍💼",
      content: "VEA saved me more time in 10 minutes than my last 3 frameworks combined. Big respect for what you built! The insights are game-changing for our business strategy.",
      rating: 5,
      company: "ParkVentures",
    },
    {
      name: "Lisa Thompson",
      role: "Small Business Owner",
      image: "👩‍🎨",
      content: "I've built my entire business workflow with VEA, and let me tell you- it's a game-changer. Its leagues ahead of anything I've used. For me this is the best tool I have ever used.",
      rating: 5,
      company: "Creative Studios",
    },
    {
      name: "James Wilson",
      role: "CTO, FinTech Pro",
      image: "👨‍🚀",
      content: "This platform is a game changer for us and for any business owner. The AI capabilities are simply amazing. I tested it with my team and we were all blown away by spending only a fraction of the time we usually do.",
      rating: 5,
      company: "FinTech Pro",
    },
  ];

  // Split testimonials into two rows
  const firstRow = testimonials.slice(0, 3);
  const secondRow = testimonials.slice(3, 6);

  return (
    <section 
      className="relative py-24 overflow-hidden"
      style={{
        backgroundImage: `url(${testimonialsImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/85 via-slate-800/85 to-slate-900/85" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Success <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Speaks</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            What some of our <span className="text-cyan-400 font-semibold">10,000+</span> business owners in{" "}
            <span className="text-cyan-400 font-semibold">180+</span> countries building everything from small projects to enterprise operations have to say.
          </p>
        </div>

        {/* Testimonials Slider */}
        <div className="space-y-6 max-w-7xl mx-auto">
          {/* First Row - Slide Left */}
          <div className="relative overflow-hidden">
            <div className="flex animate-scroll-left space-x-6">
              {/* Duplicate for seamless loop */}
              {[...firstRow, ...firstRow].map((testimonial, index) => (
                <div
                  key={index}
                  className="relative bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-cyan-400/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-400/10 flex-shrink-0 w-[400px]"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent rounded-2xl pointer-events-none" />
                  <div className="relative">
                    {/* Quote Icon */}
                    <div className="mb-4">
                      <Quote className="w-8 h-8 text-cyan-400/50" />
                    </div>

                    {/* Rating */}
                    <div className="flex space-x-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-cyan-400 text-cyan-400" />
                      ))}
                    </div>

                    {/* Content */}
                    <p className="text-gray-300 mb-6 leading-relaxed">
                      "{testimonial.content}"
                    </p>

                    {/* Author */}
                    <div className="flex items-center space-x-3 pt-4 border-t border-white/10">
                      <div className="text-3xl">{testimonial.image}</div>
                      <div>
                        <div className="font-semibold text-white">{testimonial.name}</div>
                        <div className="text-sm text-gray-400">{testimonial.role}</div>
                        <div className="text-xs text-cyan-400">{testimonial.company}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Second Row - Slide Right */}
          <div className="relative overflow-hidden">
            <div className="flex animate-scroll-right space-x-6">
              {/* Duplicate for seamless loop */}
              {[...secondRow, ...secondRow].map((testimonial, index) => (
                <div
                  key={index}
                  className="relative bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-cyan-400/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-400/10 flex-shrink-0 w-[400px]"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent rounded-2xl pointer-events-none" />
                  <div className="relative">
                    {/* Quote Icon */}
                    <div className="mb-4">
                      <Quote className="w-8 h-8 text-cyan-400/50" />
                    </div>

                    {/* Rating */}
                    <div className="flex space-x-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-cyan-400 text-cyan-400" />
                      ))}
                    </div>

                    {/* Content */}
                    <p className="text-gray-300 mb-6 leading-relaxed">
                      "{testimonial.content}"
                    </p>

                    {/* Author */}
                    <div className="flex items-center space-x-3 pt-4 border-t border-white/10">
                      <div className="text-3xl">{testimonial.image}</div>
                      <div>
                        <div className="font-semibold text-white">{testimonial.name}</div>
                        <div className="text-sm text-gray-400">{testimonial.role}</div>
                        <div className="text-xs text-cyan-400">{testimonial.company}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <p className="text-gray-300 mb-6 text-lg">
            Join thousands of successful business owners who have transformed their operations
          </p>
          <button className="bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg">
            Start Your Success Story
          </button>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;

