'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { signInWithEmailOrUsername, createUserProfile } from '@/lib/auth';
import { User, AuthContextType } from '@/types';

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const signIn = async (emailOrUsername: string, password: string) => {
    try {
      const userCredential = await signInWithEmailOrUsername(emailOrUsername, password);
      const userProfile = await createUserProfile(userCredential.user);
      setUser(userProfile);
    } catch (error: any) {
      console.error('AuthContext Sign in error - Code:', error?.code);
      console.error('AuthContext Sign in error - Message:', error?.message);
      console.error('AuthContext Sign in error - Full:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  const refreshUser = async () => {
    if (auth.currentUser) {
      try {
        const userProfile = await createUserProfile(auth.currentUser);
        setUser(userProfile);
      } catch (error) {
        console.error('AuthContext: Error refreshing user profile:', error);
      }
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userProfile = await createUserProfile(firebaseUser);
          setUser(userProfile);
        } catch (error) {
          console.error('AuthContext: Error creating user profile:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signOut,
    isAdmin,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};