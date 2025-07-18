import React, { createContext, useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import supabase from '@/lib/supabase';
import { AuthContextType, AuthProviderProps, AuthState } from '@/types/auth';
import { Profile } from '@/types/supabase';

// Create the auth context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  isLoading: true,
  error: null,
  isAuthenticated: false,
  isAdmin: false,
  signUp: async () => ({ error: null, user: null }),
  signIn: async () => ({ error: null, user: null }),
  signInWithGoogle: async () => { },
  signInWithGithub: async () => { },
  signOut: async () => { },
  resetPassword: async () => ({ error: null }),
  updatePassword: async () => ({ error: null }),
  refreshProfile: async () => { },
});

// Auth provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const navigate = useNavigate();
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    isLoading: true,
    error: null,
  });

  // Computed properties
  const isAuthenticated = !!state.user;
  const isAdmin = isAuthenticated && state.user?.email?.endsWith('@alara.com') || false;

  // Fetch user profile
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      return data as Profile;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  // Refresh user profile
  const refreshProfile = async () => {
    if (!state.user) return;

    const profile = await fetchProfile(state.user.id);
    setState((prev) => ({ ...prev, profile }));
  };

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      setState((prev) => ({ ...prev, isLoading: true }));

      try {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
          const { user } = session;
          const profile = await fetchProfile(user.id);

          setState({
            user,
            session,
            profile,
            isLoading: false,
            error: null,
          });
        } else {
          setState({
            user: null,
            session: null,
            profile: null,
            isLoading: false,
            error: null,
          });
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setState({
          user: null,
          session: null,
          profile: null,
          isLoading: false,
          error: error instanceof Error ? error : new Error('Unknown error'),
        });
      }
    };

    initializeAuth();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session && session.user) {
          const profile = await fetchProfile(session.user.id);
          setState({
            user: session.user,
            session,
            profile,
            isLoading: false,
            error: null,
          });
        } else {
          setState({
            user: null,
            session: null,
            profile: null,
            isLoading: false,
            error: null,
          });
        }
      }
    );

    // Clean up subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sign up with email and password
  const signUp = async (
    email: string,
    password: string,
    options?: { redirectTo?: string }
  ) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: options?.redirectTo,
        },
      });

      if (error) {
        toast({
          title: 'Sign up failed',
          description: error.message,
          variant: 'destructive',
        });
        setState((prev) => ({ ...prev, isLoading: false, error }));
        return { error, user: null };
      }

      toast({
        title: 'Sign up successful',
        description: 'Please check your email to confirm your account.',
      });

      setState((prev) => ({
        ...prev,
        isLoading: false,
        user: data.user,
        session: data.session,
      }));

      return { error: null, user: data.user };
    } catch (error) {
      const authError = error as AuthError;
      toast({
        title: 'Sign up failed',
        description: authError.message || 'An unknown error occurred',
        variant: 'destructive',
      });
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: authError,
      }));
      return { error: authError, user: null };
    }
  };

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: 'Sign in failed',
          description: error.message,
          variant: 'destructive',
        });
        setState((prev) => ({ ...prev, isLoading: false, error }));
        return { error, user: null };
      }

      toast({
        title: 'Sign in successful',
        description: `Welcome back${data.user.user_metadata.full_name ? ', ' + data.user.user_metadata.full_name : ''}!`,
      });

      const profile = await fetchProfile(data.user.id);

      setState((prev) => ({
        ...prev,
        isLoading: false,
        user: data.user,
        session: data.session,
        profile,
      }));

      return { error: null, user: data.user };
    } catch (error) {
      const authError = error as AuthError;
      toast({
        title: 'Sign in failed',
        description: authError.message || 'An unknown error occurred',
        variant: 'destructive',
      });
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: authError,
      }));
      return { error: authError, user: null };
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        toast({
          title: 'Google sign in failed',
          description: error.message,
          variant: 'destructive',
        });
        setState((prev) => ({ ...prev, isLoading: false, error }));
      }
    } catch (error) {
      const authError = error as AuthError;
      toast({
        title: 'Google sign in failed',
        description: authError.message || 'An unknown error occurred',
        variant: 'destructive',
      });
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: authError,
      }));
    }
  };

  // Sign in with GitHub
  const signInWithGithub = async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        toast({
          title: 'GitHub sign in failed',
          description: error.message,
          variant: 'destructive',
        });
        setState((prev) => ({ ...prev, isLoading: false, error }));
      }
    } catch (error) {
      const authError = error as AuthError;
      toast({
        title: 'GitHub sign in failed',
        description: authError.message || 'An unknown error occurred',
        variant: 'destructive',
      });
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: authError,
      }));
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));

      const { error } = await supabase.auth.signOut();

      if (error) {
        toast({
          title: 'Sign out failed',
          description: error.message,
          variant: 'destructive',
        });
        setState((prev) => ({ ...prev, isLoading: false, error }));
        return;
      }

      toast({
        title: 'Signed out successfully',
      });

      setState({
        user: null,
        session: null,
        profile: null,
        isLoading: false,
        error: null,
      });

      navigate('/');
    } catch (error) {
      const authError = error as AuthError;
      toast({
        title: 'Sign out failed',
        description: authError.message || 'An unknown error occurred',
        variant: 'destructive',
      });
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: authError,
      }));
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        toast({
          title: 'Password reset failed',
          description: error.message,
          variant: 'destructive',
        });
        setState((prev) => ({ ...prev, isLoading: false, error }));
        return { error };
      }

      toast({
        title: 'Password reset email sent',
        description: 'Please check your email for the password reset link.',
      });

      setState((prev) => ({ ...prev, isLoading: false }));
      return { error: null };
    } catch (error) {
      const authError = error as AuthError;
      toast({
        title: 'Password reset failed',
        description: authError.message || 'An unknown error occurred',
        variant: 'destructive',
      });
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: authError,
      }));
      return { error: authError };
    }
  };

  // Update password
  const updatePassword = async (password: string) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));

      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        toast({
          title: 'Password update failed',
          description: error.message,
          variant: 'destructive',
        });
        setState((prev) => ({ ...prev, isLoading: false, error }));
        return { error };
      }

      toast({
        title: 'Password updated successfully',
      });

      setState((prev) => ({ ...prev, isLoading: false }));
      return { error: null };
    } catch (error) {
      const authError = error as AuthError;
      toast({
        title: 'Password update failed',
        description: authError.message || 'An unknown error occurred',
        variant: 'destructive',
      });
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: authError,
      }));
      return { error: authError };
    }
  };

  // Context value
  const value: AuthContextType = {
    ...state,
    isAuthenticated,
    isAdmin,
    signUp,
    signIn,
    signInWithGoogle,
    signInWithGithub,
    signOut,
    resetPassword,
    updatePassword,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;