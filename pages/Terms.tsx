
import React from 'react';

export default function Terms() {
  return (
    <div className="pt-24 pb-16 min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Terms of Service</h1>
        <p className="text-slate-500 mb-8">Last modified: October 2023</p>

        <div className="prose prose-slate max-w-none">
          <p className="mb-4">
            Please read these Terms of Service ("Terms") carefully before using KuikChat. By accessing or using our Services, you agree to be bound by these Terms.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">1. Registration</h2>
          <p className="mb-4 text-slate-600">
            You must register for our Services using accurate data, provide your current mobile phone number, and, if you change it, update this mobile phone number using our in-app change number feature. You agree to receive text messages and phone calls (from us or our third-party providers) with codes to register for our Services.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">2. Privacy Policy and User Data</h2>
          <p className="mb-4 text-slate-600">
            Your privacy is important to us. KuikChat's Privacy Policy describes our information (including message) practices, including the types of information we receive and collect from you, how we use and share this information, and your rights in relation to the processing of information about you.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">3. Acceptable Use of Our Services</h2>
          <p className="mb-4 text-slate-600">
            You must use our Services according to our Terms and posted policies. If you violate our Terms or policies, we may take action with respect to your account, including disabling or suspending your account and, if we do, you agree not to create another account without our permission.
          </p>
          <ul className="list-disc pl-6 space-y-2 text-slate-600 mb-4">
              <li><strong>Legal and Acceptable Use.</strong> You must access and use our Services only for legal, authorized, and acceptable purposes.</li>
              <li><strong>Harm to KuikChat or Our Users.</strong> You must not (or assist others to) access, use, copy, adapt, modify, prepare derivative works based upon, distribute, license, sublicense, transfer, display, perform, or otherwise exploit our Services in impermissible or unauthorized manners.</li>
          </ul>

          <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">4. Third-Party Services</h2>
          <p className="mb-4 text-slate-600">
            Our Services may allow you to access, use, or interact with third-party websites, apps, content, other products and services. For example, you may choose to use third-party data backup services (such as iCloud or Google Drive) that are integrated with our Services or interact with a share button on a third-party's website that enables you to send information to your KuikChat contacts.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">5. Licenses</h2>
          <p className="mb-4 text-slate-600">
            KuikChat does not claim ownership of the information that you submit for your KuikChat account or through our Services. You must have the necessary rights to such information that you submit for your KuikChat account or through our Services and the right to grant the rights and licenses in our Terms.
          </p>
        </div>
      </div>
    </div>
  );
}
