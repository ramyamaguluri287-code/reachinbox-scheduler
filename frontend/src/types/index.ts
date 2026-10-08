export type EmailStatus = 'SCHEDULED' | 'PROCESSING' | 'SENT' | 'FAILED' | 'RESCHEDULED';

export interface EmailJob {
  id: string;
  bullJobId?: string | null;
  userId: string;
  senderEmail: string;
  recipientEmail: string;
  subject: string;
  body: string;
  scheduledAt: string;
  sentAt?: string | null;
  status: EmailStatus;
  etherealPreviewUrl?: string | null;
  errorMessage?: string | null;
  retryCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  isSlackConnected?: boolean;
  slackInfo?: {
    channelName?: string;
    teamName?: string;
    connectedAt?: string;
  } | null;
}

export interface ScheduleEmailPayload {
  senderEmail: string;
  recipientEmails: string[];
  subject: string;
  body: string;
  startTime: string;
  delayBetweenEmailsMs: number;
  hourlyLimit: number;
}
