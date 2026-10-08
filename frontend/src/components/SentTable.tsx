import React from 'react';
import { EmailJob } from '../types';
import { CheckCircle2, XCircle, ExternalLink, RefreshCw, Send, Calendar } from 'lucide-react';

interface SentTableProps {
  emails: EmailJob[];
  loading: boolean;
  onRefresh: () => void;
}

export const SentTable: React.FC<SentTableProps> = ({ emails, loading, onRefresh }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-500 font-medium">Fetching sent email history...</p>
      </div>
    );
  }

  if (emails.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
          <Send className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-slate-900">No sent emails yet</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Delivered emails and test dispatches sent via Ethereal SMTP will appear here along with their direct web preview links.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <div className="flex items-center space-x-2">
          <Send className="w-4 h-4 text-emerald-600" />
          <h3 className="text-sm font-bold text-slate-800">Delivered & Failed Email History</h3>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
            {emails.length}
          </span>
        </div>
        <button
          onClick={onRefresh}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition text-xs flex items-center space-x-1"
          title="Refresh history"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
            <tr>
              <th className="py-3 px-6">Recipient & Sender</th>
              <th className="py-3 px-6">Subject</th>
              <th className="py-3 px-6">Sent Timestamp</th>
              <th className="py-3 px-6">Status</th>
              <th className="py-3 px-6 text-right">Ethereal Preview</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-normal">
            {emails.map((job) => {
              const sentDate = job.sentAt ? new Date(job.sentAt) : new Date(job.updatedAt);

              return (
                <tr key={job.id} className="hover:bg-slate-50/80 transition">
                  {/* Recipient & Sender */}
                  <td className="py-3.5 px-6">
                    <div className="font-semibold text-slate-900">{job.recipientEmail}</div>
                    <div className="text-[11px] text-slate-400">from {job.senderEmail}</div>
                  </td>

                  {/* Subject */}
                  <td className="py-3.5 px-6 max-w-xs truncate">
                    <span className="font-medium text-slate-800">{job.subject}</span>
                    <p className="text-[11px] text-slate-400 truncate">{job.body}</p>
                  </td>

                  {/* Sent Timestamp */}
                  <td className="py-3.5 px-6 whitespace-nowrap">
                    <div className="flex items-center space-x-1.5 text-slate-700">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{sentDate.toLocaleDateString()}</span>
                      <span className="font-medium text-slate-900">{sentDate.toLocaleTimeString()}</span>
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-6 whitespace-nowrap">
                    {job.status === 'SENT' ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mr-1" />
                        Delivered
                      </span>
                    ) : (
                      <span
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200"
                        title={job.errorMessage || 'Failed to dispatch'}
                      >
                        <XCircle className="w-3.5 h-3.5 text-rose-600 mr-1" />
                        Failed
                      </span>
                    )}
                  </td>

                  {/* Ethereal Preview Button */}
                  <td className="py-3.5 px-6 text-right whitespace-nowrap">
                    {job.etherealPreviewUrl ? (
                      <a
                        href={job.etherealPreviewUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition border border-indigo-200"
                      >
                        <span>View in Ethereal</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-slate-400 text-[11px]">N/A</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
