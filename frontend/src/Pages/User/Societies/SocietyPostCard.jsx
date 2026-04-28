import React from "react";
import { Link } from "react-router-dom";
import { Calendar, Building2, ArrowRight, Eye } from "lucide-react";
import { uploadFileUrl } from "../../../config/api.config";

const DARK = "#1e3a8a";
const DARK_HOVER = "#1d4ed8";
const GOLD = "#38bdf8";
const MUTED = "#4B5563";
const BORDER = "rgba(30, 64, 175, 0.16)";
const FALLBACK_POST_IMG =
  "https://images.unsplash.com/photo-1515169067868-5387ec356754?q=80&w=1200&auto=format&fit=crop";

export default function SocietyPostCard({ post, showSociety = true, onReadFullPost }) {
  const imageRaw =
    typeof post.image === "string" ? post.image.trim() : post.image?.url || post.image?.path || "";
  const img = uploadFileUrl(imageRaw) || FALLBACK_POST_IMG;
  const sid = post.society?._id || post.society;
  const plainText = (post.content || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

  return (
    <article
      className="group flex flex-col overflow-hidden rounded-md border bg-white transition-[border-color,box-shadow] duration-200 hover:border-[#1d4ed8]/35 hover:shadow-md"
      style={{
        borderColor: BORDER,
        boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
      }}
    >
      <div className="relative h-36 w-full overflow-hidden bg-slate-100 sm:h-40">
        <img
          src={img}
          alt={post.title || "Society post"}
          className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02]"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = FALLBACK_POST_IMG;
          }}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0f172a]/55 via-transparent to-transparent" />
        {showSociety && post.society?.name ? (
          <div className="absolute left-2 top-2 right-2 flex justify-start">
            <span
              className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide"
              style={{ backgroundColor: GOLD, color: DARK }}
            >
              <Building2 size={11} strokeWidth={2.5} />
              {post.society.name}
            </span>
          </div>
        ) : null}
      </div>
      <div className="flex grow flex-col p-3.5 sm:p-4">
        <h3 className="text-sm font-bold leading-snug tracking-tight sm:text-[15px]" style={{ color: "#111827" }}>
          {post.title}
        </h3>
        <p className="mb-3 mt-2 line-clamp-2 flex-grow text-xs leading-relaxed" style={{ color: MUTED }}>
          {plainText || "No content provided."}
        </p>
        <div
          className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-dashed pt-2.5"
          style={{ borderColor: BORDER }}
        >
          <p className="flex items-center gap-1 text-[11px] font-semibold sm:text-xs" style={{ color: MUTED }}>
            <Calendar size={13} style={{ color: GOLD }} strokeWidth={2} />
            {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : "—"}
          </p>
          {post.author?.fullname ? (
            <p className="truncate text-[11px] font-semibold sm:text-xs" style={{ color: MUTED }}>
              By {post.author.fullname}
            </p>
          ) : null}
          {sid ? (
            <Link
              to={`/society/${sid}`}
              className="truncate text-[11px] font-semibold underline-offset-2 hover:underline sm:text-xs"
              style={{ color: DARK }}
            >
              Society page
            </Link>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => onReadFullPost?.(post)}
          className="mt-auto flex w-full items-center justify-center gap-1.5 rounded-sm border border-transparent py-2 text-xs font-semibold tracking-wide text-white transition-colors duration-150 hover:bg-[#1d4ed8]"
          style={{ backgroundColor: DARK }}
        >
          <Eye size={14} strokeWidth={2.25} />
          Read full post
          <ArrowRight size={13} className="opacity-90" strokeWidth={2.5} />
        </button>
      </div>
    </article>
  );
}
