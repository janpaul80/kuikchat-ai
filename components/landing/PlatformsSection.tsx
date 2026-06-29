import React from 'react';

export default function PlatformsSection() {
  return (
    <section className="py-16 bg-white dark:bg-[#121212]">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-6">Available on all your devices</h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-lg mx-auto mb-10">
          Sync your chats to your computer, tablet, or mobile phone. Keep the conversation going wherever you go.
        </p>
        <div className="flex flex-wrap justify-center gap-6">
          <div className="bg-slate-50 dark:bg-[#1e1e1e] p-6 rounded-2xl border border-slate-100/10 min-w-[180px]">
            <span className="text-3xl">💻</span>
            <h4 className="font-bold mt-2 text-slate-800 dark:text-white">Desktop</h4>
            <p className="text-xs text-muted-foreground mt-1">Windows & macOS</p>
          </div>
          <div className="bg-slate-50 dark:bg-[#1e1e1e] p-6 rounded-2xl border border-slate-100/10 min-w-[180px]">
            <span className="text-3xl">📱</span>
            <h4 className="font-bold mt-2 text-slate-800 dark:text-white">Mobile</h4>
            <p className="text-xs text-muted-foreground mt-1">Android & iOS</p>
          </div>
        </div>
      </div>
    </section>
  );
}
