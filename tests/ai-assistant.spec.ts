import { test, expect, type Page } from '@playwright/test';
import { seedAuthenticatedSession } from './helpers/auth';

/**
 * Navigates to /ai-assistant and dismisses the drawer backdrop if it is visible.
 */
async function openAiAssistant(page: Page): Promise<void> {
  await page.goto('/ai-assistant');
  const backdrop = page.locator('.im-ai-backdrop');
  if (await backdrop.isVisible({ timeout: 1500 }).catch(() => false)) {
    await backdrop.click();
    await expect(backdrop).not.toBeVisible();
  }
}

test.describe('AI Assistant - UI Layout & Composer State', () => {
  test.beforeEach(async ({ page }) => {
    await seedAuthenticatedSession(page);
  });

  test('assistant UI opens with workspace layout, empty state, and suggested prompt cards', async ({ page }) => {
    await page.goto('/ai-assistant');
    await expect(page).toHaveURL(/\/ai-assistant$/);

    // Verify workspace layout container
    const workspace = page.locator('.im-ai-workspace');
    await expect(workspace).toBeVisible();

    // Verify history panel and "New Chat" button
    const historyPanel = page.locator('.im-ai-history-panel');
    await expect(historyPanel).toBeVisible();

    const newChatBtn = page.locator('.im-ai-new-chat-btn');
    await expect(newChatBtn).toBeVisible();
    await expect(newChatBtn).toContainText('New Chat');

    // Verify empty state welcome header and description
    const emptyTitle = page.locator('.im-ai-empty-title');
    await expect(emptyTitle).toBeVisible();
    await expect(emptyTitle).toHaveText('What can I help you with today?');

    const emptySubtitle = page.locator('.im-ai-empty-subtitle');
    await expect(emptySubtitle).toBeVisible();
    await expect(emptySubtitle).toContainText('intelligent enterprise meeting assistant');

    // Verify suggested prompt cards
    const suggestedCards = page.locator('.im-ai-suggested-card');
    await expect(suggestedCards).toHaveCount(4);
    await expect(suggestedCards.first()).toContainText('Summarize my latest meeting');

    // Verify composer textarea and send button
    const textarea = page.locator('.im-ai-composer-textarea');
    await expect(textarea).toBeVisible();
    await expect(textarea).toHaveAttribute('placeholder', /Ask about your meetings/i);

    const sendBtn = page.locator('.im-ai-send-btn');
    await expect(sendBtn).toBeVisible();
  });

  test('empty and whitespace-only prompts are rejected and do not send', async ({ page }) => {
    await openAiAssistant(page);

    const textarea = page.locator('.im-ai-composer-textarea');
    const sendBtn = page.locator('.im-ai-send-btn');

    // 1. Initial empty state: send button is disabled
    await expect(textarea).toHaveValue('');
    await expect(sendBtn).toBeDisabled();

    // 2. Pressing Enter in empty textarea should not submit or create messages
    await textarea.focus();
    await textarea.press('Enter');
    await expect(page.locator('.im-ai-message-row')).toHaveCount(0);

    // 3. Entering whitespace only keeps send button disabled
    await textarea.fill('     \n\t   ');
    await expect(sendBtn).toBeDisabled();

    // 4. Pressing Enter with whitespace only does not submit
    await textarea.press('Enter');
    await expect(page.locator('.im-ai-message-row')).toHaveCount(0);

    // 5. Entering valid text enables the send button
    await textarea.fill('Hello IntellMeet');
    await expect(sendBtn).toBeEnabled();
  });
});

