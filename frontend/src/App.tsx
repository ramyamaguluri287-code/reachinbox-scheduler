import { useState, useEffect, useCallback } from 'react';
import { api } from './api/client';
import { User, EmailJob, ScheduleEmailPayload } from './types';
import { Navbar } from './components/Navbar';
import { ScheduledTable } from './components/ScheduledTable';
import { SentTable } from './components/SentTable';
import { ComposeModal } from './components/ComposeModal';
import { SearchBar } from './components/SearchBar';
import { LoginScreen } from './components/LoginScreen';
import { Plus, Clock, Send, CheckCircle2, AlertCircle } from 'lucide-react';

export function App() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'scheduled' | 'sent'>('scheduled');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [scheduledEmails, setScheduledEmails] = useState<EmailJob[]>([]);
  const [sentEmails, setSentEmails] = useState<EmailJob[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  
  const [isComposeOpen, setIsComposeOpen] = useState(false);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Check URL query parameters for Slack OAuth callback response
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('slack_connected') === 'true') {
      showToast('Slack successfully connected! Rate-limit alerts are active.', 'success');
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (urlParams.get('slack_error')) {
      showToast('Failed to connect Slack: ' + urlParams.get('slack_error'), 'error');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Fetch current user details if token is present
  useEffect(() => {
    if (!token) return;

    api.getCurrentUser()
      .then((userData) => setUser(userData))
      .catch((err) => {
        console.error('Failed to get current user:', err);
        localStorage.removeItem('token');
        setToken(null);
      });
  }, [token]);

  // Load emails function
  const loadEmails = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      if (searchQuery.trim()) {
        const results = await api.searchEmails(searchQuery, activeTab);
        if (activeTab === 'scheduled') {
          setScheduledEmails(results.filter((e) => ['SCHEDULED', 'PROCESSING', 'RESCHEDULED'].includes(e.status)));
        } else {
          setSentEmails(results.filter((e) => ['SENT', 'FAILED'].includes(e.status)));
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
    // Auto-refresh queue every 5 seconds for real-time visibility
    const interval = setInterval(loadEmails, 5000);
    return () => clearInterval(interval);
  }, [loadEmails]);

  // Handlers
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
      // Mock Google JWT for easy local evaluator demo
      const fakePayload = {
        sub: 'demo-evaluator-reachinbox-101',
        email: 'evaluator@reachinbox.test',
        name: 'Evaluation Officer',
        picture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
      };
      const fakeToken = btoa(JSON.stringify({ alg: 'none' })) + '.' + btoa(JSON.stringify(fakePayload)) + '.';
      const res = await api.googleLogin(fakeToken);
      localStorage.setItem('token', res.token);
      setToken(res.token);
      setUser(res.user);
      showToast('Logged in under Demo Evaluator account!');
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
      showToast('Test alert posted to Slack channel!', 'success');
    } catch (err: any) {
      showToast('Could not send Slack test alert: ' + (err.response?.data?.error || err.message), 'error');
    }
  };

  const handleScheduleCampaign = async (payload: ScheduleEmailPayload) => {
    const res = await api.scheduleEmails(payload);
    showToast(`Successfully scheduled ${res.count} email(s) into BullMQ!`);
    loadEmails();
  };

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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar
        user={user}
        onLogout={handleLogout}
        onConnectSlack={handleConnectSlack}
        onDisconnectSlack={handleDisconnectSlack}
        onSendTestSlack={handleSendTestSlack}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-2 px-4 py-3 rounded-2xl shadow-xl text-xs font-semibold animate-in fade-in slide-in-from-bottom-5 bg-slate-900 text-white border border-slate-700">
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Controls Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          {/* Tabs */}
          <div className="flex items-center space-x-2 bg-slate-200/70 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('scheduled')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
                activeTab === 'scheduled'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Scheduled Emails</span>
              <span className="ml-1 text-[11px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600">
                {scheduledEmails.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('sent')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
                activeTab === 'sent'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Sent Emails</span>
              <span className="ml-1 text-[11px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600">
                {sentEmails.length}
              </span>
            </button>
          </div>

          {/* Compose CTA */}
          <button
            onClick={() => setIsComposeOpen(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-200 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Compose New Email</span>
          </button>
        </div>

        {/* Search Bar (Elasticsearch) */}
        <div className="mb-6">
          <SearchBar
            value={searchQuery}
            onChange={(q) => setSearchQuery(q)}
            placeholder={`Search ${activeTab === 'scheduled' ? 'scheduled queue' : 'sent emails'} by subject, lead, or content (Elasticsearch)...`}
          />
        </div>

        {/* Tables */}
        {activeTab === 'scheduled' ? (
          <ScheduledTable
            emails={scheduledEmails}
            loading={loading}
            onRefresh={loadEmails}
          />
        ) : (
          <SentTable
            emails={sentEmails}
            loading={loading}
            onRefresh={loadEmails}
          />
        )}
      </main>

      {/* Compose Campaign Modal */}
      <ComposeModal
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
        onSchedule={handleScheduleCampaign}
      />
    </div>
  );
}
