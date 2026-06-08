import {
  SERVICE_TIERS,
  OBJECTION_RESPONSES,
  PITCH_OPENERS,
  QUALIFYING_CRITERIA,
  scoreLead,
  qualifyLead,
  SALES_PILLARS,
} from "./kingtokenz-kb";
import type { LeadConversation, ConversationStage } from "./conversation-state";

// Detect if a message is an objection
function detectObjection(message: string): string | null {
  const lower = message.toLowerCase();
  const patterns: Array<{ keyword: string; key: string }> = [
    { keyword: "expensive", key: "expensive" },
    { keyword: "too much", key: "expensive" },
    { keyword: "cost", key: "expensive" },
    { keyword: "price", key: "expensive" },
    { keyword: "on brand", key: "onBrand" },
    { keyword: "not on brand", key: "onBrand" },
    { keyword: "generic", key: "onBrand" },
    { keyword: "test", key: "testFirst" },
    { keyword: "try first", key: "testFirst" },
    { keyword: "try it", key: "testFirst" },
    { keyword: "not sure", key: "willItWork" },
    { keyword: "will it work", key: "willItWork" },
    { keyword: "does it work", key: "willItWork" },
    { keyword: "think about", key: "thinkAboutIt" },
    { keyword: "let me think", key: "thinkAboutIt" },
    { keyword: "consider", key: "thinkAboutIt" },
    { keyword: "results", key: "canSeeResultsFirst" },
    { keyword: "show me", key: "canSeeResultsFirst" },
    { keyword: "not interested", key: "notInterested" },
    { keyword: "not now", key: "notInterested" },
    { keyword: "go away", key: "notInterested" },
  ];

  for (const { keyword, key } of patterns) {
    if (lower.includes(keyword)) return key;
  }
  return null;
}

// Detect if a message indicates interest
function detectInterest(message: string): boolean {
  const lower = message.toLowerCase();
  const interestPatterns = [
    "yes", "yeah", "yep", "sure", "interested", "tell me more",
    "how", "what", "when", "sounds good", "let's do it", "let's go",
    "book", "call", " DM ", "info", "more", "details", "pricing",
    "how much", "automation", "carousels", "interesting",
  ];
  return interestPatterns.some((p) => lower.includes(p));
}

// Detect if they're a cold lead / not qualified
function detectNotQualified(message: string): boolean {
  const lower = message.toLowerCase();
  const redFlags = [
    "no followers", "just started", "new account", "0 followers",
    "not an influencer", "i'm not", "i dont", "don't have",
  ];
  return redFlags.some((f) => lower.includes(f));
}

