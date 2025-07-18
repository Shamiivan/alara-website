import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail } from "lucide-react";

const VerifyEmail = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-indigo-600">Alara</h1>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-4">
              <div className="bg-indigo-100 p-3 rounded-full">
                <Mail className="h-8 w-8 text-indigo-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-center">Check your email</CardTitle>
            <CardDescription className="text-center">
              We've sent you a verification link to confirm your email address
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <p className="text-sm text-gray-500 text-center">
              Please check your email inbox and click on the verification link to complete your registration.
              If you don't see the email, check your spam folder.
            </p>

            <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
              <p className="text-sm text-amber-800">
                <strong>Note:</strong> You need to verify your email before you can sign in.
              </p>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate("/auth/login")}
            >
              Back to Sign In
            </Button>

            <p className="text-xs text-gray-500 text-center">
              Didn't receive an email? Check your spam folder or contact support.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default VerifyEmail;