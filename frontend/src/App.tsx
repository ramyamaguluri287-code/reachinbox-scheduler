import { useState, useEffect, useCallback } from 'react';
import { api } from './api/client';
import { User, EmailJob, ScheduleEmailPayload } from './types';
import { Sidebar } from './components/Sidebar';
import { InboxList } from './components/InboxList';
import { ComposeView } from './components/ComposeView';
import { EmailDetailView } from './components/EmailDetailView';
import { QueueMonitorView } from './components/QueueMonitorView';
import { LoginScreen } from './components/LoginScreen';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export function App() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(null);

  // Views: 'inbox' | 'compose' | 'detail'
  const [currentView, setCurrentView] = useState<'inbox' | 'compose' | 'detail'>('inbox');
  const [selectedEmail, setSelectedEmail] = useState<EmailJob | null>(null);

  // Tabs: 'scheduled' | 'sent' | 'queues'
  const [activeTab, setActiveTab] = useState<'scheduled' | 'sent' | 'queues'>('scheduled');
  const [searchQuery, setSearchQuery] = useState('');

  const [scheduledEmails, setScheduledEmails] = useState<EmailJob[]>([]);
  const [sentEmails, setSentEmails] = useState<EmailJob[]>([]);

  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Slack redirect handler
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('slack_connected') === 'true') {
      showToast('Slack connected successfully! Rate-limit alerts active.', 'success');
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (urlParams.get('slack_error')) {
      showToast('Slack error: ' + urlParams.get('slack_error'), 'error');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Fetch current user
  useEffect(() => {
    if (!token) return;

    api.getCurrentUser()
      .then((userData) => setUser(userData))
      .catch((err) => {
        console.error('Session expired:', err);
        localStorage.removeItem('token');
        setToken(null);
      });
  }, [token]);

  // Load emails
  const loadEmails = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      if (searchQuery.trim()) {
        const filter = activeTab === 'sent' ? 'sent' : 'scheduled';
        const results = await api.searchEmails(searchQuery, filter);
        if (activeTab === 'sent') {
          setSentEmails(results.filter((e) => ['SENT', 'FAILED'].includes(e.status)));
        } else {
          setScheduledEmails(results.filter((e) => ['SCHEDULED', 'PROCESSING', 'RESCHEDULED'].includes(e.status)));
        }
      } else {
        const [scheduled, sent] = await Promise.all([
          api.getScheduledEmails(),
          api.getSentEmails(),
        ]);
        setScheduledEmails(scheduled);
        setSentEmails(sent);
      }
    } catch (err: any) {
      console.error('Failed to load emails:', err);
    } finally {
      setLoading(false);
    }
  }, [token, searchQuery, activeTab]);

  useEffect(() => {
    loadEmails();
    const interval = setInterval(loadEmails, 5000);
    return () => clearInterval(interval);
  }, [loadEmails]);

  // Authentication Handlers
  const handleGoogleSuccess = async (credential: string) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const res = await api.googleLogin(credential);
      localStorage.setItem('token', res.token);
      setToken(res.token);
      setUser(res.user);
      showToast(`Welcome back, ${res.user.name || 'User'}!`);
    } catch (err: any) {
      setAuthError(err.response?.data?.error || err.message || 'Google login failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const fakePayload = {
        sub: 'demo-evaluator-101',
        email: 'oliver.brown@domain.io',
        name: 'Oliver Brown',
        picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
      };
      const fakeToken = btoa(JSON.stringify({ alg: 'none' })) + '.' + btoa(JSON.stringify(fakePayload)) + '.';
      const res = await api.googleLogin(fakeToken);
      localStorage.setItem('token', res.token);
      setToken(res.token);
      setUser(res.user);
      showToast('Logged in as Oliver Brown');
    } catch (err: any) {
      setAuthError('Demo login failed: ' + err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setScheduledEmails([]);
    setSentEmails([]);
    setCurrentView('inbox');
  };

  const handleConnectSlack = async () => {
    try {
      const url = await api.getSlackAuthUrl();
      window.location.href = url;
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Slack client is not configured in .env', 'error');
    }
  };

  const handleDisconnectSlack = async () => {
    try {
      await api.disconnectSlack();
      if (user) {
        setUser({ ...user, isSlackConnected: false, slackInfo: null });
      }
      showToast('Slack successfully disconnected.');
    } catch (err: any) {
      showToast('Failed to disconnect Slack', 'error');
    }
  };

  const handleSendTestSlack = async () => {
    try {
      await api.sendTestSlackAlert();
      showToast('Test alert sent to Slack!', 'success');
    } catch (err: any) {
      showToast('Could not send Slack test alert: ' + (err.response?.data?.error || err.message), 'error');
    }
  };

  const handleScheduleCampaign = async (payload: ScheduleEmailPayload) => {
    const res = await api.scheduleEmails(payload);
    showToast(`Successfully scheduled ${res.count} email(s) into queue!`);
    loadEmails();
  };

  // If not logged in, render LoginScreen matching Figma Image 1
  if (!token || !user) {
    return (
      <LoginScreen
        onGoogleSuccess={handleGoogleSuccess}
        onDemoLogin={handleDemoLogin}
        loading={authLoading}
        error={authError}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white flex overflow-hidden font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-2 px-4 py-3 rounded-xl shadow-xl text-xs font-semibold animate-in fade-in slide-in-from-bottom-5 bg-gray-900 text-white">
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

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
        onLogout={handleLogout}
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
          onBack={() => setCurrentView('inbox')}
        />
      ) : activeTab === 'queues' ? (
        <QueueMonitorView />
      ) : (
        <InboxList
          emails={activeTab === 'scheduled' ? scheduledEmails : sentEmails}
          type={activeTab}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onRefresh={loadEmails}
          loading={loading}
          onSelectEmail={(email) => {
            setSelectedEmail(email);
            setCurrentView('detail');
          }}
        />
      )}
    </div>
  );
}
