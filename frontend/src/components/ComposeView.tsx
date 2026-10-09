'use client';

import React, { useState } from 'react';
import {
  ArrowLeft,
  Paperclip,
  Clock,
  Upload,
  Undo2,
  Redo2,
  Type,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  List,
  ListOrdered,
  Quote,
  Link,
} from 'lucide-react';
import { ScheduleEmailPayload, User } from '../types';

interface ComposeViewProps {
  user: User;
  onBack: () => void;
  onSchedule: (payload: ScheduleEmailPayload) => Promise<void>;
}

export const ComposeView: React.FC<ComposeViewProps> = ({ user, onBack, onSchedule }) => {
  const [fromEmail, setFromEmail] = useState(user.email || 'oliver.brown@domain.io');
  const [recipientInput, setRecipientInput] = useState('');
  
  // Default recipients matching Figma Image 2
  const [recipients, setRecipients] = useState<string[]>([
    'tame@jmail.com',
    'lame@jmail.com',
    'dame@jmail.com',
    'alex@jmail.com',
    'sarah@jmail.com',
    'clark@jmail.com',
    'bruce@jmail.com',
  ]);
  const [showAllTags, setShowAllTags] = useState(false);

  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [delaySeconds, setDelaySeconds] = useState(0);
  const [hourlyLimit, setHourlyLimit] = useState(0);

  // Send Later Popover state matching Figma
  const [isSendLaterOpen, setIsSendLaterOpen] = useState(false);
  const [scheduledDateTime, setScheduledDateTime] = useState(() => {
    const d = new Date(Date.now() + 60000);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Parse emails helper
  const extractEmails = (text: string): string[] => {
    const regex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    return text.match(regex) || [];
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const detected = extractEmails(content);
      if (detected.length > 0) {
        setRecipients((prev) => Array.from(new Set([...prev, ...detected])));
      }
    };
    reader.readAsText(file);
  };

  const handleAddRecipient = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = recipientInput.trim().replace(',', '');
      if (val && val.includes('@')) {
        setRecipients((prev) => Array.from(new Set([...prev, val])));
        setRecipientInput('');
      }
    }
  };

  const removeRecipient = (emailToRemove: string) => {
    setRecipients((prev) => prev.filter((r) => r !== emailToRemove));
  };

  const handlePresetClick = (hoursFromNow: number) => {
    const d = new Date(Date.now() + hoursFromNow * 3600000);
    setScheduledDateTime(new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16));
  };

  const handleSend = async (customStartTime?: string) => {
    setError(null);
    const validRecipients = recipients.filter((r) => r.includes('@'));

    if (validRecipients.length === 0) {
      setError('Please provide at least one recipient lead.');
      return;
    }
    if (!subject.trim()) {
      setError('Please provide an email subject.');
      return;
    }
    if (!body.trim()) {
      setError('Please provide email body text.');
      return;
    }

    try {
      setIsSubmitting(true);
      const targetTime = customStartTime || scheduledDateTime;
      await onSchedule({
        senderEmail: fromEmail,
        recipientEmails: validRecipients,
        subject,
        body,
        startTime: new Date(targetTime).toISOString(),
        delayBetweenEmailsMs: (delaySeconds || 2) * 1000,
        hourlyLimit: hourlyLimit || 200,
      });
      onBack();
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to schedule campaign');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendFast = async () => {
    const validRecipients = recipients.filter((r) => r.trim() && r.includes('@'));
    if (validRecipients.length === 0) {
      setError('Please add at least one valid recipient email address.');
      return;
    }
    if (!subject.trim()) {
      setError('Please provide a subject line.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSchedule({
        senderEmail: fromEmail,
        recipientEmails: validRecipients,
        subject,
        body,
        startTime: new Date().toISOString(),
        delayBetweenEmailsMs: 100, // Ultra-fast execution
        hourlyLimit: hourlyLimit || 200,
      });
      onBack();
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to send campaign');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Determine visible recipients with Figma "+N" badge
  const visibleRecipients = showAllTags ? recipients : recipients.slice(0, 3);
  const remainingCount = recipients.length - 3;

  return (
    <div className="flex-1 flex flex-col h-screen overflow-y-auto bg-white relative">
      {/* Top Header matching Figma Image 2 */}
      <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between shrink-0">
        <button
          onClick={onBack}
          className="flex items-center space-x-2.5 text-sm font-bold text-gray-800 hover:text-gray-900 transition"
        >
          <ArrowLeft className="w-4 h-4 text-gray-600" />
          <span>Compose New Email</span>
        </button>

        {/* Right Action Icons matching Figma */}
        <div className="flex items-center space-x-2.5 relative">
          {/* Paperclip with badge "1" */}
          <div className="relative cursor-pointer p-1.5 text-gray-400 hover:text-gray-600">
            <Paperclip className="w-4 h-4" />
            <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-gray-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
              1
            </span>
          </div>

          <button
            onClick={() => setIsSendLaterOpen(!isSendLaterOpen)}
            className="p-1.5 text-gray-400 hover:text-[#00A859] transition"
            title="Schedule options"
          >
            <Clock className="w-4 h-4 text-[#00A859]" />
          </button>

          {/* Quick Instant Fast Send Button */}
          <button
            onClick={handleSendFast}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-full bg-[#00A859] hover:bg-[#008f4c] text-white font-semibold text-xs tracking-wide transition flex items-center space-x-1 shadow-sm"
            title="Execute queue job immediately with minimum latency"
          >
            <span>{isSubmitting ? 'Sending...' : '⚡ Send Fast'}</span>
          </button>

          {/* Primary "Send Later" Pill Button matching Figma */}
          <button
            onClick={() => setIsSendLaterOpen(!isSendLaterOpen)}
            disabled={isSubmitting}
            className="px-5 py-2 rounded-full border border-[#00A859] text-[#00A859] hover:bg-[#EAF8F1] active:bg-[#D5F2E2] font-semibold text-xs tracking-wide transition flex items-center space-x-1.5"
          >
            <span>{isSubmitting ? 'Sending...' : 'Send Later'}</span>
          </button>

          {/* "Send Later" Popover matching Figma */}
          {isSendLaterOpen && (
            <div className="absolute top-12 right-0 z-40 bg-white rounded-2xl shadow-2xl border border-gray-100 p-5 w-80 animate-in fade-in zoom-in-95 duration-100">
              <h4 className="text-xs font-bold text-gray-900 mb-3">Send Later</h4>

              <div className="relative mb-4">
                <input
                  type="datetime-local"
                  value={scheduledDateTime}
                  onChange={(e) => setScheduledDateTime(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#00A859]"
                />
              </div>

              <div className="space-y-1 mb-5 text-xs text-gray-600 font-medium">
                <button
                  type="button"
                  onClick={() => handlePresetClick(24)}
                  className="w-full text-left py-1.5 px-2 hover:bg-gray-50 rounded-lg transition"
                >
                  Tomorrow
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetClick(14)}
                  className="w-full text-left py-1.5 px-2 hover:bg-gray-50 rounded-lg transition"
                >
                  Tomorrow, 10:00 AM
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetClick(15)}
                  className="w-full text-left py-1.5 px-2 hover:bg-gray-50 rounded-lg transition"
                >
                  Tomorrow, 11:00 AM
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetClick(19)}
                  className="w-full text-left py-1.5 px-2 hover:bg-gray-50 rounded-lg transition"
                >
                  Tomorrow, 3:00 PM
                </button>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsSendLaterOpen(false)}
                  className="text-xs font-semibold text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsSendLaterOpen(false);
                    handleSend();
                  }}
                  className="px-4 py-1.5 rounded-full border border-[#00A859] text-[#00A859] hover:bg-[#EAF8F1] text-xs font-semibold transition"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Compose Form Area matching Figma Image 2 */}
      <div className="flex-1 px-8 py-6 max-w-4xl w-full mx-auto space-y-4">
        {error && (
          <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-medium">
            {error}
          </div>
        )}

        {/* From Field */}
        <div className="flex items-center space-x-4 py-2 border-b border-gray-100 text-xs">
          <label className="w-16 font-medium text-gray-400">From</label>
          <select
            value={fromEmail}
            onChange={(e) => setFromEmail(e.target.value)}
            className="px-3 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 focus:outline-none"
          >
            <option value="oliver.brown@domain.io">oliver.brown@domain.io</option>
            <option value="outreach@company.ethereal.email">outreach@company.ethereal.email</option>
            <option value="growth@reachinbox.ethereal.email">growth@reachinbox.ethereal.email</option>
          </select>
        </div>

        {/* To Field with Email Pills + "+4" Badge & "Upload List" button matching Figma Image 2 */}
        <div className="flex items-center justify-between py-2 border-b border-gray-100 text-xs">
          <div className="flex items-center space-x-3 flex-1 overflow-hidden">
            <label className="w-16 font-medium text-gray-400 shrink-0">To</label>
            <div className="flex flex-wrap items-center gap-1.5">
              {visibleRecipients.map((email) => (
                <span
                  key={email}
                  className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium bg-[#EAF8F1] text-[#00A859] border border-[#BDE8D2]"
                >
                  <span>{email}</span>
                  <button
                    type="button"
                    onClick={() => removeRecipient(email)}
                    className="hover:text-red-500 font-bold ml-1 text-xs"
                  >
                    ✕
                  </button>
                </span>
              ))}

              {/* Overflow "+N" pill tag matching Figma Image 2 */}
              {remainingCount > 0 && !showAllTags && (
                <button
                  type="button"
                  onClick={() => setShowAllTags(true)}
                  className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#EAF8F1] text-[#00A859] border border-[#BDE8D2] hover:bg-[#D5F2E2] transition cursor-pointer"
                  title="Click to view all leads"
                >
                  +{remainingCount}
                </button>
              )}

              <input
                type="text"
                value={recipientInput}
                onChange={(e) => setRecipientInput(e.target.value)}
                onKeyDown={handleAddRecipient}
                placeholder={recipients.length === 0 ? 'recipient@example.com' : 'Add lead...'}
                className="w-24 py-1 text-xs text-gray-800 placeholder-gray-400 focus:outline-none"
              />
            </div>
          </div>

          {/* "Upload List" button matching Figma Image 2 */}
          <label className="cursor-pointer inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-semibold text-[#00A859] hover:bg-[#EAF8F1] transition shrink-0">
            <Upload className="w-3.5 h-3.5" />
            <span>Upload List</span>
            <input
              type="file"
              accept=".csv,.txt"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        {/* Subject Field */}
        <div className="flex items-center space-x-4 py-2 border-b border-gray-100 text-xs">
          <label className="w-16 font-medium text-gray-400">Subject</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject"
            className="flex-1 py-1 text-xs text-gray-800 placeholder-gray-400 focus:outline-none font-medium"
          />
        </div>

        {/* Throttling Delays & Limits matching Figma */}
        <div className="flex items-center space-x-6 py-2 border-b border-gray-100 text-xs text-gray-500">
          <div className="flex items-center space-x-2">
            <span>Delay between 2 emails</span>
            <input
              type="number"
              min="0"
              value={delaySeconds}
              onChange={(e) => setDelaySeconds(parseInt(e.target.value) || 0)}
              className="w-12 px-2 py-1 bg-gray-50 border border-gray-200 rounded-md text-center text-xs font-medium text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#00A859]"
            />
          </div>

          <div className="flex items-center space-x-2">
            <span>Hourly Limit</span>
            <input
              type="number"
              min="0"
              value={hourlyLimit}
              onChange={(e) => setHourlyLimit(parseInt(e.target.value) || 0)}
              className="w-14 px-2 py-1 bg-gray-50 border border-gray-200 rounded-md text-center text-xs font-medium text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#00A859]"
            />
          </div>
        </div>

        {/* Formatting Toolbar matching Figma */}
        <div className="flex items-center space-x-3 py-2 px-3 bg-gray-50 rounded-xl text-gray-400 text-xs border border-gray-100 overflow-x-auto">
          <button className="hover:text-gray-700"><Undo2 className="w-3.5 h-3.5" /></button>
          <button className="hover:text-gray-700"><Redo2 className="w-3.5 h-3.5" /></button>
          <div className="h-3 w-px bg-gray-200" />
          <button className="hover:text-gray-700 flex items-center space-x-0.5"><Type className="w-3.5 h-3.5" /><span>Tt</span></button>
          <div className="h-3 w-px bg-gray-200" />
          <button className="hover:text-gray-700 font-bold"><Bold className="w-3.5 h-3.5" /></button>
          <button className="hover:text-gray-700 italic"><Italic className="w-3.5 h-3.5" /></button>
          <button className="hover:text-gray-700 underline"><Underline className="w-3.5 h-3.5" /></button>
          <button className="hover:text-gray-700"><Strikethrough className="w-3.5 h-3.5" /></button>
          <div className="h-3 w-px bg-gray-200" />
          <button className="hover:text-gray-700"><AlignLeft className="w-3.5 h-3.5" /></button>
          <button className="hover:text-gray-700"><List className="w-3.5 h-3.5" /></button>
          <button className="hover:text-gray-700"><ListOrdered className="w-3.5 h-3.5" /></button>
          <button className="hover:text-gray-700"><Quote className="w-3.5 h-3.5" /></button>
          <button className="hover:text-gray-700"><Link className="w-3.5 h-3.5" /></button>
        </div>

        {/* Body Text Editor */}
        <div className="pt-2">
          <textarea
            rows={8}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Type Your Reply..."
            className="w-full text-xs text-gray-800 placeholder-gray-400 focus:outline-none resize-none leading-relaxed"
          />
        </div>

        {/* Attachment Card Thumbnail matching bottom of Figma Image 2 */}
        <div className="pt-2">
          <div className="w-28 h-20 rounded-xl overflow-hidden border border-gray-200 shadow-sm relative group">
            <img
              src="https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=500"
              alt="Tennis player thumbnail"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
              <span className="text-[10px] text-white font-medium">1.2 MB</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
