import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import API_BASE_URL from "../../../config/api.config";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  MessageSquare, 
  Clock,
  Instagram,
  Twitter,
  Linkedin,
  CheckCircle2
} from "lucide-react";

// 🔹 Sober Color Tokens
const COLORS = {
  primary: "#1e3a8a",
  primaryHover: "#1d4ed8",
  accent: "#38bdf8",
  bg: "#e2e8f0",
  surface: "#FFFFFF",
  text: "#111827",
  textMuted: "#4B5563",
  border: "rgba(30, 64, 175, 0.2)",
  borderLight: "rgba(30, 64, 175, 0.1)",
};

const Contact = () => {
  const [formState, setFormState] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await axios.post(
        `${API_BASE_URL}/contact/messages`,
        {
          name: formState.name.trim(),
          email: formState.email.trim(),
          message: formState.message.trim(),
        },
        { headers: { "Content-Type": "application/json" } }
      );
      setSubmitted(true);
      setFormState({ name: "", email: "", message: "" });
      toast.success("Message sent. We will get back to you soon.");
      setTimeout(() => setSubmitted(false), 4000);
    } catch (err) {
      const msg = err.response?.data?.message || "Could not send your message. Please try again.";
      toast.error(msg);
    } finally {
      setSending(false);
    }
  };

  const contactMethods = [
    {
      icon: <Mail size={20} />,
      title: "Email",
      value: "hello@uscms.edu",
      desc: "We respond within 24 hours on business days."
    },
    {
      icon: <Phone size={20} />,
      title: "Phone",
      value: "+1 (555) 000-1234",
      desc: "Monday to Friday, 9:00 AM – 5:00 PM."
    },
    {
      icon: <MapPin size={20} />,
      title: "Office",
      value: "Student Union, Plaza 4",
      desc: "Visit us during regular campus hours."
    }
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.bg }}>
      
      {/* 🔹 Page Header - Clean & Purposeful */}
      <header className="py-12 px-6 border-b" style={{ backgroundColor: COLORS.surface, borderColor: COLORS.borderLight }}>
        <div className="max-w-6xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md mb-4" style={{ backgroundColor: "rgba(27, 77, 40, 0.08)" }}>
            <MessageSquare size={14} style={{ color: COLORS.accent }} />
            <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: COLORS.primary }}>
              Contact Us
            </span>
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: COLORS.text }}>
            Get in Touch
          </h1>
          <p className="text-sm max-w-2xl" style={{ color: COLORS.textMuted }}>
            Have questions about a society or want to start your own? Our team is here to help you navigate your student journey.
          </p>
        </div>
      </header>

      {/* 🔹 Main Content - Two Column Layout */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* LEFT: Contact Form */}
          <div className="lg:col-span-7">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="rounded-xl border p-6 md:p-8"
              style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}
            >
              <h2 className="text-xl font-semibold mb-6" style={{ color: COLORS.text }}>
                Send us a message
              </h2>
              
              {submitted ? (
                <div 
                  className="p-6 rounded-lg text-center"
                  style={{ backgroundColor: "rgba(27, 77, 40, 0.08)", borderColor: COLORS.border }}
                >
                  <CheckCircle2 className="w-10 h-10 mx-auto mb-3" style={{ color: COLORS.primary }} />
                  <p className="font-medium mb-1" style={{ color: COLORS.text }}>Message sent successfully</p>
                  <p className="text-sm" style={{ color: COLORS.textMuted }}>We'll get back to you within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-xs font-medium" style={{ color: COLORS.textMuted }}>
                        Full Name <span style={{ color: "#DC2626" }}>*</span>
                      </label>
                      <input 
                        type="text" 
                        required
                        placeholder="John Doe"
                        value={formState.name}
                        onChange={(e) => setFormState({...formState, name: e.target.value})}
                        className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-colors"
                        style={{ 
                          backgroundColor: COLORS.bg,
                          border: `1px solid ${COLORS.border}`,
                          color: COLORS.text
                        }}
                        onFocus={(e) => e.target.style.borderColor = COLORS.primary}
                        onBlur={(e) => e.target.style.borderColor = COLORS.border}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-medium" style={{ color: COLORS.textMuted }}>
                        Email Address <span style={{ color: "#DC2626" }}>*</span>
                      </label>
                      <input 
                        type="email" 
                        required
                        placeholder="john@example.com"
                        value={formState.email}
                        onChange={(e) => setFormState({...formState, email: e.target.value})}
                        className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-colors"
                        style={{ 
                          backgroundColor: COLORS.bg,
                          border: `1px solid ${COLORS.border}`,
                          color: COLORS.text
                        }}
                        onFocus={(e) => e.target.style.borderColor = COLORS.primary}
                        onBlur={(e) => e.target.style.borderColor = COLORS.border}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-xs font-medium" style={{ color: COLORS.textMuted }}>
                      Your Message <span style={{ color: "#DC2626" }}>*</span>
                    </label>
                    <textarea 
                      rows={5}
                      required
                      minLength={10}
                      maxLength={8000}
                      placeholder="Tell us how we can help..."
                      value={formState.message}
                      onChange={(e) => setFormState({...formState, message: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-colors resize-none"
                      style={{ 
                        backgroundColor: COLORS.bg,
                        border: `1px solid ${COLORS.border}`,
                        color: COLORS.text
                      }}
                      onFocus={(e) => e.target.style.borderColor = COLORS.primary}
                      onBlur={(e) => e.target.style.borderColor = COLORS.border}
                    />
                  </div>
                  
                  <button 
                    type="submit"
                    disabled={sending}
                    className="w-full md:w-auto px-8 py-3 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{ backgroundColor: COLORS.primary, color: "#fff" }}
                  >
                    {sending ? "Sending…" : "Send Message"} 
                    {!sending && <Send size={14} />}
                  </button>
                </form>
              )}
            </motion.div>
          </div>

          {/* RIGHT: Contact Details & Socials */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Contact Methods */}
            {contactMethods.map((method, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.3 }}
                className="p-5 rounded-xl border flex gap-4"
                style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}
              >
                <div 
                  className="w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: "rgba(27, 77, 40, 0.08)" }}
                >
                  <span style={{ color: COLORS.primary }}>{method.icon}</span>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-0.5" style={{ color: COLORS.text }}>
                    {method.title}
                  </h4>
                  <p className="font-medium text-sm mb-1" style={{ color: COLORS.primary }}>
                    {method.value}
                  </p>
                  <p className="text-xs" style={{ color: COLORS.textMuted }}>
                    {method.desc}
                  </p>
                </div>
              </motion.div>
            ))}

            {/* Office Hours Card */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-5 rounded-xl border"
              style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}
            >
              <div className="flex items-center gap-3 mb-3">
                <Clock size={18} style={{ color: COLORS.accent }} />
                <h4 className="font-semibold text-sm" style={{ color: COLORS.text }}>Office Hours</h4>
              </div>
              <ul className="space-y-2 text-xs" style={{ color: COLORS.textMuted }}>
                <li className="flex justify-between">
                  <span>Monday – Friday</span>
                  <span className="font-medium" style={{ color: COLORS.text }}>9:00 AM – 5:00 PM</span>
                </li>
                <li className="flex justify-between">
                  <span>Saturday</span>
                  <span className="font-medium" style={{ color: COLORS.text }}>10:00 AM – 2:00 PM</span>
                </li>
                <li className="flex justify-between">
                  <span>Sunday</span>
                  <span>Closed</span>
                </li>
              </ul>
            </motion.div>

            {/* Social Connect Card - Sober Version */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="p-6 rounded-xl border"
              style={{ 
                backgroundColor: COLORS.primary, 
                borderColor: "rgba(27, 77, 40, 0.3)",
                color: "#fff"
              }}
            >
              <h4 className="font-semibold mb-3">Follow Us</h4>
              <p className="text-sm mb-4 opacity-90">
                Stay updated with the latest society events and campus news.
              </p>
              <div className="flex gap-3">
                {[
                  { icon: <Instagram size={16} />, label: "Instagram" },
                  { icon: <Twitter size={16} />, label: "Twitter" },
                  { icon: <Linkedin size={16} />, label: "LinkedIn" }
                ].map((social, i) => (
                  <a 
                    key={i}
                    href="#" 
                    aria-label={social.label}
                    className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors"
                    style={{ backgroundColor: "rgba(255,255,255,0.15)", color: "#fff" }}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </motion.div>

          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
