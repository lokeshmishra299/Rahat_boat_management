// src/pages/UserListEdit.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Toaster, toast } from "react-hot-toast";

const BASE_URL = import.meta.env.VITE_API_BASE ?? "http://localhost:8000/api";

const token = localStorage.getItem("access_token");

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    skip_zrok_interstitial: "true",
    ...(token && { Authorization: `Bearer ${token}` }),
  },
});

const InputField = ({ label, value, onChange, type = "text", name, error }) => (
  <div>
    <label className="text-xs font-semibold text-gray-600 block mb-1">
      {label}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className={`w-full border px-3 py-2 rounded-md text-sm bg-gray-100 text-gray-800 ${
        error ? "border-red-500" : "border-gray-300"
      }`}
    />
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

const SelectField = ({ label, name, value, onChange, options, error }) => (
  <div>
    <label className="text-xs font-semibold text-gray-600 block mb-1">
      {label}
    </label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className={`w-full border px-3 py-2 rounded-md text-sm bg-gray-100 text-gray-800 ${
        error ? "border-red-500" : "border-gray-300"
      }`}
    >
      <option value="">Select {label}</option>
      {options.map((opt) => (
        <option key={opt.id} value={opt.id}>
          {opt.name || opt.district_name}
        </option>
      ))}
    </select>
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

const UserListEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    number: "",
    role_id: "",
    district_id: "",
    designation_id: "",
  });

  const [roles, setRoles] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get(`/user-list/${id}`).then((res) => {
      const data = res.data.data;
      setFormData({
        name: data.name || "",
        email: data.email || "",
        number: data.number || "",
        role_id: data.role?.id || "",
        district_id: data.district?.id || "",
        designation_id: data.designation?.id || "",
      });
      setDisplayName(data.name || "");
    });

    api.get("/roles").then((res) => setRoles(res.data.data || []));
    api.get("/district-list").then((res) => setDistricts(res.data.data || []));
    api.get("/designation").then((res) => setDesignations(res.data.data || []));
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError({});
    setSaving(true);

    try {
      const res = await api.post(`/user-edit/${id}`, formData);
      if (res.data.status === "success") {
        setDisplayName(formData.name);
        toast.success("User updated successfully.");
        setTimeout(() => {
          navigate("/dashboard/usermanagment", { state: { tab: "manage" } });
        }, 1000);
      }
    } catch (err) {
      if (err.response?.data?.errors) {
        setError(err.response.data.errors);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-md border space-y-8">
      <Toaster position="top-right" reverseOrder={false} />
      <h1 className="text-3xl text-center font-bold text-indigo-700">
        ✏️ Edit User - {displayName || "Loading..."}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <InputField
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={(e) => {
              const value = e.target.value;
              if (/^[a-zA-Z\s]*$/.test(value)) {
                const formatted = value
                  .split(" ")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ");
                setFormData((prev) => ({ ...prev, name: formatted }));
              }
            }}
            error={error.name?.[0]}
          />
          <InputField
            label="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            error={error.email?.[0]}
          />
          <InputField
            label="Contact Number"
            name="number"
            value={formData.number}
            onChange={(e) => {
              const value = e.target.value;
              if (/^\d{0,10}$/.test(value)) {
                setFormData((prev) => ({ ...prev, number: value }));
              }
            }}
            error={error.number?.[0]}
          />

         <div>
  <label className="text-xs font-semibold text-gray-600 block mb-1">
    Role
  </label>
  <select
    name="role_id"
    value={formData.role_id}
    onChange={handleChange}
    className={`w-full border px-3 py-2 rounded-md text-sm bg-gray-100 text-gray-800 ${
      error.role_id?.[0] ? "border-red-500" : "border-gray-300"
    }`}
  >
    <option value="">Select Role</option>
    {roles.map((role) => {
      let roleLabel = role.name;
      if (roleLabel === "district_nodal") roleLabel = "District Nodal";
      else if (roleLabel === "ghaat_nodal") roleLabel = "Ghaat Nodal";

      return (
        <option key={role.id} value={role.id}>
          {roleLabel}
        </option>
      );
    })}
  </select>
  {error.role_id?.[0] && (
    <p className="text-red-500 text-xs mt-1">{error.role_id[0]}</p>
  )}
</div>

          <SelectField
            label="District"
            name="district_id"
            value={formData.district_id}
            onChange={handleChange}
            options={districts}
            error={error.district_id?.[0]}
          />
          <SelectField
            label="Designation"
            name="designation_id"
            value={formData.designation_id}
            onChange={handleChange}
            options={designations}
            error={error.designation_id?.[0]}
          />
        </div>

        <div className="pt-4 border-t flex justify-center">
          <button
            type="submit"
            className="px-6 py-3 bg-indigo-600 text-white rounded font-medium hover:bg-indigo-700"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserListEdit;