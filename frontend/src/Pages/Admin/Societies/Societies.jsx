import React, { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Building2, ListFilter } from "lucide-react";
import { uploadFileUrl } from "../../../config/api.config";
import toast from "react-hot-toast";
import { fetchAllSocieties } from "../api/adminApi";
import { adminKeys } from "../api/adminQueryKeys";
import AdminPageHeader from "../components/AdminPageHeader";
import AdminRowMenu from "../components/AdminRowMenu";
import { adminUi as a } from "../components/adminUi";

function presidentName(roles) {
  const p = roles?.find((r) => r.name === "President");
  return p?.user?.fullname || "—";
}

function presidentUser(roles) {
  return roles?.find((r) => r.name === "President")?.user;
}

function fmtFounded(d) {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return "—";
  }
}

function categoryLabel(s) {
  const raw = (s.department || s.shortName || "").trim();
  if (!raw) return "Campus";
  if (raw.length > 22) return `${raw.slice(0, 20)}…`;
  return raw;
}

export default function Societies() {
  const [sortNewest, setSortNewest] = useState(true);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const {
    data: list = [],
    isError: listError,
  } = useQuery({
    queryKey: adminKeys.societiesAll(),
    queryFn: fetchAllSocieties,
    staleTime: 60 * 1000,
  });

  useEffect(() => {
    if (listError) toast.error("Could not load societies");
  }, [listError]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let rows = list;
    if (q) {
      rows = rows.filter((s) => {
        const pres = presidentName(s.roles);
        return (
          (s.name || "").toLowerCase().includes(q) ||
          (s.shortName || "").toLowerCase().includes(q) ||
          pres.toLowerCase().includes(q) ||
          (s.department || "").toLowerCase().includes(q)
        );
      });
    }
    const out = [...rows];
    out.sort((a, b) => {
      const ta = new Date(a.createdAt || 0).getTime();
      const tb = new Date(b.createdAt || 0).getTime();
      return sortNewest ? tb - ta : ta - tb;
    });
    return out;
  }, [list, query, sortNewest]);

  return (
    <div className={a.page}>
      <AdminPageHeader
        variant="hero"
        title="Registry"
        description="Societies and clubs with category, lead manager, and activation status. Open a row for full detail, members, and exports."
      />

      <div className={a.tableCard}>
        <div className={a.tableToolbar}>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm">
              <ListFilter size={14} className="text-slate-400" />
              Filter
            </span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search societies, categories, or leads…"
              className="min-w-[12rem] flex-1 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 sm:max-w-md"
            />
          </div>
          <button type="button" onClick={() => setSortNewest((v) => !v)} className={a.btnGhostToolbar}>
            {sortNewest ? "Latest first" : "Oldest first"}
          </button>
        </div>

        <div className={a.tableScroll}>
          <table className={a.table}>
            <thead className={a.thead}>
              <tr>
                <th className={`${a.th} pl-5`}>Society / club</th>
                <th className={a.th}>Category</th>
                <th className={a.th}>Lead manager</th>
                <th className={a.th}>Status</th>
                <th className={`${a.th} w-12 pr-5 text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-16 text-center text-sm text-slate-500">
                    <Building2 className="mx-auto mb-2 text-slate-300" size={36} strokeWidth={1.25} />
                    No societies match this filter.
                  </td>
                </tr>
              ) : (
                filtered.map((s, idx) => {
                  const img = uploadFileUrl(s.image);
                  const pres = presidentUser(s.roles);
                  const active = s.status === "Active";
                  return (
                    <tr
                      key={s._id}
                      className={`${a.tbodyRowStriped(idx)} cursor-pointer`}
                      onClick={() => navigate(`/admin/societies/${s._id}`)}
                    >
                      <td className={`${a.cellStrong} pl-5`}>
                        <div className="flex items-center gap-3">
                          <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full border border-slate-200 bg-slate-100 shadow-sm">
                            {img ? (
                              <img src={img} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-slate-400">
                                <Building2 size={20} strokeWidth={1.5} />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-slate-900">{s.name}</p>
                            <p className="text-xs text-slate-500">Founded {fmtFounded(s.createdAt)}</p>
                          </div>
                        </div>
                      </td>
                      <td className={a.cell}>
                        <span className="inline-flex rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-indigo-900 ring-1 ring-indigo-100">
                          {categoryLabel(s)}
                        </span>
                      </td>
                      <td className={a.cell}>
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-600">
                            {pres?.fullname ? pres.fullname.slice(0, 2).toUpperCase() : "—"}
                          </div>
                          <span className="truncate text-sm font-medium text-slate-800">{presidentName(s.roles)}</span>
                        </div>
                      </td>
                      <td className={a.cell}>
                        <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-wide">
                          <span
                            className={`h-2 w-2 rounded-full ${active ? "bg-teal-500 shadow-[0_0_0_3px_rgba(20,184,166,0.25)]" : "bg-amber-500 shadow-[0_0_0_3px_rgba(245,158,11,0.25)]"}`}
                            aria-hidden
                          />
                          <span className={active ? "text-teal-800" : "text-amber-800"}>{active ? "Active" : "Pending"}</span>
                        </span>
                      </td>
                      <td className={`${a.cell} pr-5 text-right`} onClick={(e) => e.stopPropagation()}>
                        <AdminRowMenu
                          items={[{ label: "Open details", to: `/admin/societies/${s._id}` }]}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 text-xs text-slate-500 sm:px-5">
          <p>
            Showing <span className="font-semibold text-slate-800">{filtered.length}</span> of{" "}
            <span className="font-semibold text-slate-800">{list.length}</span> results
          </p>
        </div>
      </div>
    </div>
  );
}
