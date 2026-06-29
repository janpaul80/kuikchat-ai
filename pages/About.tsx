
import React from 'react';

export default function About() {
  return (
    <div className="pt-24 pb-16 min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-6">About KuikChat</h1>
        
        <div className="prose prose-lg text-slate-600">
          <p className="lead text-xl mb-8">
            KuikChat connects people across the globe. With a simple, secure, and reliable messaging experience, we empower users to stay in touch with friends, family, and coworkers anytime, anywhere.
          </p>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Our Mission</h2>
            <p>
              Our mission is to connect the world privately. We believe that communication is a basic human right, and it should be accessible, secure, and free from prying eyes. That's why we built end-to-end encryption into our app by default.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Our Story</h2>
            <p>
              Founded in 2023, KuikChat started with a simple idea: what if you could message anyone, anywhere, without worrying about who else might be reading? From a small team of engineers, we've grown into a platform supporting millions of messages every day.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Our Values</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Privacy First:</strong> We design every feature with privacy in mind.</li>
              <li><strong>Simplicity:</strong> We keep things simple and intuitive.</li>
              <li><strong>Reliability:</strong> We work hard to ensure your messages are delivered, even on slow networks.</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
