
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";

const DemoSection = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Watch How It Feels
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            See a real morning call in action and understand how gentle accountability can transform your daily routine.
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          <div className="bg-gray-900 rounded-lg overflow-hidden shadow-2xl aspect-video">
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-800 to-gray-900">
              <div className="text-center">
                <Button 
                  size="lg" 
                  className="bg-white text-gray-900 hover:bg-gray-100 rounded-full p-6 mb-4"
                >
                  <Play className="w-8 h-8" />
                </Button>
                <p className="text-white text-lg font-medium">
                  Experience a Sample Morning Call
                </p>
                <p className="text-gray-300 text-sm mt-2">
                  3 minutes • Real conversation, real results
                </p>
              </div>
            </div>
          </div>
          
          <div className="absolute -bottom-4 -right-4 bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-lg">
            <p className="text-sm font-medium">Coming Soon: Live Demo</p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600 mb-2">5 min</div>
              <p className="text-gray-600">Average call length</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600 mb-2">2x daily</div>
              <p className="text-gray-600">Morning + afternoon</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600 mb-2">0 pressure</div>
              <p className="text-gray-600">Just gentle guidance</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DemoSection;
