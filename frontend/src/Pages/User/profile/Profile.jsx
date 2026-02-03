import React from "react";
import { useAuth } from "../../../context/AuthContext";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  GraduationCap,
  Hash,
  Shield,
  LayoutDashboard,
  LogOut,
  Edit3,
  BookOpen,
  Calendar,
  Award
} from "lucide-react";

function Profile() {
  const { user } = useAuth();

  if (user === undefined) {
    return (
      <div className="w-full min-h-screen flex justify-center items-center bg-[#f8f9ff]">
        <motion.div 
          animate={{ scale: [1, 1.1, 1] }} 
          transition={{ repeat: Infinity, duration: 2 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-indigo-600 font-bold tracking-widest text-xs uppercase">Initializing Portal</p>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="w-full min-h-screen flex flex-col justify-center items-center bg-[#f8f9ff] px-6">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-indigo-100 text-center max-w-sm">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Shield size={40} />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">Access Restricted</h2>
          <p className="text-gray-500 text-sm mb-8">You need to be authenticated to view this student profile.</p>
          <Link to="/login" className="block w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-900 transition-all shadow-lg shadow-indigo-100">
            Secure Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#f8f9ff]">
      {/* --- SLEEK SIDEBAR --- */}
      <aside className="w-72 bg-white border-r border-gray-100 hidden lg:flex flex-col p-8">
        <div className="flex items-center gap-3 px-2 mb-12">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <GraduationCap size={24} />
          </div>
          <span className="text-xl font-black text-gray-900 tracking-tighter">CampusLink</span>
        </div>

        <nav className="flex-1 space-y-2">
          <NavItem icon={<LayoutDashboard size={18} />} label="Dashboard" />
          <NavItem icon={<User size={18} />} label="My Profile" active />
          <NavItem icon={<BookOpen size={18} />} label="Courses" />
          <NavItem icon={<Award size={18} />} label="Certificates" />
        </nav>

        <div className="pt-6 border-t border-gray-50">
          <button className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all font-bold text-sm">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div>
              <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Student Profile</h1>
              <p className="text-gray-400 text-sm font-medium">Manage your academic identity and personal details.</p>
            </div>
            <Link 
              to="/edit-profile" 
              className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-100 rounded-2xl text-gray-700 font-bold text-sm shadow-sm hover:shadow-md transition-all hover:border-indigo-600"
            >
              <Edit3 size={16} className="text-indigo-600" /> Edit Profile
            </Link>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: ID Card & Status */}
            <div className="lg:col-span-1 space-y-8">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-linear-to-br from-indigo-700 to-purple-800 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-indigo-200 relative overflow-hidden"
              >
                <div className="relative z-10">
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center mb-6">
                    <User size={40} className="text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-1">{user.fullname}</h3>
                  <p className="text-indigo-100 text-xs font-black uppercase tracking-widest opacity-80 mb-6">{user.role}</p>
                  
                  <div className="space-y-4 pt-6 border-t border-white/10">
                    <div className="flex justify-between text-sm">
                      <span className="text-indigo-200 font-medium">Status</span>
                      <span className="font-bold flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" /> Active
                      </span>
                    </div>
                  </div>
                </div>
                {/* Abstract Background Decoration */}
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
              </motion.div>

              <div className="bg-white rounded-4xl p-8 border border-gray-100 shadow-sm">
                <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6">Quick Stats</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-2xl text-center">
                    <p className="text-2xl font-black text-indigo-600">3.8</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">GPA</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-2xl text-center">
                    <p className="text-2xl font-black text-indigo-600">{user.semester || '1'}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Semester</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Information Bento Grid */}
            <div className="lg:col-span-2">
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-10">
                  <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
                    <Shield size={18} />
                  </div>
                  <h2 className="text-xl font-black text-gray-900">Personal Information</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <InfoItem icon={<User size={18} />} label="Full Name" value={user.fullname} />
                  <InfoItem icon={<Mail size={18} />} label="Email Address" value={user.email} />
                  {user.rollNo && (
                    <InfoItem icon={<Hash size={18} />} label="University ID" value={user.rollNo} />
                  )}
                  {user.Department && (
                    <InfoItem icon={<GraduationCap size={18} />} label="Department" value={user.Department} />
                  )}
                  {user.semester && (
                    <InfoItem icon={<Calendar size={18} />} label="Current Semester" value={`${user.semester}th Semester`} />
                  )}
                  <InfoItem icon={<Shield size={18} />} label="Account Type" value={user.role} capitalize />
                </div>
              </motion.div>
              
              {/* Optional Bottom Section */}
              <div className="mt-8 p-6 bg-indigo-50 rounded-4xl border border-indigo-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm">
                      <Award size={24} />
                   </div>
                   <div>
                      <p className="text-sm font-black text-indigo-900">Academic Standing</p>
                      <p className="text-xs text-indigo-700 font-medium">Your profile is currently in good standing.</p>
                   </div>
                </div>
                <button className="text-xs font-black text-indigo-600 uppercase tracking-widest hover:underline">View History</button>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

// Sub-components for cleaner code
function NavItem({ icon, label, active }) {
  return (
    <div
      className={`flex items-center gap-4 px-6 py-4 rounded-2xl cursor-pointer transition-all duration-300 font-bold text-sm ${
        active 
          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" 
          : "text-gray-400 hover:text-indigo-600 hover:bg-indigo-50"
      }`}
    >
      {icon}
      <span>{label}</span>
    </div>
  );
}

function InfoItem({ icon, label, value, capitalize }) {
  return (
    <div className="group">
      <div className="flex items-center gap-3 mb-2">
        <div className="text-indigo-400 group-hover:text-indigo-600 transition-colors">
          {icon}
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{label}</p>
      </div>
      <p className={`text-sm font-bold text-gray-800 ml-8 ${capitalize ? "capitalize" : ""}`}>
        {value || "Not Provided"}
      </p>
    </div>
  );
}

export default Profile;