"use client";

import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  loading?: boolean;
  variant?: "primary" | "secondary" | "ghost" | "danger";
}

const variants = {
  primary: "bg-primary text-primary-foreground hover:opacity-90",
  secondary: "border border-white/10 bg-white/8 text-foreground hover:bg-white/12",
  ghost: "text-muted-foreground hover:bg-white/10 hover:text-foreground",
  danger: "bg-destructive text-destructive-foreground hover:opacity-90"
};

export function Button({ children, loading, variant = "primary", className = "", ...props }: ButtonProps) {
  return (
    <motion.button
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
      className={`inline-flex h-11 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-55 ${variants[variant]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? <Loader2 className="size-4 animate-spin" /> : null}
      {children}
    </motion.button>
  );
}
