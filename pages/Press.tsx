
import React from 'react';
import { CloudDownloadIcon } from '../components/icons';

export default function Press() {
  return (
    <div className="pt-24 pb-16 min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Press & Brand Resources</h1>
        <p className="text-xl text-slate-600 mb-12">
            Get the latest news, brand assets, and guidelines for using the KuikChat brand.
        </p>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
            <div className="p-8 border border-slate-200 rounded-2xl bg-slate-50">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Brand Assets</h2>
                <p className="text-slate-600 mb-6">
                    Download official KuikChat logos, icons, and screenshots for use in your publications.
                </p>
                <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50 transition-colors">
                    <CloudDownloadIcon className="w-5 h-5"/>
                    Download Kit (ZIP)
                </button>
            </div>
            <div className="p-8 border border-slate-200 rounded-2xl bg-slate-50">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Media Inquiries</h2>
                <p className="text-slate-600 mb-6">
                    For press inquiries, interviews, or official comments, please contact our media relations team.
                </p>
                <a href="mailto:press@kuikchat.com" className="inline-block px-5 py-2.5 bg-kuik-green text-white rounded-lg font-semibold hover:bg-kuik-light-green transition-colors">
                    press@kuikchat.com
                </a>
            </div>
        </div>

        <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Latest News</h2>
            <div className="space-y-6">
                {[
                    { date: "October 15, 2023", title: "KuikChat Reaches 10 Million Active Users" },
                    { date: "September 1, 2023", title: "Introducing Channels: A New Way to Connect" },
                    { date: "August 20, 2023", title: "Enhanced Privacy Features Rolled Out Worldwide" }
                ].map((news, i) => (
                    <div key={i} className="border-b border-slate-100 pb-6 last:border-0">
                        <p className="text-sm text-slate-500 mb-1">{news.date}</p>
                        <h3 className="text-xl font-semibold text-slate-900 hover:text-kuik-accent cursor-pointer">{news.title}</h3>
                    </div>
                ))}
            </div>
        </section>
      </div>
    </div>
  );
}
