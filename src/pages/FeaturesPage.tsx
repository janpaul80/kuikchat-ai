import { StaticLayout } from "@/components/layout/StaticLayout";
import { Features } from "@/components/landing/Features";

const FeaturesPage = () => {
    return (
        <StaticLayout
            title="Powerful Features"
            subtitle="Everything you need for secure, AI-powered communication."
        >
            <Features />
        </StaticLayout>
    );
};

export default FeaturesPage;
