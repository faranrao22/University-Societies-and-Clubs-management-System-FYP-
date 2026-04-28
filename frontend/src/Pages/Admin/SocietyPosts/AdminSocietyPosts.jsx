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
  const [selectedPost, setSelectedPost] = React.useState(null);

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
        title="Society posts"
        description="All announcements published by society managers."
      />

      <div className={a.tableCard}>
        {posts.length === 0 ? (
          <div className={a.emptyState}>
            <p className={a.emptyTitle}>No posts yet</p>
            <p className="text-sm text-slate-500">Posts will appear here when managers publish them.</p>
          </div>
        ) : (
          <div className={a.tableScroll}>
            <table className={a.table}>
              <thead className={a.thead}>
                <tr>
                  <th className={`${a.th} pl-5`}>Title</th>
                  <th className={a.th}>Society</th>
                  <th className={a.th}>Author</th>
                  <th className={a.th}>Preview</th>
                  <th className={`${a.th} pr-5 text-right`}>Action</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((p, idx) => {
                  const contentText = (p.content || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
                  return (
                    <tr key={p._id} className={a.tbodyRowStriped(idx)}>
                      <td className={`${a.cellStrong} pl-5`}>
                        <button
                          type="button"
                          onClick={() => setSelectedPost(p)}
                          className="max-w-[18rem] truncate text-left font-semibold text-slate-900 hover:text-indigo-700 hover:underline"
                        >
                          {p.title || "Untitled"}
                        </button>
                      </td>
                      <td className={a.cell}>{p.society?.name || "Society"}</td>
                      <td className={a.cell}>{p.author?.fullname || "Author"}</td>
                      <td className={a.cell}>
                        <p className="line-clamp-2 max-w-[28rem] text-sm text-slate-600">
                          {contentText ? `${contentText.slice(0, 160)}${contentText.length > 160 ? "…" : ""}` : "-"}
                        </p>
                      </td>
                      <td className={`${a.cell} pr-5 text-right`}>
                        <button
                          type="button"
                          disabled={delMut.isPending}
                          onClick={() => setDeletePostId(p._id)}
                          className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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

      {selectedPost && (
        <div className={a.modalBackdrop} onClick={() => setSelectedPost(null)}>
          <div
            className={a.modalWide}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className={a.modalTitle}>{selectedPost.title || "Post details"}</h2>
            <p className={`${a.modalLead} mb-4`}>
              {selectedPost.society?.name || "Society"} · {selectedPost.author?.fullname || "Author"}
            </p>

            {selectedPost.image ? (
              <img
                src={uploadFileUrl(selectedPost.image) || ""}
                alt=""
                className="mb-4 max-h-64 w-full rounded-lg border border-slate-200 object-cover"
              />
            ) : null}

            <div
              className="prose prose-sm max-w-none text-slate-800"
              dangerouslySetInnerHTML={{ __html: selectedPost.content || "<p>No content</p>" }}
            />

            <div className="mt-5 flex justify-end gap-2 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setSelectedPost(null)}
                className={a.btnSecondary}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
