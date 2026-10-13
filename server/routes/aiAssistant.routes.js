const express = require('express');
const router = express.Router();
const controller = require('../controllers/aiAssistant.controller');

// Dummy auth middleware placeholder if standard auth middleware is imported
const authMiddleware = (req, res, next) => {
  if (req.user) return next();
  // Extract Bearer token from header for serverless or microservices
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    req.user = { id: req.headers['x-user-id'] || 'usr_authenticated' };
    return next();
  }
  return res.status(401).json({ success: false, message: 'Authentication required' });
};

router.use(authMiddleware);

// 1. Conversations CRUD
router.get('/conversations', controller.getConversations);
router.post('/conversations', controller.createConversation);
router.get('/conversations/:id', controller.getConversationById);
router.patch('/conversations/:id', controller.updateConversation);
router.delete('/conversations/:id', controller.deleteConversation);

// 2. Message Streaming
router.post('/conversations/:id/messages/stream', controller.streamMessage);

module.exports = router;
