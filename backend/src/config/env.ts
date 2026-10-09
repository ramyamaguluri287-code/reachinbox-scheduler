import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://reachinbox:reachinbox_password@localhost:5432/reachinbox_scheduler?schema=public',
  
  REDIS: {
    HOST: process.env.REDIS_HOST || 'localhost',
    PORT: parseInt(process.env.REDIS_PORT || '6379', 10),
    PASSWORD: process.env.REDIS_PASSWORD || undefined,
  },

  ELASTICSEARCH: {
    NODE: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
    INDEX_NAME: process.env.ELASTICSEARCH_INDEX || 'reachinbox_emails',
  },

  JWT_SECRET: process.env.JWT_SECRET || 'super-secret-reachinbox-jwt-key-321',

  GOOGLE: {
    CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
    CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
  },

  SLACK: {
    CLIENT_ID: process.env.SLACK_CLIENT_ID || '',
    CLIENT_SECRET: process.env.SLACK_CLIENT_SECRET || '',
    REDIRECT_URI: process.env.SLACK_REDIRECT_URI || 'http://localhost:5000/api/slack/callback',
  },

  SCHEDULER: {
    WORKER_CONCURRENCY: parseInt(process.env.WORKER_CONCURRENCY || '10', 10),
    DELAY_BETWEEN_EMAILS_MS: parseInt(process.env.DELAY_BETWEEN_EMAILS_MS || '250', 10),
    MAX_EMAILS_PER_HOUR: parseInt(process.env.MAX_EMAILS_PER_HOUR || '200', 10),
  },
};
