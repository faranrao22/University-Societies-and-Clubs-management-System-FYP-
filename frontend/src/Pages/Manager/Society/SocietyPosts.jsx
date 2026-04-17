import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import axios from "axios";
import API_BASE_URL, { uploadFileUrl } from "../../../config/api.config";
import toast from "react-hot-toast";
import { useAuth } from "../../../context/AuthContext";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Strike from "@tiptap/extension-strike";
import { Loader2, ImagePlus, Megaphone, Pencil, Trash2, X } from "lucide-react";

function ToolbarBtn({ onClick, active, title, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`inline-flex items-center justify-center w-8 h-7 text-sm transition-all duration-100 font-medium ${
        active
          ? "bg-slate-100 text-[#3699FF] border border-gray-300 shadow-sm"
          : "text-[#4B5563] hover:bg-gray-100 hover:text-[#3699FF] border border-transparent"
      }`}
    >
      {children}
    </button>
  );
}
function ToolbarDivider() {
  return <span className="w-px h-5 bg-gray-200 mx-1 shrink-0" />;
}
const BoldIcon = () => <span className="font-bold text-[13px]">B</span>;
const ItalicIcon = () => <span className="italic text-[13px]">I</span>;
const StrikeIcon = () => <span className="line-through text-[13px]">S</span>;
const ULIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <circle cx="2" cy="4" r="1.2" fill="currentColor" />
    <line x1="5" y1="4" x2="13" y2="4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    <circle cx="2" cy="8" r="1.2" fill="currentColor" />
    <line x1="5" y1="8" x2="13" y2="8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);
const OLIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <text x="0" y="5" fontSize="5" fill="currentColor" fontFamily="sans-serif">1.</text>
    <line x1="5" y1="4" x2="13" y2="4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);
const ClearIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <line x1="2" y1="4" x2="12" y2="4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

const inputCls =
  "w-full border border-gray-300 px-4 py-2 text-sm text-gray-900 bg-white rounded-lg placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3699FF]/30";

