import React, { useState } from 'react';
import { Activity, RefreshCw, ExternalLink } from 'lucide-react';

export const QueueMonitorView: React.FC = () => {
  const [iframeKey, setIframeKey] = useState(0);

  const handleRefresh = () => {
    setIframeKey((prev) => prev + 1);
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-white">
      {/* Top Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-[#EAF8F1] text-[#00A859] flex items-center justify-center">
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

        <div className="flex items-center space-x-2">
          <button
            onClick={handleRefresh}
            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 transition text-xs flex items-center space-x-1"
            title="Refresh queue view"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="text-[11px] font-medium hidden sm:inline">Refresh</span>
          </button>
          <a
            href="http://localhost:5000/admin/queues"
            target="_blank"
            rel="noreferrer"
            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 transition text-xs flex items-center space-x-1"
            title="Open in new window"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
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
