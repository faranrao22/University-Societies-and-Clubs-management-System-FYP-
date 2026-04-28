// src/pages/student/profile/sections/ProfileSocieties.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import API_BASE_URL, { uploadFileUrl } from "../../../config/api.config";
import toast from "react-hot-toast";
import { 
  Users, Mail, Phone, MapPin, Calendar, ExternalLink, 
  Loader2, AlertCircle, Crown, UserCheck, Info, LogOut
} from "lucide-react";

export default function ProfileSocieties() {
  const { user } = useAuth();
  
  const [memberSocieties, setMemberSocieties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [leavingSocietyId, setLeavingSocietyId] = useState(null);

  useEffect(() => {
    if (!user?._id) {
      if (user === null) setError("Please log in to view your societies.");
      setLoading(false);
      return;
    }
    
    const fetchMemberSocieties = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("token");
        const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

        // ✅ Fetch ONLY societies where user is a member (with full population)
        const res = await axios.get(`${API_BASE_URL}/societies/member-societies`, {
          withCredentials: true,
          headers: authHeader
        });

        if (res.data?.success) {
          setMemberSocieties(res.data.data || []);
        } else {
          setError(res.data?.message || "Failed to load societies");
        }
      } catch (err) {
        console.error("Error fetching member societies:", err);
        setError(err.response?.data?.message || "Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchMemberSocieties();
  }, [user]);

  // ✅ Helper: Get user's role in a society
  const getUserRole = (society) => {
    if (!society.roles?.length) return "Member";
    const role = society.roles.find(
      r => r.user?._id === user._id || r.user === user._id
    );
    return role?.name || "Member";
  };

  const handleLeaveSociety = async (society) => {
    if (!society?._id) return;
    if (!window.confirm(`Leave "${society.name}"?`)) return;

    try {
      setLeavingSocietyId(society._id);
      const token = localStorage.getItem("token");
      const authHeader = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.delete(`${API_BASE_URL}/societies/${society._id}/leave`, {
        withCredentials: true,
        headers: authHeader,
      });

      if (!res.data?.success) {
        toast.error(res.data?.message || "Failed to leave society");
        return;
      }

      setMemberSocieties((prev) => prev.filter((s) => s._id !== society._id));
      toast.success("You left the society");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to leave society");
    } finally {
      setLeavingSocietyId(null);
    }
  };

  // ✅ Helper: Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric"
    });
  };

  // ✅ Loading State
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="animate-spin h-8 w-8 text-[#1e3a8a] mb-3" />
        <p className="text-sm text-gray-500">Loading your societies...</p>
      </div>
    );
  }

  // ✅ Error State
  if (error) {
    return (
      <div className="text-center py-12 bg-red-50 rounded-2xl border border-red-100">
        <AlertCircle className="w-10 h-10 mx-auto text-red-400 mb-3" />
        <p className="text-red-600 font-medium mb-2">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="text-sm text-red-700 hover:text-red-900 underline font-medium"
        >
          Retry
        </button>
      </div>
    );
  }

  // ✅ Empty State
  if (memberSocieties.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-[2rem] border border-gray-100">
        <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <h3 className="text-lg font-bold text-gray-900 mb-2">No Joined Societies</h3>
        <p className="text-gray-500 mb-6 max-w-sm mx-auto">
          You haven't joined any societies yet. Explore and connect with communities that match your interests!
        </p>
        <a 
          href="/societies" 
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1e3a8a] text-white rounded-xl font-medium shadow-md hover:brightness-110 transition"
        >
          Explore Societies <ExternalLink size={16} />
        </a>
      </div>
    );
  }

  // ✅ Detailed Society Card Component
  const SocietyDetailCard = ({ society }) => {
    const role = getUserRole(society);
    const isLeader = ["President", "Vice President", "Secretary", "Treasurer"].includes(role);
    const isLeaving = leavingSocietyId === society._id;
    
    // Get all roles with assigned users
    const assignedRoles = society.roles?.filter(r => r.user) || [];
    
    return (
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition group">
        {/* Header with Image */}
        <div className="relative h-32 bg-gradient-to-r from-[#1e3a8a] via-[#1d4ed8] to-[#38bdf8]">
          {society.image && (
            <img 
              src={uploadFileUrl(society.image)} 
              alt={society.name}
              className="w-full h-full object-cover opacity-90"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          
          {/* Role Badge */}
          <div className="absolute top-3 right-3">
            <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg
              ${isLeader ? 'bg-[#1d4ed8] text-white' : 'bg-white/90 text-[#1e3a8a]'}`}>
              {isLeader ? <Crown size={12} /> : <UserCheck size={12} />}
              {role}
            </span>
          </div>
          
          {/* Society Name Overlay */}
          <div className="absolute bottom-3 left-4 right-4">
            <h3 className="text-xl font-black text-white truncate">{society.name}</h3>
            {society.shortName && (
              <p className="text-sm text-white/80">{society.shortName}</p>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Description */}
          <div>
            <p className="text-sm text-gray-600 leading-relaxed">
              {society.description || "No description available"}
            </p>
          </div>

          {/* Key Details Grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            {/* Status */}
            <div className="flex items-center gap-2 text-gray-600">
              <div className={`w-2 h-2 rounded-full ${society.status === "Active" ? "bg-green-500" : "bg-gray-400"}`} />
              <span>{society.status || "Active"}</span>
            </div>
            
            {/* Members Count */}
            <div className="flex items-center gap-2 text-gray-600">
              <Users size={14} className="text-gray-400" />
              <span>{society.members?.length || 0} members</span>
            </div>
            
            {/* Join Policy */}
            <div className="flex items-center gap-2 text-gray-600 col-span-2">
              <Info size={14} className="text-gray-400" />
              <span>
                Join Policy: <strong className="text-gray-900">
                  {society.joinPolicy === "DEPARTMENT_ONLY" ? "Department Only" : "Open to All"}
                </strong>
              </span>
            </div>
          </div>

          {/* Contact Info */}
          {(society.email || society.phone || society.advisor) && (
            <div className="pt-3 border-t border-gray-100 space-y-2">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Contact</h4>
              
              {society.advisor && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin size={14} className="text-gray-400 flex-shrink-0" />
                  <span>Advisor: <strong className="text-gray-900">{society.advisor}</strong></span>
                </div>
              )}
              
              {society.email && (
                <a 
                  href={`mailto:${society.email}`}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#1e3a8a] transition"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Mail size={14} className="text-gray-400 flex-shrink-0" />
                  <span className="truncate">{society.email}</span>
                </a>
              )}
              
              {society.phone && (
                <a 
                  href={`tel:${society.phone}`}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#1e3a8a] transition"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Phone size={14} className="text-gray-400 flex-shrink-0" />
                  <span>{society.phone}</span>
                </a>
              )}
            </div>
          )}

          {/* Leadership Roles */}
          {assignedRoles.length > 0 && (
            <div className="pt-3 border-t border-gray-100">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Leadership</h4>
              <div className="flex flex-wrap gap-2">
                {assignedRoles.map((roleItem, idx) => (
                  <span 
                    key={idx}
                    className="px-2.5 py-1 bg-gray-50 rounded-lg text-xs text-gray-700 flex items-center gap-1"
                  >
                    {roleItem.name === "President" && <Crown size={10} className="text-amber-500" />}
                    {roleItem.name}: <strong className="text-gray-900">{roleItem.user?.fullname || "Unassigned"}</strong>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Joined Date */}
          {society.createdAt && (
            <div className="pt-3 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-500">
              <Calendar size={14} className="text-gray-400" />
              <span>Joined: {formatDate(society.createdAt)}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <div className="text-xs text-gray-500">
            {society.department && <span>Dept: {society.department}</span>}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleLeaveSociety(society)}
              disabled={isLeaving}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-xl border border-red-200 hover:bg-red-100 transition disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLeaving ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Leaving...
                </>
              ) : (
                <>
                  <LogOut size={14} />
                  Leave Society
                </>
              )}
            </button>
            <a 
              href={`/societies/${society._id}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-[#1e3a8a] bg-[#eff6ff] rounded-xl border border-[rgba(30,64,175,0.14)] hover:brightness-95 transition"
            >
              View Full Details <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-black text-gray-900">My Societies</h2>
          <p className="text-sm text-gray-500 mt-1">
            {memberSocieties.length} society{memberSocieties.length !== 1 ? 'ies' : ''} you've joined
          </p>
        </div>
        <a 
          href="/societies"
          className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#1e3a8a] bg-[#eff6ff] rounded-xl border border-[rgba(30,64,175,0.14)] hover:brightness-95 transition"
        >
          <Users size={16} /> Browse All
        </a>
      </div>
      
      {/* Societies Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {memberSocieties.map(society => (
          <SocietyDetailCard key={society._id} society={society} />
        ))}
      </div>
    </div>
  );
}