export default function SocietyPosts() {
  const { user } = useAuth();
  const [societies, setSocieties] = useState([]);
  const [societyId, setSocietyId] = useState("");
  const [title, setTitle] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(false);
  const [managedPosts, setManagedPosts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [toolbarKey, setToolbarKey] = useState(0);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Strike,
      Placeholder.configure({ placeholder: "Write your announcement, update, or story…" }),
    ],
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "min-h-[200px] px-4 py-3 text-sm leading-relaxed text-gray-900 focus:outline-none prose prose-sm max-w-none",
      },
    },
    onUpdate: () => setToolbarKey((k) => k + 1),
    onSelectionUpdate: () => setToolbarKey((k) => k + 1),
  });

  const resetForm = useCallback(() => {
    setEditingId(null);
    setTitle("");
    setImageFile(null);
    setPreview(null);
    setRemoveImage(false);
    editor?.commands.clearContent();
  }, [editor]);

  const fetchManagedPosts = useCallback(async () => {
    if (!user?._id) return;
    setListLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/societies/posts/managed`, { withCredentials: true });
      setManagedPosts(res.data.data || []);
    } catch {
      toast.error("Could not load your posts");
    } finally {
      setListLoading(false);
    }
  }, [user?._id]);

  useEffect(() => {
    if (!user?._id) return;
    axios
      .get(`${API_BASE_URL}/societies/Mysocieties/${user._id}`, { withCredentials: true })
      .then((res) => {
        const list = (res.data.data || []).filter((s) => s.status === "Active");
        setSocieties(list);
        setSocietyId((prev) => prev || (list[0]?._id ?? ""));
      })
      .catch(() => toast.error("Failed to load societies"));
  }, [user?._id]);

  useEffect(() => {
    fetchManagedPosts();
  }, [fetchManagedPosts]);

  const onImage = (e) => {
    const f = e.target.files?.[0];
    setImageFile(f || null);
    setRemoveImage(false);
    if (f) {
      const r = new FileReader();
      r.onloadend = () => setPreview(r.result);
      r.readAsDataURL(f);
    } else if (!editingId) setPreview(null);
  };

  const startEdit = (post) => {
    setEditingId(post._id);
    setSocietyId(String(post.society?._id || post.society || ""));
    setTitle(post.title || "");
    setImageFile(null);
    setRemoveImage(false);
    setPreview(post.image ? uploadFileUrl(post.image) : null);
    if (editor && post.content) editor.commands.setContent(post.content);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!societyId) return toast.error("Select a society");
    if (!title.trim()) return toast.error("Title is required");
    const html = editor?.getHTML() || "";
    if (!html.replace(/<[^>]+>/g, "").trim()) return toast.error("Add some content");

    const fd = new FormData();
    fd.append("title", title.trim());
    fd.append("content", html);
    if (imageFile) fd.append("image", imageFile);
    if (removeImage) fd.append("removeImage", "true");

    setLoading(true);
    try {
      if (editingId) {
        await axios.put(`${API_BASE_URL}/societies/posts/${editingId}`, fd, { withCredentials: true });
        toast.success("Post updated");
      } else {
        fd.append("societyId", societyId);
        await axios.post(`${API_BASE_URL}/societies/posts`, fd, { withCredentials: true });
        toast.success("Post published");
      }
      resetForm();
      fetchManagedPosts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Request failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (post) => {
    if (!window.confirm(`Delete “${post.title}”? This cannot be undone.`)) return;
    try {
      await axios.delete(`${API_BASE_URL}/societies/posts/${post._id}`, { withCredentials: true });
      toast.success("Post deleted");
      if (editingId === post._id) resetForm();
      fetchManagedPosts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  if (!editor) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-2 text-gray-500">
        <Loader2 className="animate-spin" /> Loading editor…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-2 pb-16">
      <Link to="/manager/society" className="mb-6 inline-flex items-center text-sm font-medium text-gray-600 hover:text-[#3699FF]">
        <IoArrowBack className="mr-2" size={20} /> Back to societies
      </Link>

      <div className="mb-8 flex items-start gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#3699FF]/10 text-[#3699FF]">
          <Megaphone size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Society posts</h1>
          <p className="text-sm text-gray-500">
            Create, edit, or remove announcements for societies you manage. Public and member feeds update automatically.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        {editingId && (
          <div className="flex items-center justify-between rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
            <span>Editing post — society cannot be changed.</span>
            <button type="button" onClick={resetForm} className="inline-flex items-center gap-1 font-semibold hover:underline">
              <X size={16} /> Cancel
            </button>
          </div>
        )}

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-800">Society</label>
          <select
            className={inputCls}
            value={societyId}
            onChange={(e) => setSocietyId(e.target.value)}
            required={!editingId}
            disabled={Boolean(editingId)}
          >
            <option value="">Select society</option>
            {societies.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>
          {societies.length === 0 && (
            <p className="mt-2 text-xs text-amber-700">You have no active societies to post for.</p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-800">Title</label>
          <input
            className={inputCls}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Welcome week recap"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-800">Content</label>
          <div className="overflow-hidden rounded-lg border border-gray-300 focus-within:ring-2 focus-within:ring-[#3699FF]/30">
            <div key={toolbarKey} className="flex flex-wrap items-center gap-0.5 border-b border-gray-200 bg-slate-100 px-2 py-1.5">
              <select
                className="mr-1 h-7 cursor-pointer rounded border border-gray-300 bg-white px-2 text-xs text-gray-700"
                value={
                  editor.isActive("heading", { level: 2 }) ? "h2" :
                  editor.isActive("heading", { level: 3 }) ? "h3" : "p"
                }
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === "p") editor.chain().focus().setParagraph().run();
                  else if (v === "h2") editor.chain().focus().toggleHeading({ level: 2 }).run();
                  else if (v === "h3") editor.chain().focus().toggleHeading({ level: 3 }).run();
                }}
              >
                <option value="p">Paragraph</option>
                <option value="h2">Heading</option>
                <option value="h3">Subheading</option>
              </select>
              <ToolbarDivider />
              <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold">
                <BoldIcon />
              </ToolbarBtn>
              <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic">
                <ItalicIcon />
              </ToolbarBtn>
              <ToolbarBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Strike">
                <StrikeIcon />
              </ToolbarBtn>
              <ToolbarDivider />
              <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="List">
                <ULIcon />
              </ToolbarBtn>
              <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Numbered">
                <OLIcon />
              </ToolbarBtn>
              <ToolbarDivider />
              <ToolbarBtn onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()} title="Clear">
                <ClearIcon />
              </ToolbarBtn>
            </div>
            <EditorContent editor={editor} />
          </div>
        </div>

        <div>
          <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-800">
            <ImagePlus size={16} /> Cover image (optional)
          </label>
          <input type="file" accept="image/*" onChange={onImage} className="text-sm text-gray-600" />
          {preview && <img src={preview} alt="" className="mt-3 max-h-48 rounded-lg border object-cover" />}
          {editingId && preview && !imageFile && (
            <label className="mt-2 flex items-center gap-2 text-sm text-gray-600">
              <input type="checkbox" checked={removeImage} onChange={(e) => setRemoveImage(e.target.checked)} />
              Remove current image
            </label>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || (!editingId && !societyId)}
          className="w-full rounded-lg bg-[#3699FF] py-3 text-sm font-semibold text-white transition hover:brightness-105 disabled:opacity-50"
        >
          {loading ? "Saving…" : editingId ? "Update post" : "Publish post"}
        </button>
      </form>

      <div className="mt-12">
        <h2 className="mb-4 text-lg font-bold text-gray-900">All your posts</h2>
        {listLoading ? (
          <p className="flex items-center gap-2 text-sm text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </p>
        ) : managedPosts.length === 0 ? (
          <p className="text-sm text-gray-500">You have not published any posts yet.</p>
        ) : (
          <ul className="space-y-4">
            {managedPosts.map((p) => (
              <li key={p._id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#3699FF]">
                      {p.society?.name || "Society"}
                    </p>
                    <p className="font-semibold text-gray-900">{p.title}</p>
                    <p className="text-xs text-gray-400">
                      {p.createdAt ? new Date(p.createdAt).toLocaleString() : ""}
                      {p.updatedAt && p.updatedAt !== p.createdAt && (
                        <span> · Updated {new Date(p.updatedAt).toLocaleString()}</span>
                      )}
                    </p>
                    {p.image && (
                      <img src={uploadFileUrl(p.image) || ""} alt="" className="mt-2 max-h-32 rounded object-cover" />
                    )}
                    <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                      {(() => {
                        const t = (p.content || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
                        return t.length > 160 ? `${t.slice(0, 160)}…` : t;
                      })()}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(p)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      <Pencil size={14} /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(p)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
