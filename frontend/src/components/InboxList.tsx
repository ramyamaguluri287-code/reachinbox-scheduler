'use client';

import React from 'react';
import { User, EmailJob } from '../types';
import { Search, SlidersHorizontal, RefreshCw, Star, Clock, Send, ExternalLink, LogOut } from 'lucide-react';

interface InboxListProps {
  emails: EmailJob[];
  type: 'scheduled' | 'sent';
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onRefresh: () => void;
  loading: boolean;
  user?: User | null;
  onLogout?: () => void;
  onSelectEmail: (email: EmailJob) => void;
}

export const InboxList: React.FC<InboxListProps> = ({
  emails,
  type,
  searchQuery,
  onSearchChange,
  onRefresh,
  loading,
  user,
  onLogout,
  onSelectEmail,
}) => {
  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-white">
      {/* Top Search & Filter Bar matching Figma with User Profile Header */}
      <div className="px-6 py-3.5 border-b border-gray-100 flex items-center justify-between gap-4 shrink-0">
        {/* Search Input matching Figma */}
        <div className="relative flex-1 max-w-lg">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search"
            className="w-full bg-[#F4F6F8] rounded-full pl-9 pr-4 py-2 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#00A859] transition"
          />
        </div>

        {/* Action icons & User Profile in Top Header */}
        <div className="flex items-center space-x-2.5 text-gray-400">
          <button
            onClick={onRefresh}
            className="p-1.5 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#00A859]' : ''}`} />
          </button>
          <button
            className="p-1.5 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
            title="Filter"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>

          {/* User Profile in Top Header: Name, Email, Avatar, and Logout */}
          {user && (
            <div className="flex items-center space-x-2.5 pl-3 border-l border-gray-100">
              <img
                src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                alt={user.name || 'User Avatar'}
                className="w-7 h-7 rounded-full object-cover border border-gray-200"
              />
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold text-gray-800 leading-tight">
                  {user.name || 'Oliver Brown'}
                </p>
                <p className="text-[10px] text-gray-400 leading-none">
                  {user.email || 'oliver.brown@domain.io'}
                </p>
              </div>

              {onLogout && (
                <button
                  onClick={onLogout}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition ml-1 flex items-center space-x-1"
                  title="Logout"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-medium hidden md:inline">Logout</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Email Stream List matching Figma */}
      <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
        {loading && emails.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-7 h-7 border-2 border-[#00A859] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-gray-400">Loading your inbox...</p>
          </div>
        ) : emails.length === 0 ? (
          <div className="py-24 text-center">
            <div className="w-12 h-12 rounded-full bg-gray-50 text-gray-300 flex items-center justify-center mx-auto mb-3">
              {type === 'scheduled' ? <Clock className="w-6 h-6" /> : <Send className="w-6 h-6" />}
            </div>
            <h4 className="text-sm font-semibold text-gray-700">
              No {type === 'scheduled' ? 'scheduled' : 'sent'} emails found
            </h4>
            <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
              {type === 'scheduled'
                ? 'Compose a new sequence to schedule upcoming outreach.'
                : 'Delivered campaigns and test dispatches will appear here.'}
            </p>
          </div>
        ) : (
          emails.map((job) => {
            const dateObj = new Date(job.sentAt || job.scheduledAt);
            const timeString = dateObj.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit' });
            const dayString = dateObj.toLocaleDateString([], { weekday: 'short' });

            // Extract display name or email handle
            const recipientHandle = job.recipientEmail.split('@')[0].replace(/[._]/g, ' ');
            const capitalizedName = recipientHandle.charAt(0).toUpperCase() + recipientHandle.slice(1);

            return (
              <div
                key={job.id}
                onClick={() => onSelectEmail(job)}
                className="group flex items-center justify-between px-6 py-3.5 hover:bg-[#F9FBFA] cursor-pointer transition text-xs select-none"
              >
                {/* Left: Recipient */}
                <div className="flex items-center space-x-4 min-w-[160px] max-w-[200px] shrink-0">
                  <span className="text-gray-900 font-medium truncate">
                    <strong className="font-semibold text-gray-800">To:</strong> {capitalizedName}
                  </span>
                </div>

                {/* Center: Badge Pill + Subject + Snippet preview */}
                <div className="flex-1 flex items-center space-x-3 overflow-hidden px-4">
                  {/* Figma Badge */}
                  {type === 'scheduled' ? (
                    <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#FFF6ED] text-[#D97706] border border-[#FDE68A] shrink-0">
                      <Clock className="w-3 h-3 text-[#D97706]" />
                      <span>{dayString} {timeString}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-600 shrink-0">
                      Sent
                    </span>
                  )}

                  {/* Subject and Body Snippet matching Figma */}
                  <div className="truncate text-gray-500">
                    <span className="font-semibold text-gray-800 mr-1.5">{job.subject}</span>
                    <span className="text-gray-400">- {job.body}</span>
                  </div>
                </div>

                {/* Right: Preview link (if Ethereal) & Star icon matching Figma */}
                <div className="flex items-center space-x-3 text-gray-300 group-hover:text-gray-400 shrink-0">
                  {job.etherealPreviewUrl && (
                    <a
                      href={job.etherealPreviewUrl}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-[10px] text-[#00A859] hover:underline flex items-center space-x-0.5"
                    >
                      <span>Preview</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  <button className="hover:text-amber-400 transition" title="Star email">
                    <Star className="w-4 h-4 text-gray-300 hover:fill-amber-400 hover:text-amber-400" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
