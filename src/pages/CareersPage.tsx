import { StaticLayout } from "@/components/layout/StaticLayout";
import { ArrowRight } from "lucide-react";

const CareersPage = () => {
    const jobs = [
        { title: "Senior AI Engineer", location: "Remote / New York", dept: "Engineering" },
        { title: "Product Designer", location: "Remote / London", dept: "Design" },
        { title: "Privacy Security Lead", location: "Remote / Berlin", dept: "Security" }
    ];

    return (
        <StaticLayout
            title="Join the Team"
            subtitle="We're looking for passionate people to help us build the next generation of communication tools."
        >
            <div className="space-y-6">
                <h3 className="text-2xl font-bold mb-8 text-center">Open Positions</h3>
                {jobs.map((job, i) => (
                    <div key={i} className="flex items-center justify-between p-6 rounded-2xl border border-border group hover:border-primary transition-colors cursor-pointer">
                        <div>
                            <span className="text-xs font-semibold uppercase text-muted-foreground mb-1 block">{job.dept}</span>
                            <h4 className="text-xl font-bold">{job.title}</h4>
                            <p className="text-sm text-muted-foreground">{job.location}</p>
                        </div>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                    </div>
                ))}
            </div>
        </StaticLayout>
    );
};

export default CareersPage;
