
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import WhoThisIsFor from "@/components/WhoThisIsFor";
import DemoSection from "@/components/DemoSection";
import SignupForm from "@/components/SignupForm";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <Features />
      <WhoThisIsFor />
      <DemoSection />
      <SignupForm />
      
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="mb-8">
            <h3 className="text-2xl font-bold mb-4">Alara - Voice Accountability Assistant</h3>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Transforming overwhelm into clarity, one conversation at a time. 
              Built by people who understand the daily struggle of staying focused.
            </p>
          </div>
          
          <div className="border-t border-gray-800 pt-8">
            <p className="text-gray-500 text-sm">
              © 2024 Alara. Early adopter program • Built with pilot users like you.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
