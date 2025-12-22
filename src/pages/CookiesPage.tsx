import { StaticLayout } from "@/components/layout/StaticLayout";

const CookiesPage = () => {
    return (
        <StaticLayout
            title="Cookie Policy"
            subtitle="Information about how we use cookies and similar technologies."
        >
            <div className="prose prose-muted max-w-none">
                <h3 className="text-2xl font-bold mb-4">What are cookies?</h3>
                <p className="mb-6">
                    Cookies are small text files that are stored on your device when you visit a website. They help us provide you with a better experience.
                </p>
                <h3 className="text-2xl font-bold mb-4">How we use them</h3>
                <p className="mb-6">
                    We only use strictly necessary cookies to keep you signed in and to remember your preferences (like dark mode). We do not use tracking or advertising cookies.
                </p>
            </div>
        </StaticLayout>
    );
};

export default CookiesPage;
