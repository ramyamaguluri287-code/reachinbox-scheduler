import axios from 'axios';
import { EmailJob, ScheduleEmailPayload, User } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const api = {
  async googleLogin(credential: string): Promise<{ token: string; user: User }> {
    const res = await apiClient.post('/api/auth/google', { credential });
    return res.data;
  },

  async getCurrentUser(): Promise<User> {
    const res = await apiClient.get('/api/auth/me');
    return res.data;
  },

  async getScheduledEmails(): Promise<EmailJob[]> {
    const res = await apiClient.get('/api/emails/scheduled');
    return res.data;
  },

  async getSentEmails(): Promise<EmailJob[]> {
    const res = await apiClient.get('/api/emails/sent');
    return res.data;
  },

  async scheduleEmails(payload: ScheduleEmailPayload): Promise<{ message: string; count: number }> {
    const res = await apiClient.post('/api/emails/schedule', payload);
    return res.data;
  },

  async searchEmails(query: string, tab: 'all' | 'scheduled' | 'sent'): Promise<EmailJob[]> {
    const res = await apiClient.get(`/api/emails/search?q=${encodeURIComponent(query)}&tab=${tab}`);
    return res.data.results || [];
  },

  async getSlackAuthUrl(): Promise<string> {
    const res = await apiClient.get('/api/slack/authorize');
    return res.data.url;
  },

  async disconnectSlack(): Promise<void> {
    await apiClient.post('/api/slack/disconnect');
  },

  async sendTestSlackAlert(): Promise<void> {
    await apiClient.post('/api/slack/test-alert');
  },
};
