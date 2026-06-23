"use client";

import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

export function Stat({
  label,
  value,
  icon: Icon,
  accent = "text-primary"
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border border-white/10 bg-white/[0.06] p-4 backdrop-blur-xl"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{label}</p>
        <Icon className={`size-4 ${accent}`} />
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight">{value}</p>
    </motion.div>
  );
}
