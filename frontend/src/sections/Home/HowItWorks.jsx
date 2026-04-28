import React from "react";
import { motion } from "framer-motion";
import { Search, Send, Trophy } from "lucide-react";

const COLORS = {
  dark: "#1e3a8a",
  bright: "#2563eb",
  gold: "#38bdf8",
  cream: "#e2e8f0",
  text: "#111827",
  muted: "#4B5563",
  border: "rgba(30, 64, 175, 0.16)",
};

const STEPS = [
  {
    icon: Search,
    title: "Explore",
    description:
      "Browse societies, events, and opportunities that match your interests and goals.",
  },
  {
    icon: Send,
    title: "Apply & Participate",
    description:
      "Submit join requests, volunteer applications, or election candidacy in a few clicks.",
  },
  {
    icon: Trophy,
    title: "Grow & Lead",
    description:
      "Track your participation, earn recognition, and take leadership roles in your campus community.",
  },
];

export default function HowItWorks() {
  return (
    <section className="px-6 py-14 md:py-16" style={{ backgroundColor: COLORS.cream }}>
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-10 max-w-3xl text-center md:mb-12">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block text-xs font-bold uppercase tracking-widest"
            style={{ color: COLORS.bright }}
          >
            Quick Guide
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-3 text-3xl font-black tracking-tight md:text-4xl"
            style={{ color: COLORS.dark }}
          >
            How it works
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-3 text-base leading-relaxed md:text-lg"
            style={{ color: COLORS.muted }}
          >
            Start in minutes and stay connected with everything happening across campus.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.article
                key={step.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="rounded-md border bg-white p-6"
                style={{ borderColor: COLORS.border }}
              >
                <div className="mb-4 flex items-center justify-between">
                  <span
                    className="inline-flex h-10 w-10 items-center justify-center rounded-md text-white"
                    style={{ backgroundColor: index % 2 === 0 ? COLORS.dark : COLORS.bright }}
                  >
                    <Icon size={18} />
                  </span>
                  <span
                    className="inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide"
                    style={{ borderColor: COLORS.border, color: COLORS.gold }}
                  >
                    Step {index + 1}
                  </span>
                </div>

                <h3 className="mb-2 text-lg font-bold tracking-tight" style={{ color: COLORS.text }}>
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: COLORS.muted }}>
                  {step.description}
                </p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
