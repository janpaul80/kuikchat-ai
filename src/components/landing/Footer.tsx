"use client";
import { motion } from "framer-motion";
import { Github } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

/**
 * KuikChat — Footer (FIXED)
 *  - KuikChat logo image on the left (public/logo.png)
 *  - Every link enabled and pointing to real routes
 *  - GitHub-only social + GitHub CTA, brand-color hover
 *
 * TEAM: confirm the logo filename in /public and update the src below if different.
 */
const GITHUB_URL = "https://github.com/janpaul80/kuikchat-ai";

const footerLinks = {
  product: [
    { name: "Features", href: "/features" },
    { name: "Security", href: "/security" },
    { name: "Download", href: "/download" },
    { name: "Pricing", href: "/pricing" },
  ],
  company: [
    { name: "About", href: "/about" },
    { name: "Contact Us", href: "/contact" },
    { name: "Security", href: "/security" },
  ],
  support: [
    { name: "Help Center", href: "/support" },
    { name: "Contact Us", href: "/contact" },
    { name: "Download", href: "/download" },
  ],
  legal: [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Cookie Policy", href: "/cookies" },
    { name: "GDPR", href: "/gdpr" },
  ],
} as const;

export default function Footer() {
  return (
    <footer className="bg-black border-t border-white/10">
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-10">
          <div className="col-span-2">
            {/* LOGO on the left */}
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <Image src="/logo.png" alt="KuikChat" width={36} height={36} className="rounded-lg" />
              <span className="text-xl font-bold text-white">KuikChat</span>
            </Link>
            <p className="text-sm text-white/50 max-w-xs leading-relaxed">
              Your Communication Command Center — where human connection meets AI power.
            </p>
            <div className="flex items-center gap-3 mt-6">
              <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" aria-label="GitHub"
                 className="grid place-items-center w-9 h-9 rounded-lg border border-white/10 bg-white/5 text-white/60 transition-all duration-300 hover:text-white hover:border-[hsl(217,91%,60%)] hover:bg-[hsl(217,91%,60%,0.12)] hover:-translate-y-0.5">
                <Github className="w-4 h-4" />
              </a>
            </div>
          </div>
          {(["product", "company", "support", "legal"] as const).map((col) => (
            <div key={col}>
              <h4 className="text-sm font-semibold text-white capitalize mb-4">{col}</h4>
              <ul className="space-y-2.5">
                {footerLinks[col].map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-sm text-white/50 transition-colors duration-200 hover:text-[hsl(217,91%,60%)]">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-14 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/40">© {new Date().getFullYear()} KuikChat. All rights reserved.</p>
          <motion.a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" whileHover={{ scale: 1.03 }}
            className="inline-flex items-center gap-2 text-xs text-white/50 hover:text-white transition-colors">
            <Github className="w-4 h-4" /> Star us on GitHub
          </motion.a>
        </div>
      </div>
    </footer>
  );
}
