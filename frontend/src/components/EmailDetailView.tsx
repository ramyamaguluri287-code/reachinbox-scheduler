'use client';

import React from 'react';
import { ArrowLeft, Star, Archive, Trash2, ExternalLink, LogOut } from 'lucide-react';
import { User, EmailJob } from '../types';

interface EmailDetailViewProps {
  email: EmailJob;
  user?: User | null;
  onLogout?: () => void;
  onBack: () => void;
}

export const EmailDetailView: React.FC<EmailDetailViewProps> = ({ email, user, onLogout, onBack }) => {
  const sentDate = new Date(email.sentAt || email.scheduledAt);
  const formattedDate = sentDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  }) + ', ' + sentDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  const senderInitial = (email.senderEmail || 'A').charAt(0).toUpperCase();

  return (
    <div className="flex-1 flex flex-col h-screen overflow-y-auto bg-white">
      {/* Top Header matching Figma Screenshot with User Profile */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3 overflow-hidden">
          <button
            onClick={onBack}
            className="p-1 hover:bg-gray-100 rounded-lg text-gray-600 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h2 className="text-xs font-bold text-gray-800 truncate">
            {email.subject}
          </h2>
        </div>

        {/* Action icons on right matching Figma: Star, Archive, Trash, User Avatar & Logout */}
        <div className="flex items-center space-x-2.5 text-gray-400">
          {email.etherealPreviewUrl && (
            <a
              href={email.etherealPreviewUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-1 px-3 py-1 bg-[#EAF8F1] text-[#00A859] border border-[#BDE8D2] rounded-full text-xs font-semibold hover:bg-[#D5F2E2] transition mr-1"
            >
              <span>View in Ethereal</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
          <button className="p-1 hover:text-amber-400 transition" title="Star">
            <Star className="w-4 h-4 text-gray-300 hover:text-amber-400 hover:fill-amber-400" />
          </button>
          <button className="p-1 hover:text-gray-600 transition" title="Archive">
            <Archive className="w-4 h-4" />
          </button>
          <button className="p-1 hover:text-red-500 transition" title="Delete">
            <Trash2 className="w-4 h-4" />
          </button>

          {/* User Profile in Top Header */}
          {user && (
            <div className="flex items-center space-x-2 pl-2 border-l border-gray-100">
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
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition ml-1"
                  title="Logout"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area matching Figma Image 1 */}
      <div className="p-8 max-w-4xl w-full mx-auto space-y-6">
        {/* Sender Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3.5">
            {/* Green initial badge matching Figma */}
            <div className="w-9 h-9 rounded-full bg-[#00A859] text-white font-bold flex items-center justify-center text-xs shadow-sm shrink-0">
              {senderInitial}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-gray-900">{email.senderEmail.split('@')[0]}</span>
                <span className="text-[11px] text-gray-400">&lt;{email.senderEmail}&gt;</span>
              </div>
              <div className="text-[11px] text-gray-500 flex items-center space-x-1 mt-0.5">
                <span>to me</span>
                <span className="text-gray-400 text-[10px]">⌄</span>
              </div>
            </div>
          </div>

          {/* Right Timestamp matching Figma */}
          <span className="text-[11px] text-gray-400 whitespace-nowrap font-medium">
            {formattedDate}
          </span>
        </div>

        {/* Message Body matching Figma Layout */}
        <div className="text-xs text-gray-700 leading-relaxed space-y-4 pt-2">
          <p className="whitespace-pre-wrap">{email.body}</p>

          {/* Highlight Yellow Box matching Figma Image 1 */}
          <div className="p-4 bg-[#FFFBEB] border border-[#FDE68A] rounded-xl space-y-1.5 text-xs">
            <p className="font-semibold text-amber-900 flex items-center space-x-1.5">
              <span>⚡</span>
              <span>Extremely Exclusive—Only 4 Spots Worldwide Per Year | $25,000 investment</span>
              <span>⚡</span>
            </p>
            <p className="text-amber-800 text-[11px]">
              To explore securing your private transformation, simply reply right now with <strong className="font-bold">"FLY OUT FIX"</strong>.
            </p>
          </div>

          <div className="pt-2 text-gray-600 text-xs space-y-1">
            <p>Your coach for world-class performance,</p>
            <p className="font-semibold text-gray-800">Grant</p>
            <p className="italic text-gray-500 pt-2 text-[11px]">
              P.S. Always remember that you can develop world class technique! 🚀
            </p>
          </div>

          {/* Image Attachment Cards matching Figma Image 1 */}
          <div className="pt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
            {/* Attachment 1 */}
            <div className="rounded-xl border border-gray-200 overflow-hidden bg-gray-50 hover:shadow-md transition">
              <div className="h-28 bg-slate-900 overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=500"
                  alt="Tennis Coach Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-2.5 bg-white">
                <p className="text-[11px] font-semibold text-gray-800 truncate">Tennis_Coach_Profile.png</p>
                <p className="text-[10px] text-gray-400">1.2 MB</p>
              </div>
            </div>

            {/* Attachment 2 */}
            <div className="rounded-xl border border-gray-200 overflow-hidden bg-gray-50 hover:shadow-md transition">
              <div className="h-28 bg-slate-900 overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=500"
                  alt="Tennis Coach Profile 2"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-2.5 bg-white">
                <p className="text-[11px] font-semibold text-gray-800 truncate">Tennis_Coach_Profile2.png</p>
                <p className="text-[10px] text-gray-400">1.2 MB</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
