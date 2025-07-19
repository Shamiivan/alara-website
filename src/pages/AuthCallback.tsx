import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "@/lib/supabase";
import { Loader2 } from "lucide-react";

const AuthCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // First, let Supabase handle the OAuth callback from URL hash
        const { data, error } = await supabase.auth.getUser();

        if (error) {
          console.error("Auth error:", error);
          setError(error.message);
          return;
        }

        if (data?.user) {
          // Successfully authenticated
          console.log("User authenticated:", data.user.email);
          navigate("/dashboard");
        } else {
          // Check if we have tokens in the URL hash
          const hashParams = window.location.hash;
          if (hashParams.includes('access_token')) {
            // Give Supabase a moment to process the tokens
            setTimeout(async () => {
              const { data: userData } = await supabase.auth.getUser();
              if (userData?.user) {
                navigate("/dashboard");
              } else {
                setError("Failed to authenticate. Please try again.");
              }
            }, 2000);
          } else {
            // No tokens found, redirect to login
            navigate("/auth/login");
          }
        }
      } catch (err) {
        console.error("Error handling auth callback:", err);
        setError("An unexpected error occurred during authentication.");
      }
    };

    handleAuthCallback();
  }, [navigate]);

  // Also listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        console.log("Auth state changed: signed in");
        navigate("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Authentication Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate("/auth/login")}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900">Completing authentication...</h1>
        <p className="text-gray-600 mt-2">Please wait while we sign you in.</p>
      </div>
    </div>
  );
};

export default AuthCallback;