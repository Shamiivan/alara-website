import { User, Session } from '@supabase/supabase-js';
import { Profile } from './supabase';

/**
 * Authentication state interface
 */
export interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Authentication context interface
 */
export interface AuthContextType extends AuthState {
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{
    error: Error | null;
  }>;
  updatePassword: (password: string) => Promise<{
    error: Error | null;
  }>;
  refreshProfile: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

/**
 * Authentication provider props
 */
export interface AuthProviderProps {
  children: React.ReactNode;
}