test.describe('AI Assistant - Prompt Execution & Streaming Lifecycle', () => {
  test.beforeEach(async ({ page }) => {
    await seedAuthenticatedSession(page);
  });

  test('assistant accepts a prompt, streams response, and displays markdown bubble', async ({ page }) => {
    await openAiAssistant(page);

    const textarea = page.locator('.im-ai-composer-textarea');
    const sendBtn = page.locator('.im-ai-send-btn');

    // Submit a query
    await textarea.fill('What is IntellMeet AI?');
    await sendBtn.click({ force: true });

    // Verify user message appears immediately
    const userMessage = page.locator('.im-ai-message-row.user');
    await expect(userMessage).toBeVisible();
    await expect(userMessage).toContainText('What is IntellMeet AI?');

    // Verify assistant response bubble appears
    const assistantMessage = page.locator('.im-ai-message-row.assistant');
    await expect(assistantMessage).toBeVisible();

    // Wait for the generation to finish (send button re-appears in place of stop button)
    await expect(page.locator('.im-ai-send-btn')).toBeVisible({ timeout: 15000 });

    // Verify generated content contains meaningful response text
    const responseContent = assistantMessage.locator('.im-ai-markdown');
    await expect(responseContent).toBeVisible();
    const text = await responseContent.innerText();
    expect(text.length).toBeGreaterThan(20);
    expect(text).toMatch(/IntellMeet|enterprise|meeting|AI/i);
  });

  test('stop generation button cancels in-flight streaming response', async ({ page }) => {
    await openAiAssistant(page);

    const textarea = page.locator('.im-ai-composer-textarea');
    await textarea.fill('Explain enterprise security architecture in deep detail.');
    await page.locator('.im-ai-send-btn').click({ force: true });

    // The stop button appears while streaming
    const stopBtn = page.locator('.im-ai-stop-btn');
    await expect(stopBtn).toBeVisible({ timeout: 5000 });
    await expect(stopBtn).toContainText('Stop');

    // Click stop generation
    await stopBtn.click({ force: true });

    // Verify streaming ceases and send button returns
    await expect(page.locator('.im-ai-send-btn')).toBeVisible({ timeout: 5000 });

    // Verify the error/stopped status is reflected in the assistant bubble
    const assistantMessage = page.locator('.im-ai-message-row.assistant');
    await expect(assistantMessage).toBeVisible();
    await expect(assistantMessage).toContainText('Generation stopped');
  });
});

test.describe('AI Assistant - Backend API Inspection & Fallback Verification', () => {
  test.beforeEach(async ({ page }) => {
    await seedAuthenticatedSession(page);
  });

  test('inspects actual network requests to verify remote 404 and local synthesizer fallback', async ({ page }) => {
    const apiRequests: { url: string; method: string }[] = [];
    const apiResponses: { url: string; status: number }[] = [];

    // Track all requests and responses matching the ai-assistant API path
    page.on('request', (req) => {
      if (req.url().includes('ai-assistant')) {
        apiRequests.push({ url: req.url(), method: req.method() });
      }
    });

    page.on('response', (res) => {
      if (res.url().includes('ai-assistant')) {
        apiResponses.push({ url: res.url(), status: res.status() });
      }
    });

    await openAiAssistant(page);

    // Initial page load attempts to fetch remote conversations:
    // GET /api/v1/ai-assistant/conversations
    const initialConvResponse = apiResponses.find((r) => r.url.includes('/ai-assistant/conversations'));
    if (initialConvResponse) {
      // Remote AWS API Gateway currently returns 404 Not Found for unrouted AI endpoints
      expect(initialConvResponse.status).toBe(404);
    }

    // Submit a prompt to test stream endpoint dispatch
    const textarea = page.locator('.im-ai-composer-textarea');
    await textarea.fill('Summarize key enterprise features of IntellMeet.');
    await page.locator('.im-ai-send-btn').click({ force: true });

    // Wait for the stream request to be made and response received
    await page.waitForResponse(
      (res) => res.url().includes('ai-assistant') && res.url().includes('/stream'),
      { timeout: 10000 }
    ).catch(() => {
      // Stream response might resolve quickly or fail
    });

    // Inspect stream network response
    const streamResponse = apiResponses.find((r) => r.url.includes('/messages/stream'));
    expect(streamResponse).toBeDefined();

    // Verify the backend status is 404 (Route not found on remote AWS Gateway)
    expect(streamResponse?.status).toBe(404);

    // Verify that the frontend gracefully handles this 404 by activating
    // its local progressive synthesizer fallback without crashing the UI
    const assistantMessage = page.locator('.im-ai-message-row.assistant');
    await expect(assistantMessage).toBeVisible();

    // Wait for local synthesis completion
    await expect(page.locator('.im-ai-send-btn')).toBeVisible({ timeout: 15000 });

    const markdownText = await assistantMessage.locator('.im-ai-markdown').innerText();
    expect(markdownText.length).toBeGreaterThan(0);
    // UI remains fully functional and responsive
    await expect(page.locator('.im-ai-composer-textarea')).toBeEnabled();
  });
});

