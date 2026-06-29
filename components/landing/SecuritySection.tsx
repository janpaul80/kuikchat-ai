import React from 'react';

export default function SecuritySection() {
  return (
    <section id="security" className="py-20 bg-gray-50 dark:bg-[#1e1e1e]">
      <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
        <div className="text-center md:text-left">
          <h2 className="text-3xl md:text-4xl font-bold text-[#075E54] dark:text-white">Security by Default</h2>
          <p className="mt-6 text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
            Some of your most personal moments are shared on KuikChat, which is why we built end-to-end encryption into the latest versions of our app. When end-to-end encrypted, your messages and calls are secured so only you and the person you're communicating with can read or listen to them, and nobody in between, not even KuikChat.
          </p>
        </div>
        <div className="flex justify-center">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-64 h-64 max-w-[250px]">
            <path 
              fill="#25D366" 
              opacity="0.1" 
              d="M47.1,-70.4C61.8,-62.1,75.1,-49,81.1,-33.1C87.1,-17.1,85.8,1.7,78.8,16.6C71.8,31.5,59.1,42.5,46.1,52.3C33.1,62.1,19.8,70.7,5.5,73.1C-8.8,75.5,-24.1,71.7,-38.3,64.7C-52.5,57.7,-65.7,47.5,-72.2,34.4C-78.7,21.3,-78.5,5.3,-74.6,-9.8C-70.8,-24.9,-63.3,-39.2,-52.3,-48.5C-41.2,-57.8,-26.6,-62.1,-12,-67.2C2.6,-72.3,17.2,-78.7,31.1,-80.4C44.9,-82.1,58,-78.7,47.1,-70.4Z" 
              transform="translate(100 100)" 
            />
            <g transform="translate(50 50) scale(0.8)">
              <rect x="20" y="20" width="80" height="100" rx="10" fill="#25D366" />
              <circle cx="60" cy="50" r="15" fill="#fff" />
              <path d="M60,65 L60,85" stroke="#fff" strokeWidth="6" strokeLinecap="round" />
            </g>
          </svg>
        </div>
      </div>
    </section>
  );
}
