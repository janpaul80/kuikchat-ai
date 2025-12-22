import { StaticLayout } from "@/components/layout/StaticLayout";

const PrivacyPage = () => {
    return (
        <StaticLayout
            title="Privacy Policy"
            subtitle="How we collect, use, and protect your personal information."
        >
            <div className="prose prose-muted max-w-none">
                <h3 className="text-2xl font-bold mb-4">1. Data Collection</h3>
                <p className="mb-6">
                    KuikChat is built on the principle of data minimization. We only collect the information necessary to provide you with a secure and functional messaging experience.
                </p>
                <h3 className="text-2xl font-bold mb-4">2. End-to-End Encryption</h3>
                <p className="mb-6">
                    Your messages, voice calls, and video calls are encrypted at all times. Neither KuikChat nor any third party can read your messages or listen to your calls.
                </p>
                <h3 className="text-2xl font-bold mb-4">3. AI Features</h3>
                <p className="mb-6">
                    Our AI features are designed with privacy in mind. Where possible, processing happens on your device. When cloud processing is required, your data is anonymized and never stored for training purposes.
                </p>
            </div>
        </StaticLayout>
    );
};

export default PrivacyPage;
