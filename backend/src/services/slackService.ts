import { WebClient } from '@slack/web-api';
import axios from 'axios';
import { prisma } from '../db/prisma.js';
import { ENV } from '../config/env.js';

export async function exchangeSlackCodeForToken(code: string, userId: string) {
  try {
    const response = await axios.post('https://slack.com/api/oauth.v2.access', null, {
      params: {
        code,
        client_id: ENV.SLACK.CLIENT_ID,
        client_secret: ENV.SLACK.CLIENT_SECRET,
        redirect_uri: ENV.SLACK.REDIRECT_URI,
      },
    });

    const data = response.data;
    if (!data.ok) {
      throw new Error(data.error || 'Slack OAuth failed');
    }

    const accessToken = data.access_token;
    const teamName = data.team?.name || 'Slack Workspace';
    const channelId = data.incoming_webhook?.channel_id || data.authed_user?.id;
    const channelName = data.incoming_webhook?.channel || 'Direct Message';

    // Store or update in DB for this user
    await prisma.slackConfig.upsert({
      where: { userId },
      update: {
        accessToken,
        channelId,
        channelName,
        teamName,
      },
      create: {
        userId,
        accessToken,
        channelId,
        channelName,
        teamName,
      },
    });

    return data;
  } catch (error: any) {
    console.error('❌ Error exchanging Slack code:', error.message);
    throw error;
  }
}

export async function sendSlackRateLimitAlert(
  userId: string,
  senderEmail: string,
  hourlyLimit: number,
  rescheduledCount?: number
): Promise<boolean> {
  try {
    const config = await prisma.slackConfig.findUnique({
      where: { userId },
    });

    if (!config || !config.accessToken) {
      // User hasn't connected Slack; do nothing safely
      return false;
    }

    const client = new WebClient(config.accessToken);
    const targetChannel = config.channelId || 'general';

    const timestamp = new Date().toLocaleString();
    const message = `🚨 *ReachInbox Rate Limit Alert*\n\n` +
      `• *Sender:* \`${senderEmail}\`\n` +
      `• *Hourly Limit:* ${hourlyLimit} emails/hour\n` +
      `• *Status:* Limit exceeded at ${timestamp}.\n` +
      `• *Action Taken:* Remaining jobs have been safely delayed & rescheduled to the next hourly window. No emails lost!`;

    await client.chat.postMessage({
      channel: targetChannel,
      text: message,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '⚠️ ReachInbox Hourly Rate Limit Reached',
            emoji: true,
          },
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Sender:*\n${senderEmail}`,
            },
            {
              type: 'mrkdwn',
              text: `*Hourly Limit:*\n${hourlyLimit} emails/hour`,
            },
            {
              type: 'mrkdwn',
              text: `*Time:*\n${timestamp}`,
            },
            {
              type: 'mrkdwn',
              text: `*Action:*\nRescheduled to next window`,
            },
          ],
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: '🛡️ *ReachInbox Queue Resilience*: No emails dropped.',
            },
          ],
        },
      ],
    });

    console.log(`📢 Slack alert sent to channel ${targetChannel} for sender ${senderEmail}`);
    return true;
  } catch (err: any) {
    console.warn(`⚠️ Could not send Slack rate limit alert (continuing safely): ${err.message}`);
    return false;
  }
}
