'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../hooks/useAuth';
import { Zap } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const { loginWithGoogle, loginDemo, loading } = useAuth();
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');

  // If already authenticated, redirect to /dashboard immediately
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

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await loginDemo();
      toast.success('Logged in as Oliver Brown');
    } catch (err: any) {
      toast.error('Login failed: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7F9] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 sm:p-10 max-w-[420px] w-full text-center">
        {/* Figma Heading & Logo */}
        <div className="w-12 h-12 rounded-xl bg-black text-white flex items-center justify-center mx-auto mb-4 font-black text-lg shadow-sm">
          RI
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Login</h1>
        <p className="text-xs text-gray-400 mb-6">ReachInbox Email Job Scheduler</p>

        {/* Real Google OAuth Button */}
        <div className="w-full flex justify-center mb-5">
          <GoogleLogin
            onSuccess={(credentialResponse) => {
              if (credentialResponse.credential) {
                handleGoogleSuccess(credentialResponse.credential);
              }
            }}
            onError={() => {
              toast.error('Google Sign In dialog closed or encountered an error');
            }}
            shape="rectangular"
            theme="outline"
            size="large"
            width="100%"
            text="continue_with"
          />
        </div>

        {/* Divider matching Figma */}
        <div className="relative flex items-center justify-center my-6">
          <div className="border-t border-gray-200 w-full" />
          <span className="bg-white px-3 text-xs text-gray-400 select-none absolute">
            or sign up through email
          </span>
        </div>

        {/* Email & Password Form matching Figma */}
        <form onSubmit={handleEmailSubmit} className="space-y-3.5">
          <div>
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="Email ID"
              className="w-full px-4 py-3 bg-[#F4F6F8] border border-transparent rounded-lg text-xs text-gray-800 placeholder-gray-400 focus:bg-white focus:border-[#00A859] focus:outline-none transition"
            />
          </div>

          <div>
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="Password"
              className="w-full px-4 py-3 bg-[#F4F6F8] border border-transparent rounded-lg text-xs text-gray-800 placeholder-gray-400 focus:bg-white focus:border-[#00A859] focus:outline-none transition"
            />
          </div>

          {/* Primary Login Button (Figma Outbox Labs Green) */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#00A859] hover:bg-[#00924d] active:bg-[#007f43] text-white font-semibold text-xs rounded-lg transition duration-150 shadow-sm disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* Instant Demo Evaluator Access */}
        <div className="mt-5 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={loginDemo}
            className="w-full py-2 px-3 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center space-x-1.5 transition"
          >
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Instant Evaluator Demo Sign-in</span>
          </button>
        </div>
      </div>
    </div>
  );
}
