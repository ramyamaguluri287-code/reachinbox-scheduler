import React from 'react';
import { User } from '../types';
import { LogOut, ExternalLink, Slack, CheckCircle2 } from 'lucide-react';

interface NavbarProps {
  user: User;
  onLogout: () => void;
  onConnectSlack: () => void;
  onDisconnectSlack: () => void;
  onSendTestSlack: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onLogout,
  onConnectSlack,
  onDisconnectSlack,
  onSendTestSlack,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center shadow-md shadow-indigo-100">
              <span className="text-white font-bold text-xl tracking-tight">R</span>
            </div>
            <div>
              <span className="text-lg font-bold text-slate-900 tracking-tight">ReachInbox</span>
              <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                Scheduler
              </span>
            </div>
          </div>

          {/* Right Header Action Items */}
          <div className="flex items-center space-x-4">
            {/* Bull-Board Live Queue Monitor */}
            <a
              href="http://localhost:5000/admin/queues"
              target="_blank"
              rel="noreferrer"
              className="hidden md:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
              title="Open Live BullMQ Queue Monitoring Dashboard"
            >
              <span>BullMQ Board</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            {/* Slack Integration Status / Button */}
            {user.isSlackConnected ? (
              <div className="flex items-center space-x-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg text-xs text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="font-medium">Slack Connected</span>
                <button
                  onClick={onSendTestSlack}
                  className="ml-1 text-[11px] underline text-emerald-700 hover:text-emerald-900"
                  title="Send sample rate-limit alert to verify"
                >
                  Test Alert
                </button>
                <button
                  onClick={onDisconnectSlack}
                  className="ml-1 text-[11px] text-slate-400 hover:text-red-500"
                  title="Disconnect Slack"
                >
                  (×)
                </button>
              </div>
            ) : (
              <button
                onClick={onConnectSlack}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 text-white hover:bg-slate-800 transition shadow-sm"
              >
                <Slack className="w-3.5 h-3.5" />
                <span>Connect Slack</span>
              </button>
            )}

            {/* User Profile */}
            <div className="flex items-center space-x-3 pl-2 border-l border-slate-200">
              <img
                src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                alt={user.name || 'User'}
                className="w-9 h-9 rounded-full object-cover border border-slate-300"
              />
              <div className="hidden sm:block text-left text-xs">
                <p className="font-semibold text-slate-800 leading-tight">{user.name || 'Outbox Lead'}</p>
                <p className="text-slate-500 text-[11px] truncate max-w-[140px]">{user.email}</p>
              </div>
              <button
                onClick={onLogout}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