test.describe('AI Assistant - History Persistence & Multi-Chat Management', () => {
  test.beforeEach(async ({ page }) => {
    await seedAuthenticatedSession(page);
  });

  test('persists conversation and messages across browser page reloads', async ({ page }) => {
    await openAiAssistant(page);

    // Submit a message to create history
    const textarea = page.locator('.im-ai-composer-textarea');
    await textarea.fill('What is end-to-end encryption in IntellMeet?');
    await page.locator('.im-ai-send-btn').click({ force: true });

    // Wait for generation to complete
    await expect(page.locator('.im-ai-send-btn')).toBeVisible({ timeout: 15000 });

    // Verify messages exist in localStorage
    const savedConvs = await page.evaluate(() => localStorage.getItem('intellmeet_ai_conversations_v1'));
    const savedMsgs = await page.evaluate(() => localStorage.getItem('intellmeet_ai_messages_v1'));

    expect(savedConvs).toBeTruthy();
    expect(savedMsgs).toBeTruthy();

    const parsedConvs = JSON.parse(savedConvs as string);
    const parsedMsgs = JSON.parse(savedMsgs as string);

    expect(Array.isArray(parsedConvs)).toBe(true);
    expect(parsedConvs.length).toBeGreaterThanOrEqual(1);

    const activeConvId = parsedConvs[0].id;
    expect(parsedMsgs[activeConvId]).toBeDefined();
    expect(parsedMsgs[activeConvId].length).toBeGreaterThanOrEqual(2);

    // Reload the page to test persistence
    await page.reload();

    // Verify the user and assistant messages are restored from persistence
    await expect(page.locator('.im-ai-message-row.user')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.im-ai-message-row.user')).toContainText('What is end-to-end encryption');

    await expect(page.locator('.im-ai-message-row.assistant')).toBeVisible();
    const restoredText = await page.locator('.im-ai-message-row.assistant .im-ai-markdown').innerText();
    expect(restoredText.length).toBeGreaterThan(10);
  });

  test('new chat button resets workspace to empty state and initiates new conversation', async ({ page }) => {
    await openAiAssistant(page);

    // First send a message in the initial chat
    const textarea = page.locator('.im-ai-composer-textarea');
    await textarea.fill('First chat topic');
    await page.locator('.im-ai-send-btn').click({ force: true });
    await expect(page.locator('.im-ai-send-btn')).toBeVisible({ timeout: 15000 });

    // Click "New Chat" button
    const newChatBtn = page.locator('.im-ai-new-chat-btn');
    await newChatBtn.click({ force: true });

    // Verify workspace resets to empty welcome state
    const emptyTitle = page.locator('.im-ai-empty-title');
    await expect(emptyTitle).toBeVisible();
    await expect(emptyTitle).toHaveText('What can I help you with today?');

    // Verify messages from previous chat are not in the new chat's view
    await expect(page.locator('.im-ai-message-row')).toHaveCount(0);

    // Verify textarea is cleared and focused
    await expect(page.locator('.im-ai-composer-textarea')).toHaveValue('');
  });
});
