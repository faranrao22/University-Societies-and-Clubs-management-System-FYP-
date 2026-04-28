import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "./NotificationBell";

function Navbar() {
  const { user, logout } = useAuth();

  const userRole = (user?.role || "user").toLowerCase();
  const showStudentProfileNav = Boolean(user) && userRole === "user";

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

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [mobileMenuOpen]);

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

          {/* Right cluster: bell + hamburger (mobile), bell + profile + login (md+) */}
          <div className="flex shrink-0 items-center justify-end gap-0.5 pr-2 sm:gap-1 sm:pr-3 md:gap-3 md:pr-4 lg:pr-6 2xl:pr-84">
            {user ? (
              <>
                <NotificationBell buttonClassName="hover:bg-[#eef2f7]" />
                <div className="relative hidden md:flex items-center" ref={dropdownRef}>
                  <button
                    type="button"
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
                        {showStudentProfileNav && (
                          <Link to="/profile" onClick={() => setProfileOpen(false)} className="block px-4 py-2 text-sm hover:bg-[#eef2f7]">
                            Profile
                          </Link>
                        )}
                        <button type="button" onClick={() => { logout(); setProfileOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">Logout</button>
                      </div>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden flex h-10 w-10 shrink-0 items-center justify-center rounded-lg hover:bg-[#eef2f7]"
                  aria-expanded={mobileMenuOpen}
                  aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                >
                  <svg className="h-6 w-6 text-[#4B5563]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {mobileMenuOpen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                    )}
                  </svg>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden md:inline-flex items-center justify-center px-6 lg:px-8 py-2.5 lg:py-3.5 text-sm font-semibold text-white bg-[#1d4ed8] rounded-lg shadow-md hover:brightness-110"
                >
                  Login
                </Link>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden flex h-10 w-10 shrink-0 items-center justify-center rounded-lg hover:bg-[#eef2f7]"
                  aria-expanded={mobileMenuOpen}
                  aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                >
                  <svg className="h-6 w-6 text-[#4B5563]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {mobileMenuOpen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                    )}
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile drawer: slides in from the right */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.button
              key="mobile-nav-backdrop"
              type="button"
              layout={false}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="md:hidden fixed inset-0 z-[100] bg-black/45 backdrop-blur-[2px]"
              aria-label="Close menu"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              key="mobile-nav-panel"
              layout={false}
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.34, ease: [0.32, 0.72, 0, 1] }}
              className="md:hidden fixed top-0 right-0 z-[110] flex h-full w-[min(100%,20rem)] max-w-[85vw] flex-col bg-white shadow-[-12px_0_40px_rgba(15,23,42,0.12)]"
            >
              <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-5 py-4">
                <span className="text-sm font-semibold tracking-wide text-[#111827]">Menu</span>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg p-2 text-[#4B5563] transition-colors hover:bg-[#eef2f7]"
                  aria-label="Close menu"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <nav className="flex flex-1 flex-col overflow-y-auto overscroll-contain px-5 py-5">
                <div className="flex flex-col gap-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.name}
                      to={link.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className="rounded-lg px-3 py-3 text-[15px] font-medium text-[#4B5563] transition-colors hover:bg-[#eef2f7] hover:text-[#1d4ed8]"
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>
                {showStudentProfileNav && (
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="mt-6 rounded-lg border-t border-gray-100 px-3 pt-6 text-[15px] font-medium text-[#4B5563] transition-colors hover:bg-[#eef2f7] hover:text-[#1d4ed8]"
                  >
                    Profile
                  </Link>
                )}
                {user && (
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="mt-6 w-full rounded-lg border border-red-200 py-3 text-center text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
                  >
                    Logout
                  </button>
                )}
                {!user && (
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="mt-8 block w-full rounded-lg bg-[#1d4ed8] py-3 text-center text-sm font-semibold text-white shadow-md transition-[filter] hover:brightness-110"
                  >
                    Login
                  </Link>
                )}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}

export default Navbar;