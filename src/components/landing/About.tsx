import { motion } from "framer-motion";
import { Lightbulb, Users, Rocket, Heart } from "lucide-react";

export const About = () => {
  return (
    <section id="about" className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 via-background to-primary/5" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content - Vision */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 mb-6">
              <Lightbulb className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Our Vision</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Building the Future of{" "}
              <span className="brand-gradient-text">Human Connection</span>
            </h2>
            
            <p className="text-lg text-muted-foreground mb-6">
              At HEFTCoder Labs, we believe AI should amplify human potential, not replace it. 
              KuikChat is our vision of what communication can be when technology serves humanity.
            </p>

            <p className="text-muted-foreground mb-8">
              Led by CEO Jean-Paul Hartmann, our team of engineers, designers, and privacy advocates 
              work tirelessly to create a platform where security isn't just a feature—it's the foundation.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold brand-gradient-text">10M+</div>
                <p className="text-sm text-muted-foreground">Active Users</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold brand-gradient-text">150+</div>
                <p className="text-sm text-muted-foreground">Countries</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold brand-gradient-text">99.9%</div>
                <p className="text-sm text-muted-foreground">Uptime</p>
              </div>
            </div>
          </motion.div>

          {/* Right Content - Values */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            {[
              {
                icon: Users,
                title: "People First",
                description: "Every feature we build starts with one question: How does this help people connect better?",
              },
              {
                icon: Rocket,
                title: "Innovation Driven",
                description: "We push the boundaries of what's possible while never compromising on security or privacy.",
              },
              {
                icon: Heart,
                title: "Built with Care",
                description: "From accessibility to performance, we obsess over the details that make KuikChat a joy to use.",
              },
            ].map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ x: 10 }}
                className="flex gap-4 glass rounded-xl p-6 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl brand-gradient flex items-center justify-center shrink-0">
                  <value.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};
