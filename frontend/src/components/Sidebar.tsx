'use client';

import React from 'react';
import { User } from '../types';
import { Clock, Send, Activity, ChevronDown, LogOut, ExternalLink, Slack, CheckCircle2, X } from 'lucide-react';

interface SidebarProps {
  user: User;
  activeTab: 'scheduled' | 'sent' | 'queues';
  onTabChange: (tab: 'scheduled' | 'sent' | 'queues') => void;
  onOpenCompose: () => void;
  scheduledCount: number;
  sentCount: number;
  onLogout: () => void;
  onConnectSlack: () => void;
  onDisconnectSlack: () => void;
  onSendTestSlack: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  user,
  activeTab,
  onTabChange,
  onOpenCompose,
  scheduledCount,
  sentCount,
  onLogout,
  onConnectSlack,
  onDisconnectSlack,
  onSendTestSlack,
}) => {
  return (
    <aside className="w-64 bg-white border-r border-gray-100 flex flex-col justify-between h-screen shrink-0 sticky top-0">
      {/* Top Section */}
      <div className="p-5">
        {/* Brand Logo matching Figma "ONB" */}
        <div className="mb-6">
          <span className="text-2xl font-black tracking-tight text-gray-900 font-sans">ONB</span>
        </div>

        {/* User Card matching Figma */}
        <div className="flex items-center justify-between p-2 rounded-xl bg-gray-50 border border-gray-100 mb-6">
          <div className="flex items-center space-x-2.5 overflow-hidden">
            <img
              src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
              alt={user.name || 'User'}
              className="w-9 h-9 rounded-full object-cover shrink-0"
            />
            <div className="overflow-hidden text-left">
              <h4 className="text-xs font-bold text-gray-800 truncate leading-tight">
                {user.name || 'Oliver Brown'}
              </h4>
              <p className="text-[11px] text-gray-400 truncate">
                {user.email || 'oliver.brown@domain.io'}
              </p>
            </div>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0 ml-1" />
        </div>

        {/* Primary "+ Compose" Pill Button matching Figma */}
        <button
          onClick={onOpenCompose}
          className="w-full py-2.5 px-4 mb-6 rounded-full border border-[#00A859] text-[#00A859] hover:bg-[#EAF8F1] active:bg-[#D5F2E2] font-semibold text-xs tracking-wide transition flex items-center justify-center space-x-1.5 shadow-sm"
        >
          <span>Compose</span>
        </button>

        {/* Section Heading "CORE" */}
        <div className="mb-2">
          <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">CORE</span>
        </div>

        {/* Navigation Tabs matching Figma */}
        <nav className="space-y-1">
          {/* Scheduled Tab */}
          <button
            onClick={() => onTabChange('scheduled')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'scheduled'
                ? 'bg-[#EAF8F1] text-[#00A859]'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <Clock className="w-4 h-4" />
              <span>Scheduled</span>
            </div>
            <span
              className={`text-[11px] font-semibold ${
                activeTab === 'scheduled' ? 'text-[#00A859]' : 'text-gray-400'
              }`}
            >
              {scheduledCount}
            </span>
          </button>

          {/* Sent Tab */}
          <button
            onClick={() => onTabChange('sent')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'sent'
                ? 'bg-[#EAF8F1] text-[#00A859]'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <Send className="w-4 h-4" />
              <span>Sent</span>
            </div>
            <span
              className={`text-[11px] font-semibold ${
                activeTab === 'sent' ? 'text-[#00A859]' : 'text-gray-400'
              }`}
            >
              {sentCount}
            </span>
          </button>

          {/* Unified BullMQ Queue Monitor Tab */}
          <button
            onClick={() => onTabChange(activeTab === 'queues' ? 'scheduled' : 'queues')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition group ${
              activeTab === 'queues'
                ? 'bg-[#EAF8F1] text-[#00A859]'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <Activity className="w-4 h-4" />
              <span>Queue Monitor</span>
            </div>
            {activeTab === 'queues' ? (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  onTabChange('scheduled');
                }}
                className="p-1 rounded-full hover:bg-emerald-200 text-emerald-800 transition"
                title="Close Queue Monitor (X)"
              >
                <X className="w-3.5 h-3.5 stroke-[2.5]" />
              </span>
            ) : (
              <span className="flex items-center space-x-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>LIVE</span>
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* Bottom Integrations & Controls */}
      <div className="p-4 border-t border-gray-100 space-y-2">
        {/* Bull-Board Quick Access on same URL */}
        <a
          href="/admin/queues"
          target="_blank"
          rel="noreferrer"
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 transition"
          title="Open BullMQ Live Dashboard"
        >
          <span className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>BullMQ Board</span>
          </span>
          <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
        </a>

        {/* Slack Connection Pill */}
        {user.isSlackConnected ? (
          <div className="flex items-center justify-between px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-lg text-[11px] text-emerald-800">
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span className="font-medium">Slack Active</span>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={onSendTestSlack}
                className="underline text-[10px] text-emerald-700 hover:text-emerald-900"
              >
                Test
              </button>
              <button
                onClick={onDisconnectSlack}
                className="text-gray-400 hover:text-red-500 ml-1"
              >
                ×
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={onConnectSlack}
            className="w-full flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-900 text-white hover:bg-gray-800 transition"
          >
            <Slack className="w-3.5 h-3.5" />
            <span>Connect Slack</span>
          </button>
        )}

        {/* Logout */}
        <button
          onClick={onLogout}
          className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 transition"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};
