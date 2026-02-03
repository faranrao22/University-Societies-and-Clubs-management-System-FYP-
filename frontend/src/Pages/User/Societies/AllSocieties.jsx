import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, Search, Info, Sparkles, 
  ArrowRight, Globe, Loader2 
} from "lucide-react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast"; // Ensure react-hot-toast is installed
import API_BASE_URL from "../../../config/api.config";

const AllSocieties = () => {
  const [societies, setSocieties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState(null); // Track which society is currently being joined
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", "Science", "Arts", "Tech", "Culture", "Sports"];

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/societies/Allsocieties`, { withCredentials: true });
        setSocieties(res.data.data || []);
      } catch (err) {
        console.error("Fetch error:", err);
        toast.error("Failed to load societies");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // --- IMPLEMENTED JOIN LOGIC ---
  const handleJoinSociety = async (societyId) => {
    setJoiningId(societyId);
    try {
      // Endpoint matches your route: router.post('/join/:id', verifyToken, requestToJoinSociety);
      const res = await axios.post(
        `${API_BASE_URL}/memberShip/join/${societyId}`, 
        {}, // Empty body
        { withCredentials: true }
      );

      if (res.data.success) {
        toast.success(res.data.message || "Join request sent!");
      } else {
        toast.error(res.data.message || "Could not send request");
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Error joining society";
      toast.error(errorMsg);
      console.error("Error joining society:", err);
    } finally {
      setJoiningId(null);
    }
  };

  const filteredSocieties = societies.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "All" || s.department === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#f8f9ff]">
      {/* --- HERO SECTION (Remains same) --- */}
      <section className="relative pt-32 pb-48 bg-[#0a0118] overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] -mr-20 -mt-20" />
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-indigo-300 text-xs font-black uppercase tracking-widest mb-6">
              <Sparkles size={14} /> University Ecosystem
            </span>
            <h1 className="text-5xl md:text-7xl font-black text-white mb-6">
              Discover Your <span className="text-indigo-400">Passion.</span>
            </h1>
            <div className="max-w-2xl mx-auto relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500" size={22} />
              <input 
                type="text"
                placeholder="Search societies..."
                className="w-full pl-16 pr-6 py-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-4xl text-white outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all"
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- GRID SECTION --- */}
      <section className="max-w-7xl mx-auto px-6 -mt-20 relative z-20 pb-24">
        
        {/* Category Filters (Remains same) */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                activeCategory === cat ? "bg-indigo-600 text-white shadow-xl shadow-indigo-200" : "bg-white text-gray-500 border border-gray-100 shadow-sm"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[1, 2, 3].map(i => <div key={i} className="h-[450px] bg-white rounded-[2.5rem] animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            <AnimatePresence>
              {filteredSocieties.map((item, idx) => (
                <motion.div
                  key={item._id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="group bg-white rounded-[2.5rem] p-5 shadow-sm hover:shadow-2xl border border-gray-100 flex flex-col h-full transition-all duration-500"
                >
                  {/* Society Image */}
                  <div className="relative w-full h-56 rounded-4xl overflow-hidden mb-6">
                    <img 
                      src={`http://localhost:8000/uploads/${item.image}`}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                      onError={(e) => e.target.src = "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800"}
                    />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black text-indigo-600 uppercase tracking-widest shadow-sm">
                      {item.department || "General"}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="grow px-2">
                    <div className="flex items-center gap-2 mb-2 text-gray-400">
                      <Globe size={14} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">{item.joinPolicy?.replace('_', ' ') || 'OPEN'}</span>
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 mb-2">{item.name}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 mb-6">
                      {item.description || "Become part of this amazing community and start your journey today."}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3 mt-auto">
                    <div className="flex items-center gap-2 mb-4 px-2">
                      <Users size={16} className="text-indigo-500" />
                      <span className="text-xs font-bold text-gray-700">{item.members?.length || 0} Members</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {/* JOIN BUTTON */}
                      <button 
                        onClick={() => handleJoinSociety(item._id)}
                        disabled={joiningId === item._id}
                        className={`py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 group/join shadow-lg ${
                          joiningId === item._id 
                          ? "bg-gray-200 text-gray-500 cursor-not-allowed shadow-none" 
                          : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-100"
                        }`}
                      >
                        {joiningId === item._id ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <>
                            Join Now
                            <ArrowRight size={16} className="group-hover/join:translate-x-1 transition-transform" />
                          </>
                        )}
                      </button>
                      
                      <button className="py-4 bg-white border-2 border-gray-100 hover:border-indigo-600 hover:text-indigo-600 text-gray-600 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2">
                        Details
                        <Info size={16} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>
    </div>
  );
};

export default AllSocieties;