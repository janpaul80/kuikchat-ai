/**
 * Per-page copy for the Bubble hero.
 * SAME animation on every page — only the words change to describe THAT page.
 * Add a new entry here for any new route, then: <BubbleHero {...heroCopy.NAME} />
 */

export type HeroCopy = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
};

export const heroCopy: Record<string, HeroCopy> = {
  about: {
    eyebrow: "About KuikChat",
    title: "Where human connection meets AI power",
    subtitle:
      "KuikChat is a privacy-first, AI-native messaging platform that brings real-time chat, intelligent assistance, secure files, and commerce tooling together in one place — for people and teams.",
  },
  pricing: {
    eyebrow: "Pricing",
    title: "Pricing that scales with you",
    subtitle:
      "Start free, forever — no credit card required. Upgrade only when you need more power. Simple, transparent plans for individuals and teams.",
  },
  security: {
    eyebrow: "Security & Privacy",
    title: "Privacy-first, secure by design",
    subtitle:
      "Your conversations, files, and data are protected from day one — because privacy is a right, not a feature.",
  },
  features: {
    eyebrow: "Features",
    title: "Everything you need, in one place",
    subtitle:
      "Real-time chat, Hermes AI, secure file sharing, and commerce tooling — a single platform that just works.",
  },
  download: {
    eyebrow: "Download",
    title: "KuikChat on every device",
    subtitle: "Native apps for desktop and mobile. Fast, secure, and always in sync.",
  },
  privacy: {
    eyebrow: "Privacy Policy",
    title: "Your data, your control",
    subtitle:
      "We collect the minimum, protect the maximum, and never sell your data. Here's exactly how we handle your information.",
  },
  terms: {
    eyebrow: "Terms of Service",
    title: "Clear terms, no surprises",
    subtitle: "The agreement between you and KuikChat — written to be read, not buried in legalese.",
  },
  contact: {
    eyebrow: "Get in Touch",
    title: "We'd love to hear from you",
    subtitle:
      "Questions, feedback, or partnership ideas — reach out and the KuikChat team will get back to you.",
  },
};
