import React from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, Newspaper, ArrowRight, Calendar } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import API_BASE_URL from "../../config/api.config";

const COLORS = {
  dark: "#1e3a8a",
  gold: "#38bdf8",
  cream: "#e2e8f0",
  text: "#111827",
  muted: "#4B5563",
  border: "rgba(30, 64, 175, 0.16)",
};

export default function SocietyPostsPreview() {
  const { data: posts = [], isPending: loading } = useQuery({
    queryKey: ["public", "home", "society-posts-preview"],
    queryFn: async () => {
      const res = await axios.get(`${API_BASE_URL}/societies/posts/all`, {
        params: { page: 1, limit: 3 },
        withCredentials: true,
      });
      return res.data?.data || [];
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });

  return (
    <section className="px-6 py-12 md:py-14" style={{ backgroundColor: COLORS.cream }}>
      <div className="mx-auto max-w-6xl">
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-black tracking-tight sm:text-3xl" style={{ color: COLORS.text }}>
              Society posts
            </h2>
            <p className="mt-1 text-sm sm:text-base" style={{ color: COLORS.muted }}>
              Latest announcements from societies.
            </p>
          </div>
          <Link
            to="/society-posts"
            className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white transition hover:brightness-105"
            style={{ backgroundColor: COLORS.dark }}
          >
            View all posts <ArrowRight size={15} />
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-14">
            <Loader2 className="animate-spin" style={{ color: COLORS.gold }} />
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed bg-white p-8 text-center text-sm" style={{ borderColor: COLORS.border, color: COLORS.muted }}>
            No posts available yet.
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, idx) => (
              <motion.div
                key={post._id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.06 }}
              >
                <Link
                  to="/society-posts"
                  className="block rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md"
                  style={{ borderColor: COLORS.border }}
                >
                  <p className="mb-2 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide" style={{ backgroundColor: `${COLORS.gold}22`, color: COLORS.dark }}>
                    <Newspaper size={11} />
                    {post.society?.name || "Society"}
                  </p>
                  <h3 className="line-clamp-2 text-base font-bold" style={{ color: COLORS.text }}>
                    {post.title || "Untitled post"}
                  </h3>
                  <p className="mt-2 line-clamp-3 text-sm" style={{ color: COLORS.muted }}>
                    {(post.content || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()}
                  </p>
                  <p className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold" style={{ color: COLORS.muted }}>
                    <Calendar size={13} style={{ color: COLORS.gold }} />
                    {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : "Recently"}
                  </p>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
