'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { Sidebar } from '../../src/components/Sidebar';
import { InboxList } from '../../src/components/InboxList';
import { ComposeView } from '../../src/components/ComposeView';
import { EmailDetailView } from '../../src/components/EmailDetailView';
import { QueueMonitorView } from '../../src/components/QueueMonitorView';
import { LoginScreen } from '../../src/components/LoginScreen';
import { api as srcApi } from '../../src/api/client';
import { EmailJob, ScheduleEmailPayload } from '../../src/types';
import { toast } from 'sonner';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading, logout, setUser, loginWithGoogle, loginDemo } = useAuth();

  // Views: 'inbox' | 'compose' | 'detail'
  const [currentView, setCurrentView] = useState<'inbox' | 'compose' | 'detail'>('inbox');
  const [selectedEmail, setSelectedEmail] = useState<EmailJob | null>(null);

  // Tabs: 'scheduled' | 'sent' | 'queues'
  const [activeTab, setActiveTab] = useState<'scheduled' | 'sent' | 'queues'>('scheduled');
  const [searchQuery, setSearchQuery] = useState('');

  const [scheduledEmails, setScheduledEmails] = useState<EmailJob[]>([]);
  const [sentEmails, setSentEmails] = useState<EmailJob[]>([]);
  const [loading, setLoading] = useState(false);

  // Load emails
  const loadEmails = useCallback(async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) return;
    setLoading(true);
    try {
      if (searchQuery.trim()) {
        const filter = activeTab === 'sent' ? 'sent' : 'scheduled';
        const results = await srcApi.searchEmails(searchQuery, filter);
        if (activeTab === 'sent') {
          setSentEmails(results.filter((e) => ['SENT', 'FAILED'].includes(e.status)));
        } else {
          setScheduledEmails(results.filter((e) => ['SCHEDULED', 'PROCESSING', 'RESCHEDULED'].includes(e.status)));
        }
      } else {
        const [scheduled, sent] = await Promise.all([
          srcApi.getScheduledEmails(),
          srcApi.getSentEmails(),
        ]);
        setScheduledEmails(scheduled);
        setSentEmails(sent);
      }
    } catch (err: any) {
      console.error('Failed to load emails:', err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, activeTab]);

  useEffect(() => {
    loadEmails();
    const interval = setInterval(loadEmails, 5000);
    return () => clearInterval(interval);
  }, [loadEmails]);

  // Handle Slack redirect toast
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('slack_connected') === 'true') {
        toast.success('Slack connected successfully! Rate-limit alerts active.');
        window.history.replaceState({}, document.title, window.location.pathname);
      } else if (params.get('slack_error')) {
        toast.error('Slack error: ' + params.get('slack_error'));
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

  // Slack Handlers
  const handleConnectSlack = async () => {
    try {
      const url = await srcApi.getSlackAuthUrl();
      window.location.href = url;
    } catch (err: any) {
      toast.error('Could not get Slack authorization URL: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDisconnectSlack = async () => {
    try {
      await srcApi.disconnectSlack();
      if (user) {
        setUser({ ...user, isSlackConnected: false, slackInfo: null });
      }
      toast.success('Slack disconnected successfully');
    } catch {
      toast.error('Failed to disconnect Slack');
    }
  };

  const handleSendTestSlack = async () => {
    try {
      await srcApi.sendTestSlackAlert();
      toast.success('Test alert sent to Slack!');
    } catch (err: any) {
      toast.error('Could not send Slack alert: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleScheduleCampaign = async (payload: ScheduleEmailPayload) => {
    try {
      const res = await srcApi.scheduleEmails(payload);
      toast.success(`Successfully scheduled ${res.count} email(s) into queue!`);
      setCurrentView('inbox');
      setActiveTab('scheduled');
      loadEmails();
    } catch (err: any) {
      toast.error('Scheduling error: ' + (err.response?.data?.error || err.message));
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB]">
        <div className="w-8 h-8 rounded-full border-2 border-[#00A859] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <LoginScreen
        onGoogleSuccess={async (credential) => {
          try {
            await loginWithGoogle(credential);
            toast.success('Successfully logged in with Google!');
          } catch (err: any) {
            toast.error(err.response?.data?.error || err.message || 'Google authentication failed');
          }
        }}
        onDemoLogin={async () => {
          try {
            await loginDemo();
            toast.success('Logged in as Oliver Brown');
          } catch (err: any) {
            toast.error('Login failed: ' + err.message);
          }
        }}
        loading={authLoading}
        error={null}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white flex overflow-hidden font-sans">
      {/* Left Sidebar matching Figma Image 2 & 3 */}
      <Sidebar
        user={user}
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setCurrentView('inbox');
        }}
        onOpenCompose={() => setCurrentView('compose')}
        scheduledCount={scheduledEmails.length}
        sentCount={sentEmails.length}
        onLogout={logout}
        onConnectSlack={handleConnectSlack}
        onDisconnectSlack={handleDisconnectSlack}
        onSendTestSlack={handleSendTestSlack}
      />

      {/* Main Content Area switching between Views */}
      {currentView === 'compose' ? (
        <ComposeView
          user={user}
          onBack={() => setCurrentView('inbox')}
          onSchedule={handleScheduleCampaign}
        />
      ) : currentView === 'detail' && selectedEmail ? (
        <EmailDetailView
          email={selectedEmail}
          user={user}
          onLogout={logout}
          onBack={() => setCurrentView('inbox')}
        />
      ) : activeTab === 'queues' ? (
        <QueueMonitorView onClose={() => setActiveTab('scheduled')} />
      ) : (
        <InboxList
          emails={activeTab === 'scheduled' ? scheduledEmails : sentEmails}
          type={activeTab}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onRefresh={loadEmails}
          loading={loading}
          user={user}
          onLogout={logout}
          onSelectEmail={(email) => {
            setSelectedEmail(email);
            setCurrentView('detail');
          }}
        />
      )}
    </div>
  );
}
