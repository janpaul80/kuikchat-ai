
import React from 'react';
import { Lock, Shield } from 'lucide-react';

export default function Privacy() {
  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-6">Privacy Policy</h1>
        <p className="text-lg text-slate-600 mb-8">Last updated: October 26, 2023</p>

        <div className="space-y-12">
          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">Our Commitment to Privacy</h2>
            <p className="text-slate-600 leading-relaxed text-lg">
              Respect for your privacy is coded into our DNA. Since we started KuikChat, we've aspired to build our Services with a set of strong privacy principles in mind.
              KuikChat provides end-to-end encryption for your messages and calls, meaning no one else can read or listen to them, not even us.
            </p>
          </section>

          <section className="grid md:grid-cols-2 gap-6">
            <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">End-to-End Encryption</h3>
              <p className="text-slate-600">Your messages and calls are secured so only you and the person you're communicating with can read or listen to them.</p>
            </div>
            <div className="p-6 bg-green-50 rounded-2xl border border-green-100">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Safety & Security</h3>
              <p className="text-slate-600">We work tirelessly to keep your account safe and prevent spam, abuse, and other bad experiences on our platform.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">Information We Collect</h2>
            <div className="space-y-4 text-slate-600">
              <p>KuikChat must receive or collect some information to operate, provide, improve, understand, customize, support, and market our Services, including when you install, access, or use our Services.</p>
              <ul className="list-disc pl-5 space-y-3 mt-4">
                <li><strong>Account Information:</strong> You provide your mobile phone number and basic information (including a profile name of your choice) to create a KuikChat account.</li>
                <li><strong>Your Messages:</strong> We do not retain your messages in the ordinary course of providing our Services to you. Once your messages (including your chats, photos, videos, voice messages, files, and share location information) are delivered, they are deleted from our servers.</li>
                <li><strong>Customer Support:</strong> You may provide us with information related to your use of our Services, including copies of your messages, how to contact you so we can provide you customer support.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">How We Use Information</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              We use information we have (subject to choices you make and applicable law) to operate, provide, improve, understand, customize, support, and market our Services.
            </p>
            <ul className="list-disc pl-5 space-y-3 text-slate-600">
                <li><strong>Our Services:</strong> We use information to operate and provide our Services, including providing customer support; completing purchases or transactions; and improving, fixing, and customizing our Services.</li>
                <li><strong>Safety and Security:</strong> We verify accounts and activity, and promote safety and security on and off our Services, such as by investigating suspicious activity or violations of our Terms.</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
