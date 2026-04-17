import React, { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  LayoutDashboard,
  Calendar,
  Users,
  LogOut,
  X,
  FileText,
  Vote,
  ListChecks,
  ClipboardList,
  BarChart3,
  ChevronRight,
  Layers,
  ListOrdered,
  Newspaper,
} from "lucide-react";

import { MdGroups2, MdOutlineVolunteerActivism } from "react-icons/md";
import { LuGitPullRequestArrow } from "react-icons/lu";
import { useAuth } from "../context/AuthContext";

const ACCENT = "#3699FF";

/** Sidebar `to` values are segment keys; always link with absolute `/manager/...` so navigation works from any nested URL. */
function managerNavTo(item) {
  if (!item.to) return "/manager";
  if (item.to.startsWith("/")) return item.to;
  return `/manager/${item.to}`;
}

const NAV_GROUPS = [
  {
    id: "overview",
    label: "Overview",
    items: [
      {
        label: "Home",
        icon: Home,
        to: "/",
        isActive: (p) => p === "/",
      },
      {
        label: "Dashboard",
        icon: LayoutDashboard,
        to: "dashboard",
        isActive: (p) => p === "/manager/dashboard",
      },
    ],
  },
  {
    id: "elections",
    label: "Elections",
    items: [
      {
        label: "All elections",
        icon: Layers,
        to: "all-elections",
        isActive: (p) => p === "/manager/all-elections",
      },
      {
        label: "Create draft",
        icon: Vote,
        to: "election",
        isActive: (p) => p === "/manager/election",
      },
      {
        label: "Schedule applications",
        icon: ClipboardList,
        to: "my-drafts",
        isActive: (p) => p === "/manager/my-drafts",
      },
      {
        label: "Applications",
        icon: ListChecks,
        to: "applications",
        isActive: (p) =>
          p.startsWith("/manager/applications") ||
          p.includes("/reviewCandidate/"),
      },
      {
        label: "Schedule voting",
        icon: FileText,
        to: "schedule-voting",
        isActive: (p) => p === "/manager/schedule-voting",
      },
      {
        label: "Election results",
        icon: BarChart3,
        to: "results",
        isActive: (p) => p === "/manager/results",
      },
    ],
  },
  {
    id: "organizations",
    label: "Societies & programs",
    items: [
      {
        label: "Societies",
        icon: MdGroups2,
        to: "society",
        isActive: (p) =>
          p === "/manager/society" ||
          p.startsWith("/manager/societyDetails/") ||
          p.startsWith("/manager/societyform"),
      },
      {
        label: "Society status",
        icon: ListOrdered,
        to: "society-status",
        isActive: (p) => p === "/manager/society-status",
      },
      {
        label: "Society posts",
        icon: Newspaper,
        to: "society-posts",
        isActive: (p) => p === "/manager/society-posts",
      },
      {
        label: "Events",
        icon: Calendar,
        to: "events",
        isActive: (p) =>
          /^\/manager\/(events|eventForm|details)/.test(p),
      },
      {
        label: "Members",
        icon: Users,
        to: "members",
        isActive: (p) =>
          /^\/manager\/(members|SpecificSocietymembers)/.test(p),
      },
      {
        label: "Join requests",
        icon: LuGitPullRequestArrow,
        to: "requests",
        isActive: (p) => p === "/manager/requests",
      },
      {
        label: "Volunteers",
        icon: MdOutlineVolunteerActivism,
        to: "volunteers",
        isActive: (p) => p === "/manager/volunteers",
      },
    ],
  },
];

function itemIsActive(pathname, item) {
  if (item.isActive) return item.isActive(pathname);
  if (item.to === "/") return pathname === "/";
  const full = managerNavTo(item);
  return pathname === full;
}

function groupHasActive(pathname, group) {
  return group.items.some((item) => itemIsActive(pathname, item));
}

function ManagerSidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [expanded, setExpanded] = useState(() =>
    Object.fromEntries(NAV_GROUPS.map((g) => [g.id, true]))
  );

  useEffect(() => {
    setExpanded((prev) => {
      const next = { ...prev };
      NAV_GROUPS.forEach((g) => {
        if (groupHasActive(location.pathname, g)) next[g.id] = true;
      });
      return next;
    });
  }, [location.pathname]);

  const toggleGroup = useCallback((id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const handleLogout = () => {
    onClose?.();
    logout();
    navigate("/");
  };

  const initial = (user?.fullname || user?.email || "M").charAt(0).toUpperCase();

  return (
    <>
      <aside
        className={`fixed top-0 z-50 flex h-full w-64 flex-col border-r border-white/[0.06] bg-[#1e1e2d] text-[#a2a3b7] transition-transform duration-200 ease-out
          right-0 lg:left-0 lg:right-auto
          ${isOpen ? "translate-x-0" : "translate-x-full"} lg:translate-x-0`}
      >
        <button
          onClick={onClose}
          className="absolute right-3 top-3 rounded-lg border border-white/10 bg-white/5 p-2 text-[#a2a3b7] transition hover:bg-white/10 hover:text-white lg:hidden"
          aria-label="Close menu"
        >
          <X size={18} />
        </button>

        <div className="manager-sidebar-scroll flex h-full flex-col overflow-y-auto overflow-x-hidden">
          <header className="shrink-0 border-b border-white/[0.06] px-4 pb-4 pt-6">
            <div className="flex items-center gap-3 pr-10 lg:pr-0">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white shadow-lg"
                style={{ backgroundColor: ACCENT }}
              >
                <LayoutDashboard size={20} strokeWidth={1.5} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold tracking-tight text-white">
                  Manager
                </p>
                <p className="text-xs text-[#6c6d7c]">Societies & clubs</p>
              </div>
            </div>
          </header>

          <nav className="flex flex-1 flex-col gap-1 px-2 py-3">
            {NAV_GROUPS.map((group) => {
              const isOpenGroup = expanded[group.id] ?? true;
              const groupActive = groupHasActive(location.pathname, group);

              return (
                <div key={group.id} className="rounded-lg">
                  <button
                    type="button"
                    onClick={() => toggleGroup(group.id)}
                    className={`flex w-full items-center gap-2 rounded-md px-2 py-2 text-left transition hover:bg-white/[0.04] ${
                      groupActive ? "text-[#e2e8f0]" : ""
                    }`}
                    aria-expanded={isOpenGroup}
                  >
                    <ChevronRight
                      size={15}
                      strokeWidth={2}
                      className={`shrink-0 text-[#6c6d7c] transition-transform duration-150 ${
                        isOpenGroup ? "rotate-90" : ""
                      }`}
                    />
                    <span className="min-w-0 flex-1 truncate text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6c6d7c]">
                      {group.label}
                    </span>
                  </button>

                  <div
                    className={`grid transition-[grid-template-rows] duration-150 ease-out ${
                      isOpenGroup ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    }`}
                  >
                    <div
                      className={`min-h-0 overflow-hidden ${
                        isOpenGroup ? "" : "pointer-events-none"
                      }`}
                      aria-hidden={!isOpenGroup}
                    >
                      <ul className="space-y-0.5 py-0.5 pl-1">
                        {group.items.map((item) => {
                          const active = itemIsActive(location.pathname, item);
                          const Icon = item.icon;
                          return (
                            <li key={`${group.id}-${item.label}`}>
                              <Link
                                to={managerNavTo(item)}
                                onClick={() => onClose?.()}
                                className={`flex items-center gap-3 rounded-md px-2.5 py-2 text-[13px] font-medium transition-colors ${
                                  active
                                    ? "text-white shadow-sm"
                                    : "text-[#a2a3b7] hover:bg-white/[0.05] hover:text-white"
                                }`}
                                style={
                                  active
                                    ? { backgroundColor: ACCENT }
                                    : undefined
                                }
                              >
                                <Icon
                                  size={18}
                                  className={`shrink-0 ${
                                    active ? "text-white" : "text-[#6c6d7c]"
                                  }`}
                                />
                                <span className="min-w-0 flex-1 truncate">
                                  {item.label}
                                </span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </nav>

          <footer className="mt-auto shrink-0 border-t border-white/[0.06] px-2 py-3">
            <Link
              to="/profile"
              onClick={() => onClose?.()}
              className="mb-2 flex items-center gap-3 rounded-lg px-2 py-2 transition hover:bg-white/[0.05]"
            >
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
                style={{ backgroundColor: ACCENT }}
              >
                {initial}
              </div>
              <div className="min-w-0 flex-1 text-left">
                <p className="truncate text-sm font-medium text-white">
                  {user?.fullname || "Manager"}
                </p>
                <p className="truncate text-xs text-[#6c6d7c]">
                  {user?.role || "Manager"}
                </p>
              </div>
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-md border border-white/10 bg-white/[0.04] py-2 text-[13px] font-medium text-[#a2a3b7] transition hover:border-white/15 hover:bg-white/[0.08] hover:text-white"
            >
              <LogOut size={15} />
              Sign out
            </button>
          </footer>
        </div>
      </aside>

      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}
    </>
  );
}

export default ManagerSidebar;
