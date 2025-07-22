
import { Button } from "@/components/ui/button";
import TypingAnimation from "./TypingAnimation";

const Hero = () => {
  const typingPhrases = [
    "help you stay organized",
    "help you follow through",
    "help you execute",
    "keep you accountable",
    "turn overwhelm into clarity"
  ];

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-8">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Meet Alara: Your AI Friend that{" "}
            <span className="text-indigo-600 block">
              <TypingAnimation phrases={typingPhrases} />
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Get personalized morning and mid-day calls that help you capture what matters most.
            Built with real people who know the struggle of staying on track.
          </p>
        </div>

        <div className="mb-12">
          <Button
            size="lg"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 text-lg font-semibold rounded-lg shadow-lg transform transition hover:scale-105"
          >
            Join the Program – Just $9/month
          </Button>
          <p className="text-sm text-gray-500 mt-3">Built with pilot users like you.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-3">🌅</div>
            <h3 className="font-semibold text-gray-800 mb-2">Morning Clarity</h3>
            <p className="text-gray-600 text-sm">Start your day with intention through guided voice conversations</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-3">⏰</div>
            <h3 className="font-semibold text-gray-800 mb-2">Mid-Day Reset</h3>
            <p className="text-gray-600 text-sm">Stay on course with gentle check-ins that keep you focused</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-3">🤝</div>
            <h3 className="font-semibold text-gray-800 mb-2">Co-Creation</h3>
            <p className="text-gray-600 text-sm">Shape the product with us as we build something that truly works</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;