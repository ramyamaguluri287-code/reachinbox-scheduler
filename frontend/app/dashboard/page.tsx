'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { Header } from '../../components/Header';
import { Tabs } from '../../components/ui/tabs';
import { ScheduledTable } from '../../components/ScheduledTable';
import { SentTable } from '../../components/SentTable';
import { ComposeModal } from '../../components/ComposeModal';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { ScheduledEmail, SentEmail } from '../../lib/types';
import { api } from '../../lib/api';
import { Plus, Search, RefreshCw, Activity, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState('scheduled');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [scheduledEmails, setScheduledEmails] = useState<ScheduledEmail[]>([]);
  const [sentEmails, setSentEmails] = useState<SentEmail[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [isComposeOpen, setIsComposeOpen] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Debounce search query by 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Load emails from API
  const loadEmails = useCallback(async () => {
    if (!isAuthenticated) return;
    setDataLoading(true);
    try {
      if (activeTab === 'scheduled') {
        const data = await api.getScheduledEmails(debouncedSearch);
        setScheduledEmails(data);
      } else {
        const data = await api.getSentEmails(debouncedSearch);
        setSentEmails(data);
      }
    } catch (err: any) {
      console.error('Failed to load emails:', err);
    } finally {
      setDataLoading(false);
    }
  }, [isAuthenticated, activeTab, debouncedSearch]);

  useEffect(() => {
    loadEmails();
    const interval = setInterval(loadEmails, 6000);
    return () => clearInterval(interval);
  }, [loadEmails]);

  // Handle Slack redirect toast
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('slack_connected') === 'true') {
        toast.success('Slack connected successfully! Live alert cards active.');
        window.history.replaceState({}, document.title, window.location.pathname);
      } else if (params.get('slack_error')) {
        toast.error('Slack error: ' + params.get('slack_error'));
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB]">
        <div className="w-8 h-8 rounded-full border-2 border-black border-t-transparent animate-spin" />
      </div>
    );
  }

  const tabs = [
    { id: 'scheduled', label: 'Scheduled Emails', count: scheduledEmails.length },
    { id: 'sent', label: 'Sent Emails', count: sentEmails.length },
    { id: 'queues', label: '⚡ Live BullMQ Queues' },
  ];

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col">
      {/* Top Header matching Figma exact */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Control Bar: Tabs + Action Buttons */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          {/* Tabs matching Figma underline active state */}
          <Tabs
            tabs={tabs}
            activeTab={activeTab}
            onChange={(tabId) => {
              setActiveTab(tabId);
              setSearchQuery('');
            }}
          />

          {/* Right Action Buttons */}
          <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
            {/* BullMQ Monitor Quick Link on same URL */}
            <a
              href="/admin/queues"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 transition shadow-sm"
              title="Open BullMQ Queue Monitor at /admin/queues"
            >
              <Activity className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              <span className="hidden sm:inline">BullMQ Board</span>
              <ExternalLink className="w-3 h-3 text-gray-400" />
            </a>

            {/* Primary "Compose New Email" Button matching Figma */}
            <Button
              onClick={() => setIsComposeOpen(true)}
              variant="default"
              size="md"
              className="space-x-1.5 bg-black hover:bg-neutral-800 text-white font-semibold text-xs rounded-xl px-4 py-2 shadow-sm"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Compose New Email</span>
            </Button>
          </div>
        </div>

        {/* Content Container Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {activeTab === 'queues' ? (
            <div className="p-4 bg-white">
              <div className="flex items-center justify-between mb-3 px-2">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-semibold text-gray-700">Real-time BullMQ Delayed, Active & Completed Job Inspector</span>
                </div>
                <a
                  href="/admin/queues"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
                >
                  <span>Open Fullscreen (/admin/queues)</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="w-full h-[680px] rounded-xl border border-gray-200 overflow-hidden shadow-inner bg-gray-50">
                <iframe
                  src="/admin/queues"
                  className="w-full h-full border-0"
                  title="BullMQ Dashboard"
                />
              </div>
            </div>
          ) : (
            <>
              {/* Search Bar above table matching Elasticsearch Search Bar */}
              <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={`Search ${activeTab === 'scheduled' ? 'scheduled' : 'sent'} emails by recipient, subject, or body...`}
                    className="pl-9 h-9 text-xs bg-[#F9FAFB] border-gray-200 rounded-lg focus-visible:bg-white"
                  />
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={loadEmails}
                  disabled={dataLoading}
                  title="Refresh list"
                  className="shrink-0"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${dataLoading ? 'animate-spin text-[#00A859]' : 'text-gray-500'}`} />
                </Button>
              </div>

              {/* Table View */}
              {activeTab === 'scheduled' ? (
                <ScheduledTable
                  emails={scheduledEmails}
                  loading={dataLoading}
                  onOpenCompose={() => setIsComposeOpen(true)}
                />
              ) : (
                <SentTable
                  emails={sentEmails}
                  loading={dataLoading}
                  onOpenCompose={() => setIsComposeOpen(true)}
                />
              )}
            </>
          )}
        </div>
      </main>

      {/* Compose Campaign Modal */}
      <ComposeModal
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
        user={user}
        onSuccess={() => {
          setActiveTab('scheduled');
          loadEmails();
        }}
      />
    </div>
  );
}
