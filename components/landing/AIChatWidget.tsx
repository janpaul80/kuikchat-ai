import React, { useState } from 'react';

export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: 'Hello! I am the KuikChat AI. Ask me anything about our secure messaging features!', isBot: true }
  ]);
  const [input, setInput] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const userMsg = { text: input, isBot: false };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    // Simulated reply
    setTimeout(() => {
      const reply = { 
        text: 'KuikChat is powered by Gemini AI and secures all messages with full end-to-end encryption. Open the app to experience the full conversational interface!', 
        isBot: true 
      };
      setMessages(prev => [...prev, reply]);
    }, 1000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-xl hover:bg-[#075E54] transition-all transform hover:scale-110"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </button>
      ) : (
        <div className="bg-white dark:bg-[#1e1e1e] w-80 h-96 rounded-2xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 flex flex-col">
          <div className="bg-[#075E54] text-white p-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#25D366] animate-pulse" />
              <span className="font-bold text-sm">Gemini AI Assistant</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white hover:text-emerald-200 font-bold text-lg">&times;</button>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto space-y-3 custom-scrollbar bg-slate-50 dark:bg-[#121212]">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed ${
                  msg.isBot 
                    ? 'bg-white dark:bg-[#1e1e1e] text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-800' 
                    : 'bg-[#25D366] text-white'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSend} className="p-3 border-t border-slate-100 dark:border-slate-800 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-grow bg-slate-50 dark:bg-[#121212] border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#25D366]"
            />
            <button type="submit" className="bg-[#25D366] text-white px-3 py-2 rounded-xl text-xs hover:bg-[#075E54] transition-colors">Send</button>
          </form>
        </div>
      )}
    </div>
  );
}
