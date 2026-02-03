import React from "react";
import { motion } from "framer-motion";
import { 
  Target, 
  Users, 
  ShieldCheck, 
  Zap, 
  Globe, 
  Award,
  ArrowUpRight
} from "lucide-react";

// --- ANIMATION VARIANTS ---
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" }
  })
};

const About = () => {
  const stats = [
    { label: "Active Societies", value: "50+", icon: <Award className="text-indigo-400" /> },
    { label: "Student Members", value: "5,000+", icon: <Users className="text-purple-400" /> },
    { label: "Events Hosted", value: "200+", icon: <Zap className="text-yellow-400" /> },
    { label: "Global Partners", value: "12", icon: <Globe className="text-blue-400" /> },
  ];

  const values = [
    {
      title: "Inclusivity",
      desc: "Creating a space where every voice is heard and every culture is celebrated.",
      icon: <Users size={24} />,
      color: "bg-blue-500"
    },
    {
      title: "Innovation",
      desc: "Empowering students to lead technical and creative breakthroughs.",
      icon: <Zap size={24} />,
      color: "bg-indigo-500"
    },
    {
      title: "Integrity",
      desc: "Building a transparent community management system based on trust.",
      icon: <ShieldCheck size={24} />,
      color: "bg-purple-500"
    }
  ];

  return (
    <div className="bg-[#fcfcfd] min-h-screen">
      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-60 bg-[#331E86] overflow-hidden">
        <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500 rounded-full blur-[120px]" />
        </div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <motion.h1 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-6xl md:text-8xl font-black text-white mb-8 tracking-tighter"
          >
            We Are <span className="text-indigo-400">The Core.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-indigo-100/70 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed"
          >
            USCMS is the pulse of campus life—a unified digital ecosystem designed 
            to streamline society management and amplify student engagement.
          </motion.p>
        </div>
      </section>

      {/* --- STATS OVERLAY --- */}
      <section className="max-w-7xl mx-auto px-6 -mt-32 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              custom={idx}
              initial="hidden"
              whileInView="visible"
              variants={fadeIn}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-indigo-900/5 border border-gray-50 flex flex-col items-center text-center group hover:bg-indigo-600 transition-all duration-500"
            >
              <div className="p-4 bg-gray-50 rounded-2xl mb-4 group-hover:bg-white/20 transition-colors">
                {stat.icon}
              </div>
              <h4 className="text-3xl font-black text-gray-900 group-hover:text-white mb-1">{stat.value}</h4>
              <p className="text-xs font-bold text-gray-400 group-hover:text-indigo-100 uppercase tracking-widest">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* --- MISSION SECTION --- */}
      <section className="py-32 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-20">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:w-1/2"
          >
            <span className="text-indigo-600 font-black uppercase tracking-[0.3em] text-xs mb-4 block">Our Mission</span>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-8 leading-tight tracking-tight">
              Bridging the gap between <span className="text-indigo-600">Passion</span> and <span className="text-purple-600">Action.</span>
            </h2>
            <p className="text-gray-500 text-lg leading-relaxed mb-8">
              Founded in 2024, our platform was built to solve a single problem: the disconnection 
              between student talent and campus opportunities. We provide the tools for 
              societies to scale and students to flourish.
            </p>
            <div className="flex gap-4">
               <button className="px-8 py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-indigo-600 transition-all">Get Started</button>
               <button className="px-8 py-4 border-2 border-gray-100 rounded-2xl font-bold hover:border-indigo-600 transition-all">Our Team</button>
            </div>
          </motion.div>

          {/* Core Values Grid */}
          <div className="lg:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {values.map((v, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className={`p-8 rounded-4xl text-white ${v.color} ${i === 1 ? 'sm:row-span-2 flex flex-col justify-center' : ''} shadow-lg shadow-indigo-200`}
              >
                <div className="bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                  {v.icon}
                </div>
                <h3 className="text-2xl font-black mb-4">{v.title}</h3>
                <p className="text-white/80 leading-relaxed text-sm">
                  {v.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="px-6 pb-32">
        <motion.div 
          whileHover={{ scale: 1.01 }}
          className="max-w-7xl mx-auto bg-linear-to-r from-indigo-700 to-purple-800 rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden shadow-2xl shadow-indigo-500/20"
        >
          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tight">Ready to join the <br/> future of campus life?</h2>
            <button className="bg-white text-indigo-900 px-10 py-5 rounded-4xl font-black text-lg flex items-center gap-3 mx-auto hover:bg-indigo-50 transition-all">
              Join a Society Now <ArrowUpRight size={24} />
            </button>
          </div>
          {/* Decorative background circle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-[100px]" />
        </motion.div>
      </section>
    </div>
  );
};

export default About;