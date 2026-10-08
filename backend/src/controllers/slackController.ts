import { Request, Response } from 'express';
import { ENV } from '../config/env.js';
import { exchangeSlackCodeForToken, sendSlackRateLimitAlert } from '../services/slackService.js';
import { prisma } from '../db/prisma.js';

export function getSlackAuthorizeUrl(req: Request, res: Response) {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const scopes = 'chat:write,incoming-webhook';
  const url = `https://slack.com/oauth/v2/authorize?client_id=${ENV.SLACK.CLIENT_ID}&scope=${encodeURIComponent(
    scopes
  )}&redirect_uri=${encodeURIComponent(ENV.SLACK.REDIRECT_URI)}&state=${encodeURIComponent(userId)}`;

  return res.json({ url });
}

export async function slackCallback(req: Request, res: Response) {
  const { code, state, error } = req.query;

  if (error) {
    return res.redirect(`${ENV.FRONTEND_URL}?slack_error=${encodeURIComponent(String(error))}`);
  }

  if (!code || !state) {
    return res.redirect(`${ENV.FRONTEND_URL}?slack_error=missing_code_or_state`);
  }

  const userId = String(state);

  try {
    await exchangeSlackCodeForToken(String(code), userId);
    return res.redirect(`${ENV.FRONTEND_URL}?slack_connected=true`);
  } catch (err: any) {
    console.error('Slack OAuth callback error:', err.message);
    return res.redirect(`${ENV.FRONTEND_URL}?slack_error=${encodeURIComponent(err.message)}`);
  }
}

export async function disconnectSlack(req: Request, res: Response) {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    await prisma.slackConfig.deleteMany({
      where: { userId },
    });
    return res.json({ message: 'Slack disconnected successfully' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function triggerTestSlackAlert(req: Request, res: Response) {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const success = await sendSlackRateLimitAlert(userId, req.user?.email || 'sender@reachinbox.test', 10);
    if (!success) {
      return res.status(400).json({ error: 'Slack not connected for this user' });
    }
    return res.json({ message: 'Live Slack test alert sent successfully!' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
