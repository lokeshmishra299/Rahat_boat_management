// src/pages/BoatOwnerEdit.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE ?? "http://127.0.0.1:8000/api",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

const InputField = ({ label, value, onChange, type = "text", readOnly = false, error, maxLength, pattern }) => (
  <div>
    <label className="text-xs font-semibold text-gray-600 block mb-1">{label}</label>
    <input
      type={type}
      value={value || ""}
      onChange={onChange}
      readOnly={readOnly}
      maxLength={maxLength}
      pattern={pattern}
      className={`w-full border px-3 py-2 rounded-md text-sm ${readOnly ? "bg-gray-100 cursor-not-allowed" : ""} : ""}`}
    />
    {error && <p className="text-red-500 font-semibold text-xs mt-1">{error}</p>}
  </div>
);

export default function BoatOwnerEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [owner, setOwner] = useState(null);
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    api.get(`/boat-owner-list/${id}`).then((res) => {
      if (res.data.status === "success") {
        const data = res.data.data;
        if (data.dob && data.dob.includes("T")) {
          data.dob = data.dob.split("T")[0];
        }
        setOwner(data);
        setDisplayName(data.name);
      } else {
        setError("Boat owner not found.");
      }
    }).catch(() => setError("Failed to fetch boat owner data."));

    api.get("/district-list")
      .then((res) => {
        if (res.data.status === "success") {
          setDistricts(res.data.data);
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (field, value) => {
    if (field === "name") {
      value = value.replace(/[^A-Za-z\s]/g, "");
    } else if (["number", "adhar_no", "pincode"].includes(field)) {
      value = value.replace(/\D/g, "");
      if (field === "number") value = value.slice(0, 10);
      if (field === "adhar_no") value = value.slice(0, 12);
      if (field === "pincode") value = value.slice(0, 6);
    }
    setOwner((prev) => ({ ...prev, [field]: value }));
  };

  const handleFamilyChange = (index, field, value) => {
    const updated = [...owner.boat_family_members];
    updated[index][field] = value;
    setOwner((prev) => ({ ...prev, boat_family_members: updated }));
  };

  const addFamilyMember = () => {
    setOwner((prev) => ({
      ...prev,
      boat_family_members: [
        ...prev.boat_family_members,
        { id: null, name: "", mobile: "", adhar: "", relation: "" }
      ]
    }));
  };

  const deleteFamilyMember = (index) => {
    setOwner((prev) => {
      const updated = [...prev.boat_family_members];
      updated.splice(index, 1);
      return { ...prev, boat_family_members: updated };
    });
  };

const handleSubmit = async () => {
  setSaving(true);
  setErrors({});
  try {
    const payload = {
      id: owner.id,
      name: owner.name,
      number: owner.number,
      email: owner.email,
      dob: owner.dob,
      adhar_no: owner.adhar_no,
      boat_owned: owner.boat_owned,
      address: owner.address || "",
      pincode: owner.pincode,
      district_id: owner.district_id,
      boat_family_members: owner.boat_family_members.map((m) => ({
        id: m.id,
        name: m.name,
        mobile: m.mobile,
        adhar: m.adhar,
        relation: m.relation,
      })),
    };

    const res = await api.post(`/boat-owner-edit/${id}`, payload);
    if (res.data.status === "success") {
      const updated = res.data.data;

      if (updated.dob && updated.dob.includes("T")) {
        updated.dob = updated.dob.split("T")[0];
      }

      setOwner(updated);
      setDisplayName(updated.name);

      // 👇 Go back to previous page
      navigate(-1);
    } else {
      setErrors(res.data.errors || {});
    }
  } catch (err) {
    if (err.response?.data?.data) {
      setErrors(err.response.data.data);
    } else {
      console.error("Unknown error:", err);
    }
  } finally {
    setSaving(false);
  }
};

  if (loading) return <p className="p-6">Loading...</p>;
  if (error) return <p className="p-6 text-red-500">{error}</p>;
  if (!owner) return null;

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-md border space-y-10">
      <h1 className="text-3xl text-center font-bold text-indigo-700 mb-1">
        ✏️ Edit Boat Owner - {displayName}
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <InputField label="Name" value={owner.name} onChange={(e) => handleChange("name", e.target.value)} error={errors.name?.[0]} />
        <InputField label="Mobile No" value={owner.number} onChange={(e) => handleChange("number", e.target.value)} error={errors.number?.[0]} />
        <InputField label="Email" value={owner.email} onChange={(e) => handleChange("email", e.target.value)} error={errors.email?.[0]} />
        <InputField label="Aadhar No" value={owner.adhar_no} onChange={(e) => handleChange("adhar_no", e.target.value)} error={errors.adhar_no?.[0]} />
        <InputField label="DOB" type="date" value={owner.dob} onChange={(e) => handleChange("dob", e.target.value)} error={errors.dob?.[0]} />
        <InputField label="Boats Owned" value={owner.boat_owned} onChange={(e) => handleChange("boat_owned", e.target.value)} error={errors.boat_owned?.[0]} />

        <div>
          <label className="text-xs font-semibold text-gray-600 block mb-1">District</label>
          <select
            value={owner.district_id}
            onChange={(e) => handleChange("district_id", e.target.value)}
            className={`w-full border px-3 py-2 rounded-md text-sm ${errors.district_id ? "border-red-500" : ""}`}
          >
            <option value="">Select District</option>
            {districts.map((d) => (
              <option key={d.id} value={d.id}>{d.district_name}</option>
            ))}
          </select>
          {errors.district_id && <p className="text-red-500 text-xs mt-1">{errors.district_id[0]}</p>}
        </div>

        <InputField label="Pincode" value={owner.pincode} onChange={(e) => handleChange("pincode", e.target.value)} error={errors.pincode?.[0]} />
      </div>

      <div className="pt-6 border-t">
        <h2 className="text-xl font-semibold text-gray-700 mb-4 text-center">👥 Family Members</h2>

        {owner.boat_family_members.map((member, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 relative">
            <InputField label="Name" value={member.name} onChange={(e) => handleFamilyChange(index, "name", e.target.value)} />
            <InputField label="Mobile" value={member.mobile} onChange={(e) => handleFamilyChange(index, "mobile", e.target.value)} />
            <InputField label="Aadhar" value={member.adhar} onChange={(e) => handleFamilyChange(index, "adhar", e.target.value)} />
            <InputField label="Relation" value={member.relation} onChange={(e) => handleFamilyChange(index, "relation", e.target.value)} />
            <button
              onClick={() => deleteFamilyMember(index)}
              className="absolute top-0 right-0 text-red-600 hover:underline text-sm"
            >
              🗑 Delete
            </button>
          </div>
        ))}

        <div className="flex justify-center mt-4">
          <button
            onClick={addFamilyMember}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
          >
            ➕ Add Family Member
          </button>
        </div>
      </div>

      <div className="pt-4 border-t flex justify-center">
        <button
          onClick={handleSubmit}
          className="px-6 py-3 bg-green-600 text-white rounded font-medium hover:bg-green-700"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}