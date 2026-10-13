const mongoose = require('mongoose');

/**
 * Mongoose Schema for AI Messages
 */
const MessageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 32000,
    },
    status: {
      type: String,
      enum: ['idle', 'streaming', 'completed', 'error'],
      default: 'completed',
    },
    model: {
      type: String,
      default: null,
    },
    citations: [
      {
        title: { type: String, required: true },
        sourceType: {
          type: String,
          enum: ['meeting', 'summary', 'actionItem', 'documentation'],
          required: true,
        },
        referenceId: { type: String },
        snippet: { type: String },
        url: { type: String },
      },
    ],
    tokensUsed: {
      promptTokens: { type: Number, default: 0 },
      completionTokens: { type: Number, default: 0 },
      totalTokens: { type: Number, default: 0 },
    },
    error: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for message ordering within conversation
MessageSchema.index({ conversationId: 1, createdAt: 1 });

module.exports = mongoose.models.Message || mongoose.model('Message', MessageSchema);
