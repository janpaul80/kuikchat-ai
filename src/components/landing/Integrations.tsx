import {
  Cloud,
  Facebook,
  Figma,
  Github,
  Instagram,
  Linkedin,
  MessageCircle,
  Music2,
  Send,
  ShoppingBag,
  Slack,
  Twitch,
  Twitter,
  Video,
  Youtube,
} from "lucide-react";
import {
  FloatingIconsHero,
  type FloatingIconsHeroProps,
} from "@/components/ui/floating-icons-hero-section";

const integrationIcons: FloatingIconsHeroProps["icons"] = [
  { id: 1, icon: Instagram, label: "Instagram", className: "top-[9%] left-[7%]", iconClassName: "text-pink-400" },
  { id: 2, icon: Facebook, label: "Facebook", className: "top-[16%] right-[8%]", iconClassName: "text-blue-400" },
  { id: 3, icon: Linkedin, label: "LinkedIn", className: "bottom-[11%] left-[9%]", iconClassName: "text-sky-400" },
  { id: 4, icon: Youtube, label: "YouTube", className: "bottom-[9%] right-[8%]", iconClassName: "text-red-400" },
  { id: 5, icon: Slack, label: "Slack", className: "top-[7%] left-[31%] hidden sm:block", iconClassName: "text-fuchsia-300" },
  { id: 6, icon: Twitter, label: "X", className: "top-[7%] right-[31%] hidden sm:block" },
  { id: 7, icon: Github, label: "GitHub", className: "bottom-[7%] left-[28%] hidden sm:block" },
  { id: 8, icon: Twitch, label: "Twitch", className: "bottom-[6%] right-[29%] hidden sm:block", iconClassName: "text-purple-400" },
  { id: 9, icon: MessageCircle, label: "Business messaging", className: "top-[42%] left-[3%] hidden md:block", iconClassName: "text-emerald-400" },
  { id: 10, icon: Send, label: "Broadcast channels", className: "top-[43%] right-[3%] hidden md:block", iconClassName: "text-blue-300" },
  { id: 11, icon: ShoppingBag, label: "Commerce", className: "top-[25%] left-[16%] hidden lg:block", iconClassName: "text-amber-300" },
  { id: 12, icon: Cloud, label: "Cloud tools", className: "top-[25%] right-[17%] hidden lg:block", iconClassName: "text-cyan-300" },
  { id: 13, icon: Figma, label: "Figma", className: "bottom-[24%] left-[16%] hidden lg:block", iconClassName: "text-rose-300" },
  { id: 14, icon: Music2, label: "Audio platforms", className: "bottom-[24%] right-[17%] hidden lg:block", iconClassName: "text-green-300" },
  { id: 15, icon: Video, label: "Video platforms", className: "top-[50%] left-[12%] hidden xl:block", iconClassName: "text-violet-300" },
];

export const Integrations = () => (
  <FloatingIconsHero
    id="integrations"
    className="scroll-mt-20 border-y border-white/10"
    eyebrow="KuikChat Integrations"
    title="Every channel. One conversation hub."
    subtitle="Bring social messages, communities, content, business tools, and customer conversations into one intelligent workspace—without losing the human connection."
    ctaText="Start connecting"
    ctaHref="/auth"
    icons={integrationIcons}
  />
);
