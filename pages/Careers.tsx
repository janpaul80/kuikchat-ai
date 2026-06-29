
import React from 'react';
import { ArrowRightIcon } from '../components/icons';

export default function Careers() {
  const openings = [
    { title: "Senior Backend Engineer", department: "Engineering", location: "Remote" },
    { title: "Product Designer", department: "Design", location: "London, UK" },
    { title: "iOS Developer", department: "Mobile", location: "Remote" },
    { title: "Security Analyst", department: "Security", location: "New York, USA" },
    { title: "Customer Support Specialist", department: "Operations", location: "Remote" },
  ];

  return (
    <div className="pt-24 pb-16 min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Join our team</h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Help us build the future of private communication. We're looking for passionate individuals to join us on our mission.
          </p>
        </div>

        <div className="grid gap-6">
          {openings.map((job, index) => (
            <div key={index} className="flex items-center justify-between p-6 bg-slate-50 rounded-xl hover:shadow-md transition-shadow border border-slate-100 cursor-pointer group">
              <div>
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-kuik-green transition-colors">{job.title}</h3>
                <p className="text-slate-500 mt-1">{job.department} · {job.location}</p>
              </div>
              <ArrowRightIcon className="w-6 h-6 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </div>
          ))}
        </div>

        <div className="mt-16 text-center bg-kuik-green/5 rounded-2xl p-10">
          <h3 className="text-2xl font-bold text-slate-900 mb-2">Don't see a perfect fit?</h3>
          <p className="text-slate-600 mb-6">
            We are always on the lookout for great talent. Send us your resume and we'll keep you in mind for future openings.
          </p>
          <button className="px-6 py-3 bg-kuik-accent text-white font-bold rounded-full hover:bg-kuik-green transition-colors">
            Email Us
          </button>
        </div>
      </div>
    </div>
  );
}
