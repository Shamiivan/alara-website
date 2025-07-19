import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import supabase from "@/lib/supabase";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import SocialLogin from "./SocialLogin";

// Form validation schema
const signupSchema = z
  .object({
    fullName: z.string().min(2, {
      message: "Full name must be at least 2 characters",
    }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    password: z.string().min(8, {
      message: "Password must be at least 8 characters",
    }),
    confirmPassword: z.string(),
    phone: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignupFormValues = z.infer<typeof signupSchema>;

const SignupForm = () => {
  const navigate = useNavigate();
  // const { signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
    },
  });

  // const onSubmit = async (data: SignupFormValues) => {
  //   try {
  //     setIsLoading(true);

  //     // Sign up with email and password
  //     // const { error, user } = await signUp(data.email, data.password, {
  //     //   redirectTo: `${window.location.origin}/auth/callback`,
  //     // });

  //     if (!error && user) {
  //       // Update user metadata with full name
  //       await supabase.auth.updateUser({
  //         data: {
  //           full_name: data.fullName,
  //         },
  //       });

  //       // Update profile with phone number if provided
  //       if (data.phone) {
  //         await supabase
  //           .from('profiles')
  //           .update({ phone: data.phone })
  //           .eq('id', user.id);
  //       }

  //       navigate("/auth/verify-email");
  //     }
  //   } catch (error) {
  //     console.error("Signup error:", error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
        <CardDescription>
          Enter your information to create an account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SocialLogin className="mt-6" />
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button
          variant="link"
          onClick={() => navigate("/auth/login")}
          className="text-sm"
        >
          Already have an account? Sign in
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SignupForm;