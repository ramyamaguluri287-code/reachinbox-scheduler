import axios from 'axios';
import { User, ScheduledEmail, SentEmail, ScheduleEmailPayload, ApiResponse } from './types';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== 'undefined' && window.location.port === '4000'
    ? 'http://localhost:4000'
    : 'http://localhost:5000');

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token from localStorage to every request
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export const api = {
  // 1. Google OAuth Verification (Supports /api/auth/google/verify and fallback /api/auth/google)
  async verifyGoogleToken(credential: string): Promise<{ token: string; user: User }> {
    try {
      const res = await apiClient.post('/api/auth/google/verify', { credential });
      return res.data;
    } catch {
      const fallbackRes = await apiClient.post('/api/auth/google', { credential });
      return fallbackRes.data;
    }
  },

  // 2. Current User Profile
  async getCurrentUser(): Promise<User> {
    const res = await apiClient.get<User>('/api/auth/me');
    return res.data;
  },

  // 3. Scheduled Emails
  async getScheduledEmails(search?: string, status?: string): Promise<ScheduledEmail[]> {
    const params: Record<string, string> = {};
    if (search && search.trim()) params.search = search.trim();
    if (status) params.status = status;
    const res = await apiClient.get<ScheduledEmail[]>('/api/emails/scheduled', { params });
    return res.data;
  },

  // 4. Sent Emails
  async getSentEmails(search?: string): Promise<SentEmail[]> {
    const params: Record<string, string> = {};
    if (search && search.trim()) params.search = search.trim();
    const res = await apiClient.get<SentEmail[]>('/api/emails/sent', { params });
    return res.data;
  },

  // 5. Schedule Emails
  async scheduleEmails(payload: ScheduleEmailPayload): Promise<ApiResponse<ScheduledEmail[]>> {
    const res = await apiClient.post<ApiResponse<ScheduledEmail[]>>('/api/emails/schedule', payload);
    return res.data;
  },

  // 6. Slack OAuth & Alert Testing
  async getSlackAuthUrl(): Promise<string> {
    const res = await apiClient.get<{ url: string }>('/api/slack/authorize');
    return res.data.url;
  },

  async disconnectSlack(): Promise<{ message: string }> {
    const res = await apiClient.post<{ message: string }>('/api/slack/disconnect');
    return res.data;
  },

  async sendTestSlackAlert(): Promise<{ message: string }> {
    const res = await apiClient.post<{ message: string }>('/api/slack/test-alert');
    return res.data;
  },
};
