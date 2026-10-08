import express from 'express';
import cors from 'cors';
import { ENV } from './config/env.js';
import { serverAdapter } from './queues/bullBoard.js';
import { setupEmailWorker } from './workers/emailWorker.js';
import { initElasticIndex } from './services/elasticService.js';
import authRoutes from './routes/authRoutes.js';
import emailRoutes from './routes/emailRoutes.js';
import slackRoutes from './routes/slackRoutes.js';

const app = express();

// Standard middlewares
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Live BullMQ Dashboard
app.use('/admin/queues', serverAdapter.getRouter());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/emails', emailRoutes);
app.use('/api/slack', slackRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    workerConcurrency: ENV.SCHEDULER.WORKER_CONCURRENCY,
    hourlyLimit: ENV.SCHEDULER.MAX_EMAILS_PER_HOUR,
    delayBetweenEmailsMs: ENV.SCHEDULER.DELAY_BETWEEN_EMAILS_MS,
  });
});

// Start Server & Background Worker
const PORT = ENV.PORT;
app.listen(PORT, async () => {
  console.log(`\n=================================================`);
  console.log(`🚀 ReachInbox Scheduler Backend running on port ${PORT}`);
  console.log(`📊 Bull-Board Dashboard: http://localhost:${PORT}/admin/queues`);
  console.log(`🔍 Health Check: http://localhost:${PORT}/health`);
  console.log(`=================================================\n`);

  // Initialize Elasticsearch indexing
  await initElasticIndex();

  // Spin up BullMQ background worker
  setupEmailWorker();
});

export default app;
