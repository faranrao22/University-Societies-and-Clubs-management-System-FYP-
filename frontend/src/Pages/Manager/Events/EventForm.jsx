import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import axios from "axios";
import API_BASE_URL, { uploadFileUrl } from "../../../config/api.config";
import toast from "react-hot-toast";
import { useAuth } from "../../../context/AuthContext";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Strike from "@tiptap/extension-strike";

// ─── Toolbar Button ───────────────────────────────────────────────────────────
function ToolbarBtn({ onClick, active, title, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      disabled={!onClick}
      className={`
        inline-flex items-center justify-center w-8 h-7 text-sm
        transition-all duration-100 font-medium
        ${active
          ? "bg-slate-100 text-[#3699FF] border border-gray-300 shadow-sm"
          : "text-[#4B5563] hover:bg-gray-100 hover:text-[#3699FF] border border-transparent"
        }
      `}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <span className="w-px h-5 bg-gray-200 mx-1 shrink-0" />;
}

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const BoldIcon = () => <span className="font-bold text-[13px]">B</span>;
const ItalicIcon = () => <span className="italic text-[13px]">I</span>;
const StrikeIcon = () => <span className="line-through text-[13px]">S</span>;

const ULIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <circle cx="2" cy="4" r="1.2" fill="currentColor" />
    <line x1="5" y1="4" x2="13" y2="4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    <circle cx="2" cy="8" r="1.2" fill="currentColor" />
    <line x1="5" y1="8" x2="13" y2="8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    <circle cx="2" cy="12" r="1.2" fill="currentColor" />
    <line x1="5" y1="12" x2="13" y2="12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

const OLIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <text x="0" y="5" fontSize="5" fill="currentColor" fontFamily="sans-serif">1.</text>
    <line x1="5" y1="4" x2="13" y2="4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    <text x="0" y="9.5" fontSize="5" fill="currentColor" fontFamily="sans-serif">2.</text>
    <line x1="5" y1="8.5" x2="13" y2="8.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    <text x="0" y="14" fontSize="5" fill="currentColor" fontFamily="sans-serif">3.</text>
    <line x1="5" y1="13" x2="13" y2="13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

const CodeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <polyline points="4,3 1,7 4,11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    <polyline points="10,3 13,7 10,11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const QuoteIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <rect x="1" y="3" width="5" height="4" rx="1" stroke="currentColor" strokeWidth="1.2" />
    <path d="M3 7v3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    <rect x="8" y="3" width="5" height="4" rx="1" stroke="currentColor" strokeWidth="1.2" />
    <path d="M10 7v3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

const ClearIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <line x1="2" y1="4" x2="12" y2="4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    <line x1="4" y1="4" x2="4" y2="12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    <line x1="9" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    <line x1="12" y1="8" x2="9" y2="12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

// ─── Shared input class ───────────────────────────────────────────────────────
const inputCls =
  "w-full border border-gray-300 px-4 py-2 text-sm text-gray-900 bg-white rounded-lg " +
  "placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3699FF]/30 transition duration-150";

// ─── People Section Component ─────────────────────────────────────────────────
function PeopleSection({ label, people, setPeople }) {
  const add = () => setPeople([...people, { name: "", designation: "", bio: "" }]);
  const remove = (i) => setPeople(people.filter((_, idx) => idx !== i));
  const update = (i, field, value) =>
    setPeople(people.map((p, idx) => (idx === i ? { ...p, [field]: value } : p)));

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="text-gray-800 font-semibold text-sm">{label}</label>
        <button type="button" onClick={add} className="text-xs px-3 py-1 border border-gray-300 hover:bg-gray-100 transition font-medium rounded-lg text-[#3699FF]">
          + Add
        </button>
      </div>

      {people.length === 0 ? (
        <p className="text-sm text-gray-400 italic">No {label.toLowerCase()} added. (Optional)</p>
      ) : (
        <div className="space-y-3">
          {people.map((person, i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-3 border border-gray-200 p-3 bg-slate-100/90 relative rounded-lg">
              <input type="text" placeholder="Full name" value={person.name} onChange={(e) => update(i, "name", e.target.value)} className={inputCls} />
              <input type="text" placeholder="Designation (e.g. CEO, Prof.)" value={person.designation} onChange={(e) => update(i, "designation", e.target.value)} className={inputCls} />
              <div className="relative">
                <input type="text" placeholder="Short bio (optional)" value={person.bio} onChange={(e) => update(i, "bio", e.target.value)} className={inputCls} />
                <button type="button" onClick={() => remove(i)} title="Remove" className="absolute -top-2 -right-2 w-5 h-5 bg-[#3699FF] text-white text-xs flex items-center justify-center hover:bg-red-600 transition rounded">
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
function EventForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();

  const [societies, setSocieties] = useState([]);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toolbarKey, setToolbarKey] = useState(0); // Forces toolbar re-render on cursor/content change

  const [speakers, setSpeakers] = useState([]);
  const [hosts, setHosts] = useState([]);
  const [chiefGuests, setChiefGuests] = useState([]);
  const [category, setCategory] = useState("");
  
  const CATEGORY_OPTIONS = [
    "Technical", "Workshop", "Seminar", "Sports", "Cultural",
    "Competition", "Hackathon", "Social", "Career", "Other",
  ];

  const [formData, setFormData] = useState({
    title: "",
    organizer: "",
    startDateTime: "",
    endDateTime: "",
    venue: "",
    status: "scheduled",
    image: null,
    isVolunteerOpen: false,
    volunteerLimit: 0,
    volunteerDeadline: "", 
  });

  // ─── Rich Text Editor ───────────────────────────────────────────────────────
  const editor = useEditor({
    extensions: [
      StarterKit,
      Strike,
      Placeholder.configure({
        placeholder: "Describe your event — agenda, speakers, what attendees can expect...",
      }),
    ],
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "min-h-[160px] px-4 py-3 text-sm leading-relaxed text-gray-900 " +
          "focus:outline-none prose prose-sm max-w-none " +
          "prose-headings:font-semibold prose-blockquote:border-l-2 " +
          "prose-blockquote:border-gray-300 prose-blockquote:text-gray-500 " +
          "prose-code:bg-slate-100 prose-code:px-1 prose-code:text-xs",
      },
    },
    // 🔑 Crucial: Forces React to re-render toolbar when editor state changes
    onUpdate: () => setToolbarKey((k) => k + 1),
    onSelectionUpdate: () => setToolbarKey((k) => k + 1),
  });

  // ─── Fetch Societies ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    axios
      .get(`${API_BASE_URL}/societies/Mysocieties/${user._id}`, { withCredentials: true })
      .then((res) => setSocieties(res.data.data || []))
      .catch(() => toast.error("Failed to load societies"));
  }, [user]);

  // ─── Load Event for Edit ────────────────────────────────────────────────────
  useEffect(() => {
    if (!id) return;
    axios
      .get(`${API_BASE_URL}/event/Eventbyid/${id}`, { withCredentials: true })
      .then((res) => {
        const data = res.data.data;
        setFormData({
          title: data.title || "",
          organizer: data.organizer?._id || "",
          startDateTime: data.startDateTime ? new Date(data.startDateTime).toISOString().slice(0, 16) : "",
          endDateTime: data.endDateTime ? new Date(data.endDateTime).toISOString().slice(0, 16) : "",
          venue: data.venue || "",
          status: data.status || "scheduled",
          image: null,
          isVolunteerOpen: data.isVolunteerOpen || false,
          volunteerLimit: data.volunteerLimit || 0,
          volunteerDeadline: data.volunteerDeadline ? new Date(data.volunteerDeadline).toISOString().slice(0, 16) : "",
        });
        if (data.description && editor) {
          editor.commands.setContent(data.description);
        }
        if (data.image) setPreview(uploadFileUrl(data.image));

        setSpeakers(data.speakers || []);
        setHosts(data.hosts || []);
        setChiefGuests(data.chiefGuests || []);
        
        // ✅ FIX: Restore category on edit
        setCategory(data.category || "");
      })
      .catch(() => toast.error("Failed to load event"));
  }, [id, editor]);

  // ─── Handlers ──────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
      return;
    }

    if (name === "startDateTime") {
      const now = new Date();
      const selected = new Date(value);
      if (selected < now) {
        toast.error("Start date/time cannot be in the past!");
        return;
      }
      setFormData((prev) => ({ ...prev, startDateTime: value }));
      if (formData.endDateTime && new Date(formData.endDateTime) < selected) {
        setFormData((prev) => ({ ...prev, endDateTime: "" }));
      }
    } else if (name === "endDateTime") {
      const start = new Date(formData.startDateTime);
      const end = new Date(value);
      if (end <= start) {
        toast.error("End date/time must be after start date/time!");
        return;
      }
      setFormData((prev) => ({ ...prev, endDateTime: value }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({ ...prev, image: file }));
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // ─── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      if (!category) {
        toast.error("Please select a category");
        setLoading(false);
        return;
      }

      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) data.append(key, value);
      });

      data.append("description", editor?.getHTML() || "");
      data.append("category", category);
      data.append("speakers", JSON.stringify(speakers));
      data.append("hosts", JSON.stringify(hosts));
      data.append("chiefGuests", JSON.stringify(chiefGuests));

      if (id) {
        await axios.put(`${API_BASE_URL}/event/update/${id}`, data, { withCredentials: true });
        toast.success("Event updated successfully");
      } else {
        await axios.post(`${API_BASE_URL}/event/create`, data, { withCredentials: true });
        toast.success("Event created successfully");
      }
      navigate("/manager/events");
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!editor) return <div className="p-10 text-center text-gray-500">Loading Editor...</div>;

  // ─── UI ─────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex justify-center items-start p-6 font-sans">
      <div className="bg-white border border-gray-200 shadow-sm rounded-xl w-full max-w-4xl p-10">
        <Link to="/manager/events">
          <button type="button" className="flex items-center text-[#4B5563] hover:text-[#3699FF] mb-6 font-medium">
            <IoArrowBack size={20} className="mr-2" /> Back to Events
          </button>
        </Link>

        <h1 className="text-3xl font-bold text-[#3699FF] mb-8 tracking-tight">
          {id ? "Edit Event" : "Create Event"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-gray-800 font-semibold mb-2">Event Title</label>
            <input type="text" name="title" placeholder="e.g. Annual Tech Summit 2026" value={formData.title} onChange={handleChange} className={inputCls} required />
          </div>

          {/* Organizer */}
          <div>
            <label className="block text-gray-800 font-semibold mb-2">Organizer (Society)</label>
            <select name="organizer" value={formData.organizer} onChange={handleChange} className={inputCls} required>
              <option value="">Select Society</option>
              {societies.map((s) => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Description — Rich Text Editor */}
          <div>
            <label className="block text-gray-800 font-semibold mb-2">Description</label>
            <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#3699FF]/30 transition duration-150">
              
              {/* ✅ KEY PROP FORCES RE-RENDER ON CURSOR/CONTENT CHANGE */}
              <div key={toolbarKey} className="flex items-center gap-0.5 px-2 py-1.5 border-b border-gray-200 bg-slate-100 flex-wrap">
                <select
                  className="h-7 text-xs px-2 border border-gray-300 bg-white text-[#4B5563] cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#3699FF]/35 mr-1 transition rounded"
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "p") editor.chain().focus().setParagraph().run();
                    else if (val === "h1") editor.chain().focus().toggleHeading({ level: 1 }).run();
                    else if (val === "h2") editor.chain().focus().toggleHeading({ level: 2 }).run();
                    else if (val === "h3") editor.chain().focus().toggleHeading({ level: 3 }).run();
                    else if (val === "blockquote") editor.chain().focus().toggleBlockquote().run();
                  }}
                  value={
                    editor.isActive("heading", { level: 1 }) ? "h1" :
                    editor.isActive("heading", { level: 2 }) ? "h2" :
                    editor.isActive("heading", { level: 3 }) ? "h3" :
                    editor.isActive("blockquote") ? "blockquote" : "p"
                  }
                >
                  <option value="p">Paragraph</option>
                  <option value="h1">Heading 1</option>
                  <option value="h2">Heading 2</option>
                  <option value="h3">Heading 3</option>
                  <option value="blockquote">Quote</option>
                </select>

                <ToolbarDivider />
                <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold"><BoldIcon /></ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic"><ItalicIcon /></ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Strikethrough"><StrikeIcon /></ToolbarBtn>

                <ToolbarDivider />
                <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet list"><ULIcon /></ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Numbered list"><OLIcon /></ToolbarBtn>

                <ToolbarDivider />
                <ToolbarBtn onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive("code")} title="Inline code"><CodeIcon /></ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Blockquote"><QuoteIcon /></ToolbarBtn>

                <ToolbarDivider />
                <ToolbarBtn onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()} title="Clear formatting"><ClearIcon /></ToolbarBtn>
              </div>

              <EditorContent editor={editor} className="min-h-[160px]" />

              <div className="px-4 py-1.5 border-t border-gray-200 text-xs text-[#4B5563] text-right bg-slate-100">
                {editor.getText().replace(/\s/g, "").length} characters
              </div>
            </div>
          </div>

          {/* Start & End DateTime */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-800 font-semibold mb-2">Start Date & Time</label>
              <input type="datetime-local" name="startDateTime" value={formData.startDateTime} onChange={handleChange} className={inputCls} required />
            </div>
            <div>
              <label className="block text-gray-800 font-semibold mb-2">End Date & Time</label>
              <input type="datetime-local" name="endDateTime" value={formData.endDateTime} onChange={handleChange} className={inputCls} required />
            </div>
          </div>

          {/* Venue */}
          <div>
            <label className="block text-gray-800 font-semibold mb-2">Venue</label>
            <input type="text" name="venue" placeholder="e.g. Main Auditorium" value={formData.venue} onChange={handleChange} className={inputCls} required />
          </div>

          {/* Status */}
          <div>
            <label className="block text-gray-800 font-semibold mb-2">Status</label>
            <select name="status" value={formData.status} onChange={handleChange} className={inputCls}>
              <option value="scheduled">Scheduled</option>
              <option value="published">Published</option>
              <option value="postponed">Postponed</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="block text-gray-800 font-semibold mb-2">Category</label>
            <select name="category" value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls} required>
              <option value="">Select Category</option>
              {CATEGORY_OPTIONS.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-gray-800 font-semibold mb-2">Event Image</label>
            <input type="file" name="image" accept="image/*" onChange={handleImageChange} className="w-full" />
            {preview && (
              <div className="mt-4 flex flex-col items-start">
                <p className="text-gray-600 mb-2 text-sm font-medium">Preview:</p>
                <img src={preview} alt="Preview" className="h-40 w-40 object-cover border border-gray-200 shadow-sm rounded-lg" />
              </div>
            )}
          </div>

          {/* ── People Section ─────────────────────────────────────────────── */}
          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-lg font-bold text-[#3699FF] mb-1">People</h2>
            <p className="text-sm text-gray-500 mb-6">All fields are optional — add only what applies to this event.</p>
            <div className="space-y-8">
              <PeopleSection label="Chief Guests" people={chiefGuests} setPeople={setChiefGuests} />
              <PeopleSection label="Speakers" people={speakers} setPeople={setSpeakers} />
              <PeopleSection label="Hosts" people={hosts} setPeople={setHosts} />
            </div>
          </div>

          {/* ── Volunteer Section ───────────────────────────────────────────── */}
          <div className="space-y-4">
            <label className="block text-gray-800 font-semibold mb-2 text-sm uppercase tracking-wider">Volunteer Settings</label>
            <div className="bg-slate-100 border border-gray-200 p-6 rounded-xl space-y-4 shadow-sm">
              <div className="flex items-center gap-3">
                <input type="checkbox" name="isVolunteerOpen" id="isVolunteerOpen" checked={formData.isVolunteerOpen} onChange={handleChange} className="w-5 h-5 rounded border-gray-300 text-[#3699FF] focus:ring-[#3699FF] cursor-pointer" />
                <label htmlFor="isVolunteerOpen" className="text-[#3699FF] font-bold text-sm select-none cursor-pointer">Enable Volunteer Applications</label>
              </div>

              {formData.isVolunteerOpen && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div>
                    <label className="block text-[#4B5563] font-black text-[10px] uppercase tracking-widest mb-2">Max Volunteers</label>
                    <input type="number" name="volunteerLimit" placeholder="0 (Unlimited)" value={formData.volunteerLimit} onChange={handleChange} className={inputCls} min="0" />
                    <p className="text-[10px] text-[#4B5563] mt-1 italic">Enter 0 for no limit.</p>
                  </div>
                  <div>
                    <label className="block text-[#4B5563] font-black text-[10px] uppercase tracking-widest mb-2">Application Deadline</label>
                    <input type="datetime-local" name="volunteerDeadline" value={formData.volunteerDeadline} onChange={handleChange} className={inputCls} />
                    <p className="text-[10px] text-[#4B5563] mt-1 italic">Leave empty for no deadline.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-4 mt-6">
            <Link to="/manager/events">
              <button type="button" className="px-8 py-2 border border-gray-300 hover:bg-gray-100 transition font-medium rounded-lg text-[#3699FF]">Cancel</button>
            </Link>
            <button type="submit" disabled={loading} className="px-8 py-2 bg-[#3699FF] text-white hover:brightness-110 transition font-medium rounded-lg shadow-md disabled:opacity-60">
              {loading ? "Saving..." : id ? "Update Event" : "Create Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EventForm;