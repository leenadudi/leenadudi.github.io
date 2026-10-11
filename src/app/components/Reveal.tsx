/** Fades and lifts its children in when they scroll into view (once). */
import { motion, useReducedMotion } from "motion/react";
import type { CSSProperties, ReactNode } from "react";

export default function Reveal({ children, delay = 0, style, as = "div" }: {
  children: ReactNode; delay?: number; style?: CSSProperties; as?: "div" | "section" | "li" | "article";
}) {
  const reduce = useReducedMotion();
  const M = motion[as];
  return (
    <M
      initial={reduce ? false : { opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      style={style}
    >
      {children}
    </M>
  );
}
