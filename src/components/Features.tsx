
import { CheckCircle, Phone, Clock, Users } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: <Phone className="w-8 h-8 text-indigo-600" />,
      title: "Morning Voice Call",
      description: "Start each day with a personalized 5-minute call that helps you identify your top 3 priorities and set clear intentions.",
      benefits: ["Clarity on what matters most", "Reduced morning overwhelm", "Consistent daily structure"]
    },
    {
      icon: <Clock className="w-8 h-8 text-indigo-600" />,
      title: "Mid-Day Check-In",
      description: "A gentle afternoon touchpoint to assess progress, adjust course, and maintain momentum without judgment.",
      benefits: ["Stay on track throughout the day", "Flexible adjustments when needed", "Celebrate small wins"]
    },
    {
      icon: <Users className="w-8 h-8 text-indigo-600" />,
      title: "Co-Creation Emphasis",
      description: "You're not just a user—you're a partner. Your feedback directly shapes how this tool evolves to serve you better.",
      benefits: ["Direct input on features", "Weekly feedback sessions", "Early access to new capabilities"]
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Simple, human-centered accountability that fits into your life—not the other way around.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {features.map((feature, index) => (
            <div key={index} className="text-center">
              <div className="flex justify-center mb-6">
                <div className="bg-indigo-50 p-4 rounded-full">
                  {feature.icon}
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {feature.title}
              </h3>
              
              <p className="text-gray-600 mb-6 leading-relaxed">
                {feature.description}
              </p>
              
              <ul className="text-left space-y-2">
                {feature.benefits.map((benefit, benefitIndex) => (
                  <li key={benefitIndex} className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
