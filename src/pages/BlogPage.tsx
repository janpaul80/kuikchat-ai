import { StaticLayout } from "@/components/layout/StaticLayout";
import { motion } from "framer-motion";

const BlogPage = () => {
    const posts = [
        {
            title: "Introducing KuikChat: Privacy First",
            date: "Dec 15, 2025",
            excerpt: "Behind the scenes of our mission to redefine communication..."
        },
        {
            title: "The Power of On-Device AI",
            date: "Dec 10, 2025",
            excerpt: "Why we choose privacy-preserving AI models for your everyday chats..."
        },
        {
            title: "Getting Started with KuikChat Beta",
            date: "Dec 5, 2025",
            excerpt: "A comprehensive guide to all our new features and capabilities..."
        }
    ];

    return (
        <StaticLayout
            title="Our Blog"
            subtitle="Insights, updates, and stories from the KuikChat team."
        >
            <div className="grid gap-8">
                {posts.map((post, i) => (
                    <motion.div
                        key={i}
                        whileHover={{ x: 10 }}
                        className="p-6 rounded-2xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                    >
                        <span className="text-sm text-primary font-medium">{post.date}</span>
                        <h3 className="text-2xl font-bold my-2">{post.title}</h3>
                        <p className="text-muted-foreground">{post.excerpt}</p>
                    </motion.div>
                ))}
            </div>
        </StaticLayout>
    );
};

export default BlogPage;
