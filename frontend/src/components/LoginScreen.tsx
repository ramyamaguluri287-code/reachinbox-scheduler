import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { Mail, Clock, Zap, ShieldCheck } from 'lucide-react';

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
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl border border-slate-100/10 text-center relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Brand Icon */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/20 mb-6">
          <Mail className="w-8 h-8 text-white" />
        </div>

        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">ReachInbox</h1>
        <p className="text-sm text-slate-500 mt-1 font-medium">Production Email Job Scheduler</p>

        <p className="text-xs text-slate-500 mt-4 leading-relaxed">
          High-throughput email sequence scheduling powered by BullMQ delayed queues, Redis rate limiters, and fake Ethereal SMTP.
        </p>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
            {error}
          </div>
        )}

        {/* Google OAuth Button */}
        <div className="mt-8 flex flex-col items-center justify-center space-y-4">
          <div className="flex justify-center w-full">
            <GoogleLogin
              onSuccess={(credentialResponse) => {
                if (credentialResponse.credential) {
                  onGoogleSuccess(credentialResponse.credential);
                }
              }}
              onError={() => console.error('Login Failed')}
              shape="pill"
              theme="outline"
              size="large"
              text="continue_with"
            />
          </div>

          <div className="relative w-full flex items-center justify-center my-2">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-[11px] text-slate-400 uppercase tracking-wider absolute">or</span>
          </div>

          {/* Quick Demo Access Button */}
          <button
            onClick={onDemoLogin}
            disabled={loading}
            className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-full text-xs font-semibold transition shadow-md flex items-center justify-center space-x-2"
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Instant Demo Sign-in (Evaluator / Recruiter)</span>
          </button>
        </div>

        {/* Features badge */}
        <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-2 gap-3 text-left">
          <div className="flex items-start space-x-2 text-[11px] text-slate-600">
            <Clock className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
            <span>Zero-cron delayed BullMQ queuing</span>
          </div>
          <div className="flex items-start space-x-2 text-[11px] text-slate-600">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
            <span>Safe rate limiting & Slack alerts</span>
          </div>
        </div>
      </div>
    </div>
  );
};
