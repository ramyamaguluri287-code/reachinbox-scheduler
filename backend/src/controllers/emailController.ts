import { Request, Response } from 'express';
import { prisma } from '../db/prisma.js';
import { scheduleEmailInQueue } from '../queues/emailQueue.js';
import { indexEmailInElastic, searchEmailsInElastic } from '../services/elasticService.js';
import { ENV } from '../config/env.js';

export async function scheduleEmails(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const {
      senderEmail,
      recipientEmails,
      subject,
      body,
      startTime,
      delayBetweenEmailsMs = ENV.SCHEDULER.DELAY_BETWEEN_EMAILS_MS,
      hourlyLimit = ENV.SCHEDULER.MAX_EMAILS_PER_HOUR,
    } = req.body;

    if (!senderEmail || !Array.isArray(recipientEmails) || recipientEmails.length === 0 || !subject || !body) {
      return res.status(400).json({ error: 'Missing required fields or empty recipient list' });
    }

    const baseStartTime = startTime ? new Date(startTime).getTime() : Date.now();
    const now = Date.now();
    const effectiveStartTime = Math.max(now, baseStartTime);

    const createdJobs = [];

    // Loop through recipients and schedule with staggered delays
    for (let i = 0; i < recipientEmails.length; i++) {
      const recipient = recipientEmails[i].trim();
      if (!recipient) continue;

      // Stagger each recipient by delayBetweenEmailsMs
      const scheduledTimeMs = effectiveStartTime + i * Number(delayBetweenEmailsMs);
      const scheduledDate = new Date(scheduledTimeMs);
      const delayMs = Math.max(0, scheduledTimeMs - Date.now());

      // 1. Create DB record
      const emailRecord = await prisma.emailJob.create({
        data: {
          userId,
          senderEmail,
          recipientEmail: recipient,
          subject,
          body,
          scheduledAt: scheduledDate,
          status: 'SCHEDULED',
        },
      });

      // 2. Schedule BullMQ delayed job
      const bullJob = await scheduleEmailInQueue(
        {
          emailId: emailRecord.id,
          userId,
          senderEmail,
          recipientEmail: recipient,
          subject,
          body,
          scheduledAt: scheduledDate.toISOString(),
          hourlyLimit: Number(hourlyLimit),
          delayBetweenEmailsMs: Number(delayBetweenEmailsMs),
        },
        delayMs
      );

      // Save bullJobId to DB
      await prisma.emailJob.update({
        where: { id: emailRecord.id },
        data: { bullJobId: String(bullJob.id) },
      });

      // 3. Index to Elasticsearch
      await indexEmailInElastic({
        id: emailRecord.id,
        userId,
        senderEmail,
        recipientEmail: recipient,
        subject,
        body,
        status: 'SCHEDULED',
        scheduledAt: scheduledDate,
        createdAt: emailRecord.createdAt,
      });

      createdJobs.push({
        id: emailRecord.id,
        recipient,
        scheduledAt: scheduledDate,
      });
    }

    return res.status(201).json({
      message: `Successfully scheduled ${createdJobs.length} email(s)`,
      count: createdJobs.length,
      jobs: createdJobs,
    });
  } catch (error: any) {
    console.error('❌ Error scheduling emails:', error.message);
    return res.status(500).json({ error: 'Failed to schedule emails: ' + error.message });
  }
}

export async function getScheduledEmails(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const emails = await prisma.emailJob.findMany({
      where: {
        userId,
        status: { in: ['SCHEDULED', 'RESCHEDULED', 'PROCESSING'] },
      },
      orderBy: { scheduledAt: 'asc' },
    });

    return res.json(emails);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function getSentEmails(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const emails = await prisma.emailJob.findMany({
      where: {
        userId,
        status: { in: ['SENT', 'FAILED'] },
      },
      orderBy: { sentAt: 'desc' },
    });

    return res.json(emails);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function searchEmails(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const query = String(req.query.q || '').trim();
    const tab = String(req.query.tab || 'all'); // 'scheduled' | 'sent' | 'all'

    let statusFilter: string | undefined = undefined;
    if (tab === 'scheduled') statusFilter = 'SCHEDULED';
    if (tab === 'sent') statusFilter = 'SENT';

    // Try Elasticsearch first
    const esIds = await searchEmailsInElastic(userId, query, statusFilter);

    if (esIds !== null) {
      // Elasticsearch returned matching IDs
      const emails = await prisma.emailJob.findMany({
        where: {
          id: { in: esIds },
          userId,
        },
      });
      return res.json({ source: 'elasticsearch', results: emails });
    }

    // Fallback to PostgreSQL Prisma query
    const dbResults = await prisma.emailJob.findMany({
      where: {
        userId,
        ...(statusFilter ? { status: statusFilter } : {}),
        ...(query
          ? {
              OR: [
                { subject: { contains: query, mode: 'insensitive' } },
                { recipientEmail: { contains: query, mode: 'insensitive' } },
                { senderEmail: { contains: query, mode: 'insensitive' } },
                { body: { contains: query, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: { scheduledAt: 'desc' },
      take: 100,
    });

    return res.json({ source: 'database', results: dbResults });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
