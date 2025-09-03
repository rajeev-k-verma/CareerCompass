import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '../services/api';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'job_seeker' | 'recruiter' | 'admin';
  profilePicture?: string;
  skills: string[];
  experience: string;
  location: string;
  resumeUploaded: boolean;
  profileComplete: boolean;
  isDemo?: boolean; // Optional flag for demo users
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  loading: boolean;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'job_seeker' | 'recruiter';
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const token = localStorage.getItem('token');
    if (token) {
      // Check if it's a demo token
      if (token.startsWith('demo_token_')) {
        // Get demo user data from localStorage
        const demoUserData = localStorage.getItem('demo_user');
        if (demoUserData) {
          try {
            setUser(JSON.parse(demoUserData));
          } catch (error) {
            console.error('Error parsing demo user data:', error);
            localStorage.removeItem('demo_user');
            // Fallback demo user
            setUser({
              id: 'demo',
              email: 'demo@example.com',
              firstName: 'Demo',
              lastName: 'User',
              role: 'job_seeker',
              skills: ['React', 'Node.js', 'JavaScript'],
              experience: 'Mid-level',
              location: 'Remote',
              resumeUploaded: true,
              profileComplete: true,
              isDemo: true
            });
          }
        } else {
          // Fallback demo user
          setUser({
            id: 'demo',
            email: 'demo@example.com',
            firstName: 'Demo',
            lastName: 'User',
            role: 'job_seeker',
            skills: ['React', 'Node.js', 'JavaScript'],
            experience: 'Mid-level',
            location: 'Remote',
            resumeUploaded: true,
            profileComplete: true,
            isDemo: true
          });
        }
        setLoading(false);
      } else {
        // Try to get real user profile, but check stored data first
        const storedUserData = localStorage.getItem('user_data');
        if (storedUserData) {
          try {
            const userData = JSON.parse(storedUserData);
            setUser(userData);
            setLoading(false);
            return;
          } catch (error) {
            console.error('Error parsing stored user data:', error);
            // If stored data is invalid, continue with API call
            localStorage.removeItem('user_data');
          }
        }
        
        // Try to get real user profile
        authAPI.getProfile()
          .then(profileUser => {
            const userData = {
              ...profileUser,
              role: profileUser.role as 'job_seeker' | 'recruiter' | 'admin'
            };
            setUser(userData);
            localStorage.setItem('user_data', JSON.stringify(userData));
          })
          .catch((error) => {
            console.error('Failed to get profile:', error);
            // If profile endpoint fails, clear tokens and continue as unauthenticated
            localStorage.removeItem('token');
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user_data');
            setUser(null);
          })
          .finally(() => setLoading(false));
      }
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login(email, password);
      localStorage.setItem('token', response.token);
      
      // Check if this was a network fallback
      if ('networkFallback' in response && response.networkFallback) {
        localStorage.setItem('network_fallback', 'true');
      } else {
        localStorage.removeItem('network_fallback');
      }
      
      const userData = {
        ...response.user,
        role: response.user.role as 'job_seeker' | 'recruiter' | 'admin'
      };
      setUser(userData);
      // Store user data in localStorage to prevent role issues
      localStorage.setItem('user_data', JSON.stringify(userData));
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      const response = await authAPI.register(userData);
      localStorage.setItem('token', response.token);
      const userWithRole = {
        ...response.user,
        role: response.user.role as 'job_seeker' | 'recruiter' | 'admin'
      };
      setUser(userWithRole);
      // Store user data in localStorage to prevent role issues
      localStorage.setItem('user_data', JSON.stringify(userWithRole));
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = () => {
    authAPI.logout();
    localStorage.removeItem('user_data'); // Clear stored user data
    setUser(null);
  };

  const updateProfile = async (data: Partial<User>) => {
    // Transform User data to UserProfileData format for API
    const apiData = {
      ...data,
      id: data.id ? parseInt(data.id) : undefined,
      first_name: data.firstName,
      last_name: data.lastName,
      profile_picture: data.profilePicture,
      resume_uploaded: data.resumeUploaded,
      profile_complete: data.profileComplete
    };
    
    const updatedUser = await authAPI.updateProfile(apiData);
    
    // Ensure role is properly typed
    const userWithRole = {
      ...updatedUser,
      role: updatedUser.role as 'job_seeker' | 'recruiter' | 'admin'
    };
    
    setUser(userWithRole);
    // Update localStorage as well
    localStorage.setItem('user_data', JSON.stringify(userWithRole));
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      updateProfile,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};