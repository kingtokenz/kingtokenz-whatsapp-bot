// Conversation state machine for WhatsApp sales bot

export type ConversationStage =
  | "new"
  | "opener_sent"
  | "responded_positive"
  | "qualifying"
  | "pitched"
  | "objection"
  | "closing"
  | "closed_won"
  | "closed_lost"
  | "nurture";

export interface LeadConversation {
  phoneNumber: string;
  stage: ConversationStage;
  lastMessageAt: number;
    messages: Array<{
    from: "agent" | "lead";
    content: string;
    timestamp: number;
  }>;
  leadData?: {
    name?: string;
    followers?: number;
    bio?: string;
    postingFrequency?: string;
    budget?: string;
    goal?: string;
    challenge?: string;
  };
  score?: number;
  qualification?: "hot" | "warm" | "cold";
  nextAction?: string;
  followUpDate?: number;
}

// In-memory store (replace with Redis/DB in production)
const conversations = new Map<string, LeadConversation>();

const STAGE_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export function getConversation(phoneNumber: string): LeadConversation | undefined {
  const conv = conversations.get(phoneNumber);
  if (!conv) return undefined;

  // Check if expired
  if (Date.now() - conv.lastMessageAt > STAGE_EXPIRY_MS) {
    conversations.delete(phoneNumber);
    return undefined;
  }

  return conv;
}

export function initConversation(phoneNumber: string): LeadConversation {
  const conv: LeadConversation = {
    phoneNumber,
    stage: "new",
    lastMessageAt: Date.now(),
    messages: [],
  };
  conversations.set(phoneNumber, conv);
  return conv;
}

export function updateConversation(
  phoneNumber: string,
  update: Partial<LeadConversation>
): LeadConversation {
  const existing = getConversation(phoneNumber) ?? initConversation(phoneNumber);
  const updated: LeadConversation = {
    ...existing,
    ...update,
    lastMessageAt: Date.now(),
  };
  conversations.set(phoneNumber, updated);
  return updated;
}

export function addMessage(
  phoneNumber: string,
  from: "agent" | "lead",
  content: string
): LeadConversation {
  const conv = getConversation(phoneNumber) ?? initConversation(phoneNumber);
  conv.messages.push({ from, content, timestamp: Date.now() });
  conv.lastMessageAt = Date.now();
  conversations.set(phoneNumber, conv);
  return conv;
}

export function advanceStage(
  phoneNumber: string,
  newStage: ConversationStage,
  extra?: Partial<LeadConversation>
): LeadConversation {
  return updateConversation(phoneNumber, { stage: newStage, ...extra });
}

export function getAllConversations(): LeadConversation[] {
  return Array.from(conversations.values());
}

export function getConversationsByStage(stage: ConversationStage): LeadConversation[] {
  return Array.from(conversations.values()).filter((c) => c.stage === stage);
}

export function getPendingFollowUps(): LeadConversation[] {
  const now = Date.now();
  return Array.from(conversations.values()).filter(
    (c) =>
      c.followUpDate &&
      c.followUpDate <= now &&
      !["closed_won", "closed_lost"].includes(c.stage)
  );
}