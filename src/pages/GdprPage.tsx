import { StaticLayout } from "@/components/layout/StaticLayout";

const GdprPage = () => {
    return (
        <StaticLayout
            title="GDPR Compliance"
            subtitle="Our commitment to your data protection rights under EU law."
        >
            <div className="prose prose-muted max-w-none">
                <h3 className="text-2xl font-bold mb-4">Your Rights</h3>
                <p className="mb-6">
                    Under the General Data Protection Regulation (GDPR), you have the right to access, rectify, or erase your personal data, as well as the right to data portability and restriction of processing.
                </p>
                <h3 className="text-2xl font-bold mb-4">Data Protection Officer</h3>
                <p className="mb-6">
                    If you have any questions about how we handle your data, you can reach out to our DPO at dpo@kuikchat.com.
                </p>
            </div>
        </StaticLayout>
    );
};

export default GdprPage;
