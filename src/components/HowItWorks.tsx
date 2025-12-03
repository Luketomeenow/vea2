import { useState } from "react";
import { Sparkles, Database, Rocket as RocketIcon, FileText } from "lucide-react";

const HowItWorks = () => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      id: 0,
      title: "One prompt",
      subtitle: "Whole app. No kidding.",
      description: "While others make you prompt for every page and feature, VEA is different. Describe your vision once and get full functional app with backend, integrations, production-ready code- everything. It's like your senior product and dev teams that read your mind.",
      icon: Sparkles,
      details: [
        "VEA does deep research about your market (seriously)",
        "Contextualizes your problem and decides features set",
        "Designs optimum user experience and interface (UI/UX)",
        "Writes awesome copy that ranks high in SEO",
        "Writes high quality code in your choice of framework",
        "✨ VEA adds features that you didn't know you needed!",
      ],
      cta: "Sounds unbelievable? Try it",
    },
    {
      id: 1,
      title: "Backend",
      subtitle: "Already ready.",
      description: "Your application is already ready and configured to integrate with the backend. Database schemas, authentication, etc. can all be setup on-the-go based on your choice of services.",
      icon: Database,
      details: [
        "Database schemas auto-generated",
        "Authentication and security configured",
        "API endpoints created automatically",
        "Ready for payment gateway and other integrations",
        "Cloud infrastructure provisioned",
      ],
      cta: "See it in action, now",
    },
    {
      id: 2,
      title: "Launch",
      subtitle: "Deploy instantly.",
      description: "From idea to live application in minutes, not months. Our deployment pipeline handles everything from code optimization, to server configuration for launching instantly.",
      icon: RocketIcon,
      details: [
        "Code optimization and bundling",
        "Sync with Github",
        "Ready to deploy on Netlify",
        "Ready to deploy on your custom domain",
        "Mobile apps ready to install in your device",
        "✨ You own the code. Clean, functional, and high quality.",
      ],
      cta: "Launch your idea, now",
    },
    {
      id: 3,
      title: "Templates",
      subtitle: "Jump start your idea launch.",
      description: "Top quality templates curated by our experts. Reduce token consumption by upto 80%.",
      icon: FileText,
      details: [
        "Landing page templates",
        "Web app templates",
        "Brand website templates",
        "Internal tool templates",
        "Mobile app templates",
        "Dashboard templates",
      ],
      cta: "Explore more templates",
    },
  ];

  const currentStep = steps[activeStep];
  const Icon = currentStep.icon;

  return (
    <section className="relative py-24 bg-gradient-to-br from-white via-cyan-50 to-amber-50 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-500/10 via-transparent to-transparent" />

      <div className="container mx-auto px-4 sm:px-6 relative">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            How VEA does it
          </h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            <span className="text-cyan-600 font-semibold">One sentence in</span> → Whole app out
          </p>
          <p className="text-gray-600 mt-4 max-w-3xl mx-auto">
            Forget endless tutorials. Skip the boilerplate. No coding required- just your
            imagination. Type it once and get a full-stack app, backend ready, integration
            ready, launch button waiting.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-7xl mx-auto items-center">
          {/* Left Side - Steps Navigation */}
          <div>
            <div className="space-y-4">
              {steps.map((step, index) => (
                <button
                  key={step.id}
                  onClick={() => setActiveStep(index)}
                  className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-300 shadow-sm hover:shadow-md ${
                    activeStep === index
                      ? "border-cyan-500 bg-white shadow-lg"
                      : "border-gray-200 bg-white/60 hover:border-cyan-300"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-2 h-2 rounded-full transition-all ${
                        activeStep === index ? "bg-cyan-400 w-3 h-3" : "bg-gray-500"
                      }`}
                    />
                    <span
                      className={`font-semibold text-lg transition-colors ${
                        activeStep === index ? "text-gray-900" : "text-gray-600"
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right Side - Step Content */}
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl border-2 border-cyan-200 p-8 min-h-[600px] shadow-xl">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Icon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-3xl font-bold text-gray-900">{currentStep.title}</h3>
                <p className="text-xl text-gray-600">{currentStep.subtitle}</p>
              </div>
            </div>

            <p className="text-gray-700 text-lg mb-6 leading-relaxed">
              {currentStep.description}
            </p>

            <div className="mb-6">
              <h4 className="text-gray-900 font-semibold mb-4 text-lg">WHAT ACTUALLY HAPPENS:</h4>
              <div className="space-y-3">
                {currentStep.details.map((detail, idx) => (
                  <div key={idx} className="flex items-start space-x-3">
                    <span className="text-cyan-600 font-semibold mt-1">
                      {detail.startsWith("✨") ? "" : `${idx + 1}.${currentStep.id + 1}`}
                    </span>
                    <span className={`${detail.startsWith("✨") ? "text-cyan-600 font-medium" : "text-gray-700"}`}>
                      {detail}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
              {currentStep.cta}
            </button>
          </div>
        </div>

        {/* Visual Indicator */}
        <div className="flex justify-center mt-8 space-x-2">
          {steps.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveStep(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                activeStep === index ? "bg-cyan-600 w-8" : "bg-gray-300"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;

