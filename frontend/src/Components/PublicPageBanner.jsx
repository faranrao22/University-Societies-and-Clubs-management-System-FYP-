import React from "react";
import { Sparkles } from "lucide-react";

const COLORS = {
  lightGreen: "#1e40af",
  gold: "#38bdf8",
};

export default function PublicPageBanner({ title, subtitle }) {
  return (
    <section className="relative overflow-hidden py-10 md:py-14" style={{ backgroundColor: COLORS.lightGreen }}>
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.14]"
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(ellipse 70% 55% at 12% 0%, #fff 0%, transparent 50%), radial-gradient(ellipse 55% 40% at 90% 10%, #38bdf8 0%, transparent 45%)",
        }}
      />
      <div className="relative z-10 mx-auto max-w-6xl px-6 text-center">
        <span
          className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/25 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-widest text-white/95"
          style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
        >
          <Sparkles size={13} style={{ color: COLORS.gold }} />
          University Societies & Clubs
        </span>
        <h1 className="text-2xl font-black tracking-tight text-white md:text-3xl">{title}</h1>
        {subtitle ? <p className="mx-auto mt-2 max-w-2xl text-sm text-white/85 md:text-base">{subtitle}</p> : null}
      </div>
    </section>
  );
}
