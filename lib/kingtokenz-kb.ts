// Kingtokenz Carousel Automation - Sales Knowledge Base
// Used as AI context for WhatsApp bot responses

export const SERVICE_TIERS = {
  starter: {
    name: "STARTER",
    price: 297,
    carousels: 60,
    perDay: 2,
    features: ["Research-backed content", "Professional design", "Basic hashtag optimization"],
    bestFor: "Testing the model, solopreneurs on budget",
  },
  pro: {
    name: "PRO",
    price: 497,
    carousels: 300,
    perDay: 10,
    features: [
      "Deep niche research",
      "Competitive analysis",
      "Professional design",
      "Caption optimization",
      "Manus automation setup",
    ],
    bestFor: "Serious scaling, serious influencers",
    popular: true,
  },
  premium: {
    name: "PREMIUM",
    price: 797,
    carousels: "300+",
    perDay: "10+",
    features: [
      "All of Pro tier",
      "Custom design treatments",
      "Weekly strategy calls",
      "Dedicated account manager",
      "Priority support",
    ],
    bestFor: "White-glove service, agencies, high-ticket clients",
  },
};

export const TARGET_PROFILE = {
  idealClients: [
    "Female influencers (25K–500K+ followers)",
    "Content creators wanting to scale authority",
    "SaaS founders needing consistent authority content",
    "Coaches/experts who struggle with content consistency",
    "Anyone in competitive niches needing to stand out",
  ],
  avoid: [
    "Micro-influencers (<10K followers)",
    "People asking for freebies/discounts",
    "Unclear who their audience is",
    "Inactive Instagram accounts",
  ],
  qualifyingQuestions: [
    "What's your biggest challenge with content on Instagram?",
    "How often are you posting carousels right now?",
    "What's your main goal for your Instagram in the next 90 days?",
  ],
};

export const SALES_PILLARS = [
  "Authority without work — 300 carousels/month = positioned as the authority",
  "Proven results — clients see 2-3x engagement increase in 30 days",
  "Simplicity — 5 days to launch, no daily work from you",
  "Affordability — less than hiring a full-time VA",
];

export const OBJECTION_RESPONSES: Record<string, string> = {
  expensive:
    "I totally get it. Here's how I think about it: what's one carousel worth to you in terms of engagement or brand value? Because we're doing 10 daily. Most clients see it as an investment in their authority — 300 carousels a month for less than a VA would cost.",
  onBrand:
    "100% fair concern. Here's how we solve this: we do a deep-dive intake — your brand voice, visual identity, niche, audience, competitors. We study your current Instagram top posts. Then we design every carousel to feel like it came directly from you. I'll actually create a free sample carousel for you so you can see the quality first.",
  testFirst:
    "Smart move. Here's what I'll do — I create a free sample carousel for your niche (takes 24 hours), you see the design quality, and we chat again. Which helps you decide better?",
  willItWork:
    "Fair question. Here's what I'll do — let me show you our case study. One client went from 40 saves per carousel to 180+ in 60 days. Month-to-month, no contracts. If it's not working after 30 days, you cancel. Simple as that.",
  thinkAboutIt:
    "Totally fair. Here's what I'll do — I'll send you a recap, and let's set a time to chat again — say, Friday. That way you have time to think but we keep momentum.",
  canSeeResultsFirst:
    "Absolutely. I can create a free sample carousel for your niche — you see the design quality, copy, everything. Or I show you our case study results. Which would convince you most?",
};

export const PITCH_OPENERS = [
  "hey! love your content 🔥 just launched something for creators like you — 10 carousels posted to your feed daily (fully automated). interested in a quick chat?",
  "hey! came across your page — really solid content. quick question: are you handling your Instagram carousels yourself or looking to outsource?",
];

export const CLOSING_CREDIBILITY =
  "We're running this for [CASE STUDY]. Here's their growth: saves went from 40 → 180 per carousel in 60 days. Same thing happens for you.";

export const PRICING_DISPLAY = `Plans from $297/month:
- STARTER ($297): 60 carousels/month (2/day)
- PRO ($497): 300 carousels/month (10/day) ← Most popular
- PREMIUM ($797): 300+/month + white-glove service

All plans: month-to-month, no contracts, cancel anytime.`;

export const HOW_IT_WORKS = `Here's how it works:
1. You give us your niche + Instagram handle
2. We research your niche + competitors
3. We design 10 scroll-stopping carousels daily
4. Manus automation posts them for you — daily

By day 5, your feed starts filling with authority content. Your only job: respond to DMs and watch your saves climb.`;

export const QUALIFYING_CRITERIA = {
  minFollowers: 10000,
  idealFollowers: 25000,
  maxFollowers: 500000,
  budgetRange: [297, 797],
  mustHave: ["Active Instagram account", "Posts carousels or wants to", "Female target audience"],
  niceToHave: ["25K+ followers", "Already posting inconsistently", "Coaching/creator/saas niche"],
};

export function scoreLead(followers: number, bio: string, postingFrequency: string): number {
  let score = 0;

  // Follower score
  if (followers >= 25000 && followers <= 500000) score += 40;
  else if (followers >= 10000 && followers < 25000) score += 20;
  else if (followers > 500000) score += 25;
  else score -= 20;

  // Bio relevance
  const keywords = ["coach", "creator", "founder", "influencer", "expert", "consultant", "saas", "wellness", "beauty", "finance", "business"];
  const bioLower = bio.toLowerCase();
  const hasRelevantKeyword = keywords.some((k) => bioLower.includes(k));
  if (hasRelevantKeyword) score += 30;

  // Posting frequency
  if (postingFrequency === "daily") score += 10;
  else if (postingFrequency === "weekly") score += 20;
  else if (postingFrequency === "inconsistent") score += 25;
  else if (postingFrequency === "rarely") score += 5;

  return Math.max(0, Math.min(100, score));
}

export function qualifyLead(score: number): "hot" | "warm" | "cold" {
  if (score >= 60) return "hot";
  if (score >= 35) return "warm";
  return "cold";
}