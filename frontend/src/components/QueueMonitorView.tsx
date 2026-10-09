import React, { useState } from 'react';
import { Activity, RefreshCw, X, ArrowLeft } from 'lucide-react';

interface QueueMonitorViewProps {
  onClose: () => void;
}

export const QueueMonitorView: React.FC<QueueMonitorViewProps> = ({ onClose }) => {
  const [iframeKey, setIframeKey] = useState(0);
  const [autoRefresh, setAutoRefresh] = useState(true);

  React.useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      setIframeKey((prev) => prev + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const handleRefresh = () => {
    setIframeKey((prev) => prev + 1);
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-white">
      {/* Top Header with Back / Close Button */}
      <div className="px-6 py-3.5 border-b border-gray-100 flex items-center justify-between shrink-0 bg-white">
        <div className="flex items-center space-x-3">
          {/* Quick Back Arrow */}
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-900 transition"
            title="Back to Inbox"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="w-8 h-8 rounded-lg bg-[#EAF8F1] text-[#00A859] flex items-center justify-center shrink-0">
            <Activity className="w-4 h-4" />
          </div>

          <div>
            <h2 className="text-xs font-bold text-gray-900 flex items-center space-x-2">
              <span>BullMQ Real-Time Queue Dashboard</span>
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live Redis Engine</span>
              </span>
            </h2>
            <p className="text-[11px] text-gray-400">
              Direct visibility into active jobs, delayed counts, provider throttling, and worker concurrency.
            </p>
          </div>
        </div>

        {/* Action Controls + Instant Close 'X' Mark */}
        <div className="flex items-center space-x-2">
          {/* Auto-Refresh Toggle Pill */}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition border flex items-center space-x-1.5 ${
              autoRefresh
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
            }`}
            title="Toggle Fast Auto-Refresh"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${autoRefresh ? 'bg-emerald-500 animate-ping' : 'bg-gray-400'}`} />
            <span>Fast Live {autoRefresh ? '3s' : 'OFF'}</span>
          </button>

          <button
            onClick={handleRefresh}
            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-900 transition text-xs flex items-center space-x-1"
            title="Reload queue view"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="text-[11px] font-medium hidden sm:inline">Refresh</span>
          </button>

          {/* Primary Instant Close 'X' Button */}
          <button
            onClick={onClose}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-600 text-xs font-semibold border border-gray-200/90 transition shadow-sm hover:border-red-200"
            title="Close Queue Dashboard"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
            <span>Close</span>
          </button>
        </div>
      </div>

      {/* Embedded Bull-Board iframe */}
      <div className="flex-1 w-full h-full bg-[#f8fafc] relative">
        <iframe
          key={iframeKey}
          src="http://localhost:5000/admin/queues"
          title="BullMQ Dashboard"
          className="w-full h-full border-0"
        />
      </div>
    </div>
  );
};
