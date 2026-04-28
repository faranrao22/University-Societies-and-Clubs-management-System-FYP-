import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Users, Globe, ArrowRight, Eye, Sparkles } from "lucide-react";
import API_BASE_URL, { uploadFileUrl } from "../../config/api.config";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";

// --- PREMIUM COLOR TOKENS ---
const COLORS = {
  dark: "#1e3a8a",
  gold: "#38bdf8",
  cream: "#e2e8f0",
  text: "#111827",
  muted: "#4B5563",
  border: "rgba(30, 64, 175, 0.16)",
};
const FALLBACK_SOCIETY_IMG =
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800";

// --- SMART ANIMATION CONFIGURATION ---
const smartFade = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } },
};

const smartContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.15 },
  },
};

const smartHover = {
  whileHover: { 
    y: -4, 
    transition: { type: "spring", stiffness: 400, damping: 25, duration: 0.2 } 
  },
};

function SocietiesPreview() {
  const { data: societies = [], isPending: loading } = useQuery({
    queryKey: ["public", "home", "societies-preview"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/societies/Allsocieties`, { credentials: "include" });
      const data = await res.json();
      return data.data?.slice(0, 3) || [];
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
  });

  return (
    <section className="px-6 py-14 md:py-16" style={{ backgroundColor: COLORS.cream }}>
      <div className="max-w-6xl mx-auto">
        
        {/* --- SMART HEADER: Minimal, high-impact --- */}
        <div className="mb-9 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          
          <motion.div 
            initial={{ opacity: 0, x: -32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-xl"
          >
            <motion.div 
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-4 inline-flex items-center gap-2 rounded-xl px-4 py-2"
              style={{ backgroundColor: `${COLORS.gold}15`, color: COLORS.dark }}
            >
              <Sparkles size={14} style={{ color: COLORS.gold }} />
              <span className="text-[11px] font-bold uppercase tracking-wider">
                Student Life
              </span>
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 }}
              className="mb-3 text-3xl font-black leading-tight tracking-tight md:text-4xl"
              style={{ color: COLORS.dark }}
            >
              Explore Our{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4A017] to-[#1B4D28]">
                Societies
              </span>
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.26 }}
              className="text-base leading-relaxed"
              style={{ color: COLORS.muted }}
            >
              Join elite student organizations and lead the change you want to see.
            </motion.p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Link
              to="/community" 
              className="inline-flex items-center gap-3 px-7 py-3.5 text-xs font-bold uppercase tracking-wide rounded-xl transition-all duration-200"
              style={{ 
                backgroundColor: COLORS.dark, 
                color: "#fff",
                border: `1px solid ${COLORS.dark}`
              }}
            >
              View All
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </motion.div>
        </div>

        {/* --- SMART CONTENT GRID --- */}
        <AnimatePresence mode="wait">
          {loading ? (
            <div key="loader" className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {[1, 2, 3].map(i => (
                <div 
                  key={i} 
                  className="h-[360px] animate-pulse rounded-3xl"
                  style={{ backgroundColor: "rgba(27, 77, 40, 0.06)" }}
                />
              ))}
            </div>
          ) : (
            <motion.div 
              key="content"
              variants={smartContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3"
            >
              {societies.map((item) => (
                <motion.article
                  key={item._id}
                  variants={smartFade}
                  {...smartHover}
                  className="group flex h-full flex-col overflow-hidden rounded-md border bg-white transition-[border-color,box-shadow] duration-200 hover:border-[#1d4ed8]/35 hover:shadow-md"
                  style={{
                    borderColor: COLORS.border,
                    boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
                  }}
                >
                  <div className="relative h-32 overflow-hidden sm:h-36">
                    <img
                      src={uploadFileUrl(item.image) || FALLBACK_SOCIETY_IMG}
                      alt={item.name}
                      className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02]"
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = FALLBACK_SOCIETY_IMG;
                      }}
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0f172a]/55 via-transparent to-transparent" />

                    <div className="absolute left-2 top-2 right-2 flex justify-start">
                      <span
                        className="rounded px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide"
                        style={{ backgroundColor: COLORS.gold, color: COLORS.dark }}
                      >
                        {item.joinPolicy || "Open"}
                      </span>
                    </div>
                  </div>

                  <div className="flex grow flex-col p-3.5 sm:p-4">
                    <h3 className="mb-1.5 text-sm font-bold leading-snug tracking-tight sm:text-[15px]" style={{ color: COLORS.text }}>
                      {item.name}
                    </h3>

                    <p
                      className="mb-3 line-clamp-2 flex-grow text-xs leading-relaxed"
                      style={{ color: COLORS.muted }}
                    >
                      {item.description ||
                        "Connect with members, join events, and grow skills alongside peers who share your interests."}
                    </p>

                    <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-dashed pt-2.5" style={{ borderColor: COLORS.border }}>
                      <div className="flex items-center gap-1 text-[11px] font-semibold sm:text-xs" style={{ color: COLORS.muted }}>
                        <Users size={13} style={{ color: COLORS.gold }} strokeWidth={2} />
                        {item.members?.length || 0} members
                      </div>
                      <div
                        className="flex min-w-0 max-w-full items-center gap-1 truncate text-[11px] font-semibold sm:text-xs"
                        style={{ color: COLORS.muted }}
                        title={item.department || "General"}
                      >
                        <Globe size={13} style={{ color: COLORS.gold }} className="shrink-0" strokeWidth={2} />
                        <span className="truncate">{item.department || "General"}</span>
                      </div>
                    </div>

                    <Link
                      to={`/society/${item._id}`}
                      className="mt-auto flex w-full items-center justify-center gap-1.5 rounded-sm border border-transparent py-2 text-xs font-semibold tracking-wide transition-colors duration-150 hover:bg-[#1d4ed8] active:bg-[#1e40af]"
                      style={{ backgroundColor: COLORS.dark, color: "#fff" }}
                    >
                      <Eye size={14} strokeWidth={2.25} />
                      View
                      <ArrowRight size={13} className="opacity-90" strokeWidth={2.5} />
                    </Link>
                  </div>
                </motion.article>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 🔹 Smart Bottom CTA */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-10 text-center"
        >
          <div 
            className="inline-flex items-center gap-3 px-5 py-3 rounded-xl border"
            style={{ 
              borderColor: "rgba(27, 77, 40, 0.2)", 
              backgroundColor: "rgba(250, 247, 242, 0.8)" 
            }}
          >
            <Users size={16} style={{ color: COLORS.dark }} />
            <span className="text-sm font-medium" style={{ color: COLORS.dark }}>
              50+ societies waiting for you
            </span>
            <Link to="/community" className="text-xs font-bold underline underline-offset-2" style={{ color: COLORS.gold }}>
              Browse all
            </Link>
          </div>
        </motion.div>

      </div>
    </section>
  );
}

export default SocietiesPreview;
