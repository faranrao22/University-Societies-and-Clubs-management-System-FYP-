import React, { useState, useEffect } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { Eye, Check, X, Clock, User, BookOpen, Calendar, FileText } from "lucide-react";
import API_BASE_URL, { uploadFileUrl } from "../../../config/api.config";

function Requests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null); // For the Modal

  const fetchRequests = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/memberShip/requests`, {
        withCredentials: true,
      });
      // Filter pending
      const pendingRequests = res.data.data.filter((r) => r.status === "Pending");
      setRequests(pendingRequests);
      setLoading(false);
    } catch (err) {
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
      toast.success(`Request ${status} successfully`);
      setSelectedRequest(null); // Close modal if open
      fetchRequests();
    } catch (err) {
      toast.error("Failed to update request");
    }
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen text-[#4B5563]">Loading...</div>;

  return (
    <div className="min-h-screen p-8">
      <Toaster position="top-right" />
      
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-black text-[#3699FF]">Join Requests</h1>
          <p className="text-[#4B5563] font-medium">Review student applications for your societies.</p>
        </header>

        {requests.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-gray-200">
            <p className="text-[#4B5563] font-bold">No pending requests found.</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-100">
                <tr>
                  <th className="p-5 text-xs font-black uppercase tracking-widest text-gray-400">Student</th>
                  <th className="p-5 text-xs font-black uppercase tracking-widest text-gray-400">Society</th>
                  <th className="p-5 text-xs font-black uppercase tracking-widest text-gray-400">Department</th>
                  <th className="p-5 text-xs font-black uppercase tracking-widest text-gray-400">Roll No</th>
                  <th className="p-5 text-xs font-black uppercase tracking-widest text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {requests.map((req) => (
                  <tr key={req.requestId} className="hover:bg-gray-100 transition-colors">
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <img 
                          src={uploadFileUrl(req.studentProfile?.profileImage)} 
                          className="w-10 h-10 rounded-full object-cover bg-gray-200"
                          alt=""
                        />
                        <div>
                          <p className="font-bold text-gray-900">{req.studentProfile?.fullname}</p>
                          <p className="text-xs text-gray-500">{req.studentProfile?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-5 font-medium text-gray-700">{req.societyName}</td>
                    <td className="p-5 text-sm text-gray-600">{req.studentProfile?.Department}</td>
                    <td className="p-5 text-sm font-mono text-[#3699FF]">{req.studentProfile?.rollNo}</td>
                    <td className="p-5">
                      <button 
                        onClick={() => setSelectedRequest(req)}
                        className="flex items-center gap-2 px-4 py-2 bg-[#3699FF] text-white rounded-xl text-xs font-bold shadow-md hover:brightness-110 transition"
                      >
                        <Eye size={14} /> Review Application
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- APPLICATION DETAIL MODAL --- */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-slate-100">
              <h2 className="text-xl font-black text-[#3699FF]">Application Details</h2>
              <button onClick={() => setSelectedRequest(null)} className="p-2 hover:bg-white rounded-full text-[#4B5563]">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                
                {/* Section 1: Student Profile */}
                <div className="space-y-6">
                  <h3 className="text-xs font-black uppercase text-[#3699FF] tracking-widest flex items-center gap-2">
                    <User size={14} /> Student Profile
                  </h3>
                  <div className="bg-slate-100 p-6 rounded-3xl space-y-4 border border-gray-200">
                    <div className="flex justify-between">
                      <span className="text-gray-500 text-sm">Semester</span>
                      <span className="font-bold">{selectedRequest.studentProfile?.semester}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 text-sm">Session</span>
                      <span className="font-bold">{selectedRequest.studentProfile?.session}</span>
                    </div>
                    <div className="space-y-2">
                      <span className="text-gray-500 text-sm block">ID Card Verification</span>
                      <div className="grid grid-cols-2 gap-2">
                        <img src={uploadFileUrl(selectedRequest.studentProfile?.studentCardFront)} className="rounded-lg h-24 w-full object-cover border" alt="Front" />
                        <img src={uploadFileUrl(selectedRequest.studentProfile?.studentCardBack)} className="rounded-lg h-24 w-full object-cover border" alt="Back" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 2: Application Content */}
                <div className="space-y-6">
                  <h3 className="text-xs font-black uppercase text-[#3699FF] tracking-widest flex items-center gap-2">
                    <FileText size={14} /> Statement of Interest
                  </h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-100 border border-gray-200 rounded-2xl">
                      <p className="text-sm text-gray-700 leading-relaxed italic">
                        "{selectedRequest.applicationDetails?.reason}"
                      </p>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-gray-400 uppercase">Key Skills</span>
                      <p className="text-sm font-bold text-gray-800">{selectedRequest.applicationDetails?.skills || "N/A"}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-xs font-bold text-gray-400 uppercase">Availability</span>
                        <p className="text-sm text-gray-800">{selectedRequest.applicationDetails?.availability || "N/A"}</p>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-gray-400 uppercase">Experience</span>
                        <p className="text-sm text-gray-800">{selectedRequest.applicationDetails?.experience || "N/A"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer (Actions) */}
            <div className="p-6 bg-slate-100 border-t border-gray-200 flex gap-4">
              <button 
                onClick={() => handleUpdateStatus(selectedRequest.requestId, "Rejected")}
                className="flex-1 py-4 bg-white border-2 border-red-100 text-red-600 rounded-2xl font-bold hover:bg-red-50 transition flex items-center justify-center gap-2"
              >
                <X size={18} /> Reject Application
              </button>
              <button 
                onClick={() => handleUpdateStatus(selectedRequest.requestId, "Approved")}
                className="flex-1 py-4 bg-[#3699FF] text-white rounded-2xl font-bold hover:brightness-110 transition flex items-center justify-center gap-2 shadow-lg shadow-[#3699FF]/15"
              >
                <Check size={18} /> Approve Member
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Requests;