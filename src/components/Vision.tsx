
import { MessageCircle, Heart, Brain, Target } from "lucide-react";

const Vision = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Transform Overwhelm Into Progress
            <span className="text-indigo-600 block">Through Conversation</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Real change happens when you understand yourself, not when you master another app. 
            We believe in progress through reflection, clarity through conversation, 
            and accountability that feels like friendship.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div className="text-center">
            <div className="bg-indigo-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Voice-First</h3>
            <p className="text-gray-600 text-sm">
              Talk naturally, like you would to a trusted friend who truly listens
            </p>
          </div>

          <div className="text-center">
            <div className="bg-indigo-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Brain className="w-8 h-8 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Self-Awareness</h3>
            <p className="text-gray-600 text-sm">
              Discover patterns in your thoughts and emotions that drive real change
            </p>
          </div>

          <div className="text-center">
            <div className="bg-indigo-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Gentle Support</h3>
            <p className="text-gray-600 text-sm">
              Accountability without judgment, guidance without pressure
            </p>
          </div>

          <div className="text-center">
            <div className="bg-indigo-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Clear Action</h3>
            <p className="text-gray-600 text-sm">
              Turn inner clarity into concrete steps that actually matter
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-8 md:p-12">
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
              Beyond To-Do Lists and Color-Coded Calendars
            </h3>
            <p className="text-lg text-gray-700 mb-6 leading-relaxed">
              We've tried them all – the apps, the systems, the productivity hacks. 
              But real progress isn't about managing tasks; it's about managing yourself. 
              Your emotions, your energy, your inner dialogue.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              Alara meets you where you are, helping you understand what's working, 
              what isn't, and most importantly – why. Through simple daily conversations 
              that feel more like therapy than task management.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Vision;
