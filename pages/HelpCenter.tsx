
import React from 'react';
import { Search, MessageCircle, Phone, Shield, Settings, User, HelpCircle } from 'lucide-react';

export default function HelpCenter() {
  return (
    <div className="pt-20 min-h-screen bg-white">
      {/* Hero Search */}
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 py-16 px-4 border-b border-slate-200">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">How can we help you?</h1>
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search help articles..." 
              className="w-full pl-12 pr-4 py-3 rounded-full border border-slate-300 focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm bg-white text-slate-900"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-8">Browse Topics</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: MessageCircle, title: "Chats", desc: "Sending, receiving, and managing messages" },
            { icon: Phone, title: "Voice & Video Calls", desc: "Making calls and troubleshooting issues" },
            { icon: Shield, title: "Privacy & Security", desc: "End-to-end encryption and safety features" },
            { icon: Settings, title: "Account Settings", desc: "Managing your profile and preferences" },
            { icon: User, title: "Contacts", desc: "Adding and managing your contacts" },
            { icon: HelpCircle, title: "Troubleshooting", desc: "Fixing common connection and app issues" }
          ].map((topic, i) => (
            <div key={i} className="p-6 rounded-xl border border-slate-100 hover:border-green-200 hover:shadow-md transition-all cursor-pointer group bg-white">
              <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-100 transition-colors">
                <topic.icon className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">{topic.title}</h3>
              <p className="text-slate-500 text-sm">{topic.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-16">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Popular Articles</h2>
          <ul className="grid md:grid-cols-2 gap-4">
            {["How to restore your chat history", "How to manage notifications", "About two-step verification", "Stolen accounts", "Changing your phone number", "About disappearing messages"].map((article, i) => (
              <li key={i}>
                <a href="#" className="block p-4 rounded-lg border border-slate-100 hover:border-green-200 hover:bg-green-50/30 transition-colors text-slate-700 hover:text-green-700 font-medium">
                  {article}
                </a>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="mt-16 bg-slate-900 rounded-2xl p-8 md:p-12 text-center text-white">
            <h2 className="text-2xl font-bold mb-4">Still need help?</h2>
            <p className="text-slate-300 mb-8 max-w-2xl mx-auto">If you couldn't find the answer to your question, our support team is here to help you.</p>
            <button className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-full font-semibold transition-colors">
                Contact Support
            </button>
        </div>
      </div>
    </div>
  );
}
