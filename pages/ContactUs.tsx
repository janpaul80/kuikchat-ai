
import React, { useState } from 'react';
import { CheckIcon } from '../components/icons';

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    category: 'general'
  });
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isCaptchaVerified) {
      // Simulate submission
      setTimeout(() => {
        setIsSubmitted(true);
      }, 1000);
    } else {
      alert("Please verify you are not a robot.");
    }
  };

  if (isSubmitted) {
    return (
        <div className="pt-24 pb-16 min-h-screen bg-white flex items-center justify-center">
            <div className="text-center p-8 max-w-md">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckIcon className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Message Sent!</h2>
                <p className="text-slate-600">Thanks for contacting us. We'll get back to you as soon as possible.</p>
                <button 
                    onClick={() => setIsSubmitted(false)}
                    className="mt-8 px-6 py-2 text-kuik-accent font-semibold hover:underline"
                >
                    Send another message
                </button>
            </div>
        </div>
    );
  }

  return (
    <div className="pt-24 pb-16 min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Contact Us</h1>
        <p className="text-lg text-slate-600 mb-8">
            Have questions or need support? Fill out the form below and our team will help you out.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                    <input 
                        type="text" 
                        id="name"
                        required
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-kuik-light-green focus:border-transparent outline-none"
                    />
                </div>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                    <input 
                        type="email" 
                        id="email"
                        required
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-kuik-light-green focus:border-transparent outline-none"
                    />
                </div>
            </div>

            <div>
                <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-1">Topic</label>
                <select 
                    id="category"
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-kuik-light-green focus:border-transparent outline-none bg-white"
                >
                    <option value="general">General Inquiry</option>
                    <option value="support">Technical Support</option>
                    <option value="privacy">Privacy Concern</option>
                    <option value="business">Business Partnership</option>
                </select>
            </div>

            <div>
                <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-1">Message</label>
                <textarea 
                    id="message"
                    rows={5}
                    required
                    value={formData.message}
                    onChange={e => setFormData({...formData, message: e.target.value})}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-kuik-light-green focus:border-transparent outline-none"
                ></textarea>
            </div>

            {/* Mock Captcha */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg inline-flex items-center gap-4">
                <input 
                    type="checkbox" 
                    id="captcha"
                    checked={isCaptchaVerified}
                    onChange={e => setIsCaptchaVerified(e.target.checked)}
                    className="w-6 h-6 text-kuik-accent border-slate-300 rounded focus:ring-kuik-accent cursor-pointer"
                />
                <label htmlFor="captcha" className="text-sm text-slate-700 cursor-pointer select-none">I'm not a robot</label>
                <div className="ml-4 flex flex-col items-center justify-center">
                    <img src="https://www.gstatic.com/recaptcha/api2/logo_48.png" alt="captcha" className="w-8 h-8 opacity-50"/>
                    <span className="text-[10px] text-slate-400">reCAPTCHA</span>
                </div>
            </div>

            <button 
                type="submit"
                className="w-full md:w-auto px-8 py-3 bg-kuik-accent text-white font-bold rounded-full hover:bg-kuik-green transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!isCaptchaVerified}
            >
                Send Message
            </button>
        </form>
      </div>
    </div>
  );
}
