import { motion } from "framer-motion";
import { Github, Twitter, Linkedin, Instagram, Globe } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/kuikchat-logo.png";

const footerLinks = {
  product: [
    { name: "Features", href: "/features" },
    { name: "Security", href: "/security" },
    { name: "Download", href: "/download" },
    { name: "Pricing", href: "/pricing" },
  ],
  company: [
    { name: "About", href: "/about" },
    { name: "Blog", href: "/blog" },
    { name: "Careers", href: "/careers" },
    { name: "Press Kit", href: "/press" },
  ],
  support: [
    { name: "Help Center", href: "/help" },
    { name: "Contact Us", href: "/contact" },
    { name: "Status", href: "/status" },
    { name: "API Docs", href: "/api-docs" },
  ],
  legal: [
    { name: "Privacy Policy", href: "/privacy-policy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Cookie Policy", href: "/cookies" },
    { name: "GDPR", href: "/gdpr" },
  ],
};

const socialLinks = [
  { icon: Twitter, href: "/#integrations", label: "Explore X integration" },
  { icon: Github, href: "/#integrations", label: "Explore GitHub integration" },
  { icon: Linkedin, href: "/#integrations", label: "Explore LinkedIn integration" },
  { icon: Instagram, href: "/#integrations", label: "Explore Instagram integration" },
];

const languages = [
  { code: "en", name: "English" },
  { code: "es", name: "Español" },
  { code: "de", name: "Deutsch" },
  { code: "fr", name: "Français" },
  { code: "zh", name: "中文" },
  { code: "hi", name: "हिन्दी" },
];

const scrollToTop = () => window.scrollTo({ top: 0, left: 0, behavior: "auto" });

export const Footer = () => {
  return (
    <footer id="site-footer" className="border-t border-white/10 bg-black py-16 text-white">
      <div className="container mx-auto px-4">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <motion.a
              href="/"
              onClick={scrollToTop}
              className="flex items-center gap-2 mb-4"
              whileHover={{ scale: 1.02 }}
            >
              <img src={logo} alt="KuikChat" className="h-12 w-12" />
              <span className="text-xl font-bold">KuikChat</span>
            </motion.a>
            <p className="mb-6 max-w-xs text-sm text-white/60">
              Your Communication Command Center — Where Human Connection Meets AI Power.
            </p>

            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  onClick={scrollToTop}
                  aria-label={social.label}
                  whileHover={{ scale: 1.1, y: -2 }}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-colors duration-300 hover:bg-primary"
                >
                  <social.icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2">
              {footerLinks.product.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.href}
                    onClick={scrollToTop}
                    className="text-sm text-white/60 transition-colors hover:text-white"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.href}
                    onClick={scrollToTop}
                    className="text-sm text-white/60 transition-colors hover:text-white"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              {footerLinks.support.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.href}
                    onClick={scrollToTop}
                    className="text-sm text-white/60 transition-colors hover:text-white"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.href}
                    onClick={scrollToTop}
                    className="text-sm text-white/60 transition-colors hover:text-white"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 md:flex-row">
          <p className="text-sm text-white/50">
            © {new Date().getFullYear()} KuikChat by HEFTCoder Labs. All rights reserved.
          </p>

          {/* Language Selector */}
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-white/50" />
            <select className="cursor-pointer border-none bg-transparent text-sm text-white/60 focus:outline-none">
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code} className="bg-black">
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </footer>
  );
};
