// context/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true); // wait until loading from storage

  useEffect(() => {
    const loadUser = async () => {
      const token = await AsyncStorage.getItem('token');
      const username = await AsyncStorage.getItem('username');
      if (token && username) {
        setUser({ username, token });
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  const login = async ({ username, token }: any) => {
    await AsyncStorage.setItem('token', token);
    await AsyncStorage.setItem('username', username);
    setUser({ username, token });
  };

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('username');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
