import { StaticLayout } from "@/components/layout/StaticLayout";
import { Mail, MessageSquare, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const ContactUsPage = () => {
    return (
        <StaticLayout
            title="Contact Us"
            subtitle="Get in touch with the KuikChat team. We're here to help."
        >
            <div className="grid lg:grid-cols-2 gap-16">
                <div>
                    <h3 className="text-2xl font-bold mb-8">Send us a message</h3>
                    <form className="space-y-6">
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Name</label>
                                <Input placeholder="Your name" className="bg-muted/50 border-none h-12" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Email</label>
                                <Input placeholder="Your email" className="bg-muted/50 border-none h-12" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Subject</label>
                            <Input placeholder="What's this about?" className="bg-muted/50 border-none h-12" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Message</label>
                            <Textarea placeholder="Your message..." className="bg-muted/50 border-none min-h-[150px]" />
                        </div>
                        <Button variant="brand" className="w-full h-12">Send Message</Button>
                    </form>
                </div>

                <div className="space-y-12">
                    <div>
                        <h3 className="text-2xl font-bold mb-8">Other ways to connect</h3>
                        <div className="space-y-8">
                            <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                    <Mail className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h4 className="font-bold">Email Support</h4>
                                    <p className="text-muted-foreground">support@kuikchat.com</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
                                    <MessageSquare className="w-6 h-6 text-secondary" />
                                </div>
                                <div>
                                    <h4 className="font-bold">Community Chat</h4>
                                    <p className="text-muted-foreground">Join our public Discord server</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                                    <MapPin className="w-6 h-6 text-accent" />
                                </div>
                                <div>
                                    <h4 className="font-bold">Headquarters</h4>
                                    <p className="text-muted-foreground">San Francisco, CA</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </StaticLayout>
    );
};

export default ContactUsPage;
