import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, MessageSquare, TrendingUp, Users, Clock, Award } from "lucide-react";

const Contact = () => {
  return (
    <section id="contact" className="py-24 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left Content */}
          <div className="animate-fade-in-left">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
              Ready to Transform
              <span className="block bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Your Business?
              </span>
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join thousands of successful entrepreneurs who've discovered their secret weapon. Get started in minutes, not months.
            </p>

            {/* Contact Info */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center mr-4">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <span className="text-gray-300">support@vea.ai</span>
              </div>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center mr-4">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <span className="text-gray-300">1-800-VEA-HELP</span>
              </div>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center mr-4">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <span className="text-gray-300">Available Worldwide</span>
              </div>
            </div>

            {/* Why Choose VEA - Stats Grid */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white mb-4">Why Choose VEA?</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent rounded-xl pointer-events-none" />
                  <div className="relative flex items-center space-x-3 mb-2">
                    <TrendingUp className="w-5 h-5 text-cyan-400" />
                    <span className="text-2xl font-bold text-cyan-400">47%</span>
                  </div>
                  <p className="text-sm text-gray-400 relative">Revenue Increase</p>
                </div>
                
                <div className="relative bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent rounded-xl pointer-events-none" />
                  <div className="relative flex items-center space-x-3 mb-2">
                    <Clock className="w-5 h-5 text-cyan-400" />
                    <span className="text-2xl font-bold text-cyan-400">85%</span>
                  </div>
                  <p className="text-sm text-gray-400 relative">Time Saved</p>
                </div>
                
                <div className="relative bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent rounded-xl pointer-events-none" />
                  <div className="relative flex items-center space-x-3 mb-2">
                    <Users className="w-5 h-5 text-cyan-400" />
                    <span className="text-2xl font-bold text-cyan-400">10K+</span>
                  </div>
                  <p className="text-sm text-gray-400 relative">Active Users</p>
                </div>
                
                <div className="relative bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent rounded-xl pointer-events-none" />
                  <div className="relative flex items-center space-x-3 mb-2">
                    <Award className="w-5 h-5 text-cyan-400" />
                    <span className="text-2xl font-bold text-cyan-400">99.9%</span>
                  </div>
                  <p className="text-sm text-gray-400 relative">Satisfaction</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Contact Form */}
          <div className="animate-fade-in-right">
            <div className="relative bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent rounded-2xl pointer-events-none" />
              <div className="relative w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg z-10">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-center mb-6 text-white relative z-10">
                Get Your Free Demo
              </h3>

              <form className="space-y-6 relative z-10">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium mb-2 text-gray-300">
                      First Name
                    </label>
                    <Input 
                      id="firstName" 
                      placeholder="John" 
                      className="bg-slate-900/80 border-slate-700 text-white placeholder:text-gray-500" 
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium mb-2 text-gray-300">
                      Last Name
                    </label>
                    <Input 
                      id="lastName" 
                      placeholder="Doe" 
                      className="bg-slate-900/80 border-slate-700 text-white placeholder:text-gray-500" 
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2 text-gray-300">
                    Business Email
                  </label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="john@company.com" 
                    className="bg-slate-900/80 border-slate-700 text-white placeholder:text-gray-500" 
                  />
                </div>

                <div>
                  <label htmlFor="company" className="block text-sm font-medium mb-2 text-gray-300">
                    Company Name
                  </label>
                  <Input 
                    id="company" 
                    placeholder="Acme Corp" 
                    className="bg-slate-900/80 border-slate-700 text-white placeholder:text-gray-500" 
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-2 text-gray-300">
                    Tell us about your business
                  </label>
                  <Textarea 
                    id="message" 
                    placeholder="What challenges are you looking to solve with VEA?"
                    className="bg-slate-900/80 border-slate-700 text-white placeholder:text-gray-500 min-h-[120px]"
                  />
                </div>

                <Button className="bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white w-full rounded-xl py-6 text-lg font-semibold">
                  Schedule My Free Demo
                </Button>

                <p className="text-xs text-gray-500 text-center">
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