
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Mail, Phone, Star, ArrowRight, Shield } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const SignupForm = () => {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !phone) {
      toast({
        title: "Please fill in all fields",
        description: "We need both your email and phone number to get started.",
        variant: "destructive"
      });
      return;
    }

    // Simulate form submission
    setIsSubmitted(true);
    toast({
      title: "Welcome to Alara!",
      description: "We'll be in touch within 24 hours to schedule your first call.",
    });

    console.log("Alara signup:", { email, phone });
  };

  if (isSubmitted) {
    return (
      <section className="py-20 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="bg-white rounded-2xl p-8 shadow-2xl">
            <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome to the Journey! ✨
            </h3>
            <p className="text-gray-600 mb-8 text-lg">
              You're officially part of our early adopter community. We'll reach out within 24 hours 
              to schedule your first accountability call and get you started.
            </p>
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl">
              <h4 className="font-semibold text-gray-900 mb-3">What happens next:</h4>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></div>
                  <span>Check your email for welcome details</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></div>
                  <span>Expect a text to confirm your preferred call times</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></div>
                  <span>Your first call will be scheduled within 48 hours</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="7" cy="7" r="1"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
      
      <div className="max-w-4xl mx-auto px-4 relative">
        <div className="text-center mb-12">
          <div className="inline-flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-white/90 text-sm font-medium mb-6">
            <Star className="w-4 h-4 mr-2" />
            Early Adopter Program • Limited Spots
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Days?
          </h2>
          <p className="text-xl text-indigo-100 max-w-2xl mx-auto">
            Join the pilot program and help shape the future of voice-first productivity
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Benefits */}
          <div className="space-y-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h3 className="text-2xl font-bold text-white mb-6">What You Get:</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-white font-medium">Daily Voice Calls</p>
                    <p className="text-indigo-200 text-sm">5-minute morning clarity & afternoon check-ins</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-white font-medium">Direct Founder Access</p>
                    <p className="text-indigo-200 text-sm">Shape the product with weekly feedback sessions</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-white font-medium">Lifetime Early Pricing</p>
                    <p className="text-indigo-200 text-sm">Lock in $9/month forever as our thank you</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-indigo-200">
              <Shield className="w-5 h-5" />
              <span className="text-sm">No long-term commitment • Cancel anytime</span>
            </div>
          </div>

          {/* Right side - Form */}
          <div>
            <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
              <CardHeader className="text-center pb-6">
                <div className="flex justify-center mb-4">
                  <div className="bg-indigo-600 text-white px-6 py-2 rounded-full text-sm font-semibold">
                    Just $9/month
                  </div>
                </div>
                <CardTitle className="text-3xl font-bold text-gray-900">
                  Start Your Journey
                </CardTitle>
                <CardDescription className="text-lg text-gray-600">
                  Join 100+ early adopters building something amazing
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-0">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-12 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                      Phone Number
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="(555) 123-4567"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="pl-10 h-12 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      For your daily accountability calls (US numbers only during pilot)
                    </p>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 text-lg font-semibold h-14 group"
                  >
                    Join Alara Now
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>

                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-2">
                      Trusted by early adopters who believe in building together
                    </p>
                    <div className="flex justify-center items-center space-x-1">
                      {[1,2,3,4,5].map((star) => (
                        <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                      <span className="text-sm text-gray-600 ml-2">Built with pilot users</span>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SignupForm;
