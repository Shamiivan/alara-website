
import { CheckCircle, Heart, Lightbulb, Users } from "lucide-react";

const WhoThisIsFor = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Who This Is For
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Alara is designed for overwhelmed early adopters who want to shape something meaningful while getting real support.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="bg-indigo-100 p-2 rounded-full flex-shrink-0">
                <Heart className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">You're Overwhelmed But Motivated</h3>
                <p className="text-gray-600">You have goals and dreams but struggle with daily execution. You know what you want to do but need gentle accountability to make it happen.</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-indigo-100 p-2 rounded-full flex-shrink-0">
                <Lightbulb className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">You're an Early Adopter</h3>
                <p className="text-gray-600">You love being part of something new and meaningful. You understand that pilot products aren't perfect, but you see the potential.</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="bg-indigo-100 p-2 rounded-full flex-shrink-0">
                <Users className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">You Want to Co-Create</h3>
                <p className="text-gray-600">You don't just want to use a product—you want to help build it. Your feedback and insights will directly shape how Alara evolves.</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-indigo-100 p-2 rounded-full flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">You Value Authenticity</h3>
                <p className="text-gray-600">You prefer real conversations over automated messages. You want support that feels human, not robotic.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Your Voice Shapes Alara's Future
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            As an early adopter, you're not just getting accountability support—you're helping create the tool that will serve thousands of people like you. Your feedback, suggestions, and real-world usage will guide every feature we build.
          </p>
          <div className="flex justify-center items-center space-x-6 text-sm text-indigo-600">
            <span className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              Weekly feedback sessions
            </span>
            <span className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              Direct line to founders
            </span>
            <span className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              Lifetime early adopter pricing
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhoThisIsFor;
