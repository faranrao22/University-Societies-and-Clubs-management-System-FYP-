import React, { useState } from "react";
import { Facebook, Linkedin, Instagram, Twitter, Mail, Send, MapPin, Phone, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import shape from "../images/footer-shape-1.png";

function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState("");

  const handleSubscribe = () => {
    setError("");
    if (!email) return setError("Please enter your email");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return setError("Please enter a valid email");

    setSubscribed(true);
    setTimeout(() => {
      setEmail("");
      setSubscribed(false);
    }, 3000);
  };

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Twitter, href: "#", label: "Twitter" },
  ];

  const quickLinks = [
    { name: "Home", href: "/" },
    { name: "Societies", href: "/community" },
    { name: "News", href: "/society-posts" },
    { name: "Events", href: "/events" },
    { name: "Contact", href: "/contact" },
  ];

  const resources = [
    { name: "FAQ", href: "#" },
    { name: "Support", href: "#" },
    { name: "Privacy Policy", href: "#" },
    { name: "Terms & Conditions", href: "#" },
  ];

  return (
    <footer className="relative overflow-hidden bg-[#0f172a] text-white">
      {/* Left-side shape - Original image, unchanged */}
      <img
        src={shape}
        alt="Footer Decorative Shape"
        className="md:block hidden absolute md:left-0 xl:left-35 top-0 h-full opacity-20 pointer-events-none select-none"
        style={{
          animation: "floatLeftRight 3s ease-in-out infinite"
        }}
      />

      {/* Add this style tag inside your component or globally in index.css */}
      <style>
        {`
    @keyframes floatLeftRight {
      0%, 100% { transform: translateX(0); }
      50% { transform: translateX(20px); }
    }
  `}
      </style>


      <div className="relative mx-auto max-w-6xl px-6 py-10 md:px-8 lg:px-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

          {/* Brand Section */}
          <div className="space-y-4">
            <Link to="/" className="flex flex-col focus:outline-none">
              <h1 className="text-3xl md:text-4xl font-black flex items-center gap-1">
                US<span className="text-[#38bdf8]">CMS</span>
              </h1>
              <div className="md:w-1/2 w-1/3 h-[2.5px] bg-[#38bdf8]/60 rounded-full mt-[-2px]" />
            </Link>

            <p className="text-white/90 text-sm leading-relaxed">
              University Society & Event Management System to help students connect, participate, and grow through campus societies and events.
            </p>

            <div className="space-y-1.5 text-white/70 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#38bdf8]" />
                University Campus, Main Building
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#38bdf8]" />
                +1 (555) 123-4567
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#38bdf8]" />
                info@uscms.edu
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              {socialLinks.map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  aria-label={social.label}
                  className="p-2.5 rounded-full bg-white text-gray-700 hover:bg-[#38bdf8] hover:text-[#0f172a] transition-all duration-300 shadow"
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-3 relative inline-block">
              Quick Links
              <span className="absolute -bottom-1 left-0 w-12 h-0.5 bg-[#38bdf8]"></span>
            </h3>
            <ul className="space-y-1.5">
              {quickLinks.map((link, i) => (
                <li key={i}>
                  <a
                    href={link.href}
                    className="text-white/90 hover:text-[#D4A017] transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-lg font-semibold mb-3 relative inline-block">
              Resources
              <span className="absolute -bottom-1 left-0 w-12 h-0.5 bg-[#D4A017]"></span>
            </h3>
            <ul className="space-y-1.5">
              {resources.map((link, i) => (
                <li key={i}>
                  <a
                    href={link.href}
                    className="text-white/90 hover:text-[#D4A017] transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-semibold mb-3 relative inline-block">
              Stay Updated
              <span className="absolute -bottom-1 left-0 w-12 h-0.5 bg-[#D4A017]"></span>
            </h3>
            <p className="text-white/90 text-sm mb-2.5 leading-relaxed">
              Subscribe to get the latest news and updates about campus events and society activities.
            </p>

            {subscribed ? (
              <div className="bg-[#D4A017]/15 border border-[#D4A017]/30 rounded-xl p-2.5 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#D4A017] shrink-0" />
                <span className="text-white text-sm font-medium">Successfully subscribed!</span>
              </div>
            ) : (
              <div className="space-y-1.5">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-3 py-2 border border-white/20 rounded-xl focus:ring-2 focus:ring-[#D4A017] focus:border-transparent outline-none text-white placeholder-white/50 transition-all text-sm"
                />
                {error && <p className="text-red-400 text-xs">{error}</p>}
                <button
                  onClick={handleSubscribe}
                  className="w-full px-3 py-2 bg-[#D4A017] text-white rounded-xl cursor-pointer hover:scale-105 hover:brightness-110 transition-all duration-300 shadow flex items-center justify-center gap-2 font-medium text-sm"
                >
                  <Send className="w-4 h-4" />
                  Subscribe
                </button>

              </div>
            )}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/15 pt-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-2">
            <p className="text-white/70 text-sm text-center md:text-left">
              © {new Date().getFullYear()} USCMS. All rights reserved.
            </p>
            <div className="flex items-center gap-3 text-white/70 text-sm">
              <a href="#" className="hover:text-[#D4A017] transition-colors">Privacy Policy</a>
              <span>|</span>
              <a href="#" className="hover:text-[#D4A017] transition-colors">Terms of Service</a>
              <span>|</span>
              <a href="#" className="hover:text-[#D4A017] transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;