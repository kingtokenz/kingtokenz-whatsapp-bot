# Kingtokenz WhatsApp Sales Bot

AI-powered WhatsApp sales agent for Kingtokenz Carousel Automation.

## What it does

- Receives WhatsApp messages via Twilio webhook
- Uses AI (rule-based engine + Kingtokenz KB) to generate sales responses
- Qualifies leads, pitches the service, handles objections, and closes
- Tracks conversation state across every lead
- Dashboard to monitor all conversations and lead scores

## Setup

### 1. Get Twilio Account + WhatsApp Number

```bash
# Sign up at console.twilio.com
# Buy a US number: ~$1/month (enable WhatsApp capability)
```

### 2. Set Environment Variables

```bash
cp .env.example .env.local
# Fill in:
# TWILIO_ACCOUNT_SID
# TWILIO_AUTH_TOKEN
# TWILIO_WHATSAPP_FROM  (format: whatsapp:+1234567890)
```

### 3. Expose Webhook URL

Twilio needs a public HTTPS URL to hit your webhook. Options:

**Option A: Ngrok (quick local dev)**
```bash
ngrok http 3000
# Copy the https:// URL and paste below
```

**Option B: Deploy to Railway/Render/Vercel (production)**
Deploy the app, then use your production URL.

### 4. Configure Twilio WhatsApp Sandbox

1. Go to Twilio Console → WhatsApp → Senders
2. Add your phone number
3. Set the webhook URL to: `https://YOUR_DOMAIN/api/webhook/whatsapp`
4. Enable WhatsApp sandbox (for testing)

### 5. Run

```bash
npm run dev
```

## Architecture

```
WhatsApp User
     ↓ (sends message)
Twilio WhatsApp API
     ↓ (POST webhook)
/api/webhook/whatsapp  ← Next.js route
     ↓ (looks up conversation state)
AI Response Engine     ← Kingtokenz KB + conversation state
     ↓ (generates reply)
Twilio WhatsApp API
     ↓ (sends reply)
WhatsApp User
```

## Dashboard

Visit `/dashboard` to see:
- All conversations and their stage
- Lead scores (hot / warm / cold)
- Message history per lead
- Stats: total leads, in-closing, won, lost

## Sales Flow

The bot follows this flow automatically:

1. **NEW** → Sends opener (randomized from KB)
2. **OPENER_SENT** → Waits for response, sends follow-up if no reply
3. **PITCHED** → Handles interest, answers pricing, pushes to close
4. **OBJECTION** → Handles: too expensive, not on-brand, want to test, etc.
5. **CLOSING** → Sends booking link or onboarding link
6. **CLOSED_WON** → Triggers onboarding sequence
7. **CLOSED_LOST** → Graceful exit, door left open

## Deploy

```bash
npm run build
npm start
```

Or deploy directly to Vercel, Railway, or Render.

## Customization

- **AI Engine**: Currently rule-based using `lib/ai-response-engine.ts`
  - Upgrade to OpenAI by adding `OPENAI_API_KEY` and calling GPT-4 in the webhook
- **KB**: All product knowledge is in `lib/kingtokenz-kb.ts`
- **Lead Scoring**: Configured in `lib/kingtokenz-kb.ts` → `scoreLead()`
- **State**: Currently in-memory (resets on restart)
  - Add Redis or Supabase for persistent state in production