'use client';

import React from 'react';
import { LogOut, Slack, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Avatar } from './ui/avatar';
import { api } from '../lib/api';
import { toast } from 'sonner';

export const Header: React.FC = () => {
  const { user, logout, setUser } = useAuth();

  const handleConnectSlack = async () => {
    try {
      const url = await api.getSlackAuthUrl();
      window.location.href = url;
    } catch (err: any) {
      toast.error('Could not get Slack authorization URL: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDisconnectSlack = async () => {
    try {
      await api.disconnectSlack();
      if (user) {
        setUser({ ...user, isSlackConnected: false, slackInfo: null });
      }
      toast.success('Slack disconnected successfully');
    } catch {
      toast.error('Failed to disconnect Slack');
    }
  };

  const handleTestSlack = async () => {
    try {
      await api.sendTestSlackAlert();
      toast.success('Test alert sent to Slack!');
    } catch (err: any) {
      toast.error('Could not send Slack alert: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <header className="h-16 w-full bg-white border-b border-gray-100 px-6 sm:px-8 flex items-center justify-between shrink-0 sticky top-0 z-30">
      {/* Left: ReachInbox Logo */}
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center font-black text-sm tracking-tight shadow-sm">
          RI
        </div>
        <div>
          <span className="text-base font-bold tracking-tight text-gray-900">ReachInbox</span>
          <span className="text-[10px] text-gray-400 block -mt-1 font-medium">Scheduler Dashboard</span>
        </div>
      </div>

      {/* Right: Slack Connect + Avatar + Name + Email + Logout */}
      <div className="flex items-center space-x-4">
        {/* Slack Connection Pill */}
        {user?.isSlackConnected ? (
          <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Slack Connected</span>
            <button
              onClick={handleTestSlack}
              className="text-[10px] underline ml-1 hover:text-emerald-950 font-bold"
              title="Test alert"
            >
              Test
            </button>
            <button
              onClick={handleDisconnectSlack}
              className="text-gray-400 hover:text-red-500 ml-0.5 text-xs font-bold"
              title="Disconnect"
            >
              ×
            </button>
          </div>
        ) : (
          <button
            onClick={handleConnectSlack}
            className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-full text-xs font-semibold transition"
          >
            <Slack className="w-3.5 h-3.5 text-gray-800" />
            <span>Connect Slack</span>
          </button>
        )}

        {/* User Card */}
        {user && (
          <div className="flex items-center space-x-3 pl-2 sm:pl-4 border-l border-gray-100">
            <Avatar
              src={user.avatar}
              alt={user.name || 'User'}
              fallback={user.name || 'OB'}
              size="md"
            />
            <div className="text-left hidden md:block">
              <p className="text-xs font-bold text-gray-900 leading-tight">
                {user.name || 'Oliver Brown'}
              </p>
              <p className="text-[11px] text-gray-400 leading-none">
                {user.email}
              </p>
            </div>

            {/* Logout button */}
            <button
              onClick={logout}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition ml-1"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
