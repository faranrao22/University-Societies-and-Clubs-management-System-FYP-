import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "./NotificationBell";

function Navbar() {
  const { user, logout } = useAuth();

  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const dropdownRef = useRef(null);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Societies", path: "/community" },
    { name: "News", path: "/society-posts" },
    { name: "Events", path: "/events" },
    { name: "Elections", path: "/applyForElections" },
    { name: "Contact Us", path: "/contact" },
  ];

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-500 ease-out ${
        scrolled ? "bg-white shadow-lg transform translate-y-0" : "bg-white shadow-sm"
      }`}
      style={{ animation: scrolled ? "slideDown 0.5s ease-out" : "none" }}
    >
      <style>{`
        @keyframes slideDown {
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>

      <div className="px-0 py-2">
        <div className="flex justify-between items-center h-[72px]">
          
          {/* LOGO - Same structure, only colors updated */}
          <Link
            to="/"
            className="relative flex items-center h-[89px] w-[55%] md:w-[30%] lg:w-[25%] xl:w-[30%]"
          >
            <div
              className="absolute inset-0 bg-gradient-to-r from-[#1e3a8a] via-[#1d4ed8] to-[#0ea5e9]"
              style={{ clipPath: "polygon(0% 0%, 100% 0%, 93% 100%, 0% 100%)" }}
            />
            <div className="relative pl-10 md:pl-12 lg:pl-20 2xl:pl-86">
              <h1 className="text-3xl md:text-3xl lg:text-4xl font-black text-white">
                US<span className="text-[#38bdf8]/90">CMS</span>
              </h1>
              <div className="w-full h-[2px] bg-[#38bdf8]/60 rounded-full -mt-1" />
            </div>
          </Link>

          {/* Nav Links - Same structure, only colors updated */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="px-2 lg:px-4 py-2 text-[13px] lg:text-sm font-medium text-[#4B5563] hover:text-[#1d4ed8] relative group whitespace-nowrap"
              >
                {link.name}
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-[#1d4ed8] to-[#0ea5e9] group-hover:w-3/4 transition-all" />
              </Link>
            ))}
          </div>

          {/* RIGHT SIDE - Same structure, only colors updated */}
          <div className="hidden md:flex items-center gap-3 pr-4 lg:pr-6 2xl:pr-84 relative" ref={dropdownRef}>
            {user ? (
              <>
                <NotificationBell buttonClassName="hover:bg-[#eef2f7]" />
                <button
                  onClick={() => setProfileOpen((prev) => !prev)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#eef2f7] transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#1e3a8a] via-[#1d4ed8] to-[#0ea5e9] text-white flex items-center justify-center font-semibold">
                    {user.fullname.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-[#4B5563] hidden lg:block">
                    {user.fullname.split(" ")[0]}
                  </span>
                  <svg className={`w-4 h-4 transition-transform ${profileOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-2xl border overflow-hidden">
                    <div className="bg-gradient-to-r from-[#1e3a8a] to-[#0ea5e9] px-4 py-3 text-white">
                      <p className="text-sm font-semibold">{user.fullname}</p>
                      <p className="text-xs opacity-80">{user.email}</p>
                    </div>
                    <div className="py-1">
                      <Link to="/profile" onClick={() => setProfileOpen(false)} className="block px-4 py-2 text-sm hover:bg-[#eef2f7]">Profile</Link>
                      <button onClick={() => { logout(); setProfileOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">Logout</button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <Link to="/login">
                <button className="px-6 lg:px-8 py-2.5 lg:py-3.5 text-sm font-semibold text-white bg-[#1d4ed8] rounded-lg shadow-md hover:brightness-110">
                  Login
                </button>
              </Link>
            )}
          </div>

          {/* Hamburger - Same structure, only colors updated */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 mr-4 rounded-md hover:bg-[#eef2f7]"
          >
            <svg className="w-6 h-6 text-[#4B5563]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu (Phone Only) - Same structure, only colors updated */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t py-4 px-6 space-y-4 shadow-xl">
          {navLinks.map((link) => (
            <Link key={link.name} to={link.path} onClick={() => setMobileMenuOpen(false)} className="block text-[#4B5563] font-medium">
              {link.name}
            </Link>
          ))}
          {user && (
            <div className="flex items-center justify-between gap-3 border-t border-gray-100 pt-4">
              <span className="text-sm font-medium text-[#4B5563]">Notifications</span>
              <NotificationBell buttonClassName="hover:bg-[#eef2f7]" />
            </div>
          )}
          {!user && (
            <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block w-full py-3 bg-[#1d4ed8] text-white text-center rounded-lg">
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;