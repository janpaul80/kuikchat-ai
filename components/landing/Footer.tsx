import React from 'react';

interface FooterProps {
  onNavigate: (page: 'home' | 'privacy' | 'help' | 'apps' | 'about' | 'careers' | 'press' | 'contact' | 'terms') => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="bg-[#1e1e1e] text-gray-300">
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h4 className="font-bold text-white mb-4">KuikChat</h4>
            <ul className="space-y-2">
              <li><button onClick={() => onNavigate('home')} className="hover:underline text-left">Features</button></li>
              <li><button onClick={() => onNavigate('privacy')} className="hover:underline text-left">Privacy</button></li>
              <li><button onClick={() => onNavigate('apps')} className="hover:underline text-left">Download</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4">Company</h4>
            <ul className="space-y-2">
              <li><button onClick={() => onNavigate('about')} className="hover:underline text-left">About</button></li>
              <li><button onClick={() => onNavigate('careers')} className="hover:underline text-left">Careers</button></li>
              <li><button onClick={() => onNavigate('press')} className="hover:underline text-left">Brand Center</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4">Download</h4>
            <ul className="space-y-2">
              <li><button onClick={() => onNavigate('apps')} className="hover:underline text-left">Mac/PC</button></li>
              <li><button onClick={() => onNavigate('apps')} className="hover:underline text-left">Android</button></li>
              <li><button onClick={() => onNavigate('apps')} className="hover:underline text-left">iPhone</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4">Help</h4>
            <ul className="space-y-2">
              <li><button onClick={() => onNavigate('help')} className="hover:underline text-left">Help Center</button></li>
              <li><button onClick={() => onNavigate('contact')} className="hover:underline text-left">Contact Us</button></li>
              <li><button onClick={() => onNavigate('terms')} className="hover:underline text-left">Terms of Service</button></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="bg-[#121212] py-4">
        <div className="container mx-auto px-6 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-500">
          <p>&copy; 2024 KuikChat Inc.</p>
          <div className="mt-4 sm:mt-0">
            <select className="bg-transparent border border-gray-600 rounded-md p-1">
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
            </select>
          </div>
        </div>
      </div>
    </footer>
  );
}
