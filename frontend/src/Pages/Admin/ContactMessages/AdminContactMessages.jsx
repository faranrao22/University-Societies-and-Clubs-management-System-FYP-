import React, { useEffect } from "react";
import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Mail, Trash2 } from "lucide-react";
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
  const [selectedMessage, setSelectedMessage] = React.useState(null);

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
        title="Contact inbox"
        description="Messages sent from the public contact form."
      />

      <div className={a.tableCard}>
        {messages.length === 0 ? (
          <div className={a.emptyState}>
            <p className={a.emptyTitle}>No messages yet</p>
            <p className="text-sm text-slate-500">Submissions from the contact page will appear here.</p>
          </div>
        ) : (
          <div className={a.tableScroll}>
            <table className={a.table}>
              <thead className={a.thead}>
                <tr>
                  <th className={`${a.th} w-[24%] pl-5`}>Sender</th>
                  <th className={a.th}>Email</th>
                  <th className={a.th}>Message</th>
                  <th className={`${a.th} pr-5 text-right`}>Action</th>
                </tr>
              </thead>
              <tbody>
                {messages.map((m, idx) => {
                  const preview = (m.message || "").replace(/\s+/g, " ").trim();
                  return (
                    <tr key={m._id} className={a.tbodyRowStriped(idx)}>
                      <td className={`${a.cellStrong} whitespace-nowrap pl-5`}>
                        <button
                          type="button"
                          onClick={() => setSelectedMessage(m)}
                          className="max-w-[18rem] truncate font-semibold text-slate-900 hover:text-indigo-700 hover:underline"
                          title={m.name}
                        >
                          {m.name}
                        </button>
                      </td>
                      <td className={a.cell}>
                        <a href={`mailto:${m.email}`} className="inline-flex items-center gap-1.5 text-indigo-600 hover:underline">
                          <Mail size={14} className="text-slate-400" />
                          {m.email}
                        </a>
                      </td>
                      <td className={a.cell}>
                        <p className="line-clamp-2 max-w-[30rem] text-justify text-sm text-slate-700">
                          {preview ? `${preview.slice(0, 170)}${preview.length > 170 ? "…" : ""}` : "-"}
                        </p>
                      </td>
                      <td className={`${a.cell} pr-5 text-right`}>
                        <button
                          type="button"
                          disabled={delMut.isPending}
                          onClick={() => setDeleteId(m._id)}
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

      {selectedMessage && (
        <div className={a.modalBackdrop} onClick={() => setSelectedMessage(null)}>
          <div className={a.modalWide} onClick={(e) => e.stopPropagation()}>
            <h2 className={a.modalTitle}>Message details</h2>
            <p className={`${a.modalLead} mb-4`}>
              {selectedMessage.name} · {selectedMessage.email}
            </p>
            {selectedMessage.createdAt ? (
              <p className="mb-3 text-xs text-slate-500">
                {new Date(selectedMessage.createdAt).toLocaleString()}
              </p>
            ) : null}
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="whitespace-pre-wrap text-justify text-sm leading-relaxed text-slate-800">
                {selectedMessage.message || "-"}
              </p>
            </div>
            <div className="mt-4 flex justify-end">
              <button type="button" onClick={() => setSelectedMessage(null)} className={a.btnSecondary}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
