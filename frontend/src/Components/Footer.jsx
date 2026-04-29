import React from "react";
import { Facebook, Linkedin, Instagram, Twitter, Mail, MapPin, Phone } from "lucide-react";
import { Link } from "react-router-dom";

function Footer() {
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

  return (
    <footer className="bg-[#0b1220] text-white">
      <div className="h-[2px] w-full bg-gradient-to-r from-[#1e3a8a] via-[#1d4ed8] to-[#38bdf8]" />

      <div className="mx-auto max-w-6xl px-6 py-12 md:px-8 lg:px-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <Link to="/" className="inline-flex flex-col focus:outline-none">
              <h1 className="text-3xl font-black leading-none">
                US<span className="text-[#38bdf8]">CMS</span>
              </h1>
              <span className="mt-1 h-[2px] w-24 rounded-full bg-[#38bdf8]/70" />
            </Link>

            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/75">
              University Societies and Clubs Management System for better campus engagement.
            </p>

            <div className="mt-5 flex gap-2.5">
              {socialLinks.map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  aria-label={social.label}
                  className="rounded-lg border border-white/15 bg-white/5 p-2.5 text-white/85 transition hover:border-[#38bdf8]/70 hover:text-[#38bdf8]"
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-white/85">Quick Links</h3>
            <ul className="mt-4 space-y-2.5">
              {quickLinks.map((link, i) => (
                <li key={i}>
                  <Link to={link.href} className="text-sm text-white/75 transition hover:text-[#38bdf8]">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-white/85">Contact</h3>
            <div className="mt-4 space-y-3 text-sm text-white/75">
              <div className="flex items-center gap-2.5">
                <MapPin className="h-4 w-4 text-[#38bdf8]" />
                <span>Gulgash multan</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-[#38bdf8]" />
                <span>03019334302</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-[#38bdf8]" />
                <span>admin@uscms.com</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-white/10 pt-4 text-center text-sm text-white/55">
          © {new Date().getFullYear()} USCMS. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default Footer;