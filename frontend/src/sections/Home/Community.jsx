import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // Import Link
import { Users, ChevronRight, ArrowRight, Sparkles } from "lucide-react";
import API_BASE_URL from "../../config/api.config";
import { motion, AnimatePresence } from "framer-motion";

// --- ANIMATION CONFIGURATION ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 100, damping: 15 } 
  },
};

function SocietiesPreview() {
  const [societies, setSocieties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSocieties = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/societies/Allsocieties`, { credentials: 'include' });
        const data = await res.json();
        setSocieties(data.data?.slice(0, 3) || []);
      } catch (e) { 
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchSocieties();
  }, []);

  return (
    <section className="py-24 px-6 bg-[#fcfcfd] overflow-hidden">
      <div className="max-w-7xl mx-auto">
        
        {/* --- HEADER WITH DIRECTIONAL ANIMATIONS --- */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-20 gap-8">
          
          <motion.div 
            initial={{ opacity: 0, x: -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-black uppercase tracking-widest mb-4">
              <Sparkles size={14} /> Student Life
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-gray-900 leading-tight mb-4">
              Explore Our <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-600 via-purple-600 to-indigo-600">
                Societies
              </span>
            </h2>
            <p className="text-lg text-gray-500 font-medium">
              Join elite student organizations and lead the change you want to see.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* CHANGED: href -> to and Link component */}
            <Link
              to="/community" 
              className="inline-flex items-center gap-3 px-8 py-4 bg-gray-900 text-white font-bold rounded-2xl transition-shadow shadow-xl shadow-indigo-100 group"
            >
              <motion.span whileHover={{ x: -2 }} className="flex items-center gap-3">
                View All Communities
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </motion.span>
            </Link>
          </motion.div>
        </div>

        {/* --- CONTENT GRID --- */}
        <AnimatePresence mode="wait">
          {loading ? (
            <div key="loader" className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-[480px] bg-gray-100 rounded-[2.5rem] animate-pulse" />
              ))}
            </div>
          ) : (
            <motion.div 
              key="content"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
            >
              {societies.map((item) => (
                <motion.div
                  key={item._id}
                  variants={cardVariants}
                  whileHover={{ 
                    y: -15, 
                    transition: { type: "spring", stiffness: 300, damping: 20 } 
                  }}
                  className="group bg-white rounded-[2.5rem] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.02)] border border-gray-100 hover:shadow-[0_30px_60px_rgba(79,70,229,0.12)] transition-all duration-500 flex flex-col h-full"
                >
                  <div className="relative w-full h-60 rounded-4xl mb-6 overflow-hidden">
                    <img
                      src={`http://localhost:8000/uploads/${item.image}`}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                      onError={(e) => { 
                        e.target.src = "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=800"; 
                      }}
                    />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-indigo-600">
                      {item.department || "General"}
                    </div>
                  </div>

                  <div className="grow px-2">
                    <h3 className="text-2xl font-black text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">
                      {item.description || "Empowering the next generation of campus leaders."}
                    </p>
                  </div>

                  <div className="mt-8 space-y-4">
                    <div className="flex items-center justify-between px-2">
                      <div className="flex items-center gap-2 text-gray-400 font-bold text-xs uppercase">
                        <Users size={16} className="text-indigo-500" />
                        {item.members?.length || 0} Members
                      </div>
                      <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
                    </div>

                    {/* Navigation Link for Individual Society Details */}
                    <Link to={`/society/${item._id}`} className="block">
                      <button className="w-full py-4 bg-gray-50 group-hover:bg-indigo-600 text-gray-900 group-hover:text-white rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-2">
                        View Details
                        <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                      </button>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

export default SocietiesPreview;