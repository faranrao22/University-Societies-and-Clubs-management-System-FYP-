import React from "react";
import { Link } from "react-router-dom";
import { Calendar, Building2 } from "lucide-react";
import { uploadFileUrl } from "../../../config/api.config";

const DARK = "#1B4D28";
const GOLD = "#D4A017";
const MUTED = "#4B5563";

export default function SocietyPostCard({ post, showSociety = true }) {
  const img = post.image ? uploadFileUrl(post.image) : null;
  const sid = post.society?._id || post.society;
  const plainText = (post.content || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

  return (
    <article
      className="overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
      style={{ borderColor: "rgba(27, 77, 40, 0.12)" }}
    >
      {img && (
        <div className="relative aspect-[16/8] max-h-56 w-full overflow-hidden bg-slate-100">
          <img src={img} alt="" className="h-full w-full object-cover transition duration-500 hover:scale-[1.03]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent opacity-80" />
        </div>
      )}
      <div className="p-5 sm:p-6">
        {showSociety && post.society?.name && (
          <div className="mb-3 flex flex-wrap items-center gap-2.5">
            <span
              className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider"
              style={{ backgroundColor: `${GOLD}22`, color: DARK }}
            >
              <Building2 size={12} />
              {post.society.name}
            </span>
            {sid && (
              <Link
                to={`/society/${sid}`}
                className="text-xs font-semibold underline-offset-2 hover:underline"
                style={{ color: DARK }}
              >
                Society page
              </Link>
            )}
          </div>
        )}
        <h3 className="text-xl font-black leading-snug" style={{ color: "#111827" }}>
          {post.title}
        </h3>
        <p className="mt-2 flex items-center gap-1.5 text-sm" style={{ color: MUTED }}>
          <Calendar size={13} style={{ color: GOLD }} />
          {post.createdAt ? new Date(post.createdAt).toLocaleString() : ""}
          {post.author?.fullname && (
            <>
              <span className="mx-1">·</span>
              {post.author.fullname}
            </>
          )}
        </p>
        <p className="mt-4 line-clamp-4 text-sm leading-relaxed" style={{ color: MUTED }}>
          {plainText || "No content provided."}
        </p>
        <div className="mt-5 border-t pt-4" style={{ borderColor: "rgba(27, 77, 40, 0.12)" }}>
          <Link to="/society-posts" className="text-sm font-bold underline-offset-2 hover:underline" style={{ color: DARK }}>
            Read full post
          </Link>
        </div>
      </div>
    </article>
  );
}
