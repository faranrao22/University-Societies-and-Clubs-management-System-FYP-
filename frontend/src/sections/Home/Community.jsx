import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Users, ChevronRight, ArrowRight, Sparkles } from "lucide-react";
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
              {societies.map((item, index) => (
                <motion.article
                  key={item._id}
                  variants={smartFade}
                  {...smartHover}
                  className="group bg-white rounded-3xl overflow-hidden border shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full"
                  style={{ borderColor: COLORS.border }}
                >
                  {/* Image - Sleek with very light overlay */}
                  <div className="relative h-52 overflow-hidden">
                    <img
                      src={uploadFileUrl(item.image)}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                      onError={(e) => { 
                        e.target.src = "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=800"; 
                      }}
                    />
                    {/* 🔹 Very Light Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1B4D28]/10 via-transparent to-transparent pointer-events-none" />
                    
                    {/* Smart Department Badge */}
                    <div className="absolute top-4 left-4">
                      <span 
                        className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider text-white shadow-sm"
                        style={{ 
                          backgroundColor: index % 2 === 0 ? COLORS.dark : COLORS.gold,
                          backdropFilter: "blur(4px)"
                        }}
                      >
                        {item.department || "General"}
                      </span>
                    </div>
                  </div>

                  {/* Content - Tight, scannable, smart */}
                  <div className="p-6 flex flex-col grow">
                    {/* Title - Sharp, bold */}
                    <h3 
                      className="text-lg font-bold mb-3 leading-tight group-hover:text-[#D4A017] transition-colors duration-200"
                      style={{ color: COLORS.text }}
                    >
                      {item.name}
                    </h3>
                    
                    {/* Description - Concise */}
                    <p 
                      className="text-sm leading-relaxed mb-6 line-clamp-2"
                      style={{ color: COLORS.muted }}
                    >
                      {item.description || "Empowering the next generation of campus leaders."}
                    </p>

                    {/* Smart Footer: Members + CTA */}
                    <div className="pt-5 border-t mt-auto flex items-center justify-between" style={{ borderColor: "rgba(75, 85, 99, 0.1)" }}>
                      <div className="flex items-center gap-2">
                        <Users size={14} style={{ color: COLORS.gold }} />
                        <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: COLORS.muted }}>
                          {item.members?.length || 0} Members
                        </span>
                      </div>
                      
                      <Link to={`/society/${item._id}`} className="block">
                        <button 
                          className="text-xs font-bold transition-colors duration-150 hover:underline underline-offset-2"
                          style={{ color: COLORS.gold }}
                        >
                          Details →
                        </button>
                      </Link>
                    </div>
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
