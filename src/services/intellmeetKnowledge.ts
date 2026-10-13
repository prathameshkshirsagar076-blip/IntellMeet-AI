import type { Meeting, MeetingSummary, ActionItem } from '../types/meeting';

export interface GroundedContext {
  meetings: Meeting[];
  summaries: MeetingSummary[];
  userName?: string;
  userRole?: string;
  activeMeetingId?: string;
}

export const INTELLMEET_PRODUCT_KNOWLEDGE = `
# IntellMeet AI — Official Product Specification & Knowledge Base

## 1. Product Overview
IntellMeet AI is an enterprise-grade AI-powered video conferencing and collaborative meeting intelligence platform. It combines real-time video communications with post-meeting artificial intelligence to capture summaries, track decisions, and extract action items automatically.

## 2. Core Functional Modules
- **Meetings Management (/meetings):**
  - View all, upcoming, completed, and cancelled meetings.
  - Quick join via 9-digit meeting code (format: itm-XXX-XXX).
  - Copy meeting links, edit upcoming sessions, and cancel with participant notification.
  - Multi-page pagination with configurable rows-per-page (5, 10, 20, 50).
- **Interactive Calendar Schedule (/schedule):**
  - Monthly calendar grid view with uniform day cells.
  - Click any future date to immediately schedule a meeting with date auto-binding.
  - Past dates are protected against invalid scheduling.
  - Day Overview modal to view all sessions scheduled on a given date.
- **Meeting Pre-Join Lobby (/meetings/join):**
  - Camera & microphone hardware preview with toggle controls.
  - Audio and video device selection.
  - Display name customization and meeting passcode verification.
- **Live Meeting Room (/meeting/:meetingId):**
  - Full-screen immersive meeting layout with auto-hiding top bar.
  - Grid and Spotlight participant views.
  - Non-overlapping floating control docks: Audio/Mic, Camera/Video, Screen Share, Chat Drawer, Participant Roster, Meeting Info & Settings.
- **AI Notes & Executive Summaries (/ai-notes):**
  - Automated transcript ingestion and post-meeting distillation.
  - Sections: Executive Overview, Key Discussion Points, Decisions Made, and Action Items.
  - Interactive Action Items tracker: check off tasks directly, see assignee and due dates.
  - One-click Markdown copy for executive notes sharing.
- **Team & Workspace Directory (/team):**
  - Directory of enterprise members with role badges (Admin, Host, Member).
  - Online/offline presence indicators.
  - Invite new members with email and assigned role.
- **Direct Messaging & Chat (/chat):**
  - Direct message channels between colleagues.
  - Unread message tracking, message search, and typing indicators.
- **Theme & Personalization (/settings?tab=theme):**
  - 8 curated enterprise theme presets: Signature (Indigo), Ocean (Blue), Emerald (Green), Midnight (Slate), Arctic (Teal), Royal (Violet), Sunset (Amber), Graphite (Neutral).
  - Light, Dark, and System color modes.
  - Custom HEX accent picker with live contrast evaluation.
  - Accessibility settings: High Contrast toggle, Reduced Motion toggle.

## 3. Privacy & Security Standards
- Enterprise OAuth 2.0 (Google Workspace, Microsoft Entra ID) and JWT Bearer token authentication.
- All live streams utilize DTLS-SRTP end-to-end encryption.
- No user private audio or video data is retained without explicit enterprise recording consent.
`;

/**
 * Searches the grounded IntellMeet knowledge base for relevant facts matching a user query.
 */
export function searchIntellMeetKnowledge(query: string): string[] {
  const normalized = query.toLowerCase();
  const sections = INTELLMEET_PRODUCT_KNOWLEDGE.split('## ').slice(1);
  const matchedSections: string[] = [];

  for (const section of sections) {
    const lines = section.split('\n');
    const title = lines[0]?.trim() || '';
    const content = lines.slice(1).join('\n');

    if (
      title.toLowerCase().includes(normalized) ||
      content.toLowerCase().includes(normalized) ||
      (normalized.includes('theme') && title.includes('Theme')) ||
      (normalized.includes('schedule') && title.includes('Calendar')) ||
      (normalized.includes('summary') && title.includes('AI Notes')) ||
      (normalized.includes('action') && title.includes('AI Notes')) ||
      (normalized.includes('security') && title.includes('Privacy')) ||
      (normalized.includes('shortcut') && title.includes('Overview'))
    ) {
      matchedSections.push(`### ${title}\n${content.trim()}`);
    }
  }

  return matchedSections.length > 0 ? matchedSections : [INTELLMEET_PRODUCT_KNOWLEDGE.slice(0, 1200)];
}

