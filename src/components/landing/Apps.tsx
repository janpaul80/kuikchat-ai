import { motion } from "framer-motion";
import { Apple, Monitor, Smartphone, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

const platforms = [
  {
    name: "iOS",
    icon: Smartphone,
    description: "iPhone & iPad",
    available: true,
  },
  {
    name: "Android",
    icon: Smartphone,
    description: "Google Play & APK",
    available: true,
  },
  {
    name: "Web",
    icon: Monitor,
    description: "Progressive Web App",
    available: true,
  },
];

export const Apps = () => {
  return (
    <section id="apps" className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/30 to-background" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 mb-6">
            <Download className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Download KuikChat</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
            Available{" "}
            <span className="brand-gradient-text">Everywhere</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Seamless sync across all your devices. Start a conversation on your phone,
            continue on your desktop.
          </p>
        </motion.div>

        {/* Platforms Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12"
        >
          {platforms.map((platform, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ duration: 0.2 }}
              className="glass rounded-2xl p-6 text-center cursor-pointer hover:shadow-xl transition-shadow duration-300"
            >
              <div className="w-14 h-14 mx-auto rounded-xl brand-gradient flex items-center justify-center mb-4">
                <platform.icon className="w-7 h-7 text-primary-foreground" />
              </div>
              <h3 className="font-semibold mb-1">{platform.name}</h3>
              <p className="text-xs text-muted-foreground">{platform.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Download CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center"
        >
          <Button variant="hero" size="xl">
            <Download className="mr-2" />
            Download for Free
          </Button>
          <p className="text-sm text-muted-foreground mt-4 max-w-xl mx-auto">
            No credit card required. KuikChat is currently in beta — help us shape the future of privacy-first communication.
          </p>
        </motion.div>
      </div>
    </section>
  );
};
