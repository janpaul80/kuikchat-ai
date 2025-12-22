import { StaticLayout } from "@/components/layout/StaticLayout";
import { About } from "@/components/landing/About";

const AboutPage = () => {
    return (
        <StaticLayout
            title="About KuikChat"
            subtitle="The story behind the communication platform of the future."
        >
            <About />
        </StaticLayout>
    );
};

export default AboutPage;
