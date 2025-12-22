import { StaticLayout } from "@/components/layout/StaticLayout";
import { Apps } from "@/components/landing/Apps";

const DownloadPage = () => {
    return (
        <StaticLayout
            title="Download KuikChat"
            subtitle="Connect across all your devices with our native apps and web platform."
        >
            <Apps />
        </StaticLayout>
    );
};

export default DownloadPage;
