import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  CheckCircle2,
  X,
  Loader2,
  AlertCircle,
  Users,
  FileText,
  Shield,
} from "lucide-react";
import API_BASE_URL from "../../../config/api.config";
import PageLoader from "../../../Components/PageLoader";

/* ---------------- Skeleton ---------------- */
const Skeleton = () => <PageLoader fullScreen />;

/* ---------------- Success Modal ---------------- */
const SuccessModal = ({ title, onBack }) => (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-50">
    <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
      <CheckCircle2 className="mx-auto text-[#1d4ed8] mb-4" size={48} />
      <h2 className="text-xl font-bold text-slate-800 mb-2">
        Application Submitted
      </h2>
      <p className="text-sm text-slate-500 mb-6">
        Your application for <b>{title}</b> has been submitted successfully.
      </p>

      <button
        onClick={onBack}
        className="w-full bg-[#1e3a8a] text-white py-2 rounded-xl hover:bg-[#1d4ed8] transition"
      >
        Back to Elections
      </button>
    </div>
  </div>
);

/* ---------------- Info Item ---------------- */
const Info = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-blue-50 text-[#1e3a8a]">
      <Icon size={18} />
    </div>
    <div>
      <p className="text-xs text-slate-400 uppercase">{label}</p>
      <p className="text-sm text-slate-700 font-medium">{value}</p>
    </div>
  </div>
);

export default function ApplyPage() {
  const { electionId } = useParams();
  const navigate = useNavigate();

  const [election, setElection] = useState(null);
  const [form, setForm] = useState({
    role: "",
    cnic: "",
    image: null,
  });

  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const fileRef = useRef();

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${API_BASE_URL}/election/Singleelection/${electionId}`)
      .then((res) => setElection(res.data.data))
      .finally(() => setLoading(false));
  }, [electionId]);

  const pickImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setForm((p) => ({ ...p, image: file }));

    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.role || !form.cnic || !form.image) {
      setError("Please fill all fields");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const fd = new FormData();
      fd.append("role", form.role);
      fd.append("cnic", form.cnic);
      fd.append("image", form.image);

      await axios.post(
        `${API_BASE_URL}/election/apply/${electionId}`,
        fd,
        { withCredentials: true }
      );

      setSuccess(true);
    } catch (err) {
      setError(err?.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !election) return <Skeleton />;

  if (success)
    return (
      <SuccessModal
        title={election.title}
        onBack={() => navigate("/applyForElections")}
      />
    );

  return (
    <div className="min-h-screen bg-slate-200 py-10 px-4 public-theme">

      {/* BACK BUTTON */}
      <div className="max-w-6xl mx-auto mb-4">
        <button
          onClick={() => navigate("/applyForElections")}
          className="flex items-center gap-2 text-slate-600 hover:text-[#1d4ed8] transition"
        >
          <ArrowLeft size={18} />
          <span className="font-medium">Back</span>
        </button>
      </div>

      {/* MAIN CARD */}
      <div className="max-w-5xl mx-auto bg-white border rounded-2xl shadow-sm grid lg:grid-cols-5 overflow-hidden">

        {/* LEFT SIDE */}
        <div className="lg:col-span-2 p-8 bg-slate-50 border-r">
          <h1 className="text-2xl font-bold text-slate-800">
            {election.title}
          </h1>

          <p className="text-sm text-slate-500 mt-2 mb-6">
            Society Election Application Form
          </p>

          <div className="space-y-5">
            <Info
              icon={Users}
              label="Roles"
              value={`${election.roles.length} positions`}
            />
            <Info
              icon={Shield}
              label="Verification"
              value="Identity verification required"
            />
            <Info
              icon={FileText}
              label="Requirements"
              value="CNIC + Profile Image"
            />
          </div>
        </div>

        {/* RIGHT SIDE FORM */}
        <div className="lg:col-span-3 p-8">

          <h2 className="text-xl font-semibold text-slate-800 mb-6">
            Apply for Position
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* ROLE */}
            <div>
              <label className="text-xs text-slate-500">Select Role</label>
              <select
                value={form.role}
                onChange={(e) =>
                  setForm({ ...form, role: e.target.value })
                }
                className="w-full border rounded-xl p-3 mt-1 focus:ring-2 focus:ring-[#1d4ed8] outline-none"
              >
                <option value="">Choose role</option>
                {election.roles.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {/* CNIC */}
            <div>
              <label className="text-xs text-slate-500">CNIC</label>
              <input
                value={form.cnic}
                onChange={(e) =>
                  setForm({ ...form, cnic: e.target.value })
                }
                placeholder="00000-0000000-0"
                className="w-full border rounded-xl p-3 mt-1 focus:ring-2 focus:ring-[#1d4ed8] outline-none"
              />
            </div>

            {/* IMAGE */}
            <div>
              <label className="text-xs text-slate-500">Profile Image</label>

              <input
                type="file"
                ref={fileRef}
                onChange={pickImage}
                className="hidden"
              />

              {preview ? (
                <div className="flex items-center gap-3 mt-2 border p-3 rounded-xl">
                  <img
                    src={preview}
                    className="w-14 h-14 rounded-lg object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setPreview(null);
                      setForm((p) => ({ ...p, image: null }));
                    }}
                    className="text-red-500 ml-auto"
                  >
                    <X />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current.click()}
                  className="w-full border border-dashed p-6 rounded-xl text-slate-500 mt-2 hover:border-[#38bdf8]"
                >
                  Click to upload image
                </button>
              )}
            </div>

            {/* ERROR */}
            {error && (
              <div className="flex items-center gap-2 text-red-500 text-sm">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            {/* SUBMIT */}
            <button
              disabled={submitting}
              className="w-full bg-[#1e3a8a] text-white py-3 rounded-xl hover:bg-[#1d4ed8] transition"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="animate-spin" size={16} />
                  Submitting...
                </span>
              ) : (
                "Submit Application"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}