import React, { useDeferredValue, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  ArrowRight,
  Globe,
  Loader2,
  BookOpen,
  Eye,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import API_BASE_URL, { uploadFileUrl } from "../../../config/api.config";
import PublicSearchInput from "../../../Components/PublicSearchInput";

const FALLBACK_SOCIETY_IMG =
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800";

// 🔹 Premium Color Tokens
const COLORS = {
  dark: "#1e3a8a",
  darkHover: "#1d4ed8",
  lightGreen: "#1d4ed8",
  gold: "#38bdf8",
  goldHover: "#0ea5e9",
  cream: "#e2e8f0",
  text: "#111827",
  muted: "#4B5563",
  border: "rgba(30, 64, 175, 0.16)",
};

const AllSocieties = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearch = useDeferredValue(searchQuery);
  const navigate = useNavigate();

  const { data: societies = [], isPending: loading } = useQuery({
    queryKey: ["public", "societies", "all"],
    queryFn: async () => {
      const res = await axios.get(`${API_BASE_URL}/societies/Allsocieties`, { withCredentials: true });
      return res.data.data || [];
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
    retry: 1,
  });

  // Memoize heavy grouping/filtering so typing and rerenders stay fast.
  const groupedSocieties = useMemo(() => {
    const q = deferredSearch.trim().toLowerCase();
    return societies.reduce((acc, society) => {
      const dept = society.department || "General / Others";
      if (!acc[dept]) acc[dept] = [];

      if (!q || society.name.toLowerCase().includes(q)) {
        acc[dept].push(society);
      }
      return acc;
    }, {});
  }, [societies, deferredSearch]);

  const departments = Object.keys(groupedSocieties).filter(
    (dept) => groupedSocieties[dept].length > 0
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.cream }}>
      <section className="max-w-6xl mx-auto px-6 py-10 md:py-12">
        <div className="mb-10 rounded-2xl border bg-white p-5 shadow-sm sm:p-6" style={{ borderColor: COLORS.border }}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-black tracking-tight sm:text-2xl" style={{ color: COLORS.text }}>
                Find your society
              </h2>
              <p className="mt-1 text-sm sm:text-base" style={{ color: COLORS.muted }}>
                Browse by department or search by society name.
              </p>
            </div>
            <PublicSearchInput
              className="w-full sm:w-[340px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by society name…"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col justify-center items-center h-80">
            <Loader2 className="animate-spin mb-4" size={40} style={{ color: COLORS.gold }} />
            <p className="text-sm font-medium" style={{ color: COLORS.muted }}>Loading societies...</p>
          </div>
        ) : (
          departments.map((dept, deptIndex) => (
            <div key={dept} className="mb-16 last:mb-0">
              {/* Department Header */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: deptIndex * 0.1 }}
                className="flex items-center gap-4 mb-7 pb-5"
                style={{ borderBottom: `2px solid ${COLORS.border}` }}
              >
                <div
                  className="p-3 rounded-xl flex items-center justify-center shadow-sm"
                  style={{
                    backgroundColor: COLORS.dark,
                    boxShadow: "0 6px 20px rgba(27, 77, 40, 0.25)",
                  }}
                >
                  <BookOpen size={22} color="#fff" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight" style={{ color: COLORS.text }}>
                    {dept}
                  </h2>
                  <p className="text-sm font-medium mt-1" style={{ color: COLORS.muted }}>
                    {groupedSocieties[dept].length}{" "}
                    {groupedSocieties[dept].length === 1 ? "society" : "societies"}
                  </p>
                </div>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-7">
                {groupedSocieties[dept].map((item) => {
                  const cardImg = uploadFileUrl(item.image) || FALLBACK_SOCIETY_IMG;
                  return (
                  <article
                    key={item._id}
                    className="group flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                    style={{
                      borderColor: COLORS.border,
                      boxShadow: "0 4px 18px rgba(15, 23, 42, 0.06)",
                    }}
                  >
                    <div className="relative h-44 overflow-hidden">
                      <img
                        src={cardImg}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500 ease-out"
                        loading="lazy"
                        onError={(e) => {
                          e.target.src = FALLBACK_SOCIETY_IMG;
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#111827]/65 via-[#111827]/15 to-transparent pointer-events-none" />

                      <div className="absolute top-3 left-3 right-3 flex justify-between items-start gap-2">
                        <span
                          className="rounded-full bg-white/95 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#1B4D28] shadow-sm"
                          style={{ backgroundColor: COLORS.gold }}
                        >
                          {item.joinPolicy || "Open"}
                        </span>
                      </div>
                    </div>

                    <div className="p-5 sm:p-6 flex flex-col grow">
                      <h3 className="mb-2 text-lg font-black leading-snug transition-colors group-hover:text-[#B8860B]" style={{ color: COLORS.text }}>
                        {item.name}
                      </h3>

                      <p className="text-sm leading-relaxed mb-5 line-clamp-3 flex-grow min-h-[3.75rem]" style={{ color: COLORS.muted }}>
                        {item.description ||
                          "Connect with members, join events, and grow skills alongside peers who share your interests."}
                      </p>

                      <div className="mb-5 flex items-center gap-5 border-t pt-4" style={{ borderColor: COLORS.border }}>
                        <div
                          className="flex items-center gap-1.5 text-sm font-semibold"
                          style={{ color: COLORS.muted }}
                        >
                          <Users size={15} style={{ color: COLORS.gold }} />
                          {item.members?.length || 0} members
                        </div>
                        <div
                          className="flex items-center gap-1.5 text-sm font-semibold truncate"
                          style={{ color: COLORS.muted }}
                          title={item.department || "General"}
                        >
                          <Globe size={15} style={{ color: COLORS.gold }} className="shrink-0" />
                          <span className="truncate">{item.department || "General"}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => navigate(`/society/${item._id}`)}
                        className="mt-auto flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all duration-200 hover:brightness-105 active:scale-[0.99]"
                        style={{
                          backgroundColor: COLORS.dark,
                          color: "#fff",
                          boxShadow: "0 8px 18px rgba(27, 77, 40, 0.2)",
                        }}
                      >
                        <Eye size={18} strokeWidth={2.25} />
                        View details now
                        <ArrowRight size={16} className="opacity-90" />
                      </button>
                    </div>
                  </article>
                  );
                })}
              </div>
            </div>
          ))
        )}

        {!loading && departments.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div 
              className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
              style={{ backgroundColor: "rgba(27, 77, 40, 0.08)" }}
            >
              <Search size={28} style={{ color: COLORS.muted }} />
            </div>
            <p className="text-base font-bold mb-2" style={{ color: COLORS.text }}>No societies found</p>
            <p className="text-sm" style={{ color: COLORS.muted }}>Try adjusting your search terms</p>
          </motion.div>
        )}
      </section>
    </div>
  );
};

export default AllSocieties;
