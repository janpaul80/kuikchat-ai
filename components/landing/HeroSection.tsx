import React from 'react';

interface HeroSectionProps {
  onAuthClick: (mode: 'login' | 'signup') => void;
}

export default function HeroSection({ onAuthClick }: HeroSectionProps) {
  return (
    <section className="pt-32 pb-20 bg-gray-50 dark:bg-[#1e1e1e]">
      <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
        <div className="text-center md:text-left">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#075E54] dark:text-white leading-tight">
            Simple. Secure.
            <br />
            <span className="text-gray-800 dark:text-gray-300">Reliable messaging.</span>
          </h1>
          <p className="mt-6 text-lg text-gray-600 dark:text-gray-400 max-w-lg mx-auto md:mx-0">
            Connect with friends and family around the world. With KuikChat, you'll get fast, simple, secure messaging and calling for free*, powered by Gemini AI capabilities.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row sm:justify-center md:justify-start space-y-4 sm:space-y-0 sm:space-x-4">
            <button
              onClick={() => onAuthClick('signup')}
              className="flex items-center justify-center bg-[#25D366] text-white px-8 py-3.5 rounded-full font-bold text-lg hover:bg-[#075E54] transition-all transform hover:scale-105 shadow-lg shadow-emerald-500/20"
            >
              Get Started Free
            </button>
          </div>
          <p className="mt-4 text-xs text-gray-500 dark:text-gray-500">*Data charges may apply. Contact your provider for details.</p>
        </div>
        <div className="hidden md:block">
          <svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-[450px] mx-auto">
            <defs>
              <linearGradient id="heroGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#25D366" />
                <stop offset="100%" stopColor="#128C7E" />
              </linearGradient>
            </defs>
            <circle cx="250" cy="250" r="230" fill="none" stroke="url(#heroGradient)" strokeWidth="4" opacity="0.2" />
            <path d="M250 20 C128.5 20 20 128.5 20 250 C20 371.5 128.5 480 250 480 C371.5 480 480 371.5 480 250 C480 128.5 371.5 20 250 20 Z" fill="none" stroke="#25D366" strokeWidth="1" strokeDasharray="5 5" opacity="0.3" />
            <g transform="translate(180 160) scale(0.6)">
              <rect x="50" y="50" width="120" height="240" rx="20" ry="20" fill="#fff" stroke="#ccc" stroke-width="4" />
              <rect x="60" y="60" width="100" height="200" fill="url(#heroGradient)" />
              <circle cx="110" cy="75" r="5" fill="#fff" />
              <path d="M80,100 L140,100" stroke="#fff" stroke-width="4" strokeLinecap="round" />
            </g>
          </svg>
        </div>
      </div>
    </section>
  );
}
