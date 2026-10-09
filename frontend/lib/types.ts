export interface User {
  id: string;
  name?: string;
  email: string;
  avatar?: string;
  isSlackConnected?: boolean;
  slackInfo?: {
    channelName?: string;
    teamName?: string;
    connectedAt?: string;
  } | null;
}

export interface ScheduledEmail {
  id: string;
  userId: string;
  senderEmail: string;
  recipientEmail: string;
  subject: string;
  body: string;
  scheduledAt: string;
  status: 'SCHEDULED' | 'PENDING' | 'PROCESSING' | 'RESCHEDULED';
  createdAt: string;
}

export interface SentEmail {
  id: string;
  userId: string;
  senderEmail: string;
  recipientEmail: string;
  subject: string;
  body: string;
  scheduledAt: string;
  sentAt?: string | null;
  status: 'SENT' | 'FAILED';
  etherealPreviewUrl?: string | null;
  errorMessage?: string | null;
  createdAt: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  count?: number;
  jobs?: any[];
}

export interface ScheduleEmailPayload {
  to?: string[];
  recipientEmails?: string[];
  fromEmail?: string;
  senderEmail?: string;
  subject: string;
  body: string;
  startTime?: string;
  delayBetweenMs?: number;
  delayBetweenEmailsMs?: number;
  hourlyLimit?: number;
}
