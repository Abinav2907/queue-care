"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={`rounded-lg border border-white/10 bg-surface/70 shadow-glow backdrop-blur-xl ${className}`}
    >
      {children}
    </motion.section>
  );
}
