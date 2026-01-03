// contexts/AuthContext.tsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';

interface AuthContextType {
  userToken: string | null;
  isLoading: boolean;
  signIn: (email: string, pass: string) => Promise<boolean>;
  signOut: () => void;
  signUp: (email: string, pass: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // ตรวจสอบ Token เมื่อเปิดแอป
    const checkLogin = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        setUserToken(token);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    checkLogin();
  }, []);

  const signIn = async (email: string, pass: string) => {
    try {
      // เรียก API Login จาก Backend
      const response = await api.post('/login', { email, password: pass });
      
      if (response.data.status === 'ok') {
        const token = response.data.data;
        setUserToken(token);
        await AsyncStorage.setItem('userToken', token);
        return true;
      }
      return false;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  const signUp = async (email: string, pass: string) => {
    try {
      const response = await api.post('/register', { email, password: pass });
      return response.data.status === 'ok';
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  const signOut = async () => {
    setUserToken(null);
    await AsyncStorage.removeItem('userToken');
  };

  return (
    <AuthContext.Provider value={{ userToken, isLoading, signIn, signOut, signUp }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);