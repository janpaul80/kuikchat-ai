"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CtaBand() {
  return (
    <section className="container mx-auto px-6 py-16">
      <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        className="relative overflow-hidden rounded-3xl border border-white/10 p-12 text-center"
        style={{ background: "linear-gradient(135deg, hsl(217 91% 60% / 0.16), hsl(142 71% 45% / 0.10))" }}>
        <h2 className="text-3xl md:text-4xl font-bold text-white">Ready to chat smarter?</h2>
        <p className="mt-3 text-white/70">Join KuikChat free. No credit card required.</p>
        <Link href="/auth" className="mt-7 inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-white text-black font-semibold hover:bg-white/90 transition-colors">
          Get started <ArrowRight className="w-4 h-4" />
        </Link>
      </motion.div>
    </section>
  );
}
