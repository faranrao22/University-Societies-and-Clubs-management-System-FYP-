import React, { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Loader2, Newspaper } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import API_BASE_URL from "../../../config/api.config";
import SocietyPostCard from "./SocietyPostCard";

const COLORS = {
  dark: "#1e3a8a",
  lightGreen: "#1d4ed8",
  gold: "#38bdf8",
  cream: "#e2e8f0",
  text: "#111827",
  muted: "#4B5563",
  border: "rgba(30, 64, 175, 0.16)",
};

export default function SocietyPostsFeed() {
  const [page, setPage] = useState(1);
  const { data, isPending: loading } = useQuery({
    queryKey: ["public", "society-posts", page],
    queryFn: async () => {
      const res = await axios.get(`${API_BASE_URL}/societies/posts/all`, {
        params: { page, limit: 8 },
        withCredentials: true,
      });
      return {
        posts: res.data.data || [],
        totalPages: res.data.totalPages || 1,
      };
    },
    staleTime: 3 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    placeholderData: (prev) => prev,
  });
  const posts = data?.posts || [];
  const totalPages = data?.totalPages || 1;

  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.cream }}>
      <div className="mx-auto max-w-6xl px-6 py-10 md:py-12">
        <div className="mb-8 rounded-2xl border bg-white p-5 shadow-sm sm:p-6" style={{ borderColor: COLORS.border }}>
          <h2 className="text-xl font-black tracking-tight sm:text-2xl" style={{ color: COLORS.text }}>
            Campus announcements
          </h2>
          <p className="mt-1 text-sm sm:text-base" style={{ color: COLORS.muted }}>
            Updates from active societies across campus.
          </p>
        </div>

        <div className="mb-8 flex items-center gap-2 text-base font-semibold" style={{ color: COLORS.dark }}>
          <Newspaper size={18} />
          Latest posts
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin" size={36} style={{ color: COLORS.gold }} />
            <p className="mt-3 text-sm" style={{ color: COLORS.muted }}>
              Loading…
            </p>
          </div>
        ) : posts.length === 0 ? (
          <p className="text-center text-sm" style={{ color: COLORS.muted }}>
            No posts published yet.
          </p>
        ) : (
          <div className="space-y-8">
            {posts.map((p, i) => (
              <motion.div
                key={p._id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <SocietyPostCard post={p} showSociety />
              </motion.div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-10 flex justify-center gap-3">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-xl border px-4 py-2 text-sm font-semibold transition disabled:opacity-40"
              style={{ borderColor: COLORS.border, color: COLORS.dark, backgroundColor: "#fff" }}
            >
              Previous
            </button>
            <span className="self-center text-sm" style={{ color: COLORS.muted }}>
              {page} / {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-xl border px-4 py-2 text-sm font-semibold transition disabled:opacity-40"
              style={{ borderColor: COLORS.border, color: COLORS.dark, backgroundColor: "#fff" }}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
