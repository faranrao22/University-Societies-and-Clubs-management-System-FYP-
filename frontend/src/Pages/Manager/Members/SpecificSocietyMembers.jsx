import React, { useEffect, useState } from "react";
import { useParams,useNavigate } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../../../config/api.config";
import { IoArrowBack } from "react-icons/io5";
import { useLocation } from "react-router-dom";
function SpecificSocietyMembers() {
  const { societyId } = useParams();
  const navigate = useNavigate(); // <-- added
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (societyId) fetchMembers();
  }, [societyId]);

  const fetchMembers = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/memberShip/members/${societyId}`,
        { withCredentials: true }
      );

      // Ensure members is always an array
      setMembers(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (err) {
      console.error("Error fetching members:", err);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };
const location = useLocation();
const societyName = location.state?.societyName || "Unknown Society";
  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center text-gray-500">
        Loading members...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
         {/* Back Button */}
      <button
        onClick={() => navigate(-1)} // go back
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
       < IoArrowBack size={20} className="mr-2" /> Back Back
      </button>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Members of {societyName}{" "}Society
      </h1>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">#</th>
              <th className="px-6 py-3 text-left">Name</th>
              <th className="px-6 py-3 text-left">Email</th>
              <th className="px-6 py-3 text-left">Department</th>
              <th className="px-6 py-3 text-left">Semester</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {Array.isArray(members) && members.length > 0 ? (
              members.map((member, idx) => (
                <tr key={member._id || idx}>
                  <td className="px-6 py-4">{idx + 1}</td>
                  <td className="px-6 py-4">{member.fullname }</td>
                  <td className="px-6 py-4">{member.email}</td>
                  <td className="px-6 py-4">{member.Department}</td>
                  <td className="px-6 py-4">{member.semester}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-4 text-gray-500">
                  No members found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SpecificSocietyMembers;
