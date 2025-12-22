import { StaticLayout } from "@/components/layout/StaticLayout";
import { Code, Terminal, Key } from "lucide-react";

const ApiDocsPage = () => {
    return (
        <StaticLayout
            title="API Documentation"
            subtitle="Integrate KuikChat and AI capabilities into your own applications."
        >
            <div className="grid md:grid-cols-3 gap-8 mb-16">
                {[
                    { icon: Terminal, title: "Quick Start", desc: "Get your API key and make your first request in minutes." },
                    { icon: Code, title: "SDKs", desc: "Official libraries for JavaScript, Python, and Go." },
                    { icon: Key, title: "Authentication", desc: "Learn how to secure your integrations with OAuth2." },
                ].map((item, i) => (
                    <div key={i} className="p-8 glass rounded-3xl text-center group transition-all hover:bg-white/5">
                        <div className="w-14 h-14 rounded-xl brand-gradient mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <item.icon className="w-6 h-6 text-primary-foreground" />
                        </div>
                        <h3 className="font-bold mb-2">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                ))}
            </div>

            <div className="space-y-6">
                <h3 className="text-2xl font-bold">Base URL</h3>
                <div className="p-4 rounded-xl bg-black text-green-500 font-mono text-sm">
                    https://api.kuikchat.com/v1
                </div>
                <p className="text-muted-foreground">
                    All API requests require authentication via an `Authorization` header.
                </p>
            </div>
        </StaticLayout>
    );
};

export default ApiDocsPage;
