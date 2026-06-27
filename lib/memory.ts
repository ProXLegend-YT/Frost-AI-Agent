// lib/memory.ts
// Manages conversation history in localStorage for persistent memory

export type Message = {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: number;
};

export type Conversation = {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  model: string;
};

const STORAGE_KEY = 'ai_agent_conversations';
const ACTIVE_KEY = 'ai_agent_active_id';
const MAX_CONVERSATIONS = 50;
const MAX_MESSAGES_PER_CONVO = 100;

// ─── Conversation CRUD ────────────────────────────────────────────────────────

export function getAllConversations(): Conversation[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveConversation(convo: Conversation): void {
  if (typeof window === 'undefined') return;
  const all = getAllConversations().filter(c => c.id !== convo.id);
  const updated = [convo, ...all].slice(0, MAX_CONVERSATIONS);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function getConversation(id: string): Conversation | null {
  return getAllConversations().find(c => c.id === id) ?? null;
}

export function deleteConversation(id: string): void {
  if (typeof window === 'undefined') return;
  const all = getAllConversations().filter(c => c.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function clearAllConversations(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(ACTIVE_KEY);
}

// ─── Active conversation ───────────────────────────────────────────────────────

export function getActiveId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACTIVE_KEY);
}

export function setActiveId(id: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACTIVE_KEY, id);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function createConversation(model: string): Conversation {
  return {
    id: crypto.randomUUID(),
    title: 'New Chat',
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    model,
  };
}

export function addMessage(convo: Conversation, msg: Message): Conversation {
  const messages = [...convo.messages, { ...msg, timestamp: Date.now() }]
    .slice(-MAX_MESSAGES_PER_CONVO);
  return { ...convo, messages, updatedAt: Date.now() };
}

export function generateTitle(firstUserMessage: string): string {
  return firstUserMessage.slice(0, 40) + (firstUserMessage.length > 40 ? '…' : '');
}

// ─── Format messages for API (strip timestamps) ───────────────────────────────

export function toAPIMessages(messages: Message[]) {
  return messages
    .filter(m => m.role !== 'system')
    .map(({ role, content }) => ({ role, content }));
}