/**
 * Extracts authorized meeting data relevant to the user's question.
 */
export function extractMeetingContext(
  query: string,
  context: GroundedContext
): { contextText: string; citations: { title: string; sourceType: 'meeting' | 'summary' | 'actionItem'; referenceId: string }[] } {
  const q = query.toLowerCase();
  const citations: { title: string; sourceType: 'meeting' | 'summary' | 'actionItem'; referenceId: string }[] = [];
  const lines: string[] = [];

  // 1. Specific meeting targeted by ID
  if (context.activeMeetingId) {
    const targetMeeting = context.meetings.find((m) => m.id === context.activeMeetingId);
    const targetSummary = context.summaries.find((s) => s.meetingId === context.activeMeetingId);

    if (targetMeeting) {
      lines.push(`ACTIVE TARGET MEETING:`);
      lines.push(`- Title: "${targetMeeting.title}" | Date: ${targetMeeting.date} at ${targetMeeting.startTime} | Duration: ${targetMeeting.durationMinutes} min | Status: ${targetMeeting.status}`);
      lines.push(`- Host: ${targetMeeting.organizer.name} | Code: ${targetMeeting.meetingCode}`);
      citations.push({ title: targetMeeting.title, sourceType: 'meeting', referenceId: targetMeeting.id });

      if (targetSummary) {
        lines.push(`\nSUMMARY FOR THIS MEETING:`);
        lines.push(`- Overview: ${targetSummary.overview}`);
        lines.push(`- Key Points:\n${targetSummary.keyPoints.map((p) => `  * ${p}`).join('\n')}`);
        lines.push(`- Decisions Made:\n${targetSummary.decisions.map((d) => `  * ${d}`).join('\n')}`);
        lines.push(`- Action Items:\n${targetSummary.actionItems.map((a) => `  * [${a.completed ? 'COMPLETED' : 'PENDING'}] ${a.task} (@${a.assignee}) Due: ${a.dueDate || 'N/A'}`).join('\n')}`);
        citations.push({ title: `Summary: ${targetMeeting.title}`, sourceType: 'summary', referenceId: targetSummary.id });
      }
      return { contextText: lines.join('\n'), citations };
    }
  }

  // 2. Query regarding latest / recent meeting
  if (q.includes('latest') || q.includes('recent') || q.includes('last meeting') || q.includes('previous')) {
    const sortedMeetings = [...context.meetings].sort((a, b) => new Date(`${b.date}T${b.startTime}`).getTime() - new Date(`${a.date}T${a.startTime}`).getTime());
    const latestMeeting = sortedMeetings[0];

    if (latestMeeting) {
      lines.push(`MOST RECENT MEETING: "${latestMeeting.title}" (${latestMeeting.date})`);
      citations.push({ title: latestMeeting.title, sourceType: 'meeting', referenceId: latestMeeting.id });

      const summary = context.summaries.find((s) => s.meetingId === latestMeeting.id);
      if (summary) {
        lines.push(`- Overview: ${summary.overview}`);
        lines.push(`- Key Points: ${summary.keyPoints.join('; ')}`);
        lines.push(`- Decisions: ${summary.decisions.join('; ')}`);
        lines.push(`- Action Items: ${summary.actionItems.map((a) => `${a.task} (@${a.assignee})`).join('; ')}`);
        citations.push({ title: `Summary: ${latestMeeting.title}`, sourceType: 'summary', referenceId: summary.id });
      } else {
        lines.push(`(No AI summary generated for this meeting yet)`);
      }
    }
  }

  // 3. Query regarding action items / tasks / pending items
  if (q.includes('action item') || q.includes('task') || q.includes('pending') || q.includes('to-do')) {
    const allActionItems: { task: ActionItem; meetingTitle: string; meetingId: string }[] = [];

    context.summaries.forEach((s) => {
      s.actionItems.forEach((ai) => {
        allActionItems.push({ task: ai, meetingTitle: s.meetingTitle, meetingId: s.meetingId });
      });
    });

    // Also check direct meeting action items if any
    context.meetings.forEach((m) => {
      if (m.actionItems && m.actionItems.length > 0) {
        m.actionItems.forEach((ai) => {
          if (!allActionItems.some((existing) => existing.task.id === ai.id)) {
            allActionItems.push({ task: ai, meetingTitle: m.title, meetingId: m.id });
          }
        });
      }
    });

    if (allActionItems.length > 0) {
      lines.push(`\nPENDING & ASSIGNED ACTION ITEMS IN WORKSPACE:`);
      allActionItems.forEach(({ task, meetingTitle, meetingId }) => {
        lines.push(`- [${task.completed ? 'COMPLETED' : 'PENDING'}] "${task.task}" | Assignee: @${task.assignee} | Due: ${task.dueDate || 'No deadline'} | From meeting: "${meetingTitle}"`);
        if (!citations.some((c) => c.referenceId === task.id)) {
          citations.push({ title: task.task, sourceType: 'actionItem', referenceId: task.id || meetingId });
        }
      });
    } else {
      lines.push(`\nACTION ITEMS: Currently there are 0 logged action items across your meetings.`);
    }
  }

  // 4. Query regarding upcoming or next meetings
  if (q.includes('upcoming') || q.includes('next') || q.includes('tomorrow') || q.includes('prepare')) {
    const upcoming = context.meetings.filter((m) => m.status === 'upcoming' || m.status === 'live');
    if (upcoming.length > 0) {
      lines.push(`\nUPCOMING MEETINGS:`);
      upcoming.slice(0, 5).forEach((m) => {
        lines.push(`- "${m.title}" | Date: ${m.date} at ${m.startTime} (${m.durationMinutes}m) | Code: ${m.meetingCode} | Host: ${m.organizer.name}`);
        citations.push({ title: m.title, sourceType: 'meeting', referenceId: m.id });
      });
    } else {
      lines.push(`\nUPCOMING MEETINGS: No upcoming meetings scheduled.`);
    }
  }

  return {
    contextText: lines.join('\n'),
    citations,
  };
}

