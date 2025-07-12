
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Mail, Phone } from "lucide-react";
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
      <section className="py-20 bg-indigo-600">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="bg-white rounded-lg p-8 shadow-xl">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              You're In! Welcome to Alara
            </h3>
            <p className="text-gray-600 mb-6">
              We'll reach out within 24 hours to schedule your first accountability call. 
              Get ready to transform how you start your days!
            </p>
            <div className="bg-indigo-50 p-4 rounded-lg">
              <p className="text-sm text-indigo-700">
                <strong>What's next:</strong> Check your email for welcome details and expect a text to confirm your preferred call times.
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-indigo-600">
      <div className="max-w-2xl mx-auto px-4">
        <Card className="shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-gray-900">
              Join the Alara Program
            </CardTitle>
            <CardDescription className="text-lg">
              Just $9/month. Help us build something that actually works for real people like you.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
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
                    className="pl-10"
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
                    className="pl-10"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500">
                  We'll use this for your accountability calls (US numbers only during pilot)
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 text-lg font-semibold"
              >
                Start with Alara – $9/month
              </Button>

              <div className="text-center space-y-2">
                <p className="text-xs text-gray-500">
                  No long-term commitment. Cancel anytime.
                </p>
                <p className="text-sm text-indigo-600 font-medium">
                  Built with pilot users like you.
                </p>
              </div>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-3">What early adopters get:</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Direct line to the founders for feedback
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Influence on product direction and features
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Lock in early adopter pricing forever
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default SignupForm;
