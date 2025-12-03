const Partners = () => {
  const partners = [
    "Microsoft",
    "Google",
    "Amazon",
    "Shopify",
    "Stripe",
    "Salesforce",
    "HubSpot",
    "Zoom",
    "Slack",
    "Adobe",
  ];

  return (
    <section className="relative py-20 bg-gradient-to-br from-amber-50 via-white to-cyan-50">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Trusted by <span className="text-cyan-600">10,000+</span> users in <span className="text-cyan-600">180+</span> countries
          </h2>
          <p className="text-gray-600 text-lg">Leading businesses choose VEA for their operations</p>
        </div>

        {/* Partners Logo Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 items-center justify-items-center max-w-6xl mx-auto">
          {partners.map((partner, index) => (
            <div 
              key={index}
              className="group relative p-6 bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-gray-200 hover:border-cyan-400 transition-all duration-300 hover:scale-105 w-full shadow-sm hover:shadow-lg"
            >
              <div className="text-center">
                <span className="text-xl font-bold text-gray-600 group-hover:text-gray-900 transition-colors">
                  {partner}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mt-16 max-w-4xl mx-auto">
          <div className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-cyan-200 shadow-md">
            <div className="text-3xl font-bold text-cyan-600 mb-2">10K+</div>
            <div className="text-sm text-gray-600 font-medium">Active Users</div>
          </div>
          <div className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-cyan-200 shadow-md">
            <div className="text-3xl font-bold text-cyan-600 mb-2">180+</div>
            <div className="text-sm text-gray-600 font-medium">Countries</div>
          </div>
          <div className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-cyan-200 shadow-md">
            <div className="text-3xl font-bold text-cyan-600 mb-2">99.9%</div>
            <div className="text-sm text-gray-600 font-medium">Uptime</div>
          </div>
          <div className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-cyan-200 shadow-md">
            <div className="text-3xl font-bold text-cyan-600 mb-2">24/7</div>
            <div className="text-sm text-gray-600 font-medium">Support</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Partners;