// Generate stage-appropriate response
export function generateResponse(
  incomingMessage: string,
  conv: LeadConversation
): { response: string; newStage?: ConversationStage; action?: string } {
  const message = incomingMessage.trim();
  const lower = message.toLowerCase();

  // ── OBJECTION HANDLING (any stage after opener) ──
  if (conv.stage !== "new" && conv.stage !== "opener_sent") {
    const objectionKey = detectObjection(message);
    if (objectionKey) {
      if (objectionKey === "notInterested") {
        return {
          response:
            "No worries at all! If you ever get overwhelmed with content creation, feel free to reach out. I'll be here 😊",
          newStage: "closed_lost",
          action: "mark_lost",
        };
      }
      return {
        response: OBJECTION_RESPONSES[objectionKey],
        newStage: "objection",
        action: `handled_objection:${objectionKey}`,
      };
    }
  }

  // ── NOT QUALIFIED ──
  if (detectNotQualified(message)) {
    return {
      response:
        "No worries! This service is specifically for creators and influencers who are already active on Instagram and looking to scale. If that's ever you in the future, feel free to reach out! 🙌",
      newStage: "closed_lost",
      action: "mark_not_qualified",
    };
  }

  // ── STAGE: NEW ──
  if (conv.stage === "new") {
    const opener = PITCH_OPENERS[Math.floor(Math.random() * PITCH_OPENERS.length)];
    return {
      response: opener,
      newStage: "opener_sent",
      action: "sent_opener",
    };
  }

  // ── STAGE: OPENER SENT — waiting for response ──
  if (conv.stage === "opener_sent") {
    if (detectInterest(message)) {
      return {
        response: `Love the enthusiasm! 🔥 Here's the quick rundown:

We post 10 research-backed carousels to your Instagram DAILY — designed professionally, fully automated.

That's 300+ carousels monthly = you look like the authority in your niche without lifting a finger.

**Price: $497/month** (or $297 for Starter — 2/day)

Questions? Or ready to book a 15-min call to get started? [CALENDLY_LINK]`,
        newStage: "pitched",
        action: "sent_pitch",
      };
    } else {
      // Generic response — keep it light
      return {
        response:
          "Hey! Just checking in — did you get my last message? Happy to answer any questions about the carousel automation! 😊",
        action: "follow_up",
      };
    }
  }

  // ── STAGE: PITCHED ──
  if (conv.stage === "pitched") {
    if (lower.includes("book") || lower.includes("call") || lower.includes("yes") || lower.includes("let's go") || lower.includes("sounds good")) {
      return {
        response: `Perfect! Let's lock it in 🎉

**Book your 15-min discovery call here:**
[CALENDLY_LINK]

On the call we'll:
→ Look at your Instagram
→ Confirm your niche + goals
→ Get you set up for a Day 5 launch

See you there! 🙌`,
        newStage: "closing",
        action: "sent_calendar_link",
      };
    }

    if (lower.includes("how much") || lower.includes("price") || lower.includes("pricing")) {
      return {
        response: `Great question! Here are the plans:

**STARTER** — $297/month
→ 60 carousels (2/day)
→ Research-backed content + design
→ Best for testing the model

**PRO** — $497/month ⭐ Most Popular
→ 300 carousels (10/day)
→ Deep niche research + competitive analysis
→ Manus automation setup
→ Best for serious scaling

**PREMIUM** — $797/month
→ 300+ carousels + custom design treatments
→ Weekly strategy calls + dedicated account manager

All month-to-month. No contracts. Cancel anytime.

Which tier sounds right for you?`,
        newStage: "pitched",
        action: "sent_pricing",
      };
    }

    if (detectInterest(message)) {
      return {
        response: `Love that! Here's how we work:

**Step 1:** You give us your niche + Instagram handle
**Step 2:** We research your niche + competitors (days 1-2)
**Step 3:** We design your first 10 carousels (days 3-4)
**Step 4:** Manus automation goes live — carousels post daily (day 5)

By the end of week 1, your feed is packed with authority content. You focus on DMs and relationships.

Ready to start? Just reply YES and I'll send the onboarding link! 🙌`,
        newStage: "closing",
        action: "sent_how_it_works_close",
      };
    }

    // Still engaging but no clear signal
    return {
      response:
        "Still have questions? Fire away — I'm happy to clarify anything about the service, pricing, or process! 😊",
      action: "follow_up_pitched",
    };
  }

  // ── QUALIFYING STAGE ──
  if (conv.stage === "qualifying") {
    // Process qualifying answer and advance
    const leadData = conv.leadData ?? {};

    if (!leadData.challenge) {
      leadData.challenge = message;
      return {
        response:
          "Got it — that makes sense. And how often are you posting carousels right now? (daily / weekly / rarely / not at all)",
        newStage: "qualifying",
        action: "qualifying_frequency",
        ...(leadData as Partial<LeadConversation>),
      };
    }

    if (!leadData.postingFrequency) {
      leadData.postingFrequency = message.toLowerCase().includes("daily")
        ? "daily"
        : message.toLowerCase().includes("week")
        ? "weekly"
        : message.toLowerCase().includes("rarely") || message.toLowerCase().includes("not")
        ? "rarely"
        : "inconsistent";

      const score = scoreLead(
        leadData.followers ?? 25000,
        leadData.bio ?? "",
        leadData.postingFrequency
      );
      const qualification = qualifyLead(score);

      if (qualification === "cold") {
        return {
          response:
            "Thanks for the info! Based on where you are right now, I'd actually recommend starting with our free resources first — this service is best suited for creators who are already active and looking to scale. Keep me posted as you grow! 🙌",
          newStage: "nurture",
          action: "marked_cold_lead",
        };
      }

      return {
        response:
          "Last question — what's your main goal for Instagram in the next 90 days? (growth / authority / engagement / launching something?)",
        newStage: "qualifying",
        action: "qualifying_goal",
        ...(leadData as Partial<LeadConversation>),
      };
    }

    if (!leadData.goal) {
      leadData.goal = message;

      const score = scoreLead(
        leadData.followers ?? 25000,
        leadData.bio ?? "",
        leadData.postingFrequency ?? "inconsistent"
      );
      const qualification = qualifyLead(score);

      const tier =
        qualification === "hot"
          ? "PRO ($497/month — 300 carousels)"
          : "STARTER ($297/month — 60 carousels)";

      return {
        response: `Perfect — here's what I'd recommend for your situation:

Based on your goals and posting frequency, the **${tier}** plan makes the most sense.

**Here's what happens next:**
→ I send you a quick onboarding form (5 min)
→ We research your niche + competitors
→ First carousels post by Day 5

Ready to get started? Reply YES and I'll send the link! 🔥`,
        newStage: "closing",
        action: "sent_recommendation",
        ...(leadData as Partial<LeadConversation>),
      };
    }

    return {
      response:
        "Sounds good! Let's get you set up. Reply YES and I'll send the onboarding link! 🙌",
      newStage: "closing",
      action: "confirm_close",
    };
  }

  // ── CLOSING ──
  if (conv.stage === "closing") {
    if (lower.includes("yes") || lower.includes("yep") || lower.includes("let's") || lower.includes("book")) {
      return {
        response: `Let's go! 🚀

**Click here to complete onboarding:**
[ONBOARDING_LINK]

Once you fill it out (5 min), we go live by Friday. Your first carousel posts and you start building authority.

Any questions before you start?`,
        newStage: "closed_won",
        action: "closed_won",
      };
    }

    if (lower.includes("no") || lower.includes("not yet") || lower.includes("maybe")) {
      return {
        response:
          "No pressure at all! If this ever makes sense, just reply to this message and I'll help you get set up. Good luck with your page! 🙌",
        newStage: "nurture",
        action: "deferred",
      };
    }
  }

  // ── DEFAULT (unrecognized) ──
  return {
    response:
      "Hey! Just to confirm — are you still interested in the carousel automation? Reply YES to get the details or let me know if you have questions! 😊",
    action: "generic_followup",
  };
}

