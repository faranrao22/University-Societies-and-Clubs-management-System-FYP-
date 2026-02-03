import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../../../config/api.config";
import { toast } from "react-hot-toast"; // ✅ FIX
import {
  FiArrowLeft,
  FiUser,
  FiMail,
  FiCheck,
  FiX,
  FiShield,
  FiHash,
  FiInfo,
} from "react-icons/fi";

function ReviewCandidate() {
  const { electionId, candidateId } = useParams();
  const navigate = useNavigate();

  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch candidate details
  const fetchCandidate = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/election/reviewCandidate/${candidateId}`,
        { withCredentials: true }
      );
      setCandidate(res.data.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load candidate data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidate();
  }, [candidateId]);

  // Approve / Reject candidate
  const handleAction = async (action) => {
    try {
      setActionLoading(true);

      await axios.patch(
        `${API_BASE_URL}/election/update-application/${electionId}/${candidateId}`,
        {
          status: action === "approve" ? "approved" : "rejected",
        },
        { withCredentials: true }
      );

      toast.success(
        `Candidate ${action === "approve" ? "approved" : "rejected"} successfully`
      );

      fetchCandidate(); // refresh UI
    } catch (err) {
      console.error(err);
      toast.error("Could not update candidate status");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin mb-4"></div>
        <span className="text-slate-500 font-medium tracking-widest text-xs uppercase">
          Retrieving Dossier
        </span>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="p-20 text-center text-slate-500">
        Document record not found.
      </div>
    );
  }

  const { fullname, email, image, cnic, status } = candidate;

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-slate-900 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-slate-500 hover:text-slate-900 text-sm font-medium"
          >
            <FiArrowLeft className="mr-2" /> Back
          </button>

          <div className="flex items-center space-x-2">
            <div
              className={`h-2 w-2 rounded-full ${
                status === "approved"
                  ? "bg-emerald-500"
                  : status === "rejected"
                  ? "bg-rose-500"
                  : "bg-amber-400"
              }`}
            />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-600">
              {status}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 mt-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div>
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <div className="aspect-square bg-slate-100">
                <img
                  src={`${API_BASE_URL.replace("/api", "")}/uploads/${image}`}
                  alt={fullname}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-5">
                <h1 className="text-xl font-bold">{fullname}</h1>
                <p className="text-sm text-slate-500 mb-4">{email}</p>

                <div className="pt-4 border-t border-slate-100">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">ID</span>
                    <span className="font-mono text-slate-700">
                      {candidateId.slice(0, 8)}...
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main */}
          <div className="md:col-span-2 space-y-6">
            <section className="bg-white border border-slate-200 rounded-xl p-8">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-8 flex items-center">
                <FiInfo className="mr-2" /> Candidate Data
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <DataField icon={<FiUser />} label="Full Name" value={fullname} />
                <DataField icon={<FiMail />} label="Email" value={email} />
                <DataField icon={<FiHash />} label="CNIC" value={cnic} />
                <DataField
                  icon={<FiShield />}
                  label="Election Group"
                  value="National Assembly"
                />
              </div>
            </section>

            {status === "pending" && (
              <section className="bg-slate-900 rounded-xl p-8 text-white">
                <div className="flex flex-col sm:flex-row justify-between gap-6">
                  <div>
                    <h3 className="text-lg font-bold">Verification Pending</h3>
                    <p className="text-slate-400 text-sm">
                      Approve or reject this candidate
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleAction("approve")}
                      disabled={actionLoading}
                      className="px-6 py-2.5 bg-emerald-500 rounded-lg font-bold flex items-center"
                    >
                      <FiCheck className="mr-2" /> Approve
                    </button>

                    <button
                      onClick={() => handleAction("reject")}
                      disabled={actionLoading}
                      className="px-6 py-2.5 bg-rose-600 rounded-lg font-bold flex items-center"
                    >
                      <FiX className="mr-2" /> Reject
                    </button>
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

const DataField = ({ icon, label, value }) => (
  <div>
    <div className="flex items-center text-slate-400 mb-1">
      <span className="text-xs">{icon}</span>
      <span className="ml-2 text-[10px] font-bold uppercase tracking-widest">
        {label}
      </span>
    </div>
    <p className="text-slate-900 font-semibold">{value}</p>
  </div>
);

export default ReviewCandidate;
