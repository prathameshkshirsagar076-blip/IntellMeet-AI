const mongoose = require('mongoose');

/**
 * Mongoose Schema for AI Assistant Conversations
 * Follows enterprise multi-tenant schema design.
 */
const ConversationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
      default: 'New Conversation',
    },
    model: {
      type: String,
      default: process.env.AI_MODEL || 'gpt-4o',
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
    contextMeetingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Meeting',
      default: null,
    },
    contextMeetingTitle: {
      type: String,
      default: null,
    },
    messageCount: {
      type: Number,
      default: 0,
    },
    lastMessagePreview: {
      type: String,
      maxlength: 300,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for user query performance
ConversationSchema.index({ userId: 1, isArchived: 1, updatedAt: -1 });
ConversationSchema.index({ userId: 1, title: 'text' });

module.exports = mongoose.models.Conversation || mongoose.model('Conversation', ConversationSchema);
