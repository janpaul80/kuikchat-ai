import BubbleHero from "@/components/hero/BubbleHero";

export const metadata = {
  title: "GDPR — KuikChat",
  description: "Your data protection rights under the GDPR.",
};

export default function GdprPage() {
  return (
    <>
      <BubbleHero
        eyebrow="GDPR"
        title="Your data protection rights"
        subtitle="KuikChat is built privacy-first. Under the GDPR you have full control over your personal data — here is how we honor that."
      />
      <article className="mx-auto max-w-3xl px-6 py-16 text-white/80 leading-relaxed space-y-6">
        <h2 className="text-2xl font-bold text-white">Your rights</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong className="text-white">Access</strong> — request a copy of the personal data we hold about you.</li>
          <li><strong className="text-white">Rectification</strong> — correct inaccurate or incomplete data.</li>
          <li><strong className="text-white">Erasure</strong> — request deletion of your data ("right to be forgotten").</li>
          <li><strong className="text-white">Portability</strong> — receive your data in a portable format.</li>
          <li><strong className="text-white">Objection</strong> — object to certain processing of your data.</li>
        </ul>

        <h2 className="text-2xl font-bold text-white">How we protect your data</h2>
        <p>We collect the minimum data needed, store it securely, and never sell it to third parties.</p>

        <h2 className="text-2xl font-bold text-white">Exercising your rights</h2>
        <p>To make a request, contact us via our <a href="/contact" className="text-emerald-400 hover:underline">contact page</a>. We respond within 30 days as required by the GDPR.</p>

        <p className="text-sm text-white/40">Last updated: {new Date().getFullYear()}. This is a starter document — review with legal counsel before launch.</p>
      </article>
    </>
  );
}
