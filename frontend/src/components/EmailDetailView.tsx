import React from 'react';
import { ArrowLeft, ExternalLink, Calendar, Star, CornerUpLeft } from 'lucide-react';
import { EmailJob } from '../types';

interface EmailDetailViewProps {
  email: EmailJob;
  onBack: () => void;
}

export const EmailDetailView: React.FC<EmailDetailViewProps> = ({ email, onBack }) => {
  const sentDate = new Date(email.sentAt || email.scheduledAt);

  return (
    <div className="flex-1 flex flex-col h-screen overflow-y-auto bg-white">
      {/* Top Header matching Figma Image 3 */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3 overflow-hidden">
          <button
            onClick={onBack}
            className="p-1 hover:bg-gray-100 rounded-lg text-gray-500 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h2 className="text-xs font-bold text-gray-800 truncate">
            {email.subject}
          </h2>
        </div>

        <div className="flex items-center space-x-3 text-gray-400">
          {email.etherealPreviewUrl && (
            <a
              href={email.etherealPreviewUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-1 px-3 py-1 bg-[#EAF8F1] text-[#00A859] border border-[#BDE8D2] rounded-full text-xs font-semibold hover:bg-[#D5F2E2] transition"
            >
              <span>View in Ethereal</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
          <Star className="w-4 h-4 hover:text-amber-400 cursor-pointer transition" />
        </div>
      </div>

      {/* Main Email Content */}
      <div className="p-8 max-w-3xl w-full mx-auto space-y-6">
        {/* Sender Info matching Figma */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-full bg-[#00A859] text-white font-bold flex items-center justify-center text-sm shadow-sm">
              {email.senderEmail.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-gray-900">{email.senderEmail}</span>
                <span className="text-[11px] text-gray-400">&lt;{email.senderEmail}&gt;</span>
              </div>
              <p className="text-[11px] text-gray-500">
                to <span className="font-semibold">{email.recipientEmail}</span>
              </p>
            </div>
          </div>

          <div className="text-[11px] text-gray-400 flex items-center space-x-1">
            <Calendar className="w-3 h-3 text-gray-300" />
            <span>{sentDate.toLocaleString()}</span>
          </div>
        </div>

        {/* Message Body */}
        <div className="pt-2 text-xs text-gray-700 leading-relaxed space-y-4">
          <p className="whitespace-pre-wrap">{email.body}</p>

          {/* Figma Style Highlight Banner */}
          <div className="p-4 bg-amber-50/70 border-l-4 border-amber-400 rounded-r-xl space-y-1">
            <p className="font-bold text-amber-900 text-xs">⚡ ReachInbox High-Throughput Delivery</p>
            <p className="text-amber-800 text-[11px]">
              Dispatched via BullMQ delayed queue with Redis-backed sender rate limiting.
            </p>
          </div>
        </div>

        {/* Reply / Quick Action */}
        <div className="pt-6 border-t border-gray-100 flex items-center space-x-3">
          <button
            onClick={onBack}
            className="inline-flex items-center space-x-1.5 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-xs font-semibold hover:bg-gray-50 transition"
          >
            <CornerUpLeft className="w-3.5 h-3.5" />
            <span>Back to Inbox</span>
          </button>
        </div>
      </div>
    </div>
  );
};
