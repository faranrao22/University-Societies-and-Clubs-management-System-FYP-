import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../../../config/api.config";
import { useAuth } from "../../../context/AuthContext";
import { IoArrowForward } from "react-icons/io5";

function Members() {
  const { user } = useAuth();
  const [societies, setSocieties] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSocieties();
  }, []);

  const fetchSocieties = () => {
    axios
      .get(`${API_BASE_URL}/societies/Mysocieties/${user._id}`, {
        withCredentials: true,
      })
      .then((res) => setSocieties(res.data.data))
      .catch((err) => console.log(err));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Society Members
          </h1>
          <p className="text-sm text-gray-500">
            Select a society to view and manage its members
          </p>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-300">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">
                    #
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">
                    Society Name
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">
                    Members
                  </th>
                  <th className="px-6 py-3 text-right font-semibold text-gray-700">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {societies.length > 0 ? (
                  societies.map((society, idx) => (
                    <tr
                      key={society._id}
                      className="hover:bg-gray-50 transition"
                    >
                      <td className="px-6 py-4 text-gray-700">
                        {idx + 1}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {society.name}
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {society.department || "—"}
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {society.members?.length || 0}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() =>
                            navigate(
                              `/manager/SpecificSocietymembers/${society._id}`,
                              { state: { societyName: society.name } }
                            )
                          }
                          className="inline-flex items-center text-gray-900 hover:text-gray-700 font-medium"
                        >
                          View
                          <IoArrowForward className="ml-1" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className="text-center py-6 text-gray-500 font-medium"
                    >
                      No societies found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Members;
