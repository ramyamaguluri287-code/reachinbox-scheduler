'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoginScreen } from '../../src/components/LoginScreen';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const { loginWithGoogle, loginDemo, loading } = useAuth();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      router.replace('/dashboard');
    }
  }, [router]);

  const handleGoogleSuccess = async (credential: string) => {
    try {
      await loginWithGoogle(credential);
      toast.success('Successfully logged in with Google!');
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.message || 'Google authentication failed');
    }
  };

  const handleDemoLogin = async () => {
    try {
      await loginDemo();
      toast.success('Logged in as Oliver Brown');
    } catch (err: any) {
      toast.error('Login failed: ' + err.message);
    }
  };

  return (
    <LoginScreen
      onGoogleSuccess={handleGoogleSuccess}
      onDemoLogin={handleDemoLogin}
      loading={loading}
      error={null}
    />
  );
}
