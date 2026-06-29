import React from 'react';

interface NavbarProps {
  onAuthClick: (mode: 'login' | 'signup') => void;
  onNavigate: (page: 'home' | 'privacy' | 'help' | 'apps' | 'about' | 'careers' | 'press' | 'contact' | 'terms') => void;
}

export default function Navbar({ onAuthClick, onNavigate }: NavbarProps) {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white/80 dark:bg-[#121212]/80 backdrop-blur-sm z-50 transition-all duration-300 border-b border-slate-100 dark:border-slate-800">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <button onClick={() => onNavigate('home')} className="flex items-center space-x-2">
          <svg viewBox="0 0 200 200" className="h-8 w-8" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#25D366', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#128C7E', stopOpacity: 1 }} />
              </linearGradient>
            </defs>
            <path fill="url(#logoGradient)" d="M100,0 C44.8,0,0,44.8,0,100 C0,155.2,44.8,200,100,200 C155.2,200,200,155.2,200,100 C200,44.8,155.2,0,100,0 Z M152.8,128.5 C150,130.6,141.2,135.5,134.1,131.9 C127,128.3,113.8,120,109.8,118.8 C105.8,117.6,103.5,118.4,101.4,120.9 C99.3,123.4,92.2,130.8,89.5,133.7 C86.8,136.6,84.1,137,80.5,135.4 C76.9,133.8,65.8,129.8,56.6,120.9 C45.3,110.1,40,97.7,42.2,95 C44.4,92.3,47.3,91.8,49.2,90.1 C51.1,88.4,52.8,86.2,54.1,84.4 C55.4,82.6,55.9,81.4,57.3,78.9 C58.7,76.4,58.2,74.5,57.2,73.1 C56.2,71.7,54.8,70.9,53.4,70.3 C52,69.7,50.1,69.5,48.5,69.5 C46.9,69.5,44.9,69.9,43,71.8 C41.1,73.7,37.2,78.2,37.2,87.6 C37.2,97,43.3,105.7,44.5,107.5 C45.7,109.3,58.8,130.2,79.5,139.1 C98.5,147.3,103.2,148.8,109.2,148.5 C115.2,148.2,126.3,142.6,129.3,136.9 C132.3,131.2,132.3,126.6,131.6,125.6 C130.9,124.6,129.2,123.8,127.1,122.6 C125,121.4,121.7,119.8,122.8,117.2 C123.9,114.6,129.4,121.1,134.4,124 C139.4,126.9,143.1,128.1,145.2,127.5 C147.3,126.9,150.7,124.6,152.8,121.6 C154.9,118.6,155.8,115.5,155.8,112.9 C155.8,110.3,154.8,108,152.8,105.5 C151,103.2,146.6,100,146.6,100 C146.6,100,155.8,109.1,155.8,112.9 C155.8,115.5,155.6,125.4,152.8,128.5 Z" />
          </svg>
          <span className="font-bold text-xl text-[#075E54] dark:text-[#128C7E]">KuikChat</span>
        </button>
        <nav className="hidden md:flex items-center space-x-8">
          <button onClick={() => onNavigate('home')} className="text-gray-600 dark:text-gray-300 hover:text-[#075E54] font-medium transition-colors">Features</button>
          <button onClick={() => onNavigate('privacy')} className="text-gray-600 dark:text-gray-300 hover:text-[#075E54] font-medium transition-colors">Privacy</button>
          <button onClick={() => onNavigate('apps')} className="text-gray-600 dark:text-gray-300 hover:text-[#075E54] font-medium transition-colors">Apps</button>
          <button onClick={() => onNavigate('about')} className="text-gray-600 dark:text-gray-300 hover:text-[#075E54] font-medium transition-colors">About</button>
          <button onClick={() => onNavigate('careers')} className="text-gray-600 dark:text-gray-300 hover:text-[#075E54] font-medium transition-colors">Careers</button>
          <button onClick={() => onNavigate('contact')} className="text-gray-600 dark:text-gray-300 hover:text-[#075E54] font-medium transition-colors">Contact</button>
        </nav>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => onAuthClick('login')} 
            className="px-5 py-2 border-2 border-[#25D366] text-[#25D366] font-bold rounded-full hover:bg-[#25D366] hover:text-white transition-colors"
          >
            Log In
          </button>
        </div>
      </div>
    </header>
  );
}
