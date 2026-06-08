import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";
import {
  getConversation,
  addMessage,
  advanceStage,
  initConversation,
} from "@/lib/conversation-state";
import { generateResponse } from "@/lib/ai-response-engine";
import { scoreLead, qualifyLead } from "@/lib/kingtokenz-kb";

// Environment variables — set these in .env.local
// TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM
const {
  TWILIO_ACCOUNT_SID = "",
  TWILIO_AUTH_TOKEN = "",
  TWILIO_WHATSAPP_FROM = "",
} = process.env;

const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const from = formData.get("From") as string;       // e.g. whatsapp:+1234567890
    const body = (formData.get("Body") as string)?.trim() ?? "";
    const to = formData.get("To") as string;

    if (!from || !body) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Extract clean phone number
    const phoneNumber = from.replace("whatsapp:", "");

    console.log(`📩 Incoming from ${phoneNumber}: ${body}`);

    // ── Save inbound message ──
    let conv = getConversation(phoneNumber);
    if (!conv) {
      conv = initConversation(phoneNumber);
    }
    addMessage(phoneNumber, "lead", body);

    // ── Generate AI response ──
    const { response, newStage, action } = generateResponse(body, conv);

    // ── Save outbound message ──
    addMessage(phoneNumber, "agent", response);

    // ── Advance stage if needed ──
    if (newStage) {
      advanceStage(phoneNumber, newStage);
    }

    console.log(`📤 Outbound to ${phoneNumber}: ${response}`);

    // ── Send via Twilio WhatsApp ──
    if (TWILIO_WHATSAPP_FROM) {
      await client.messages.create({
        body: response,
        from: TWILIO_WHATSAPP_FROM,
        to: from,
      });
    }

    // ── TwiML response (good practice even when using SDK) ──
    const twiml = new twilio.twiml.MessagingResponse();
    twiml.message(response);

    return new NextResponse(twiml.toString(), {
      headers: { "Content-Type": "text/xml" },
    });
  } catch (error: unknown) {
    console.error("❌ Webhook error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// Twilio calls this as a webhook — needs to be GET-compatible too
export async function GET(req: NextRequest) {
  return new NextResponse("WhatsApp Bot is running ✅", { status: 200 });
}