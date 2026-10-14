const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const aiProviderService = require('../services/aiProvider.service');

exports.getConversations = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const conversations = await Conversation.find({ userId, isArchived: false })
      .sort({ isPinned: -1, updatedAt: -1 })
      .limit(100);

    return res.status(200).json({ success: true, data: conversations });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.createConversation = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { title, model, contextMeetingId, contextMeetingTitle } = req.body;

    const conversation = await Conversation.create({
      userId,
      title: title || 'New Conversation',
      model: model || 'IntellMeet-4.0',
      contextMeetingId: contextMeetingId || null,
      contextMeetingTitle: contextMeetingTitle || null,
    });

    return res.status(201).json({ success: true, data: conversation });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.getConversationById = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { id } = req.params;

    const conversation = await Conversation.findOne({ _id: id, userId });
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    const messages = await Message.find({ conversationId: id, userId }).sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      data: { conversation, messages },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateConversation = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { id } = req.params;
    const { title, isPinned, isArchived } = req.body;

    const conversation = await Conversation.findOneAndUpdate(
      { _id: id, userId },
      { $set: { title, isPinned, isArchived } },
      { new: true }
    );

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    return res.status(200).json({ success: true, data: conversation });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteConversation = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { id } = req.params;

    const deleted = await Conversation.findOneAndDelete({ _id: id, userId });
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    await Message.deleteMany({ conversationId: id, userId });

    return res.status(200).json({ success: true, message: 'Conversation deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.streamMessage = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { id: conversationId } = req.params;
    const { content, systemPrompt } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Content cannot be empty' });
    }

    // Verify conversation ownership
    const conversation = await Conversation.findOne({ _id: conversationId, userId });
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    // Save user message
    await Message.create({
      conversationId,
      userId,
      role: 'user',
      content,
    });

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Retrieve previous history for context
    const previousMessages = await Message.find({ conversationId })
      .sort({ createdAt: -1 })
      .limit(10);

    previousMessages.reverse();

    // Stream LLM response
    await aiProviderService.streamChat({
      messages: previousMessages,
      systemPrompt: systemPrompt || 'You are the IntellMeet AI Assistant.',
      res,
    });
  } catch (err) {
    if (!res.headersSent) {
      return res.status(500).json({ success: false, message: err.message });
    }
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
    res.end();
  }
};
