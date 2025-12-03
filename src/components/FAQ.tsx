import { useState } from "react";
import { Plus, Minus } from "lucide-react";

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "What is VEA and how does it work?",
      answer: "VEA (Virtual Executive Assistant) is an AI-powered business management platform that provides executive-level insights and automates your business operations. It analyzes your business data, provides strategic recommendations, and handles routine tasks so you can focus on growth.",
    },
    {
      question: "Do I need any technical knowledge to use VEA?",
      answer: "Not at all! VEA is designed for business owners, not developers. Simply describe what you need in plain English, and VEA handles the rest. The AI assistant guides you through everything with an intuitive interface.",
    },
    {
      question: "How is VEA different from other business tools?",
      answer: "Unlike traditional business tools that require manual setup and data entry, VEA uses AI to understand your business context and automatically configure everything. It's like having a senior executive, analyst, and assistant all in one platform.",
    },
    {
      question: "What kind of businesses can use VEA?",
      answer: "VEA is perfect for small to medium businesses, entrepreneurs, and growing companies across all industries. Whether you're in e-commerce, services, consulting, or any other field, VEA adapts to your specific business needs.",
    },
    {
      question: "Is my business data secure?",
      answer: "Absolutely. We use enterprise-grade encryption and security measures to protect your data. Your information is stored securely and never shared with third parties. We're compliant with all major data protection regulations including GDPR.",
    },
    {
      question: "Can I try VEA before committing?",
      answer: "Yes! We offer a 14-day free trial with full access to all features. No credit card required. You can explore everything VEA has to offer and see the results for yourself before making any commitment.",
    },
    {
      question: "What kind of support do you provide?",
      answer: "We provide 24/7 customer support through chat, email, and video calls. Our team is always ready to help you get the most out of VEA. Plus, the AI assistant itself provides contextual help and guidance as you work.",
    },
    {
      question: "Can VEA integrate with my existing tools?",
      answer: "Yes! VEA integrates with popular business tools including accounting software, CRM systems, payment processors, and more. We're constantly adding new integrations based on customer feedback.",
    },
    {
      question: "How quickly can I see results?",
      answer: "Most users start seeing improvements within the first week. Our customers report an average of 47% revenue increase and 85% time savings within the first 3 months of using VEA.",
    },
    {
      question: "What happens if I want to cancel?",
      answer: "You can cancel anytime with no penalties or hidden fees. We believe in earning your business every month. If you cancel, you'll retain access until the end of your billing period, and you can export all your data.",
    },
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="relative py-24 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Frequently Asked <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Questions</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Everything you need to know about VEA. Can't find the answer you're looking for?{" "}
            <a href="#contact" className="text-cyan-400 hover:underline">
              Contact our support team
            </a>
            .
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-4xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="relative bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden transition-all duration-300 hover:border-cyan-400/50"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent rounded-2xl pointer-events-none" />
              <button
                onClick={() => toggleFAQ(index)}
                className="relative w-full px-6 py-5 flex items-center justify-between text-left transition-all z-10"
              >
                <span className="font-semibold text-lg text-white pr-8">
                  {faq.question}
                </span>
                <div className="flex-shrink-0">
                  {openIndex === index ? (
                    <Minus className="w-6 h-6 text-cyan-400" />
                  ) : (
                    <Plus className="w-6 h-6 text-gray-400" />
                  )}
                </div>
              </button>
              
              <div
                className={`transition-all duration-300 ease-in-out ${
                  openIndex === index
                    ? "max-h-96 opacity-100"
                    : "max-h-0 opacity-0"
                }`}
              >
                <div className="px-6 pb-5 pt-0 relative z-10">
                  <p className="text-gray-300 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16 p-8 bg-gradient-to-r from-cyan-400/10 to-blue-500/10 rounded-2xl border border-cyan-400/20 max-w-3xl mx-auto">
          <h3 className="text-2xl font-bold text-white mb-4">
            Still have questions?
          </h3>
          <p className="text-gray-300 mb-6">
            Our team is here to help you succeed. Reach out anytime!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 transform hover:scale-105">
              Contact Support
            </button>
            <button className="bg-slate-700 hover:bg-slate-600 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300">
              Schedule a Demo
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;

