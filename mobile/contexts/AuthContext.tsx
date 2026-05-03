import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiUrl } from '@/constants/api';
import { loginUser } from '../src/api/auth';

type UserRole = 'admin' | 'user';

export type AuthUser = {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  token: string;
} | null;

type AuthContextType = {
  user: AuthUser;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; message?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ ok: boolean; message?: string }>;
  forgotPassword: (email: string, newPassword: string) => Promise<{ ok: boolean; message?: string }>;
  loginWithGoogle: (idToken: string) => Promise<{ ok: boolean; message?: string }>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const STORAGE_KEY = 'smart-campus-auth';

// Set this to true ONLY when you want to clear old login once.
// After testing, change it back to false.
const FORCE_LOGOUT_ON_START = false;

const normalizeRole = (role: unknown): UserRole => {
  return String(role || '')
    .trim()
    .toLowerCase() === 'admin'
    ? 'admin'
    : 'user';
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredUser();
  }, []);

  const loadStoredUser = async () => {
    try {
      if (FORCE_LOGOUT_ON_START) {
        await AsyncStorage.removeItem(STORAGE_KEY);
        setUser(null);
        return;
      }

      const stored = await AsyncStorage.getItem(STORAGE_KEY);

      if (stored) {
        const parsedUser = JSON.parse(stored);

        if (parsedUser?.token && parsedUser?.email) {
          const normalizedUser: AuthUser = {
            _id: parsedUser._id,
            name: parsedUser.name,
            email: parsedUser.email,
            role: normalizeRole(parsedUser.role),
            token: parsedUser.token,
          };

          setUser(normalizedUser);
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedUser));
        } else {
          await AsyncStorage.removeItem(STORAGE_KEY);
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.log('Load user error:', error);
      await AsyncStorage.removeItem(STORAGE_KEY);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const saveUser = async (data: any) => {
    const authUser: AuthUser = {
      _id: data.user._id,
      name: data.user.name,
      email: data.user.email,
      role: normalizeRole(data.user.role),
      token: data.token,
    };

    setUser(authUser);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
  };

  const login = async (email: string, password: string) => {
  try {
    const res = await loginUser({
      email: email.trim().toLowerCase(),
      password,
    });

    const data = res.data;

    // Save user (this already works in your code)
    const authUser = {
      _id: data.user._id,
      name: data.user.name,
      email: data.user.email,
      role: data.user.role === 'admin' ? 'admin' : 'user',
      token: data.token,
    };

    setUser(authUser);
    await AsyncStorage.setItem('smart-campus-auth', JSON.stringify(authUser));

    return { ok: true };

  } catch (error) {
    console.log('LOGIN ERROR:', error);

    return {
      ok: false,
      message:
        error?.response?.data?.message || 'Cannot connect to server',
    };
  }
};

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await fetch(apiUrl('/auth/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { ok: false, message: data.message || 'Registration failed' };
      }

      await saveUser(data);
      return { ok: true };
    } catch (error) {
      console.log('Register error:', error);
      return { ok: false, message: 'Cannot connect to server' };
    }
  };

  const forgotPassword = async (email: string, newPassword: string) => {
    try {
      const response = await fetch(apiUrl('/auth/forgot-password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { ok: false, message: data.message || 'Password reset failed' };
      }

      return { ok: true, message: data.message || 'Password updated successfully' };
    } catch (error) {
      console.log('Forgot password error:', error);
      return { ok: false, message: 'Cannot connect to server' };
    }
  };

  const loginWithGoogle = async (idToken: string) => {
    try {
      const response = await fetch(apiUrl('/auth/google'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { ok: false, message: data.message || 'Google login failed' };
      }

      await saveUser(data);
      return { ok: true };
    } catch (error) {
      console.log('Google login error:', error);
      return { ok: false, message: 'Cannot connect to server' };
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setUser(null);
    } catch (error) {
      console.log('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, forgotPassword, loginWithGoogle, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
