'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, UserRole } from '../../types/auth';
import { loginApi, registerApi, logoutApi, getMeApi, updateProfileApi } from '../../services/auth';

interface AuthContextType {
  user: User | null;
  profile: any;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (fullName: string, email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (age: number, gender: string, height: number, weight: number) => Promise<boolean>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Fetch current user session on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await getMeApi();
        if (response.success && response.data) {
          setUser(response.data.user);
          setProfile(response.data.profile);
        }
      } catch (err) {
        console.warn('[INFO] User not logged in.');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    const response = await loginApi({ email, password });
    
    if (response.success && response.data) {
      setUser(response.data.user);
      // Fetch user profile info on login
      const userDetails = await getMeApi();
      if (userDetails.success && userDetails.data) {
        setProfile(userDetails.data.profile);
      }
      setLoading(false);
      // Redirect based on role
      // Redirect based on role using window.location to force fresh HTTP request committing cookie
      const targetRoute = response.data.user.role === 'Doctor' ? '/doctor' : '/patient';
      window.location.href = targetRoute;
      return true;
    } else {
      setError(response.error?.message || 'Login failed.');
      setLoading(false);
      return false;
    }
  };

  const register = async (fullName: string, email: string, password: string, role: UserRole): Promise<boolean> => {
    setLoading(true);
    setError(null);
    const response = await registerApi({ fullName, email, password, role });
    
    if (response.success && response.data) {
      setLoading(false);
      // Auto login after registration
      return await login(email, password);
    } else {
      setError(response.error?.message || 'Registration failed.');
      setLoading(false);
      return false;
    }
  };

  const logout = async () => {
    setLoading(true);
    await logoutApi();
    setUser(null);
    setProfile(null);
    setLoading(false);
    window.location.href = '/login';
  };

  const updateProfile = async (age: number, gender: string, height: number, weight: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    const response = await updateProfileApi({ age, gender, height, weight });

    if (response.success && response.data) {
      setProfile(response.data);
      setLoading(false);
      return true;
    } else {
      setError(response.error?.message || 'Failed to update profile.');
      setLoading(false);
      return false;
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider value={{ user, profile, loading, error, login, register, logout, updateProfile, clearError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
