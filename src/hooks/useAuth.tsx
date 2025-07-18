import { useContext } from 'react';
import AuthContext from '@/contexts/AuthContext';
import { AuthContextType } from '@/types/auth';

/**
 * Custom hook to access the authentication context
 * @returns The authentication context
 * @throws Error if used outside of AuthProvider
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

export default useAuth;