import { StaticLayout } from "@/components/layout/StaticLayout";
import { CheckCircle2, AlertCircle } from "lucide-react";

const StatusPage = () => {
    const services = [
        { name: "Messaging Service", status: "Operational" },
        { name: "AI Assistant", status: "Operational" },
        { name: "File Uploads", status: "Operational" },
        { name: "VoIP & Video", status: "Partial Outage", issue: true },
        { name: "API", status: "Operational" },
    ];

    return (
        <StaticLayout
            title="System Status"
            subtitle="Real-time performance and availability of KuikChat services."
        >
            <div className="p-6 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center gap-4 mb-12">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
                <div>
                    <h3 className="font-bold text-green-500">All Systems Operational</h3>
                    <p className="text-sm text-green-500/80">Everything is working as expected.</p>
                </div>
            </div>

            <div className="space-y-4">
                {services.map((service, i) => (
                    <div key={i} className="p-6 glass rounded-2xl flex items-center justify-between">
                        <h4 className="font-medium">{service.name}</h4>
                        <div className="flex items-center gap-2">
                            <span className={`text-sm ${service.issue ? 'text-yellow-500' : 'text-green-500'}`}>{service.status}</span>
                            {service.issue ? <AlertCircle className="w-4 h-4 text-yellow-500" /> : <CheckCircle2 className="w-4 h-4 text-green-500" />}
                        </div>
                    </div>
                ))}
            </div>
        </StaticLayout>
    );
};

export default StatusPage;
