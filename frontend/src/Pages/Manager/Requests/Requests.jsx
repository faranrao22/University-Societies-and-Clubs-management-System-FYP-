import React, { useState, useEffect } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import API_BASE_URL from "../../../config/api.config";

function Requests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/memberShip/requests`, {
        withCredentials: true,
      });
      // Only show pending requests
      const pendingRequests = res.data.data.filter((r) => r.status === "Pending");
      setRequests(pendingRequests);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch requests:", err);
      toast.error("Failed to fetch requests");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleUpdateStatus = async (requestId, status) => {
    try {
      await axios.put(
        `${API_BASE_URL}/memberShip/update/${requestId}`,
        { status },
        { withCredentials: true }
      );
      toast.success(`Request ${status.toLowerCase()} successfully`);
      fetchRequests(); // refresh after update
    } catch (err) {
      console.error(err.response?.data || err);
      toast.error("Failed to update request");
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen flex justify-center items-center text-gray-500">
        Loading requests...
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <Toaster position="top-right" />
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Join Requests</h1>
        <p className="text-gray-500">No pending requests found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <Toaster position="top-right" />
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Pending Join Requests</h1>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-2 px-4 border-b text-left text-gray-600">Society</th>
              <th className="py-2 px-4 border-b text-left text-gray-600">User</th>
              <th className="py-2 px-4 border-b text-left text-gray-600">Email</th>
              <th className="py-2 px-4 border-b text-left text-gray-600">Department</th>
              <th className="py-2 px-4 border-b text-left text-gray-600">Requested At</th>
              <th className="py-2 px-4 border-b text-left text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr key={req.requestId} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b">{req.societyName}</td>
                <td className="py-2 px-4 border-b">{req.user.fullname}</td>
                <td className="py-2 px-4 border-b">{req.user.email}</td>
                <td className="py-2 px-4 border-b">{req.user.Department}</td>
                <td className="py-2 px-4 border-b">
                  {new Date(req.requestedAt).toLocaleString()}
                </td>
                <td className="py-2 px-4 border-b flex gap-2">
                  <button
                    onClick={() => handleUpdateStatus(req.requestId, "Approved")}
                    className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(req.requestId, "Rejected")}
                    className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Requests;