// Build the system prompt for the AI
export function getSystemPrompt(): string {
  return `You are a friendly, energetic WhatsApp sales agent for Kingtokenz Carousel Automation.

Your personality:
- Casual, upbeat, Gen-Z energy
- Never pushy — you guide, not pressure
- Confident in the product
- Short, punchy messages (2-4 sentences max on WhatsApp)
- Use emojis sparingly but effectively

About Kingtokenz Carousel Automation:
- Service: Done-for-you Instagram carousel content (research, design, posting)
- 3 tiers: STARTER $297/mo (60 carousels), PRO $497/mo (300 carousels), PREMIUM $797/mo
- Target: Female influencers (25K-500K+), coaches, creators, SaaS founders
- Result: 300 carousels posted monthly = positioned as authority without daily work
- Process: Day 1 intake → Day 5 first carousel posts → ongoing daily posting
- Credibility: Case study — saves went from 40 → 180 per carousel in 60 days

Sales Flow:
1. Send opener (casual, curiosity-driven)
2. If interested → pitch the value prop + price
3. Handle objections (price, on-brand, test first, will it work)
4. Close: Book discovery call or send onboarding link

Rules:
- Keep messages SHORT (WhatsApp style)
- Never reveal full pricing unless asked
- Never discount — hold firm on value
- If not interested, be graceful and leave the door open
- Use the qualifying questions when needed: "What's your biggest challenge with content?" / "How often are you posting?" / "What's your main goal?"
- Mark leads as hot/warm/cold based on follower count, posting frequency, and budget fit`;
}