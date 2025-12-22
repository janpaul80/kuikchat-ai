import { motion } from "framer-motion";
import { 
  Sparkles, 
  Shield, 
  Zap, 
  Globe, 
  Video, 
  Image as ImageIcon,
  MessageSquare,
  Lock,
  Eye,
  Timer
} from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "Ask AI",
    description: "Inline assistant for real-time answers, coding help, and creative brainstorming.",
    gradient: "from-primary to-primary/60",
  },
  {
    icon: ImageIcon,
    title: "AI Art Studio",
    description: "Generate stunning images from text prompts directly in your conversations.",
    gradient: "from-secondary to-secondary/60",
  },
  {
    icon: Video,
    title: "Multimodal Live Call",
    description: "Real-time voice/video with AI that sees and hears, powered by cutting-edge models.",
    gradient: "from-primary to-secondary",
  },
  {
    icon: Globe,
    title: "Smart Translation",
    description: "One-tap translation supporting English, Spanish, German, French, Hindi, and Chinese.",
    gradient: "from-secondary to-primary",
  },
  {
    icon: Lock,
    title: "Vanish Mode",
    description: "Dark UI with messages that disappear after being read. Complete privacy.",
    gradient: "from-accent to-primary",
  },
  {
    icon: Eye,
    title: "Screenshot Alerts",
    description: "Real-time notifications whenever someone takes a screenshot of your chat.",
    gradient: "from-primary to-accent",
  },
  {
    icon: Timer,
    title: "Disappearing Messages",
    description: "Set timers for self-destructing messages: 5s, 10s, or 1 minute.",
    gradient: "from-secondary to-accent",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Optimized for speed with PWA support and offline capabilities.",
    gradient: "from-primary to-secondary",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export const Features = () => {
  return (
    <section id="features" className="py-24 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />
      
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
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Powerful Features</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
            Everything You Need,{" "}
            <span className="brand-gradient-text">Nothing You Don't</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            From AI-powered conversations to ironclad security, KuikChat has it all.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="group"
            >
              <div className="glass rounded-2xl p-6 h-full transition-all duration-300 hover:shadow-xl">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
