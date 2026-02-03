import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, ShieldCheck } from "lucide-react";
import API_BASE_URL from "../../../config/api.config";

const statusMap = {
  APPLICATIONS_OPEN: { label: "Applications Open", color: "bg-green-100 text-green-700" },
  VOTING_SCHEDULED: { label: "Voting Scheduled", color: "bg-purple-100 text-purple-700" },
};

export default function ElectionListPage() {
  const navigate = useNavigate();
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchElections();
  }, []);

  const fetchElections = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/election/allElections`);
      const filtered = (res.data.data || []).filter(
        (e) => ["APPLICATIONS_OPEN", "VOTING_SCHEDULED"].includes(e.status)
      );
      setElections(filtered);
    } catch (err) {
      console.error("Error fetching elections:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "TBA";
    return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck className="text-indigo-600" size={20} />
            <span className="bg-indigo-50 px-2 py-1 rounded-full text-indigo-700 font-bold uppercase tracking-widest text-xs shadow-sm">Secure Portal</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-8">Society Elections</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {elections.map((election) => {
              const start = formatDate(election.startDate);
              const end = formatDate(election.endDate);
              const statusInfo = statusMap[election.status];
              return (
                <motion.div
                  layout
                  key={election._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-4xl p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col"
                >
                  <div className="flex justify-between mb-6">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black tracking-tighter uppercase ${statusInfo.color}`}>{statusInfo.label}</span>
                    <Clock size={16} className="text-gray-300 transition-colors" />
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{election.title}</h3>

                  <div className="space-y-4 mb-8 grow">
                    <div className="flex items-center gap-2 text-gray-500 text-xs font-semibold">
                      <Calendar size={14} className="text-indigo-600" /> {start} - {end}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {election.roles.map((r) => (
                        <span key={r} className="text-[9px] font-bold px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full uppercase">{r}</span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-auto">
                    {election.status === "APPLICATIONS_OPEN" && (
                      <button
                        onClick={() => navigate(`/apply/${election._id}`)}
                        className="w-full py-4 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-3xl font-bold text-sm uppercase tracking-widest shadow-lg hover:scale-105 transition-all"
                      >
                        Apply Now
                      </button>
                    )}
                    {election.status === "VOTING_SCHEDULED" && (
                      <button disabled className="w-full py-4 bg-gray-200 text-gray-400 rounded-3xl font-bold text-sm uppercase tracking-widest">Voting Scheduled</button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
