import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import axios from "axios";
import { toast } from "react-hot-toast";
import CreatableSelect from "react-select/creatable";
import { useAuth } from "../../../context/AuthContext";
import API_BASE_URL, { uploadFileUrl } from '../../../config/api.config';

function SocietyForm() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { id } = useParams();

  const predefinedRoles = [
    { value: "Secretary", label: "Secretary" },
    { value: "Treasurer", label: "Treasurer" },
    { value: "Member", label: "Member" },
  ];

  const [formData, setFormData] = useState({
    name: "",
    shortName: "",
    advisor: "",
    membersCount: "",
    email: "",
    phone: "",
    description: "",
    joinPolicy: "",
    image: null,
  });

  const [roles, setRoles] = useState([]);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (id) {
      axios.get(`${API_BASE_URL}/societies/${id}`, { withCredentials: true })
        .then(res => {
          const data = res.data.data;
          setFormData({
            name: data.name || "",
            shortName: data.shortName || "",
            advisor: data.advisor || "",
            membersCount: data.membersCount || "",
            email: data.email || "",
            phone: data.phone || "",
            description: data.description || "",
            joinPolicy: data.joinPolicy || "",
            image: null,
          });
          if (data.roles && data.roles.length > 0) {
            const filteredRoles = data.roles
              .filter(r => r.name.toLowerCase() !== "president")
              .map(r => ({ value: r.name, label: r.name }));
            setRoles(filteredRoles);
          }
          if (data.image) setPreview(uploadFileUrl(data.image));
        })
        .catch(err => console.log(err));
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleRolesChange = (selectedOptions) => setRoles(selectedOptions || []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, image: file });
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      for (let key in formData) if (formData[key] !== null) data.append(key, formData[key]);
      const allRoles = [
        { name: "President", user: user.id },
        ...roles.map(r => ({ name: r.value, user: null }))
      ];
      data.append("roles", JSON.stringify(allRoles));

      if (id) {
        await axios.put(`${API_BASE_URL}/societies/update/${id}`, data, {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Society updated successfully.");
      } else {
        await axios.post(`${API_BASE_URL}/societies/create`, data, {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        });
        if (String(user?.role || "").toLowerCase() === "manager") {
          toast.success(
            "Your society creation request has been received. It will be reviewed and activated by the administration after approval.",
            { duration: 6500 }
          );
        } else {
          toast.success("Society created successfully.");
        }
      }

      navigate("/manager/society");
    } catch (error) {
      console.error("Failed to save society:", error.response?.data?.message || error.message);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-start p-6 font-sans">
      <div className="bg-white border border-gray-200 shadow-sm rounded-xl w-full max-w-4xl p-10">
        {/* Back Button */}
        <Link to="/manager/society">
          <button className="flex items-center text-[#4B5563] hover:text-[#3699FF] mb-6 font-medium">
            <IoArrowBack size={20} className="mr-2" /> Back
          </button>
        </Link>

        {/* Heading */}
        <h1 className="text-3xl font-bold text-[#3699FF] mb-8 tracking-tight">
          {id ? "Edit Society / Club" : "Add New Society / Club"}
        </h1>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name & Short Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-800 mb-2 font-semibold">Society Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Full Name"
                className="w-full border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#3699FF]/35 rounded-lg transition duration-150"
                required
              />
            </div>
            <div>
              <label className="block text-gray-800 mb-2 font-semibold">Short Name / Acronym</label>
              <input
                type="text"
                name="shortName"
                value={formData.shortName}
                onChange={handleChange}
                placeholder="e.g. CSS"
                className="w-full border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#3699FF]/35 rounded-lg transition duration-150"
              />
            </div>
          </div>

          {/* Advisor */}
          <div>
            <label className="block text-gray-800 mb-2 font-semibold">Faculty Advisor</label>
            <input
              type="text"
              name="advisor"
              value={formData.advisor}
              onChange={handleChange}
              placeholder="Advisor Name"
              className="w-full border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#3699FF]/35 rounded-lg transition duration-150"
            />
          </div>

          {/* President Display */}
          <div>
            <label className="block text-gray-800 mb-2 font-semibold">President</label>
            <input
              type="text"
              value={user?.fullname || "Loading..."}
              readOnly
              className="w-full border border-gray-200 px-4 py-2 bg-slate-100 cursor-not-allowed rounded-lg"
            />
            <p className="text-sm text-gray-500 mt-1">
              Logged-in user is automatically assigned as President.
            </p>
          </div>

          {/* Other Roles Multi-Select */}
          <div>
            <label className="block text-gray-800 mb-2 font-semibold">Other Roles</label>
            <CreatableSelect
              isMulti
              options={predefinedRoles}
              value={roles}
              onChange={handleRolesChange}
              onCreateOption={(inputValue) => setRoles(prev => [...prev, { value: inputValue, label: inputValue }])}
              closeMenuOnSelect={false}
              placeholder="Select or create roles..."
            />
            <p className="text-sm text-gray-500 mt-1">Add multiple roles for the society, excluding President.</p>
          </div>

          {/* Members Count */}
          <div className="max-w-md">
            <label className="block text-gray-800 mb-2 font-semibold">Members Count</label>
            <input
              type="number"
              name="membersCount"
              value={formData.membersCount}
              onChange={handleChange}
              placeholder="e.g. 100"
              className="w-full border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#3699FF]/35 rounded-lg transition duration-150"
            />
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-800 mb-2 font-semibold">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="example@university.edu"
                className="w-full border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#3699FF]/35 rounded-lg transition duration-150"
              />
            </div>
            <div>
              <label className="block text-gray-800 mb-2 font-semibold">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+923001234567"
                className="w-full border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#3699FF]/35 rounded-lg transition duration-150"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-gray-800 mb-2 font-semibold">Description / About</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Brief description about the society"
              rows={4}
              className="w-full border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#3699FF]/35 rounded-lg transition duration-150"
            />
          </div>

          {/* Join Policy */}
          <div>
            <label className="block text-gray-800 mb-2 font-semibold">Who can join this society?</label>
            <select
              name="joinPolicy"
              value={formData.joinPolicy}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#3699FF]/35 rounded-lg transition duration-150"
            >
              <option value="">-- Select Join Policy --</option>
              <option value="DEPARTMENT_ONLY">Only students from same department</option>
              <option value="OPEN">Anyone can join</option>
            </select>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-gray-800 mb-2 font-semibold">Society Image</label>
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full"
            />
            {preview && (
              <div className="mt-4 flex flex-col items-start">
                <p className="text-gray-600 mb-2 text-sm font-medium">Preview:</p>
                <img
                  src={preview}
                  alt="Preview"
                  className="h-40 w-40 object-cover border border-gray-300 shadow-sm"
                />
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-4 mt-6">
            <Link to="/manager/society">
              <button
                type="button"
                className="px-8 py-2 border border-gray-300 hover:bg-gray-100 transition font-medium rounded-lg text-[#3699FF]"
              >
                Cancel
              </button>
            </Link>
            <button
              type="submit"
              className="px-8 py-2 bg-[#3699FF] text-white hover:brightness-110 transition font-medium rounded-lg shadow-md"
            >
              {id ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SocietyForm;
