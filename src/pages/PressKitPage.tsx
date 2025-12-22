import { StaticLayout } from "@/components/layout/StaticLayout";
import { Download } from "lucide-react";
import logo from "@/assets/kuikchat-logo.png";

const PressKitPage = () => {
    return (
        <StaticLayout
            title="Press Kit"
            subtitle="Assets and information for press and media enquiries."
        >
            <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                    <h3 className="text-2xl font-bold">Brand Assets</h3>
                    <p className="text-muted-foreground">
                        Download our official logo, brand guidelines, and high-resolution product images.
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                            <Download className="w-4 h-4" />
                            Download Media Kit (50MB)
                        </button>
                    </div>
                </div>
                <div className="p-8 glass rounded-3xl flex items-center justify-center">
                    <img src={logo} alt="KuikChat Logo" className="w-56 h-56" />
                </div>
            </div>
        </StaticLayout>
    );
};

export default PressKitPage;
