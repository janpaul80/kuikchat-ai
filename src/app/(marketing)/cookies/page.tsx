import BubbleHero from "@/components/hero/BubbleHero";

export const metadata = {
  title: "Cookie Policy - KuikChat",
  description: "How KuikChat uses cookies and similar technologies.",
};

export default function CookiesPage() {
  return (
    <>
      <BubbleHero
        eyebrow="Cookie Policy"
        title="How we use cookies"
        subtitle="We use a minimal set of cookies to keep KuikChat secure, remember your preferences, and understand how the product is used - never to sell your data."
      />
      <article className="mx-auto max-w-3xl px-6 py-16 text-white/80 leading-relaxed space-y-6">
        <h2 className="text-2xl font-bold text-white">What are cookies?</h2>
        <p>Cookies are small text files stored on your device that help websites function and remember information about your visit.</p>

        <h2 className="text-2xl font-bold text-white">Cookies we use</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong className="text-white">Essential</strong> - required for login, security, and core functionality.</li>
          <li><strong className="text-white">Preferences</strong> - remember your settings (e.g. theme).</li>
          <li><strong className="text-white">Analytics</strong> - privacy-respecting, aggregated usage data to improve KuikChat.</li>
        </ul>

        <h2 className="text-2xl font-bold text-white">Managing cookies</h2>
        <p>You can control or delete cookies through your browser settings at any time. Blocking essential cookies may affect functionality.</p>

        <h2 className="text-2xl font-bold text-white">Contact</h2>
        <p>Questions about this policy? Reach out via our <a href="/contact" className="text-emerald-400 hover:underline">contact page</a>.</p>

        <p className="text-sm text-white/40">Last updated: {new Date().getFullYear()}. This is a starter policy - review with legal counsel before launch.</p>
      </article>
    </>
  );
}
