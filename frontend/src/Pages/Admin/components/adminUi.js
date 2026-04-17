/**
 * Admin console — theme aligned with reference UI:
 * cool gray canvas, white cards, indigo/purple accent (Tailwind indigo).
 */
const shadowCard = "shadow-[0_4px_14px_rgba(15,23,42,0.06)]";

export const adminUi = {
  /** Full-width admin canvas (outer layout already caps max width). */
  page: "mx-auto w-full max-w-7xl space-y-8",
  pageNarrow: "mx-auto w-full max-w-5xl space-y-8",
  pageDetail: "mx-auto w-full max-w-4xl space-y-8",
  pageForm: "mx-auto w-full max-w-2xl space-y-8 pb-20 pt-1",

  eyebrow: "text-[11px] font-semibold uppercase tracking-[0.16em] text-indigo-600",
  h1: "text-lg font-semibold tracking-tight text-slate-900 sm:text-xl",
  lead: "mt-2 max-w-2xl text-sm leading-relaxed text-slate-600",

  headerRow:
    "flex flex-col gap-4 border-b border-slate-200/80 pb-6 sm:flex-row sm:items-end sm:justify-between sm:gap-6",

  sectionHead: "mb-4",
  sectionHeading: "text-xs font-semibold uppercase tracking-wide text-slate-500",
  sectionSub: "mt-0.5 text-xs text-slate-400",

  card: `overflow-hidden rounded-2xl border border-slate-200/90 bg-white ${shadowCard}`,
  cardPadded: `rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 ${shadowCard}`,
  tableCard: `overflow-hidden rounded-2xl border border-slate-200/90 bg-white ${shadowCard}`,
  tableToolbar:
    "flex flex-col gap-3 border-b border-slate-100 bg-slate-50/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5",

  list: "divide-y divide-slate-100",
  listRowBtn:
    "flex w-full items-start gap-4 px-4 py-3.5 text-left text-sm transition hover:bg-indigo-50/40 sm:px-5 sm:py-4",
  iconTile:
    "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-indigo-100 bg-indigo-50 text-indigo-700 sm:h-11 sm:w-11",

  tableScroll: "overflow-x-auto",
  table: "min-w-full text-sm text-slate-700",
  thead: "border-b border-slate-200 bg-slate-50/90 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500",
  th: "px-4 py-3 font-semibold sm:px-5",
  tbodyRowStriped: (idx) =>
    `border-t border-slate-100 transition hover:bg-indigo-50/30 ${idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"}`,

  cellStrong: "px-4 py-3 font-medium text-slate-900 sm:px-5 sm:py-3.5",
  cell: "px-4 py-3 text-slate-600 sm:px-5 sm:py-3.5",

  btnPrimary:
    "inline-flex items-center justify-center gap-2 rounded-lg border border-indigo-600 bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:border-indigo-700 hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/35 disabled:cursor-not-allowed disabled:opacity-45",
  btnPrimarySm:
    "inline-flex items-center justify-center gap-1.5 rounded-lg border border-indigo-600 bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40",
  btnSecondary:
    "inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200",
  btnGhostToolbar:
    "inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50",
  btnDanger:
    "inline-flex items-center justify-center gap-2 rounded-lg border border-red-700 bg-red-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-800 hover:border-red-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300/40 disabled:opacity-45",
  btnOutlineDanger:
    "inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-700 transition hover:border-red-300 hover:bg-red-50 disabled:opacity-45",
  btnIcon:
    "inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50/60 hover:text-indigo-800",
  btnIconDanger:
    "inline-flex items-center justify-center rounded-lg border border-red-200 bg-red-600 p-2 text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-200 disabled:text-slate-400",

  input:
    "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 transition placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20",
  select:
    "rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20",

  label: "mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-500",

  modalBackdrop:
    "fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/45 p-4 backdrop-blur-[1px]",
  modalPanel: `relative my-8 w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 ${shadowCard}`,
  modalWide: `relative my-8 w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 ${shadowCard}`,
  modalTitle: "pr-10 text-base font-semibold tracking-tight text-slate-900",
  modalLead: "mt-1 text-sm text-slate-600",

  emptyState:
    "flex flex-col items-center justify-center gap-2 px-6 py-16 text-center text-sm text-slate-500",
  emptyTitle: "text-sm font-medium text-slate-700",

  backLink:
    "inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 transition hover:text-indigo-700",

  badgeNeutral:
    "inline-flex rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600",
  badgeIndigo:
    "inline-flex rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-indigo-800",
  linkSubtle:
    "text-xs font-medium text-indigo-700 underline-offset-2 hover:text-indigo-900 hover:underline",

  introCard: `rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 ${shadowCard}`,
  statTile: `rounded-2xl border border-slate-200/90 bg-white p-5 ${shadowCard}`,
  statIconWrap: "flex h-10 w-10 items-center justify-center rounded-lg border border-indigo-100 bg-indigo-50 text-indigo-700",
  statLabel: "mt-4 text-[11px] font-semibold uppercase tracking-wide text-slate-500",
  statValue: "mt-1 text-2xl font-semibold tabular-nums tracking-tight text-slate-900",
  statHint: "mt-1 text-xs text-slate-500",

  linkRow:
    "flex items-center justify-between gap-3 rounded-xl border border-slate-200/90 bg-white px-4 py-3 text-left text-sm transition hover:border-indigo-200 hover:bg-indigo-50/50",
  linkRowTitle: "font-medium text-slate-900",
  linkRowDesc: "mt-0.5 text-xs text-slate-500",

  panel: `rounded-2xl border border-slate-200/90 bg-white p-5 text-sm ${shadowCard} sm:p-6`,
  panelTitle: "text-sm font-semibold tracking-tight text-slate-900",

  insightCard:
    "relative overflow-hidden rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-[#1e1b4b] via-indigo-950 to-slate-900 p-6 text-white shadow-[0_20px_50px_-12px_rgba(79,70,229,0.35)] sm:p-8",
  insightBadge:
    "mb-3 inline-flex rounded-full border border-white/20 bg-white/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-indigo-100",
  insightTitle: "text-lg font-semibold leading-snug sm:text-xl",
  insightLead: "mt-2 max-w-md text-sm leading-relaxed text-indigo-100/90",
};

/** @param {string} [role] */
export function adminRolePillClass(role) {
  if (role === "admin") return "bg-indigo-50 text-indigo-800 ring-1 ring-indigo-100";
  if (role === "manager") return "bg-sky-50 text-sky-800 ring-1 ring-sky-100";
  return "bg-slate-100 text-slate-700 ring-1 ring-slate-200";
}

/** @param {string} [role] */
export function adminRoleLabel(role) {
  if (role === "admin") return "Admin";
  if (role === "manager") return "Manager";
  return "Student";
}
