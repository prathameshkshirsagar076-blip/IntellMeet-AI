# IntellMeet AI Assistant — Backend Architecture & MERN Integration Guide

This directory contains the production-ready Node.js/Express and MongoDB (Mongoose) architecture for the **IntellMeet AI Assistant** module.

---

## 1. Directory Structure

```
server/
├── models/
│   ├── Conversation.js       # Mongoose schema for conversations & multi-tenant indexing
│   └── Message.js            # Mongoose schema for user/assistant messages & citations
├── controllers/
│   └── aiAssistant.controller.js # Controller handling CRUD & Server-Sent Events (SSE) streaming
├── routes/
│   └── aiAssistant.routes.js     # Protected API routes mounted under /api/v1/ai-assistant
└── services/
    └── aiProvider.service.js     # Multi-provider LLM abstraction (OpenAI GPT-4o, Google Gemini, Anthropic)
```

---

## 2. Environment Variables

Configure the following environment variables in your server's `.env` file:

```env
# AI Model Provider ('openai' | 'gemini')
AI_PROVIDER="openai"

# Model Identification
AI_MODEL="gpt-4o"

# Maximum Output Tokens
AI_MAX_OUTPUT_TOKENS="2048"

# Provider Secrets (Kept exclusively on the server, NEVER exposed to client)
OPENAI_API_KEY="sk-..."
# GEMINI_API_KEY="AIzaSy..."

# Database Connection (MongoDB)
MONGODB_URI="mongodb+srv://<user>:<password>@cluster.mongodb.net/intellmeet?retryWrites=true&w=majority"
```

---

## 3. Mounting Routes into an Express Server

In your main Express application (e.g. `app.js` or `server.js`):

```javascript
const express = require('express');
const app = express();
const aiAssistantRoutes = require('./routes/aiAssistant.routes');

app.use(express.json());

// Mount under existing API version prefix
app.use('/api/v1/ai-assistant', aiAssistantRoutes);
```

---

## 4. API Endpoints Specification

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/ai-assistant/conversations` | Lists all active conversations for the authenticated user |
| `POST` | `/api/v1/ai-assistant/conversations` | Creates a new conversation thread |
| `GET` | `/api/v1/ai-assistant/conversations/:id` | Retrieves a single conversation with its message history |
| `PATCH` | `/api/v1/ai-assistant/conversations/:id` | Updates conversation title, pinned status, or archive state |
| `DELETE`| `/api/v1/ai-assistant/conversations/:id` | Deletes a conversation and all its messages |
| `POST` | `/api/v1/ai-assistant/conversations/:id/messages/stream` | Streams LLM response tokens via Server-Sent Events (SSE) |

---

## 5. Security & Privacy Guarantees

1. **Authorization & Multi-Tenancy:**
   All queries enforce `{ userId }` checks preventing any cross-user or cross-workspace data leakage.
2. **Server-Side Key Isolation:**
   `OPENAI_API_KEY` and `GEMINI_API_KEY` remain exclusively on the server and are never bundled into client distributions.
3. **Prompt Grounding & Data Redaction:**
   Sensitive meeting data is only injected when explicitly authorized by the authenticated user's workspace membership.
