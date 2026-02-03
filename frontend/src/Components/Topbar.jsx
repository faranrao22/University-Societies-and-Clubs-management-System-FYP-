
// ============================================
// Topbar.jsx
// ============================================
import React from "react";
import { CiMail } from "react-icons/ci";
import { MdOutlinePhoneEnabled } from "react-icons/md";
import { FaFacebook, FaInstagram, FaLinkedin, FaYoutube } from "react-icons/fa";

function Topbar() {
  const socialLinks = [
    { icon: FaFacebook, href: "#", label: "Facebook",  },
    { icon: FaInstagram, href: "#", label: "Instagram", },
    { icon: FaLinkedin, href: "#", label: "LinkedIn", },
    { icon: FaYoutube, href: "#", label: "YouTube",  },
  ];

  return (
    <div className= "bg-primary-gradient hidden md:block w-full text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-8">
          
          {/* Contact Info */}
          <div className="hidden md:flex items-center gap-5 text-xs">
            <a 
              href="mailto:admin@uscms.com" 
              className="flex items-center gap-1.5 text-white/90 hover:text-white transition-all duration-200 group"
            >
              <CiMail className="w-3.5 h-3.5 group-hover:scale-110 transition-transform duration-200" />
              <span className="text-[14px] tracking-wide">admin@uscms.com</span>
            </a>

            <div className="w-px h-3.5 bg-white/25"></div>

            <a 
              href="tel:+923019334302" 
              className="flex items-center gap-1.5 text-white/90 hover:text-white transition-all duration-200 group"
            >
              <MdOutlinePhoneEnabled className="w-3.5 h-3.5 group-hover:scale-110 transition-transform duration-200" />
              <span className="text-[14px]  tracking-wide">+92 301 933 4302</span>
            </a>
          </div>

          {/* Mobile Contact */}
          {/* <div className="md:hidden flex items-center text-xs">
            <a 
              href="mailto:admin@uscms.com" 
              className="flex items-center gap-1.5 text-white/90 hover:text-white transition-colors duration-200"
            >
              <CiMail className="w-3.5 h-3.5" />
              <span className="font-normal">Contact Us</span>
            </a>
          </div> */}

          {/* Social Links */}
          <div className="flex items-center gap-0.5">
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className={`p-1.5 rounded  hover:bg-white/15 transition-all duration-200 transform hover:scale-110`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Topbar;