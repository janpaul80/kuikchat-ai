import React from 'react';

export default function VideoCallSection() {
  return (
    <section className="py-20 bg-emerald-50 dark:bg-[#1a2d27]/25 border-y border-emerald-100/10">
      <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
        <div className="order-last md:order-first flex justify-center">
          <div className="relative w-full max-w-[400px]">
            <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-slate-900 shadow-2xl border-4 border-white dark:border-slate-800 relative">
              <img 
                src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format&fit=crop&q=80" 
                alt="Video Call Showcase" 
                className="w-full h-full object-cover opacity-90"
              />
              <div className="absolute top-4 right-4 bg-emerald-500 text-white text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                HD Video Active
              </div>
            </div>
          </div>
        </div>
        <div className="text-center md:text-left">
          <h2 className="text-3xl md:text-4xl font-bold text-[#075E54] dark:text-white leading-tight">
            High-Quality Voice & Video Calls
          </h2>
          <p className="mt-6 text-lg text-slate-600 dark:text-slate-400">
            Keep in touch with your colleagues, friends, and family around the globe for free*. With crystal-clear audio and zero lag, your conversations will feel just like in-person meetings.
          </p>
        </div>
      </div>
    </section>
  );
}
