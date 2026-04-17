import React, { useEffect } from "react";
import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Trash2 } from "lucide-react";
import API_BASE_URL from "../../../config/api.config";
import toast from "react-hot-toast";
import AdminPageHeader from "../components/AdminPageHeader";
import AdminDeleteModal from "../components/AdminDeleteModal";
import { adminUi as a } from "../components/adminUi";
import { uploadFileUrl } from "../../../config/api.config";

async function fetchSocietyPosts({ queryKey }) {
  const [, , page] = queryKey;
  const res = await axios.get(`${API_BASE_URL}/admin/society-posts`, {
    params: { page, limit: 15 },
    withCredentials: true,
  });
  return res.data;
}

export default function AdminSocietyPosts() {
  const queryClient = useQueryClient();
  const [page, setPage] = React.useState(1);
  const [deletePostId, setDeletePostId] = React.useState(null);

  const { data, isPending, isError } = useQuery({
    queryKey: ["admin", "society-posts", page],
    queryFn: fetchSocietyPosts,
  });

  useEffect(() => {
    if (isError) toast.error("Could not load posts");
  }, [isError]);

  const delMut = useMutation({
    mutationFn: (postId) =>
      axios.delete(`${API_BASE_URL}/admin/society-posts/${postId}`, { withCredentials: true }),
    onSuccess: () => {
      toast.success("Post deleted");
      setDeletePostId(null);
      queryClient.invalidateQueries({ queryKey: ["admin", "society-posts"] });
    },
    onError: (e) => toast.error(e.response?.data?.message || "Delete failed"),
  });

  const posts = data?.data || [];
  const totalPages = data?.totalPages || 1;

  if (isPending) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-2 text-slate-500">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <span className="text-sm font-medium">Loading posts…</span>
      </div>
    );
  }

  return (
    <div className={a.page}>
      <AdminPageHeader
        variant="hero"
        title="Society posts"
        description="All announcements published by society managers. Remove content that violates policy."
      />

      <div className={a.tableCard}>
        {posts.length === 0 ? (
          <div className={a.emptyState}>
            <p className={a.emptyTitle}>No posts yet</p>
            <p className="text-sm text-slate-500">Posts will appear here when managers publish them.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {posts.map((p) => (
              <div key={p._id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900">{p.title}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {p.society?.name || "Society"} · {p.author?.fullname || "Author"} ·{" "}
                    {p.createdAt ? new Date(p.createdAt).toLocaleString() : ""}
                  </p>
                  {p.image && (
                    <img
                      src={uploadFileUrl(p.image) || ""}
                      alt=""
                      className="mt-3 max-h-28 rounded-lg border border-slate-100 object-cover"
                    />
                  )}
                  <p className="mt-3 line-clamp-3 text-sm text-slate-600">
                    {(p.content || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 280)}
                    {(p.content || "").replace(/<[^>]+>/g, "").length > 280 ? "…" : ""}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={delMut.isPending}
                  onClick={() => setDeletePostId(p._id)}
                  className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 border-t border-slate-100 p-4">
            <button
              type="button"
              disabled={page <= 1}
              className={a.btnSecondary}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </button>
            <span className="self-center text-sm text-slate-500">
              Page {page} / {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              className={a.btnSecondary}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </button>
          </div>
        )}
      </div>

      <AdminDeleteModal
        open={Boolean(deletePostId)}
        onClose={() => {
          if (delMut.isPending) return;
          setDeletePostId(null);
        }}
        title="Delete society post?"
        description="This permanently removes the announcement and its image from the platform."
        isPending={delMut.isPending}
        onConfirm={() => {
          if (deletePostId) delMut.mutate(deletePostId);
        }}
      />
    </div>
  );
}
