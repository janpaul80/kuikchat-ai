import { StaticLayout } from "@/components/layout/StaticLayout";

const TermsPage = () => {
    return (
        <StaticLayout
            title="Terms of Service"
            subtitle="The rules and guidelines for using the KuikChat platform."
        >
            <div className="prose prose-muted max-w-none">
                <h3 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h3>
                <p className="mb-6">
                    By accessing or using KuikChat, you agree to be bound by these Terms of Service and all applicable laws and regulations.
                </p>
                <h3 className="text-2xl font-bold mb-4">2. User Conduct</h3>
                <p className="mb-6">
                    You are responsible for your use of the platform and for any content you post. KuikChat is intended for respectful and lawful communication.
                </p>
                <h3 className="text-2xl font-bold mb-4">3. Beta Disclaimer</h3>
                <p className="mb-6">
                    KuikChat is currently in beta. Features may change, and while we strive for 100% uptime, occasional interruptions may occur as we refine the platform.
                </p>
            </div>
        </StaticLayout>
    );
};

export default TermsPage;
