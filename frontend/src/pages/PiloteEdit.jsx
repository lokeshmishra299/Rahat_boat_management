// src/pages/PiloteEdit.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE ?? "http://127.0.0.1:8000/api",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

const InputField = ({ label, value, onChange, type = "text", readOnly = false, error, maxLength }) => (
  <div>
    <label className="text-xs font-semibold text-gray-600 block mb-1">{label}</label>
    <input
      type={type}
      value={value || ""}
      onChange={onChange}
      readOnly={readOnly}
      maxLength={maxLength}
      className={`w-full border px-3 py-2 rounded-md text-sm ${readOnly ? "bg-gray-100 cursor-not-allowed" : ""}`}
    />
    {error && <p className="text-red-500 font-semibold text-xs mt-1">{error}</p>}
  </div>
);

const PiloteEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [pilot, setPilot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get(`/pilot-list/${id}`)
      .then((res) => {
        if (res.data.status === "success") {
          const data = res.data.data;
          if (data.dob?.includes("T")) {
            data.dob = data.dob.split("T")[0];
          }
          // rename pilot_family to family
          setPilot({ ...data, family: data.pilot_family || [] });
        }
      })
      .catch(() => console.error("Failed to fetch pilot data"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (field, value) => {
    if (field === "name" || field === "relation") {
      value = value.replace(/[^A-Za-z\s]/g, "");
    } else if (["number", "adhar", "no_of_boat", "registration_no"].includes(field)) {
      value = value.replace(/\D/g, "");
    }

    if (field === "adhar") value = value.slice(0, 12);
    if (field === "number") value = value.slice(0, 10);
    if (field === "registration_no") value = value.slice(0, 20);

    setPilot((prev) => ({ ...prev, [field]: value }));
  };

  const handleFamilyChange = (index, field, value) => {
    if (["mobile", "adhar"].includes(field)) {
      value = value.replace(/\D/g, "");
    }
    if (field === "adhar") value = value.slice(0, 12);
    if (field === "mobile") value = value.slice(0, 10);
    if (field === "name" || field === "relation") {
      value = value.replace(/[^A-Za-z\s]/g, "");
    }

    const updated = [...pilot.family];
    updated[index][field] = value;
    setPilot((prev) => ({ ...prev, family: updated }));
  };

  const addFamilyMember = () => {
    setPilot((prev) => ({
      ...prev,
      family: [
        ...prev.family,
        { id: null, name: "", mobile: "", adhar: "", relation: "" },
      ],
    }));
  };

  const deleteFamilyMember = (index) => {
    setPilot((prev) => {
      const updated = [...prev.family];
      updated.splice(index, 1);
      return { ...prev, family: updated };
    });
  };

  const handleSubmit = async () => {
    setSaving(true);
    setErrors({});

    try {
      const payload = {
        id: pilot.id,
        name: pilot.name,
        number: pilot.number,
        email: pilot.email,
        dob: pilot.dob,
        adhar: pilot.adhar,
        no_of_boat: pilot.no_of_boat,
        registration_no: pilot.registration_no,
        relation: pilot.relation,
        family: pilot.family.map((m) => ({
          id: m.id,
          name: m.name,
          mobile: m.mobile,
          adhar: m.adhar,
          relation: m.relation,
        })),
      };

      const res = await api.post(`/pilot-edit/${id}`, payload);
      if (res.data.status === "success") {
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
  if (!pilot) return <p className="p-6 text-red-500">Pilot not found.</p>;

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-md border space-y-10">
      <h1 className="text-3xl text-center font-bold text-indigo-700 mb-1">
        ✏️ Edit Pilot - {pilot.name}
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <InputField label="Name" value={pilot.name} onChange={(e) => handleChange("name", e.target.value)} error={errors.name?.[0]} />
        <InputField label="Mobile No" value={pilot.number} onChange={(e) => handleChange("number", e.target.value)} error={errors.number?.[0]} maxLength={10} />
        <InputField label="Email" value={pilot.email} onChange={(e) => handleChange("email", e.target.value)} error={errors.email?.[0]} />
        <InputField label="Aadhar No" value={pilot.adhar} onChange={(e) => handleChange("adhar", e.target.value)} error={errors.adhar?.[0]} maxLength={12} />
        <InputField label="DOB" type="date" value={pilot.dob} onChange={(e) => handleChange("dob", e.target.value)} error={errors.dob?.[0]} />
        <InputField label="No. of Boats" value={pilot.no_of_boat} onChange={(e) => handleChange("no_of_boat", e.target.value)} error={errors.no_of_boat?.[0]} />
        <InputField label="Registration No" value={pilot.registration_no} onChange={(e) => handleChange("registration_no", e.target.value)} error={errors.registration_no?.[0]} />
      </div>

      {/* Family Section */}
      <div className="pt-6 border-t">
        <h2 className="text-xl font-semibold text-gray-700 mb-4 text-center">👥 Family Members</h2>

        {pilot.family.map((member, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 relative">
            <InputField label="Name" value={member.name} onChange={(e) => handleFamilyChange(index, "name", e.target.value)} />
            <InputField label="Mobile" value={member.mobile} onChange={(e) => handleFamilyChange(index, "mobile", e.target.value)} maxLength={10} />
            <InputField label="Aadhar" value={member.adhar} onChange={(e) => handleFamilyChange(index, "adhar", e.target.value)} maxLength={12} />
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
};

export default PiloteEdit;