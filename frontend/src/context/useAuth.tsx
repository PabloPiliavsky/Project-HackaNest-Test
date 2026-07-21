import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/api';
import { toast } from '../components/ui/Toast';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  image?: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkSession = async () => {
    try {
      const data = await api.get<{ user: User } | null>('/api/auth/get-session');
      if (data && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await api.post<any>('/api/auth/sign-in/email', { email, password });
      if (res && res.user) {
        setUser(res.user);
        toast({ title: '¡Bienvenido!', description: 'Sesión iniciada con éxito', type: 'success' });
      } else {
        // Fallback check
        await checkSession();
      }
    } catch (err: any) {
      throw err;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const res = await api.post<any>('/api/auth/sign-up/email', { name, email, password });
      if (res && res.user) {
        setUser(res.user);
        toast({ title: 'Registro Exitoso', description: 'Tu cuenta ha sido creada e iniciaste sesión.', type: 'success' });
      } else {
        await checkSession();
      }
    } catch (err: any) {
      throw err;
    }
  };

  const logout = async () => {
    try {
      await api.post('/api/auth/sign-out');
      setUser(null);
      toast({ title: 'Sesión Cerrada', description: 'Has cerrado sesión correctamente.', type: 'info' });
    } catch (err) {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, checkSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
