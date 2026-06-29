
import React, { useState, useEffect } from 'react';
import Navbar from '../components/landing/Navbar';
import HeroSection from '../components/landing/HeroSection';
import VideoCallSection from '../components/landing/VideoCallSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import SecuritySection from '../components/landing/SecuritySection';
import PlatformsSection from '../components/landing/PlatformsSection';
import CTASection from '../components/landing/CTASection';
import Footer from '../components/landing/Footer';
import AuthModal from '../components/landing/AuthModal';
import AIChatWidget from '../components/landing/AIChatWidget';
import Privacy from './Privacy';
import HelpCenter from './HelpCenter';
import AppsPage from './AppsPage';
import About from './About';
import Careers from './Careers';
import Press from './Press';
import ContactUs from './ContactUs';
import Terms from './Terms';

interface HomeProps {
    onLogin: () => void;
}

type Page = 'home' | 'privacy' | 'help' | 'apps' | 'about' | 'careers' | 'press' | 'contact' | 'terms';

export default function Home({ onLogin }: HomeProps) {
    const [authModal, setAuthModal] = useState({ isOpen: false, mode: 'login' });
    const [currentPage, setCurrentPage] = useState<Page>('home');

    // Scroll to top when page changes
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [currentPage]);

    const handleAuthClick = (mode) => {
        setAuthModal({ isOpen: true, mode });
    };

    const handleCloseAuth = () => {
        setAuthModal({ isOpen: false, mode: 'login' });
    };

    const renderPage = () => {
        switch (currentPage) {
            case 'privacy':
                return <Privacy />;
            case 'help':
                return <HelpCenter />;
            case 'apps':
                return <AppsPage />;
            case 'about':
                return <About />;
            case 'careers':
                return <Careers />;
            case 'press':
                return <Press />;
            case 'contact':
                return <ContactUs />;
            case 'terms':
                return <Terms />;
            case 'home':
            default:
                return (
                    <>
                        <HeroSection onAuthClick={handleAuthClick} />
                        <VideoCallSection />
                        <FeaturesSection />
                        <SecuritySection />
                        <PlatformsSection />
                        <CTASection onAuthClick={handleAuthClick} />
                    </>
                );
        }
    };

    return (
        <div className="min-h-screen bg-white font-sans text-slate-900 flex flex-col">
            <Navbar onAuthClick={handleAuthClick} onNavigate={setCurrentPage} />
            
            <main className="flex-grow">
                {renderPage()}
            </main>

            <Footer onNavigate={setCurrentPage} />
            
            <AuthModal 
                isOpen={authModal.isOpen} 
                onClose={handleCloseAuth} 
                mode={authModal.mode}
                onLogin={onLogin}
            />
            
            <AIChatWidget />
        </div>
    );
}
