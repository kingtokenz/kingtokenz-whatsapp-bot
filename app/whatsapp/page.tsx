import { redirect } from "next/navigation";

export default function WhatsAppLanding() {
  // This page is the entry point for WhatsApp — Twilio calls this webhook
  // The actual WhatsApp interaction happens via /api/webhook/whatsapp
  redirect("/dashboard");
}