'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '../lib/types';
import { api } from '../lib/api';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    router.push('/login');
  }, [router]);

  // Load user from token on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (!savedToken) {
      setLoading(false);
      return;
    }

    setToken(savedToken);
    api
      .getCurrentUser()
      .then((userData) => {
        setUser(userData);
      })
      .catch((err) => {
        console.error('Session expired or invalid:', err);
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const loginWithGoogle = async (credential: string) => {
    setLoading(true);
    try {
      const data = await api.verifyGoogleToken(credential);
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      router.push('/dashboard');
      return data;
    } finally {
      setLoading(false);
    }
  };

  const loginDemo = async () => {
    setLoading(true);
    try {
      const fakePayload = {
        sub: 'demo-evaluator-101',
        email: 'oliver.brown@domain.io',
        name: 'Oliver Brown',
        picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
      };
      const fakeToken =
        btoa(JSON.stringify({ alg: 'none' })) +
        '.' +
        btoa(JSON.stringify(fakePayload)) +
        '.';
      const data = await api.verifyGoogleToken(fakeToken);
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      router.push('/dashboard');
      return data;
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    loginWithGoogle,
    loginDemo,
    logout,
    setUser,
  };
}
