import React, { useDeferredValue, useMemo, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Calendar, Newspaper, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import API_BASE_URL, { uploadFileUrl } from "../../../config/api.config";
import SocietyPostCard from "./SocietyPostCard";
import PublicFilterCard, { PublicFilterChip, PublicFilterChipGroup } from "../../../Components/PublicFilterCard";
import PageLoader from "../../../Components/PageLoader";

const COLORS = {
  dark: "#1e3a8a",
  lightGreen: "#1d4ed8",
  gold: "#38bdf8",
  cream: "#e2e8f0",
  text: "#111827",
  muted: "#4B5563",
  border: "rgba(30, 64, 175, 0.16)",
};
const FALLBACK_POST_IMG =
  "https://images.unsplash.com/photo-1515169067868-5387ec356754?q=80&w=1200&auto=format&fit=crop";

export default function SocietyPostsFeed() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSociety, setSelectedSociety] = useState("All");
  const [selectedPost, setSelectedPost] = useState(null);
  const deferredSearch = useDeferredValue(searchQuery);

  const { data: societies = [] } = useQuery({
    queryKey: ["public", "societies", "all-minimal"],
    queryFn: async () => {
      const res = await axios.get(`${API_BASE_URL}/societies/Allsocieties`);
      return res.data.data || [];
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
  });

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

  const postSocietyId = (p) => {
    const s = p.society?._id ?? p.society;
    return s ? String(s) : "";
  };

  const filteredPosts = useMemo(() => {
    const q = deferredSearch.trim().toLowerCase();
    return posts.filter((p) => {
      if (selectedSociety !== "All" && postSocietyId(p) !== selectedSociety) return false;
      if (!q) return true;
      const title = (p.title || "").toLowerCase();
      const html = (p.content || "").replace(/<[^>]+>/g, " ").toLowerCase();
      const society = (p.society?.name || "").toLowerCase();
      return title.includes(q) || html.includes(q) || society.includes(q);
    });
  }, [posts, deferredSearch, selectedSociety]);

  const hasActiveFilters = Boolean(searchQuery.trim()) || selectedSociety !== "All";

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedSociety("All");
  };

  const closePostModal = () => setSelectedPost(null);

  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.cream }}>
      <section className="mx-auto max-w-6xl px-6 py-6 md:py-8">
        <PublicFilterCard
          title="Campus announcements"
          subtitle="Updates from active societies across campus — filter by society or search posts."
          search={{
            id: "society-posts-search",
            value: searchQuery,
            onChange: (e) => setSearchQuery(e.target.value),
            placeholder: "Search posts, societies…",
          }}
          headerAction={
            hasActiveFilters ? (
              <button
                type="button"
                onClick={clearFilters}
                className="flex items-center gap-1 text-xs font-semibold hover:underline"
                style={{ color: COLORS.dark }}
              >
                <X size={12} strokeWidth={2.5} /> Clear
              </button>
            ) : null
          }
        >
          {societies.length > 0 ? (
            <PublicFilterChipGroup label="By society">
              <PublicFilterChip active={selectedSociety === "All"} onClick={() => setSelectedSociety("All")}>
                All societies
              </PublicFilterChip>
              {societies.map((soc) => {
                const id = String(soc._id);
                const active = selectedSociety === id;
                return (
                  <PublicFilterChip
                    key={id}
                    active={active}
                    className="max-w-[min(100%,14rem)]"
                    onClick={() => setSelectedSociety(active ? "All" : id)}
                  >
                    <span className="line-clamp-2">{soc.name}</span>
                  </PublicFilterChip>
                );
              })}
            </PublicFilterChipGroup>
          ) : null}
        </PublicFilterCard>

        <div className="mb-6 flex items-center gap-2 text-sm font-semibold" style={{ color: COLORS.dark }}>
          <Newspaper size={16} strokeWidth={2} />
          Latest posts
        </div>

        {loading ? (
          <PageLoader className="py-20" />
        ) : posts.length === 0 ? (
          <p className="text-center text-sm" style={{ color: COLORS.muted }}>
            No posts published yet.
          </p>
        ) : filteredPosts.length === 0 ? (
          <div className="rounded-xl border bg-white py-12 text-center shadow-sm" style={{ borderColor: COLORS.border }}>
            <p className="text-sm font-semibold" style={{ color: COLORS.text }}>
              No posts match your filters.
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="mt-3 text-sm font-bold underline-offset-2 hover:underline"
              style={{ color: COLORS.dark }}
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
            {filteredPosts.map((p, i) => (
              <motion.div
                key={p._id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="h-full"
              >
                <SocietyPostCard post={p} showSociety onReadFullPost={setSelectedPost} />
              </motion.div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-10 flex justify-center gap-3 pb-4">
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
      </section>

      {selectedPost ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/45 px-4 pb-0 backdrop-blur-sm sm:items-center sm:pb-6"
          onClick={(e) => e.target === e.currentTarget && closePostModal()}
        >
          <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-xl border bg-white shadow-xl sm:rounded-xl" style={{ borderColor: COLORS.border }}>
            <div className="flex items-start justify-between border-b px-5 py-4 sm:px-6" style={{ borderColor: COLORS.border }}>
              <div className="min-w-0 pr-3">
                <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: COLORS.muted }}>
                  Society post
                </p>
                <h3 className="mt-1 line-clamp-2 text-lg font-bold tracking-tight" style={{ color: COLORS.text }}>
                  {selectedPost.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={closePostModal}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border bg-white transition hover:bg-slate-50"
                style={{ borderColor: COLORS.border }}
                aria-label="Close"
              >
                <X size={16} className="text-slate-600" />
              </button>
            </div>

            <div className="overflow-y-auto px-5 py-4 sm:px-6 sm:py-5">
              <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold" style={{ color: COLORS.muted }}>
                <p className="inline-flex items-center gap-1">
                  <Calendar size={13} style={{ color: COLORS.gold }} />
                  {selectedPost.createdAt ? new Date(selectedPost.createdAt).toLocaleString() : "—"}
                </p>
                {selectedPost.author?.fullname ? <p>By {selectedPost.author.fullname}</p> : null}
                {selectedPost.society?.name ? <p>{selectedPost.society.name}</p> : null}
              </div>

              <div className="mb-5 overflow-hidden rounded-md border bg-slate-100" style={{ borderColor: COLORS.border }}>
                <img
                  src={
                    uploadFileUrl(
                      typeof selectedPost.image === "string"
                        ? selectedPost.image.trim()
                        : selectedPost.image?.url || selectedPost.image?.path || ""
                    ) || FALLBACK_POST_IMG
                  }
                  alt={selectedPost.title || "Society post"}
                  className="h-56 w-full object-cover sm:h-72"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = FALLBACK_POST_IMG;
                  }}
                />
              </div>

              <article
                className="prose prose-slate max-w-none text-sm leading-relaxed sm:prose-base"
                dangerouslySetInnerHTML={{ __html: selectedPost.content || "<p>No content provided.</p>" }}
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
