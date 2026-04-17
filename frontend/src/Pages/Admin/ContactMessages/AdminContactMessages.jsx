import React, { useEffect } from "react";
import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Mail, Trash2, User } from "lucide-react";
import API_BASE_URL from "../../../config/api.config";
import toast from "react-hot-toast";
import AdminPageHeader from "../components/AdminPageHeader";
import AdminDeleteModal from "../components/AdminDeleteModal";
import { adminUi as a } from "../components/adminUi";

async function fetchMessages({ queryKey }) {
  const [, , page] = queryKey;
  const res = await axios.get(`${API_BASE_URL}/admin/contact-messages`, {
    params: { page, limit: 20 },
    withCredentials: true,
  });
  return res.data;
}

export default function AdminContactMessages() {
  const queryClient = useQueryClient();
  const [page, setPage] = React.useState(1);
  const [deleteId, setDeleteId] = React.useState(null);

  const { data, isPending, isError } = useQuery({
    queryKey: ["admin", "contact-messages", page],
    queryFn: fetchMessages,
  });

  useEffect(() => {
    if (isError) toast.error("Could not load messages");
  }, [isError]);

  const delMut = useMutation({
    mutationFn: (id) =>
      axios.delete(`${API_BASE_URL}/admin/contact-messages/${id}`, { withCredentials: true }),
    onSuccess: () => {
      toast.success("Message deleted");
      setDeleteId(null);
      queryClient.invalidateQueries({ queryKey: ["admin", "contact-messages"] });
    },
    onError: (e) => toast.error(e.response?.data?.message || "Delete failed"),
  });

  const messages = data?.data || [];
  const totalPages = data?.totalPages || 1;

  if (isPending) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-2 text-slate-500">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <span className="text-sm font-medium">Loading messages…</span>
      </div>
    );
  }

  return (
    <div className={a.page}>
      <AdminPageHeader
        variant="hero"
        title="Contact inbox"
        description="Messages sent from the public contact form. Remove items once they are handled."
      />

      <div className={a.tableCard}>
        {messages.length === 0 ? (
          <div className={a.emptyState}>
            <p className={a.emptyTitle}>No messages yet</p>
            <p className="text-sm text-slate-500">Submissions from the contact page will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {messages.map((m) => (
              <div key={m._id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-700">
                    <span className="inline-flex items-center gap-1.5 font-semibold text-slate-900">
                      <User size={14} className="text-slate-400" />
                      {m.name}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-slate-600">
                      <Mail size={14} className="text-slate-400" />
                      <a href={`mailto:${m.email}`} className="text-indigo-600 hover:underline">
                        {m.email}
                      </a>
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {m.createdAt ? new Date(m.createdAt).toLocaleString() : ""}
                  </p>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{m.message}</p>
                </div>
                <button
                  type="button"
                  disabled={delMut.isPending}
                  onClick={() => setDeleteId(m._id)}
                  className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4">
            <p className="text-xs text-slate-500">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <AdminDeleteModal
        open={Boolean(deleteId)}
        onClose={() => {
          if (delMut.isPending) return;
          setDeleteId(null);
        }}
        title="Delete contact message?"
        description="This permanently removes the message from the admin inbox."
        isPending={delMut.isPending}
        onConfirm={() => {
          if (deleteId) delMut.mutate(deleteId);
        }}
      />
    </div>
  );
}
