import { StaticLayout } from "@/components/layout/StaticLayout";
import { Search, Book, MessageCircle, HelpCircle } from "lucide-react";
import { Input } from "@/components/ui/input";

const HelpCenterPage = () => {
    const categories = [
        { icon: Book, title: "Getting Started", count: 12 },
        { icon: MessageCircle, title: "Messaging", count: 24 },
        { icon: HelpCircle, title: "Troubleshooting", count: 18 },
    ];

    return (
        <StaticLayout
            title="Help Center"
            subtitle="How can we help you today? Search our documentation or browse categories."
        >
            <div className="max-w-2xl mx-auto mb-16">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input className="pl-12 h-14 bg-muted/50 border-none rounded-2xl" placeholder="Search for answers..." />
                </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-8">
                {categories.map((cat, i) => (
                    <div key={i} className="p-8 glass rounded-3xl text-center hover:shadow-lg transition-all cursor-pointer group">
                        <div className="w-16 h-16 rounded-2xl brand-gradient mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <cat.icon className="w-8 h-8 text-primary-foreground" />
                        </div>
                        <h3 className="font-bold text-lg mb-1">{cat.title}</h3>
                        <p className="text-sm text-muted-foreground">{cat.count} Articles</p>
                    </div>
                ))}
            </div>
        </StaticLayout>
    );
};

export default HelpCenterPage;
