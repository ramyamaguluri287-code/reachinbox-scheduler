import React, { useState } from 'react';
import { X, Upload, Mail, Calendar, Clock, Gauge, AlertCircle, CheckCircle } from 'lucide-react';
import { ScheduleEmailPayload } from '../types';

interface ComposeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSchedule: (payload: ScheduleEmailPayload) => Promise<void>;
}

export const ComposeModal: React.FC<ComposeModalProps> = ({ isOpen, onClose, onSchedule }) => {
  const [senderEmail, setSenderEmail] = useState('outreach@company.ethereal.email');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [manualEmails, setManualEmails] = useState('');
  const [parsedEmails, setParsedEmails] = useState<string[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  
  // Scheduling controls
  const [startTime, setStartTime] = useState(() => {
    // Default to current time + 1 minute formatted for datetime-local input
    const d = new Date(Date.now() + 60000);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  });
  const [delaySeconds, setDelaySeconds] = useState(2);
  const [hourlyLimit, setHourlyLimit] = useState(200);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Helper to extract valid email addresses from text
  const extractEmails = (text: string): string[] => {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const matches = text.match(emailRegex) || [];
    // Deduplicate
    return Array.from(new Set(matches.map((e) => e.toLowerCase().trim())));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const detected = extractEmails(content);
      setParsedEmails(detected);
    };
    reader.readAsText(file);
  };

  const handleManualEmailChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setManualEmails(text);
    const detected = extractEmails(text);
    setParsedEmails(detected);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (parsedEmails.length === 0) {
      setError('Please provide at least one valid recipient email or upload a CSV file.');
      return;
    }
    if (!subject.trim()) {
      setError('Email subject cannot be empty.');
      return;
    }
    if (!body.trim()) {
      setError('Email body cannot be empty.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSchedule({
        senderEmail,
        recipientEmails: parsedEmails,
        subject,
        body,
        startTime: new Date(startTime).toISOString(),
        delayBetweenEmailsMs: delaySeconds * 1000,
        hourlyLimit,
      });

      // Reset form
      setSubject('');
      setBody('');
      setManualEmails('');
      setParsedEmails([]);
      setFileName(null);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to schedule campaign');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Compose New Email Campaign</h2>
            <p className="text-xs text-slate-500">Configure sequence leads, scheduling delay, and hourly rate limits</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center space-x-2 p-3 text-xs bg-red-50 text-red-700 border border-red-200 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Sender & Start Time Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>Sender Account</span>
              </label>
              <select
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
              >
                <option value="outreach@company.ethereal.email">outreach@company.ethereal.email (Primary)</option>
                <option value="growth@reachinbox.ethereal.email">growth@reachinbox.ethereal.email (Secondary)</option>
                <option value="founder@outboxlabs.ethereal.email">founder@outboxlabs.ethereal.email (Executive)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Start Time</span>
              </label>
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Lead Input & CSV Upload */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-700">Recipient Leads (CSV or Paste)</label>
              {parsedEmails.length > 0 && (
                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                  <CheckCircle className="w-3 h-3" />
                  <span>{parsedEmails.length} email(s) detected</span>
                </span>
              )}
            </div>

            {/* CSV Upload Dropzone */}
            <div className="mb-2">
              <label className="flex items-center justify-center space-x-2 px-4 py-2.5 border-2 border-dashed border-indigo-200 rounded-xl bg-indigo-50/40 hover:bg-indigo-50 transition cursor-pointer text-xs text-indigo-700 font-medium">
                <Upload className="w-4 h-4 text-indigo-500" />
                <span>{fileName ? `Loaded: ${fileName}` : 'Upload CSV / Text file containing leads'}</span>
                <input
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            <textarea
              rows={2}
              placeholder="Or paste emails directly: john@doe.com, alice@startup.io, bob@tech.co..."
              value={manualEmails}
              onChange={handleManualEmailChange}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none font-mono"
            />
          </div>

          {/* Subject */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Subject</label>
            <input
              type="text"
              placeholder="e.g. Scaling outbound outreach with AI-driven workflows"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />
          </div>

          {/* Body */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Body</label>
            <textarea
              rows={4}
              placeholder="Hi {{name}}, saw your recent announcement..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
              required
            />
          </div>

          {/* Rate Limiting & Delays */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Delay Between Sends (seconds)</span>
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={delaySeconds}
                onChange={(e) => setDelaySeconds(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full text-xs px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
              />
              <span className="text-[10px] text-slate-400">Mimics ISP anti-spam throttling</span>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center space-x-1">
                <Gauge className="w-3.5 h-3.5 text-slate-400" />
                <span>Max Hourly Limit (per sender)</span>
              </label>
              <input
                type="number"
                min="1"
                step="10"
                value={hourlyLimit}
                onChange={(e) => setHourlyLimit(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full text-xs px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
              />
              <span className="text-[10px] text-slate-400">Reschedules overflow jobs + Slack alert</span>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl transition shadow-md shadow-indigo-100 flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Scheduling...</span>
                </>
              ) : (
                <span>Schedule Campaign ({parsedEmails.length} Leads)</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
