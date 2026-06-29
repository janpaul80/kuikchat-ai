import React from 'react';

interface CTASectionProps {
  onAuthClick: (mode: 'login' | 'signup') => void;
}

export default function CTASection({ onAuthClick }: CTASectionProps) {
  return (
    <section className="py-20 bg-gradient-to-br from-[#075E54] to-[#128C7E] text-white text-center">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl md:text-5xl font-extrabold mb-6 leading-tight">
          Experience Secure & AI-Powered Chat Today
        </h2>
        <p className="text-emerald-100 max-w-xl mx-auto text-lg mb-10">
          Sign up now to try our Gemini-powered AI features, end-to-end encryption, and large file sharing completely free.
        </p>
        <button
          onClick={() => onAuthClick('signup')}
          className="bg-white text-[#075E54] font-bold text-lg px-8 py-3.5 rounded-full hover:bg-emerald-50 transition-all transform hover:scale-105 shadow-xl shadow-black/10"
        >
          Open KuikChat Web
        </button>
      </div>
    </section>
  );
}
