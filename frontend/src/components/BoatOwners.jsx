import { useState, useEffect } from "react";
import axios from "axios";
import { FaTrash } from "react-icons/fa";
import toast from "react-hot-toast";
import { Navigate, useNavigate } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_API_BASE ?? "http://localhost:8000/api";
const token = localStorage.getItem("access_token");
const user = JSON.parse(localStorage.getItem("user"));

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  },
});

const BoatOwners = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    number: "",
    adhar_no: "",
    boat_owned: "",
    dob: "",
    pincode: "",
   district_id: user?.role_id === 2 ? user.district_id : "",
  });

  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});

const [districts, setDistricts] = useState([]);

useEffect(() => {
  api.get("/district-list")
    .then((res) => setDistricts(res.data.data || []))
    .catch((err) => console.error("Failed to fetch districts", err));
}, []);


  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleMemberChange = (index, value) => {
    const updated = [...members];
    updated[index].name = value.replace(/[^a-zA-Z\s]/g, "");
    setMembers(updated);
  };

  const addMember = () => {
    setMembers([...members, { name: "" }]);
  };

  const removeMember = (index) => {
    const updated = [...members];
    updated.splice(index, 1);
    setMembers(updated);
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setMessage("");
  setErrors({});

  const payload = {
    name: form.name,
    number: form.number,
    email: form.email,
    adhar_no: form.adhar_no,
    owner_family_name: members.map((m) => m.name),
    boat_owned: form.boat_owned,
    pincode: form.pincode,
    dob: form.dob,
    district_id: form.district_id, 
  };

  try {
    await api.post("/boat-owner", payload);
    toast.success("Boat owner submitted successfully!");
    navigate("/dashboard/addboatowner");
    setForm({
      name: "",
      email: "",
      number: "",
      adhar_no: "",
      boat_owned: "",
      dob: "",
      pincode: "",
    });
    setMembers([]);
  } catch (error) {
    console.log("Backend Error:", error.response?.data); // optional debug

    const backendErrors = error.response?.data?.data;

    if (backendErrors) {
      const mappedErrors = {};

      Object.entries(backendErrors).forEach(([key, value]) => {
        if (key.startsWith("owner_family_name")) {
          const match = key.match(/owner_family_name\.(\d+)/);
          if (match) {
            const index = parseInt(match[1]);
            if (!mappedErrors.family) mappedErrors.family = {};
            mappedErrors.family[index] = value[0];
          }
        } else {
          mappedErrors[key] = value[0];
        }
      });

      setErrors(mappedErrors);
    } 
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="p-6 min-h-screen flex justify-center items-start">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-6xl border border-gray-200 bg-white rounded-lg shadow-md p-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <h1 className="text-2xl font-bold mb-6 text-green-600 md:col-span-2">
            Boat Owner Details
          </h1>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value.replace(/[^a-zA-Z\s]/g, ""),
                })
              }
              className="w-full border-2 rounded px-3 py-2 focus:border-green-500 focus:outline-none"
              placeholder="Enter name"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full border-2 rounded px-3 py-2 focus:border-green-500 focus:outline-none"
              placeholder="Enter email"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

         {user?.role_id === 2 ? (
  <>
    <input
      type="hidden"
      name="district_id"
      value={form.district_id}
    />
  </>
) : (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      District *
    </label>
    <select
      name="district_id"
      value={form.district_id}
      onChange={handleChange}
      className="w-full border-2 rounded px-3 py-2 focus:border-green-500 focus:outline-none"
    >
      <option value="">Select District</option>
      {districts.map((district) => (
        <option key={district.id} value={district.id}>
          {district.district_name}
        </option>
      ))}
    </select>
    {errors.district_id && (
      <p className="text-red-500 text-sm mt-1">{errors.district_id}</p>
    )}
  </div>
)}

         

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact No *
            </label>
            <input
              type="tel"
              name="number"
              value={form.number}
              onChange={(e) =>
                setForm({
                  ...form,
                  number: e.target.value.replace(/[^0-9]/g, "").slice(0, 10),
                })
              }
              className="w-full border-2 rounded px-3 py-2 focus:border-green-500 focus:outline-none"
              placeholder="Enter contact"
            />
            {errors.number && (
              <p className="text-red-500 text-sm mt-1">{errors.number}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Aadhar No
            </label>
            <input
              type="tel"
              name="adhar_no"
              value={form.adhar_no}
              onChange={(e) =>
                setForm({
                  ...form,
                  adhar_no: e.target.value.replace(/[^0-9]/g, "").slice(0, 12),
                })
              }
              className="w-full border-2 rounded px-3 py-2 focus:border-green-500 focus:outline-none"
              placeholder="Enter Aadhar No"
            />
            {errors.adhar_no && (
              <p className="text-red-500 text-sm mt-1">{errors.adhar_no}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              No of Boats Owned
            </label>
            <input
              type="number"
              name="boat_owned"
              value={form.boat_owned}
              onChange={handleChange}
              className="w-full border-2 rounded px-3 py-2 focus:border-green-500 focus:outline-none"
              placeholder="Enter number of boats"
            />
            {errors.boat_owned && (
              <p className="text-red-500 text-sm mt-1">{errors.boat_owned}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date of Birth *
            </label>
            <input
              type="date"
              name="dob"
              value={form.dob}
              onChange={handleChange}
              className="w-full border-2 rounded px-3 py-2 focus:border-green-500 focus:outline-none"
            />
            {errors.dob && (
              <p className="text-red-500 text-sm mt-1">{errors.dob}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pincode
            </label>
            <input
              type="tel"
              name="pincode"
              value={form.pincode}
              onChange={(e) =>
                setForm({
                  ...form,
                  pincode: e.target.value.replace(/[^0-9]/g, "").slice(0, 6),
                })
              }
              className="w-full border-2 rounded px-3 py-2 focus:border-green-500 focus:outline-none"
              placeholder="Enter Pincode"
            />
            {errors.pincode && (
              <p className="text-red-500 text-sm mt-1">{errors.pincode}</p>
            )}
          </div>
        </div>

        {/* Family Members */}
        <div className="mt-10 col-span-1">
          <label className="font-medium text-lg block mb-4 text-sky-700">
            Family Members
          </label>

          {members.map((member, index) => (
            <div
              key={index}
              className="grid md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded border mb-4 items-center"
            >
              <div className="col-span-1">
                <input
                  type="text"
                  placeholder="Name"
                  value={member.name}
                  onChange={(e) => handleMemberChange(index, e.target.value)}
                  className="w-full p-2 border rounded"
                />
                {errors.family?.[index] && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.family[index]}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => removeMember(index)}
                className="text-red-600 hover:text-red-800"
                title="Remove"
              >
                <FaTrash />
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addMember}
            className="mt-2 px-4 py-2 bg-green-600 text-white rounded-full font-semibold hover:bg-green-700"
          >
            Add Family Member
          </button>
        </div>

        {/* Submit */}
        <div className="mt-6 flex justify-center py-5">
          <button
            type="submit"
            disabled={loading}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold px-8 py-2 rounded-full"
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </div>

        {message && (
          <p className="text-center text-sm text-blue-600 font-medium mt-4">
            {message}
          </p>
        )}
      </form>
    </div>
  );
};

export default BoatOwners;