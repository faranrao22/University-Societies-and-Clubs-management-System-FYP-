import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  MessageSquare, 
  Clock,
  Instagram,
  Twitter,
  Linkedin
} from "lucide-react";

const Contact = () => {
  const [formState, setFormState] = useState({ name: "", email: "", message: "" });

  const contactMethods = [
    {
      icon: <Mail className="text-indigo-600" />,
      title: "Email Us",
      value: "hello@university.edu",
      desc: "Our team responds within 24 hours."
    },
    {
      icon: <Phone className="text-purple-600" />,
      title: "Call Us",
      value: "+1 (555) 000-1234",
      desc: "Mon-Fri from 9am to 5pm."
    },
    {
      icon: <MapPin className="text-pink-600" />,
      title: "Office",
      value: "Student Union, Plaza 4",
      desc: "Come say hi at our HQ."
    }
  ];

  return (
    <div className="bg-[#fcfcfd] min-h-screen">
      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-64 bg-[#0a0118] overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] -mr-40 -mt-40" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center md:text-left max-w-3xl"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-indigo-300 text-xs font-black uppercase tracking-[0.2em] mb-6">
              <MessageSquare size={14} /> Get In Touch
            </span>
            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter">
              Let's Start a <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-400 via-purple-400 to-indigo-400">
                Conversation.
              </span>
            </h1>
            <p className="text-gray-400 text-lg md:text-xl leading-relaxed">
              Have questions about a society or want to start your own? Our team is here to help you navigate your student journey.
            </p>
          </motion.div>
        </div>
      </section>

      {/* --- MAIN INTERACTION AREA --- */}
      <section className="max-w-7xl mx-auto px-6 -mt-40 relative z-20 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left: Contact Form Card */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-7 bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-indigo-900/10 border border-gray-50"
          >
            <h2 className="text-3xl font-black text-gray-900 mb-8">Send us a message</h2>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Full Name</label>
                  <input 
                    type="text" 
                    placeholder="John Doe"
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Email Address</label>
                  <input 
                    type="email" 
                    placeholder="john@example.com"
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Your Message</label>
                <textarea 
                  rows="5"
                  placeholder="Tell us how we can help..."
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all resize-none"
                ></textarea>
              </div>
              <button className="w-full md:w-auto px-10 py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-3 transition-all shadow-xl shadow-indigo-200 group">
                Send Message <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
            </form>
          </motion.div>

          {/* Right: Contact Details & Socials */}
          <div className="lg:col-span-5 space-y-8">
            {contactMethods.map((method, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white p-6 rounded-4xl border border-gray-100 shadow-xl shadow-indigo-900/5 flex gap-6 group hover:border-indigo-100 transition-all"
              >
                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  {method.icon}
                </div>
                <div>
                  <h4 className="font-black text-gray-900 text-lg mb-1">{method.title}</h4>
                  <p className="text-indigo-600 font-bold mb-1">{method.value}</p>
                  <p className="text-gray-400 text-sm">{method.desc}</p>
                </div>
              </motion.div>
            ))}

            {/* Social Connect Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-linear-to-br from-indigo-600 to-purple-700 p-8 rounded-[2.5rem] text-white overflow-hidden relative"
            >
              <div className="relative z-10">
                <h4 className="text-2xl font-black mb-4">Follow the vibe</h4>
                <p className="text-indigo-100/80 mb-6 text-sm">Stay updated with the latest society events and campus news.</p>
                <div className="flex gap-4">
                  {[<Instagram />, <Twitter />, <Linkedin />].map((icon, i) => (
                    <button key={i} className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-all backdrop-blur-md">
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
              <Clock className="absolute -bottom-4 -right-4 w-32 h-32 text-white/5 rotate-12" />
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;