/**
 * Constructs the grounded enterprise system prompt for IntellMeet AI.
 */
export function buildSystemPrompt(context: GroundedContext, userQuery: string): { prompt: string; citations: { title: string; sourceType: 'meeting' | 'summary' | 'actionItem' | 'documentation'; referenceId?: string }[] } {
  const productDocs = searchIntellMeetKnowledge(userQuery);
  const { contextText, citations } = extractMeetingContext(userQuery, context);

  const docCitations: { title: string; sourceType: 'documentation' }[] = [
    { title: 'IntellMeet Product Knowledge Base', sourceType: 'documentation' },
  ];

  const prompt = `You are the IntellMeet AI Assistant, an advanced enterprise meeting co-pilot integrated natively into the IntellMeet application.

Current User: ${context.userName || 'Authenticated User'} (Role: ${context.userRole || 'Member'})

CORE OPERATIONAL PRINCIPLES:
1. TRUTHFULNESS & GROUNDING: You answer questions using verified IntellMeet product capabilities and the authorized meeting data provided below. Never invent features, pretend actions have occurred, or hallucinate meeting transcripts.
2. IDENTITY: You identify as the IntellMeet AI Assistant. Your style is clear, professional, concise, and structured (using Markdown formatting, bold headings, bullet points, and code blocks where appropriate).
3. WORKSPACE MEETINGS & ACTIONS: When asked to summarize meetings, list action items, or plan agendas, strictly use the user's authorized meeting records provided in the context below. If information is missing or not yet generated, explicitly and politely explain that to the user.
4. CODE & INSTRUCTIONS: If the user asks for code, markdown, agenda templates, or SQL, format them cleanly with syntax-highlighted code blocks.

=== GROUNDED INTELLMEET PRODUCT DOCUMENTATION ===
${productDocs.join('\n\n')}

=== USER AUTHORIZED MEETING & WORKSPACE DATA ===
${contextText ? contextText : 'No specific meeting records match this query. Total meetings in account: ' + context.meetings.length}
`;

  return {
    prompt,
    citations: [...citations, ...docCitations],
  };
}
