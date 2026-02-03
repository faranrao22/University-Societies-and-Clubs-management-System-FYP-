import React, { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../../../config/api.config";
import { useAuth } from "../../../context/AuthContext";
import HotToast from "react-hot-toast";

export default function DraftElections() {
  const { user } = useAuth();
  const [draftElections, setDraftElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openFormId, setOpenFormId] = useState(null);
  const [applyDeadline, setApplyDeadline] = useState("");

  // Fetch draft elections
  useEffect(() => {
    const fetchDrafts = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/election/my-drafts`, {
          withCredentials: true,
        });
        setDraftElections(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDrafts();
  }, [user._id]);

  // Update applyDeadline & status
  const handleUpdate = async (election) => {
    if (!applyDeadline) return;

    try {
      await axios.patch(
        `${API_BASE_URL}/election/openApplications/${election._id}`,
        { applyDeadline },
        { withCredentials: true }
      );
      HotToast.success("Application deadline set & status updated!");
      setDraftElections((prev) =>
        prev.map((e) =>
          e._id === election._id
            ? { ...e, applyDeadline, status: "APPLICATIONS_OPEN" }
            : e
        )
      );
      setOpenFormId(null);
      setApplyDeadline("");
    } catch (err) {
      console.error(err);
      HotToast.error("Failed to update deadline.");
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex justify-center items-center text-gray-500">
        Loading...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">Draft Elections</h1>

        {draftElections.length === 0 && (
          <div className="text-center py-10 text-gray-500">
            No draft elections found.
          </div>
        )}

        <div className="space-y-4">
          {draftElections.map((election) => (
            <div
              key={election._id}
              className="bg-white p-6 rounded-lg shadow"
            >
              {/* Election Summary */}
              <div className="flex justify-between items-center cursor-pointer">
                <div>
                  <h2 className="font-bold text-lg">{election.title}</h2>
                  <p className="text-sm text-gray-500">
                    Roles: {election.roles.join(", ")}
                  </p>
                  <p className="text-sm text-gray-500">
                    Who can vote:{" "}
                    {election.votingEligibility === "MEMBERS_ONLY"
                      ? "Registered Members Only"
                      : "All Students"}
                  </p>
                </div>
                <button
                  onClick={() =>
                    setOpenFormId(openFormId === election._id ? null : election._id)
                  }
                  className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800"
                >
                  {openFormId === election._id ? "Close" : "Set Apply Deadline"}
                </button>
              </div>

              {/* Inline Form */}
              {openFormId === election._id && (
                <div className="mt-4 border-t pt-4">
                  <label className="block text-xs font-bold text-gray-500 mb-1">
                    Application Deadline
                  </label>
                  <input
                    type="datetime-local"
                    className="w-full border px-4 py-2 rounded mb-4"
                    value={applyDeadline}
                    onChange={(e) => setApplyDeadline(e.target.value)}
                  />
                  <button
                    onClick={() => handleUpdate(election)}
                    className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800"
                  >
                    Update & Open Applications
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
