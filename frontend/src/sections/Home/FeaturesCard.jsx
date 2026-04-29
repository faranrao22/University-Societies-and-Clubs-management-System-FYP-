import React from "react";
import { motion } from "framer-motion";
import { 
  Users, 
  Calendar, 
  Trophy, 
  ShieldCheck, 
  Zap, 
  BarChart3 
} from "lucide-react";

// 🔹 Exact Color Palette from Image
const COLORS = {
  darkGreen: "#1e3a8a",
  brightGreen: "#2563eb",
  gold: "#38bdf8",
  cream: "#e2e8f0",
  cardBorder: "#E5E2DC",
  textPrimary: "#111827",
  textSecondary: "#4B5563",
};

const FeaturesSection = () => {
  const features = [
    {
      icon: <Users size={24} />,
      title: "Society Discovery & Join Requests",
      description: "Browse societies, view profiles, and send join requests online.",
    },
    {
      icon: <Calendar size={24} />,
      title: "Event Management Workflow",
      description: "Create events, apply as volunteers, and track status in profile.",
    },
    {
      icon: <Trophy size={24} />,
      title: "Election Module",
      description: "Handle applications, voting, and results in one election flow.",
    },
    {
      icon: <ShieldCheck size={24} />,
      title: "Role-Based Access Control",
      description: "User, manager, and admin roles have separate permissions.",
    },
    {
      icon: <Zap size={24} />,
      title: "Real-Time Notification Center",
      description: "Get in-app updates for requests, approvals, and elections.",
    },
    {
      icon: <BarChart3 size={24} />,
      title: "Dashboards & Profile Tracking",
      description: "Dashboards and profiles keep all activity in one place.",
    },
  ];

  return (
    <section className="px-6 py-14 md:py-16" style={{ backgroundColor: COLORS.cream }}>
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="mx-auto mb-10 max-w-3xl text-center md:mb-12">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="inline-block font-bold tracking-[0.22em] uppercase text-xs"
            style={{ color: COLORS.brightGreen }}
          >
            Core Modules
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-5 mt-3 text-3xl font-black tracking-[0.01em] md:text-4xl"
            style={{ color: COLORS.darkGreen }}
          >
            Key features of <span className="text-transparent bg-clip-text bg-gradient-to-r" style={{ backgroundImage: `linear-gradient(90deg, ${COLORS.brightGreen}, ${COLORS.gold})` }}>USCMS.</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base leading-relaxed md:text-lg"
            style={{ color: COLORS.textSecondary }}
          >
            Built for students, society managers, and university admins.
          </motion.p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              whileHover={{ y: -4 }}
              className="group relative p-6 bg-white border transition-all duration-150 hover:border-opacity-100"
              style={{ 
                borderColor: COLORS.cardBorder,
                borderRadius: "8px",
                borderWidth: "1px",
              }}
            >
              {/* Icon Container - Sharp & Precise */}
              <div 
                className="w-12 h-12 flex items-center justify-center text-white mb-5 transition-colors duration-150 group-hover:brightness-110"
                style={{ 
                  borderRadius: "6px",
                  backgroundColor: index % 2 === 0 ? COLORS.darkGreen : COLORS.brightGreen,
                }}
              >
                {feature.icon}
              </div>

              {/* Text Content */}
              <h3 
                className="text-lg font-bold mb-2 tracking-[0.01em] transition-colors duration-150"
                style={{ color: COLORS.textPrimary }}
              >
                {feature.title}
              </h3>
              <p 
                className="text-sm leading-relaxed"
                style={{ color: COLORS.textSecondary }}
              >
                {feature.description}
              </p>

              {/* Sharp Hover Indicator */}
              <div 
                className="absolute bottom-0 left-6 right-6 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                style={{ backgroundColor: COLORS.gold }}
              />
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA or Stat */}
        {/* <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mt-20 p-8 flex flex-col md:flex-row items-center justify-between gap-6"
          style={{ 
            backgroundColor: COLORS.darkGreen, 
            borderRadius: "8px",
            color: "#FFFFFF"
          }}
        >
          <div>
            <h4 className="text-2xl font-bold">Ready to lead your society?</h4>
            <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.7)" }}>Setup your society profile in less than 5 minutes.</p>
          </div>
          <button 
            className="px-8 py-3 font-bold text-sm tracking-wide transition-colors duration-150 hover:brightness-95"
            style={{ 
              backgroundColor: COLORS.gold, 
              color: COLORS.darkGreen,
              borderRadius: "6px",
            }}
          >
            Register a Society
          </button>
        </motion.div> */}
      </div>
    </section>
  );
};

export default FeaturesSection;
