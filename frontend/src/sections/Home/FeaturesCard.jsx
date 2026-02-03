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

const FeaturesSection = () => {
  const features = [
    {
      icon: <Users size={24} />,
      title: "Vibrant Societies",
      description: "Browse curated student organizations. Filter by interest, join recruitment drives, and manage your memberships in one place.",
      color: "from-blue-500 to-cyan-400",
    },
    {
      icon: <Calendar size={24} />,
      title: "Smart Event Tracking",
      description: "Sync campus workshops, seminars, and fests directly to your personal calendar with automated RSVP reminders.",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: <Trophy size={24} />,
      title: "Election Portal",
      description: "Transparent digital voting and candidate profiles. Run for office or vote for your next student representatives securely.",
      color: "from-amber-500 to-orange-400",
    },
    {
      icon: <ShieldCheck size={24} />,
      title: "Verified Certifications",
      description: "Earn digital certificates for society participation and event attendance, verifiable by recruiters via QR codes.",
      color: "from-emerald-500 to-teal-400",
    },
    {
      icon: <Zap size={24} />,
      title: "Instant Notifications",
      description: "Get real-time updates on venue changes, emergency announcements, and last-minute society meeting calls.",
      color: "from-red-500 to-rose-400",
    },
    {
      icon: <BarChart3 size={24} />,
      title: "Resource Analytics",
      description: "Society leads can track attendance, budget utilization, and engagement metrics through a dedicated dashboard.",
      color: "from-indigo-500 to-purple-400",
    },
  ];

  return (
    <section className="py-24 px-6 bg-[#fcfcfd]">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-indigo-600 font-bold tracking-widest uppercase text-sm"
          >
            Efficiency Redefined
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-black text-gray-900 mt-4 mb-6 tracking-tight"
          >
            Everything you need to <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-600 to-purple-600">thrive on campus.</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-600 leading-relaxed"
          >
            USCMS provides the digital infrastructure to bridge the gap between 
            students, societies, and university administration.
          </motion.p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              className="group relative p-8 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300"
            >
              {/* Icon Background Circle */}
              <div className={`w-14 h-14 rounded-2xl bg-linear-to-br ${feature.color} flex items-center justify-center text-white mb-6 shadow-lg transform group-hover:rotate-6 transition-transform duration-300`}>
                {feature.icon}
              </div>

              {/* Text Content */}
              <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-indigo-600 transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-500 leading-relaxed text-sm italic md:not-italic">
                {feature.description}
              </p>

              {/* Subtle Decorative Element */}
              <div className="absolute bottom-4 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-8 h-1 bg-indigo-100 rounded-full" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA or Stat */}
        {/* <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mt-20 p-8 rounded-[2rem] bg-indigo-600 text-white flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div>
            <h4 className="text-2xl font-bold">Ready to lead your society?</h4>
            <p className="text-indigo-100">Setup your society profile in less than 5 minutes.</p>
          </div>
          <button className="px-8 py-4 bg-white text-indigo-600 font-bold rounded-2xl hover:bg-indigo-50 transition-colors shadow-xl">
            Register a Society
          </button>
        </motion.div> */}
      </div>
    </section>
  );
};

export default FeaturesSection;