"use client";

import { Activity } from "lucide-react";
import { motion, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";

function AnimatedNumber({ value }: { value: number }) {
  const spring = useSpring(value, { stiffness: 120, damping: 22 });
  const display = useTransform(spring, (latest) => Math.round(latest).toString().padStart(2, "0"));

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return <motion.span>{display}</motion.span>;
}

export function CurrentToken({ token }: { token: number | null }) {
  return (
    <section className="overflow-hidden rounded-lg border border-white/10 bg-surface/70 p-6 shadow-glow backdrop-blur-xl sm:p-8">
      <div className="flex items-center gap-2 text-sm font-medium uppercase tracking-[0.18em] text-primary">
        <Activity className="size-4" />
        Now Serving
      </div>
      <motion.div
        key={token ?? "none"}
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45 }}
        className="mt-8 flex min-h-44 items-center justify-center rounded-lg border border-primary/20 bg-primary/10"
      >
        <p className="text-[5rem] font-black leading-none tracking-tight text-primary sm:text-[9rem]">
          {token ? <AnimatedNumber value={token} /> : "--"}
        </p>
      </motion.div>
    </section>
  );
}
