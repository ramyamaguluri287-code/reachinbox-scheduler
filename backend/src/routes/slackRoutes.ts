import { Router } from 'express';
import {
  getSlackAuthorizeUrl,
  slackCallback,
  disconnectSlack,
  triggerTestSlackAlert,
} from '../controllers/slackController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';

const router = Router();

// Callback does not use JWT middleware as it is called directly by Slack browser redirect
router.get('/callback', slackCallback);

// Protected Slack routes
router.get('/authorize', requireAuth, getSlackAuthorizeUrl);
router.post('/disconnect', requireAuth, disconnectSlack);
router.post('/test-alert', requireAuth, triggerTestSlackAlert);

export default router;
