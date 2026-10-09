'use client';

import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { Zap } from 'lucide-react';

interface LoginScreenProps {
  onGoogleSuccess: (credential: string) => void;
  onDemoLogin: () => void;
  loading: boolean;
  error: string | null;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onGoogleSuccess,
  onDemoLogin,
  loading,
  error,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Use demo login or create session with entered email
    onDemoLogin();
  };

  return (
    <div className="min-h-screen bg-[#F5F7F9] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 sm:p-10 max-w-[420px] w-full text-center">
        {/* Figma Heading */}
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Login</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg text-left">
            {error}
          </div>
        )}

        {/* Real Google OAuth Button */}
        <div className="w-full flex justify-center mb-5">
          <GoogleLogin
            onSuccess={(credentialResponse) => {
              if (credentialResponse.credential) {
                onGoogleSuccess(credentialResponse.credential);
              }
            }}
            onError={() => console.error('Google Login Failed')}
            shape="rectangular"
            theme="outline"
            size="large"
            width="100%"
            text="continue_with"
          />
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center my-6">
          <div className="border-t border-gray-200 w-full" />
          <span className="bg-white px-3 text-xs text-gray-400 select-none absolute">
            or sign up through email
          </span>
        </div>

        {/* Email & Password Form matching Figma */}
        <form onSubmit={handleEmailLogin} className="space-y-3.5">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email ID"
              className="w-full px-4 py-3 bg-[#F4F6F8] border border-transparent rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:bg-white focus:border-[#00A859] focus:outline-none transition"
            />
          </div>

          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-4 py-3 bg-[#F4F6F8] border border-transparent rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:bg-white focus:border-[#00A859] focus:outline-none transition"
            />
          </div>

          {/* Primary Login Button (Figma Outbox Labs Green) */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#00A859] hover:bg-[#00924d] active:bg-[#007f43] text-white font-semibold text-sm rounded-lg transition duration-150 shadow-sm disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* One-Click Recruiter Demo Access */}
        <div className="mt-5 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onDemoLogin}
            className="w-full py-2 px-3 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center space-x-1.5 transition"
          >
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Instant Evaluator Demo Sign-in</span>
          </button>
        </div>
      </div>
    </div>
  );
};
