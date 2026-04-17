import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../../../config/api.config";
import { toast } from "react-hot-toast";
import {
  FiArrowLeft,
  FiUser,
  FiMail,
  FiCheck,
  FiX,
  FiHash,
  FiShield,
} from "react-icons/fi";

function ReviewCandidate() {
  const { electionId, candidateId } = useParams();
  const navigate = useNavigate();

  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // ✅ reason + action state
  const [reason, setReason] = useState("");
  const [activeAction, setActiveAction] = useState(null); 
  // "reject" | "dispute" | null

  const fetchCandidate = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/election/reviewCandidate/${candidateId}`,
        { withCredentials: true }
      );
      setCandidate(res.data.data);
    } catch (err) {
      toast.error("Failed to load candidate data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidate();
  }, [candidateId]);

  // ✅ handle button click first (show input)
  const handleSelectAction = (action) => {
    if (action === "approve") {
      handleAction("approve");
      return;
    }

    setActiveAction(action); // show textarea
    setReason(""); // reset old reason
  };

  const handleAction = async (action) => {
    try {
      if ((action === "reject" || action === "dispute") && reason.trim() === "") {
        return toast.error("Please enter a reason");
      }

      setActionLoading(true);

      let statusValue = "";

      if (action === "approve") statusValue = "approved";
      else if (action === "reject") statusValue = "rejected";
      else if (action === "dispute") statusValue = "inDispute";

      await axios.patch(
        `${API_BASE_URL}/election/update-application/${electionId}/${candidateId}`,
        {
          status: statusValue,
          reason: reason.trim(),
        },
        { withCredentials: true }
      );

      toast.success(`Candidate marked as ${statusValue}`);

      setReason("");
      setActiveAction(null);
      fetchCandidate();

    } catch (err) {
      toast.error("Could not update candidate status");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[#4B5563]">
        Loading candidate details...
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[#4B5563]">
        Candidate not found.
      </div>
    );
  }

  const { fullname, email, image, cnic, status } = candidate;

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">

        {/* BACK */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-sm text-[#4B5563] hover:text-[#3699FF] mb-6"
        >
          <FiArrowLeft className="mr-2" /> Back
        </button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* PROFILE */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

            <div className="aspect-square bg-slate-100">
              <img
                src={`${API_BASE_URL.replace("/api", "")}/uploads/${image}`}
                alt={fullname}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-5 text-center">
              <h1 className="text-xl font-semibold text-[#3699FF]">{fullname}</h1>
              <p className="text-sm text-gray-500">{email}</p>
              <p className="text-xs text-gray-400 mt-2">CNIC: {cnic}</p>

              <div className="mt-4">
                <span className={`px-3 py-1 text-xs rounded-full font-medium
                  ${
                    status === "approved"
                      ? "bg-green-100 text-green-700"
                      : status === "rejected"
                      ? "bg-red-100 text-red-700"
                      : status === "inDispute"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {status === "inDispute" ? "IN DISPUTE" : status.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="md:col-span-2 space-y-6">

            {/* DETAILS */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h2 className="text-lg font-semibold mb-4 text-[#3699FF]">Candidate Details</h2>

              <div className="grid grid-cols-2 gap-4">
                <DataField icon={<FiUser />} label="Full Name" value={fullname} />
                <DataField icon={<FiMail />} label="Email" value={email} />
                <DataField icon={<FiHash />} label="CNIC" value={cnic} />
              </div>
            </div>

            {/* ACTION */}
            {status === "pending" && (
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">

                <h3 className="text-lg font-semibold text-[#3699FF]">Review Application</h3>

                {/* ACTION BUTTONS */}
                <div className="flex gap-3 flex-wrap">

                  <button
                    onClick={() => handleSelectAction("approve")}
                    disabled={actionLoading}
                    className="px-5 py-2 bg-[#3699FF] text-white rounded-lg shadow-sm hover:brightness-110"
                  >
                    <FiCheck /> Approve
                  </button>

                  <button
                    onClick={() => handleSelectAction("reject")}
                    disabled={actionLoading}
                    className="px-5 py-2 bg-red-500 text-white rounded-lg"
                  >
                    <FiX /> Reject
                  </button>

                  <button
                    onClick={() => handleSelectAction("dispute")}
                    disabled={actionLoading}
                    className="px-5 py-2 bg-yellow-500 text-white rounded-lg"
                  >
                    <FiShield /> Dispute
                  </button>

                </div>

                {/* ✅ SHOW INPUT ONLY WHEN REJECT OR DISPUTE CLICKED */}
                {(activeAction === "reject" || activeAction === "dispute") && (
                  <div className="mt-4 space-y-3">

                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder={`Enter reason for ${activeAction}...`}
                      rows={4}
                      className="w-full border border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-[#3699FF]/30"
                    />

                    <button
                      onClick={() => handleAction(activeAction)}
                      disabled={actionLoading || reason.trim() === ""}
                      className="px-5 py-2 bg-[#3699FF] text-white rounded-lg shadow-sm hover:brightness-110 disabled:opacity-50"
                    >
                      Submit {activeAction}
                    </button>

                  </div>
                )}

              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

/* FIELD */
const DataField = ({ icon, label, value }) => (
  <div className="p-3 bg-slate-100 rounded-lg border border-gray-200">
    <div className="text-xs text-[#4B5563] flex gap-2 items-center">
      {icon} {label}
    </div>
    <div className="font-medium text-[#3699FF]">{value}</div>
  </div>
);

export default ReviewCandidate;