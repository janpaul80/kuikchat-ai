
import React from 'react';
import PlatformsSection from '../components/landing/PlatformsSection';

export default function AppsPage() {
  return (
    <div className="pt-20 min-h-screen bg-white">
      <div className="py-16 px-4 bg-gradient-to-b from-slate-50 to-white text-center border-b border-slate-100">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Download KuikChat</h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Stay connected on any device. Download the app for mobile, desktop, or use the web version.
        </p>
      </div>
      
      <div className="-mt-16">
        <PlatformsSection />
      </div>
    </div>
  );
}
