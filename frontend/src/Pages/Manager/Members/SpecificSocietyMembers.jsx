import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import API_BASE_URL, { uploadFileUrl } from "../../../config/api.config";
import { IoArrowBack, IoClose } from "react-icons/io5";

function SpecificSocietyMembers() {
  const { societyId } = useParams();
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState(null); // State for the Modal

  const location = useLocation();
  const societyName = location.state?.societyName || "Unknown Society";

  useEffect(() => {
    if (societyId) fetchMembers();
  }, [societyId]);

  const fetchMembers = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/memberShip/members/${societyId}`,
        { withCredentials: true }
      );
      setMembers(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (err) {
      console.error("Error fetching members:", err);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center text-[#4B5563]">
        Loading members...
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-[#4B5563] hover:text-[#3699FF] mb-6"
      >
        <IoArrowBack size={20} className="mr-2" /> Back
      </button>

      <h1 className="text-2xl font-bold text-[#3699FF] mb-6">
        Members of {societyName} Society
      </h1>

      <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-200">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll No</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {members.length > 0 ? (
              members.map((member, idx) => (
                <tr key={member._id || idx}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{idx + 1}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img 
                        className="h-8 w-8 rounded-full object-cover mr-3 border border-gray-200" 
                        src={uploadFileUrl(member.profileImage)} 
                        alt="" 
                        onError={(e) => e.target.src = "https://via.placeholder.com/32"}
                      />
                      <div className="text-sm font-medium text-gray-900">{member.fullname}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">{member.rollNo}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.Department}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button 
                      onClick={() => setSelectedMember(member)}
                      className="text-[#3699FF] hover:text-[#2B8ACF] font-semibold text-sm"
                    >
                      View Profile
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-10 text-gray-500">No members found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* --- STUDENT INFO MODAL --- */}
      {selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden relative">
            
            {/* Modal Header */}
            <div className="bg-slate-100 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-[#3699FF]">Student Profile</h2>
              <button onClick={() => setSelectedMember(null)} className="text-gray-500 hover:text-red-500 transition">
                <IoClose size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-6 mb-8">
                <img 
                  src={uploadFileUrl(selectedMember.profileImage)} 
                  className="w-32 h-32 rounded-lg object-cover border-4 border-gray-100 shadow-sm mx-auto md:mx-0"
                  alt="Profile"
                  onError={(e) => e.target.src = "https://via.placeholder.com/150"}
                />
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-2xl font-bold text-gray-900">{selectedMember.fullname}</h3>
                  <p className="text-[#2B8ACF] font-medium">{selectedMember.email}</p>
                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500 block">Department</span>
                      <span className="font-semibold">{selectedMember.Department}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Roll Number</span>
                      <span className="font-semibold">{selectedMember.rollNo}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Semester</span>
                      <span className="font-semibold">{selectedMember.semester}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Session</span>
                      <span className="font-semibold">{selectedMember.session}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ID Card Images Section */}
              <div className="space-y-4">
                <h4 className="font-bold text-gray-700 border-b pb-2">Student Card Verification</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-xs text-gray-500 uppercase">Front Side</span>
                    <img 
                      src={uploadFileUrl(selectedMember.studentCardFront)} 
                      className="w-full h-40 object-cover rounded-lg border border-gray-200" 
                      alt="ID Front"
                      onError={(e) => e.target.src = "https://via.placeholder.com/300x200?text=No+Image"}
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-gray-500 uppercase">Back Side</span>
                    <img 
                      src={uploadFileUrl(selectedMember.studentCardBack)} 
                      className="w-full h-40 object-cover rounded-lg border border-gray-200" 
                      alt="ID Back"
                      onError={(e) => e.target.src = "https://via.placeholder.com/300x200?text=No+Image"}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-100 px-6 py-4 flex justify-end border-t border-gray-100">
              <button 
                onClick={() => setSelectedMember(null)}
                className="px-6 py-2 bg-[#3699FF] text-white rounded-lg hover:brightness-110 transition text-sm font-medium shadow-md"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SpecificSocietyMembers;