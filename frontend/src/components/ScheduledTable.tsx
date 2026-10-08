import React from 'react';
import { EmailJob } from '../types';
import { Calendar, Clock, RefreshCw, AlertTriangle, Inbox } from 'lucide-react';

interface ScheduledTableProps {
  emails: EmailJob[];
  loading: boolean;
  onRefresh: () => void;
}

export const ScheduledTable: React.FC<ScheduledTableProps> = ({ emails, loading, onRefresh }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-500 font-medium">Loading scheduled jobs from BullMQ & Database...</p>
      </div>
    );
  }

  if (emails.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center mx-auto mb-3">
          <Inbox className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-slate-900">No scheduled emails in queue</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          You don't have any pending jobs. Click the "Compose New Email" button above to launch an automated email campaign.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-800">Pending & Delayed Email Queue</h3>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
            {emails.length}
          </span>
        </div>
        <button
          onClick={onRefresh}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition text-xs flex items-center space-x-1"
          title="Refresh queue"
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
              <th className="py-3 px-6">Scheduled Time</th>
              <th className="py-3 px-6">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-normal">
            {emails.map((job) => {
              const scheduledDate = new Date(job.scheduledAt);
              const isPast = scheduledDate.getTime() <= Date.now();

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

                  {/* Scheduled Time */}
                  <td className="py-3.5 px-6 whitespace-nowrap">
                    <div className="flex items-center space-x-1.5 text-slate-700">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{scheduledDate.toLocaleDateString()}</span>
                      <span className="font-medium text-slate-900">{scheduledDate.toLocaleTimeString()}</span>
                    </div>
                    {isPast && job.status === 'SCHEDULED' && (
                      <span className="text-[10px] text-amber-600 font-medium">Processing shortly...</span>
                    )}
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-6 whitespace-nowrap">
                    {job.status === 'PROCESSING' && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse mr-1.5" />
                        Processing
                      </span>
                    )}
                    {job.status === 'SCHEDULED' && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-1.5" />
                        Scheduled
                      </span>
                    )}
                    {job.status === 'RESCHEDULED' && (
                      <span
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200"
                        title={job.errorMessage || 'Hourly limit exceeded. Rescheduled to next hour window.'}
                      >
                        <AlertTriangle className="w-3 h-3 mr-1 text-amber-600" />
                        Rate-Limit Rescheduled
                      </span>
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
