"use client";

import * as React from "react";
import { motion } from "framer-motion";

type BubbleColors = {
  first?: string;
  second?: string;
  third?: string;
  fourth?: string;
  fifth?: string;
  sixth?: string;
};

type BubbleBackgroundProps = {
  className?: string;
  interactive?: boolean;
  colors?: BubbleColors;
};

const defaultColors: Required<BubbleColors> = {
  first: "59,130,246",
  second: "16,185,129",
  third: "34,211,238",
  fourth: "20,184,166",
  fifth: "37,99,235",
  sixth: "5,150,105",
};

function rgba(rgb: string, alpha: number) {
  return `rgba(${rgb}, ${alpha})`;
}

export function BubbleBackground({
  className = "",
  interactive = true,
  colors,
}: BubbleBackgroundProps) {
  const c = { ...defaultColors, ...(colors ?? {}) };
  const [mouse, setMouse] = React.useState({ x: 50, y: 50 });

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMouse({ x, y });
  };

  return (
    <div
      className={`overflow-hidden ${className}`}
      onMouseMove={onMouseMove}
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-[#04100c]" />

      <motion.div
        className="absolute -left-24 -top-24 h-72 w-72 rounded-full blur-3xl"
        animate={{ x: [0, 30, -10, 0], y: [0, -10, 20, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        style={{ background: rgba(c.first, 0.24) }}
      />
      <motion.div
        className="absolute right-[-80px] top-1/4 h-80 w-80 rounded-full blur-3xl"
        animate={{ x: [0, -20, 10, 0], y: [0, 20, -10, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        style={{ background: rgba(c.second, 0.2) }}
      />
      <motion.div
        className="absolute left-1/3 bottom-[-120px] h-96 w-96 rounded-full blur-3xl"
        animate={{ x: [0, 20, -20, 0], y: [0, -25, 15, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        style={{ background: rgba(c.third, 0.18) }}
      />
      <motion.div
        className="absolute left-[12%] top-[58%] h-52 w-52 rounded-full blur-3xl"
        animate={{ x: [0, -12, 20, 0], y: [0, 12, -16, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        style={{ background: rgba(c.fourth, 0.16) }}
      />
      <motion.div
        className="absolute right-[22%] top-[14%] h-48 w-48 rounded-full blur-3xl"
        animate={{ x: [0, 18, -8, 0], y: [0, -14, 18, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        style={{ background: rgba(c.fifth, 0.16) }}
      />
      <motion.div
        className="absolute right-[8%] bottom-[10%] h-60 w-60 rounded-full blur-3xl"
        animate={{ x: [0, -16, 12, 0], y: [0, 10, -14, 0] }}
        transition={{ duration: 17, repeat: Infinity, ease: "easeInOut" }}
        style={{ background: rgba(c.sixth, 0.16) }}
      />

      {interactive && (
        <motion.div
          className="pointer-events-none absolute h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
          animate={{
            left: `${mouse.x}%`,
            top: `${mouse.y}%`,
          }}
          transition={{ type: "spring", stiffness: 70, damping: 20 }}
          style={{
            background: `radial-gradient(circle, ${rgba(c.third, 0.24)} 0%, ${rgba(
              c.second,
              0.05
            )} 60%, transparent 100%)`,
          }}
        />
      )}
    </div>
  );
}
