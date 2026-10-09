'use client';

import React, { useState } from 'react';
import { Upload, X, Zap } from 'lucide-react';
import { Modal } from './ui/dialog';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { parseEmailsFromText } from '../lib/utils';
import { api } from '../lib/api';
import { User } from '../lib/types';
import { toast } from 'sonner';

export interface ComposeModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSuccess: () => void;
}

export const ComposeModal: React.FC<ComposeModalProps> = ({
  isOpen,
  onClose,
  user,
  onSuccess,
}) => {
  const [recipientInput, setRecipientInput] = useState('');
  const [detectedEmails, setDetectedEmails] = useState<string[]>([]);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  // Default start time: Now + 2 minutes formatted for datetime-local
  const getDefaultStartTime = () => {
    const d = new Date(Date.now() + 2 * 60 * 1000);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  };
  const [startTime, setStartTime] = useState(getDefaultStartTime);

  const [delayBetweenSeconds, setDelayBetweenSeconds] = useState(2);
  const [hourlyLimit, setHourlyLimit] = useState(100);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // File Upload Parser
  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        const parsed = parseEmailsFromText(content);
        if (parsed.length > 0) {
          setDetectedEmails((prev) => Array.from(new Set([...prev, ...parsed])));
          toast.success(`Detected ${parsed.length} email addresses from ${file.name}`);
        } else {
          toast.error(`No email addresses detected in ${file.name}`);
        }
      }
    };
    reader.readAsText(file);
  };

  const handleManualAddEmail = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const trimmed = recipientInput.trim().toLowerCase();
      if (trimmed && trimmed.includes('@')) {
        if (!detectedEmails.includes(trimmed)) {
          setDetectedEmails([...detectedEmails, trimmed]);
        }
        setRecipientInput('');
      }
    }
  };

  const handleRemoveEmail = (emailToRemove: string) => {
    setDetectedEmails(detectedEmails.filter((e) => e !== emailToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check manual input leftover
    const allEmails = [...detectedEmails];
    if (recipientInput.trim().includes('@') && !allEmails.includes(recipientInput.trim().toLowerCase())) {
      allEmails.push(recipientInput.trim().toLowerCase());
    }

    if (allEmails.length === 0) {
      toast.error('Please upload or enter at least one recipient email');
      return;
    }

    if (!subject.trim()) {
      toast.error('Please enter an email subject');
      return;
    }

    if (!body.trim()) {
      toast.error('Please enter the email body content');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.scheduleEmails({
        to: allEmails,
        fromEmail: user?.email || 'sender@domain.io',
        subject: subject.trim(),
        body: body.trim(),
        startTime: new Date(startTime).toISOString(),
        delayBetweenMs: Number(delayBetweenSeconds) * 1000,
        hourlyLimit: Number(hourlyLimit),
      });

      toast.success(`Successfully scheduled campaign to ${allEmails.length} recipient(s)!`);
      onClose();
      onSuccess();
      // Reset form
      setDetectedEmails([]);
      setRecipientInput('');
      setSubject('');
      setBody('');
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.message || 'Failed to schedule campaign');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Compose New Email Campaign"
      description="Configure scheduling parameters and lead recipient lists"
      className="max-w-[620px]"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Recipient Drag & Drop Zone + Input */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Recipients (CSV / TXT Upload or Type)
          </label>

          {/* Drag & Drop Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              const files = Array.from(e.dataTransfer.files);
              if (files.length > 0) handleFileUpload(files[0]);
            }}
            className={`border-2 border-dashed rounded-xl p-3.5 text-center transition cursor-pointer mb-2 ${
              isDragging ? 'border-[#00A859] bg-emerald-50/50' : 'border-gray-200 hover:border-gray-300 bg-gray-50/50'
            }`}
            onClick={() => document.getElementById('compose-file-input')?.click()}
          >
            <input
              id="compose-file-input"
              type="file"
              accept=".csv,.txt"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
            />
            <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
              <Upload className="w-4 h-4 text-gray-400" />
              <span>Drag & drop CSV/TXT file here or <span className="text-[#00A859] font-bold underline">browse</span></span>
            </div>
          </div>

          {/* Manual Type Input */}
          <div className="flex items-center space-x-2">
            <Input
              value={recipientInput}
              onChange={(e) => setRecipientInput(e.target.value)}
              onKeyDown={handleManualAddEmail}
              placeholder="Type email and press Enter..."
              className="text-xs"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const trimmed = recipientInput.trim().toLowerCase();
                if (trimmed.includes('@') && !detectedEmails.includes(trimmed)) {
                  setDetectedEmails([...detectedEmails, trimmed]);
                  setRecipientInput('');
                }
              }}
            >
              Add
            </Button>
          </div>

          {/* Detected Emails Badge & List */}
          {detectedEmails.length > 0 && (
            <div className="mt-2.5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                  <Zap className="w-3 h-3 text-emerald-600" />
                  <span>{detectedEmails.length} email addresses detected</span>
                </span>
                <button
                  type="button"
                  onClick={() => setDetectedEmails([])}
                  className="text-[10px] text-gray-400 hover:text-red-500 underline"
                >
                  Clear all
                </button>
              </div>

              <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto p-1.5 bg-gray-50 rounded-lg border border-gray-100">
                {detectedEmails.slice(0, 8).map((email) => (
                  <span
                    key={email}
                    className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-white text-gray-700 text-[10px] border border-gray-200"
                  >
                    <span>{email}</span>
                    <button type="button" onClick={() => handleRemoveEmail(email)}>
                      <X className="w-2.5 h-2.5 text-gray-400 hover:text-red-500" />
                    </button>
                  </span>
                ))}
                {detectedEmails.length > 8 && (
                  <span className="text-[10px] text-gray-400 self-center pl-1 font-semibold">
                    +{detectedEmails.length - 8} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Subject */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Subject</label>
          <Input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Cold outreach campaign subject line"
            required
            className="text-xs"
          />
        </div>

        {/* Body (min 120px) */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Body</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Compose your email message..."
            required
            rows={5}
            className="w-full rounded-lg border border-gray-200 bg-white p-3 text-xs text-gray-800 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#00A859] focus-visible:border-[#00A859] min-h-[120px] transition"
          />
        </div>

        {/* Schedule & Rate Limiting Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-gray-50/80 rounded-xl border border-gray-100 text-xs">
          {/* Start Time */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-600 mb-1">Start Time</label>
            <input
              type="datetime-local"
              value={startTime}
              min={new Date().toISOString().slice(0, 16)}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-[#00A859]"
            />
          </div>

          {/* Delay Between Emails */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-600 mb-1">Delay (seconds)</label>
            <Input
              type="number"
              min={0}
              value={delayBetweenSeconds}
              onChange={(e) => setDelayBetweenSeconds(Math.max(0, parseInt(e.target.value) || 0))}
              className="h-8 text-xs bg-white"
            />
          </div>

          {/* Hourly Limit */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-600 mb-1">Hourly Limit</label>
            <Input
              type="number"
              min={1}
              value={hourlyLimit}
              onChange={(e) => setHourlyLimit(Math.max(1, parseInt(e.target.value) || 100))}
              className="h-8 text-xs bg-white"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-2.5 pt-3 border-t border-gray-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" disabled={isSubmitting} className="space-x-1.5">
            <span>{isSubmitting ? 'Scheduling...' : 'Schedule Campaign'}</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
};
