import type React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
export function Pill({
  children,
  href = "#join",
  outline = false,
}: {
  children: React.ReactNode;
  href?: string;
  outline?: boolean;
}) {
  return (
    <a href={href} className={"pill " + (outline ? "pill-outline" : "")}>
      {children}
      <ArrowRight size={16} />
    </a>
  );
}
export function SectionTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="section-tag">
      <Sparkles size={12} />
      {children}
    </span>
  );
}
export function Reveal({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={useReducedMotion() ? false : { opacity: 0, y: 35 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.13 }}
      transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}
