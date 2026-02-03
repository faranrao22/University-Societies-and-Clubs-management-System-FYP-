import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaGoogle,
  FaFacebookF,
  FaGithub,
  FaEye,
  FaEyeSlash,
  FaArrowRight,
  FaGraduationCap,
} from "react-icons/fa";

function Login() {
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    password: "",
    rollNo: "",
    Department: "",
    semester: "",
  });

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setError("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        const data = await login(formData.email, formData.password);
        const role = data.user?.role || "user";
        if (role === "admin") navigate("/admin");
        else if (role === "manager") navigate("/manager");
        else navigate("/");
      } else {
        await signup(
          formData.fullname,
          formData.email,
          formData.password,
          formData.rollNo,
          formData.Department,
          formData.semester
        );
        alert("Signup successful! Please login.");
        setIsLogin(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f2f5] p-4">
      <div className="w-full max-w-6xl bg-white rounded-4xl shadow-2xl overflow-hidden flex flex-col md:flex-row-reverse min-h-[750px]">
        
        {/* RIGHT SIDE – AUTH FORM */}
        <div className="w-full md:w-1/2 p-8 lg:p-16 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              {isLogin ? "Welcome Back 👋" : "Create Account"}
            </h2>
            <p className="text-gray-500 mb-8 font-medium">
              {isLogin ? "Login to your USCMS dashboard" : "Join the university society community"}
            </p>

            {/* Social Auth Buttons */}
            <div className="flex gap-3 mb-8">
              {[FaGoogle, FaFacebookF, FaGithub].map((Icon, idx) => (
                <button
                  key={idx}
                  className="flex-1 border border-gray-200 rounded-xl py-3 flex items-center justify-center hover:bg-gray-50 transition-all active:scale-95"
                >
                  <Icon className={idx === 0 ? "text-red-500" : idx === 1 ? "text-blue-600" : "text-gray-900"} />
                </button>
              ))}
            </div>

            <div className="relative mb-8 text-center">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-100"></span></div>
              <span className="relative bg-white px-4 text-xs font-semibold text-gray-400 uppercase">Or use email</span>
            </div>

            {error && (
              <div className="mb-6 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence>
                {!isLogin && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                    <input
                      type="text"
                      name="fullname"
                      placeholder="Full Name"
                      value={formData.fullname}
                      onChange={handleChange}
                      required={!isLogin}
                      className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all"
              />

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-600"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              {!isLogin && (
                <div className="space-y-4">
                  <input
                    type="text"
                    name="rollNo"
                    placeholder="Roll No"
                    value={formData.rollNo}
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="Department"
                      placeholder="Department"
                      value={formData.Department}
                      onChange={handleChange}
                      className="px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                    />
                    <input
                      type="text"
                      name="semester"
                      placeholder="Semester"
                      value={formData.semester}
                      onChange={handleChange}
                      className="px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                    />
                  </div>
                </div>
              )}

              {isLogin && (
                <div className="text-right">
                  <button type="button" className="text-sm font-semibold text-purple-600 hover:text-purple-700">Forgot Password?</button>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-purple-700 hover:bg-purple-800 disabled:bg-purple-300 text-white rounded-xl font-bold transition-all shadow-lg shadow-purple-100 flex items-center justify-center gap-2 group"
              >
                {loading ? "Please wait..." : isLogin ? "Login" : "Create Account"}
                <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
            </form>

            <p className="text-center text-gray-600 mt-8 font-medium">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <span
                onClick={toggleForm}
                className="text-purple-700 font-bold cursor-pointer hover:underline underline-offset-4"
              >
                {isLogin ? "Sign Up" : "Login"}
              </span>
            </p>
          </div>
        </div>

        {/* LEFT SIDE – BRANDING */}
        <div className="hidden md:flex w-1/2 bg-linear-to-br from-purple-700 via-indigo-700 to-indigo-900 relative items-center justify-center p-12 text-white">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
          
          <div className="relative z-10 text-center">
            <div className="mb-6 inline-flex p-5 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20">
              <FaGraduationCap size={50} />
            </div>
            <h1 className="text-6xl font-black mb-4 tracking-tighter">USCMS</h1>
            <p className="text-lg text-purple-100 font-light max-w-sm mx-auto leading-relaxed">
              University Society & Event Management System
            </p>
            <div className="mt-12 flex justify-center gap-8">
              <div className="text-center">
                <p className="text-2xl font-bold">Manage</p>
                <p className="text-xs text-purple-200 uppercase tracking-widest">Societies</p>
              </div>
              <div className="w-px h-10 bg-white/20"></div>
              <div className="text-center">
                <p className="text-2xl font-bold">Discover</p>
                <p className="text-xs text-purple-200 uppercase tracking-widest">Events</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Login;