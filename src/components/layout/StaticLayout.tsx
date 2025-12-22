import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { LandingChatbot } from "@/components/landing/LandingChatbot";
import { motion } from "framer-motion";

interface StaticLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle?: string;
}

export const StaticLayout = ({ children, title, subtitle }: StaticLayoutProps) => {
    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="pt-32 pb-20">
                {/* Page Hero */}
                <section className="relative py-20 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

                    <div className="container mx-auto px-4 relative z-10 text-center">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-6xl font-bold mb-6"
                        >
                            <span className="brand-gradient-text">{title}</span>
                        </motion.h1>
                        {subtitle && (
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-xl text-muted-foreground max-w-2xl mx-auto"
                            >
                                {subtitle}
                            </motion.p>
                        )}
                    </div>
                </section>

                {/* Page Content */}
                <section className="container mx-auto px-4 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="glass rounded-3xl p-8 md:p-12 shadow-xl"
                    >
                        {children}
                    </motion.div>
                </section>
            </main>
            <Footer />
            <LandingChatbot />
        </div>
    );
};
