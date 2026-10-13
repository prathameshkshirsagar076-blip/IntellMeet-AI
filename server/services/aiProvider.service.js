/**
 * Multi-Provider LLM Service Abstraction
 * Supports OpenAI, Google Gemini, and Anthropic Claude with streaming SSE.
 */

class AiProviderService {
  constructor() {
    this.provider = process.env.AI_PROVIDER || 'openai';
    this.model = process.env.AI_MODEL || (this.provider === 'openai' ? 'gpt-4o' : 'gemini-1.5-pro');
    this.maxTokens = parseInt(process.env.AI_MAX_OUTPUT_TOKENS || '2048', 10);
  }

  isConfigured() {
    if (this.provider === 'openai' && process.env.OPENAI_API_KEY) return true;
    if (this.provider === 'gemini' && process.env.GEMINI_API_KEY) return true;
    if (this.provider === 'anthropic' && process.env.ANTHROPIC_API_KEY) return true;
    return false;
  }

  /**
   * Streams chat completion tokens directly to an Express Server-Sent Events (SSE) stream.
   *
   * @param {Object} options
   * @param {Array} options.messages - Array of { role, content }
   * @param {string} options.systemPrompt - Grounded system prompt
   * @param {Response} options.res - Express response object
   */
  async streamChat({ messages, systemPrompt, res }) {
    if (!this.isConfigured()) {
      res.write(
        `data: ${JSON.stringify({
          delta: '⚠️ **Configuration Notice:** No live LLM provider API key (`OPENAI_API_KEY` or `GEMINI_API_KEY`) is set on the server.\n\nTo enable live responses, configure the environment variables as specified in the IntellMeet AI documentation.',
        })}\n\n`
      );
      res.write('data: [DONE]\n\n');
      res.end();
      return;
    }

    if (this.provider === 'openai') {
      await this.streamOpenAi({ messages, systemPrompt, res });
    } else if (this.provider === 'gemini') {
      await this.streamGemini({ messages, systemPrompt, res });
    } else {
      throw new Error(`Unsupported AI Provider: ${this.provider}`);
    }
  }

  async streamOpenAi({ messages, systemPrompt, res }) {
    const formattedMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: formattedMessages,
        max_tokens: this.maxTokens,
        temperature: 0.7,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenAI API Error (${response.status}): ${errText}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const payload = line.slice(6).trim();
          if (payload === '[DONE]') {
            res.write('data: [DONE]\n\n');
            break;
          }
          try {
            const parsed = JSON.parse(payload);
            const delta = parsed.choices?.[0]?.delta?.content || '';
            if (delta) {
              res.write(`data: ${JSON.stringify({ delta })}\n\n`);
            }
          } catch {
            // pass non-json lines
          }
        }
      }
    }

    res.end();
  }

  async streamGemini({ messages, systemPrompt, res }) {
    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:streamGenerateContent?alt=sse&key=${apiKey}`;

    const contents = messages.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemPrompt }],
        },
        contents,
        generationConfig: {
          maxOutputTokens: this.maxTokens,
          temperature: 0.7,
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API Error (${response.status}): ${errText}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const parsed = JSON.parse(line.slice(6).trim());
            const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text || '';
            if (text) {
              res.write(`data: ${JSON.stringify({ delta: text })}\n\n`);
            }
          } catch {
            // ignore
          }
        }
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  }
}

module.exports = new AiProviderService();
