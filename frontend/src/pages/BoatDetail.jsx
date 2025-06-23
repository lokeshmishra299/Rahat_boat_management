// src/pages/BoatDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom"; // ⬅️ navigate added
import axios from "axios";
import { FaCamera } from "react-icons/fa";

/* ---------- API ---------- */
const api = axios.create({
  baseURL: "http://localhost:8000/api",
  headers: localStorage.getItem("access_token")
    ? { Authorization: `Bearer ${localStorage.getItem("access_token")}` }
    : {},
});

export default function BoatDetail() {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();          // ⬅️ init

  const [boat, setBoat] = useState(state || null);
  const [draft, setDraft] = useState(state || {});
  const [loading, setLoad] = useState(!state);
  const [districts, setDistricts] = useState([]);
  const [ghaats, setGhaats] = useState([]);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});


  const [imgDraft, setImgDraft] = useState(null);
  const [saving, setSaving] = useState(false);

  /* ─── fetch on hard-refresh ─── */
  useEffect(() => {
    if (state) return;
    api
      .get(`/boat-list/${id}`)
      .then((r) =>
        r.data?.status === "success"
          ? (setBoat(r.data.data), setDraft(r.data.data))
          : setError("Boat not found.")
      )
      .catch(() => setError("Could not load boat details."))
      .finally(() => setLoad(false));
  }, [id, state]);

  useEffect(() => {
    api.get("/district-list").then((res) => {
      if (res.data?.status === "success") {
        setDistricts(res.data.data);
      }
    });

    api.get("/ghaat-list").then((res) => {
      if (res.data?.status === "success") {
        setGhaats(res.data.data);
      }
    });
  }, []);



  if (loading) return <p className="p-6">Loading…</p>;
  if (error) return <p className="p-6 text-red-500">{error}</p>;
  if (!boat) return null;

  /* ─── save (text fields + optional image) ─── */
  const handleSaveAll = () => {
    setSaving(true);

    const fd = new FormData();
    Object.entries(draft).forEach(([k, v]) => fd.append(k, v ?? ""));

    if (imgDraft) fd.set("image", imgDraft);
    else fd.delete("image");

    api
      .post(`/edit-boat-details/${boat.id}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => {
        if (r.data?.status === "success") {
          setBoat(r.data.data);
          setDraft(r.data.data);
          navigate("/dashboard/boats");   // ⬅️ redirect on success
        }
      })
      .catch((err) => {

        if (err.response?.data?.status === "error" && err.response?.data?.data) {
          setErrors(err.response.data.data);
        } else {
          alert("Could not save image");
        }
      })


  };

  /* ─── editable helper ─── */
  const Editable = ({ label, field, error }) => {
    const [val, setVal] = useState(draft[field] ?? "");

    useEffect(() => setVal(draft[field] ?? ""), [draft, field]);

    const commit = () => setDraft((p) => ({ ...p, [field]: val }));

    return (
      <div className="space-y-1">
        <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
        <input
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), commit())}
          className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm"
          autoComplete="off"
        />
        {error && <p className="text-sm text-red-500">{error[0]}</p>}
      </div>
    );
  };


  /* ─── static field helper ─── */
  const Info = ({ label, value }) => (
    <div className="space-y-1">
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
      <div className="bg-gray-100 rounded-md px-3 py-2 text-sm text-gray-800 border">
        {value ?? "—"}
      </div>
    </div>
  );

  /* ───────────────────────── UI ───────────────────────── */
  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-md border space-y-10">
      {/* Header */}
      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold text-blue-700 mb-1">
          🚤 Boat Detail – #{boat.registration_no}
        </h1>
      </div>

      {/* Editable Grid */}
      <div>
        <h2 className="text-xl font-semibold mb-4">General Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">

          {/* Boat Type Dropdown */}
          <div className="space-y-1">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Boat Type</p>
            <select
              value={draft.boat_type ?? ""}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, boat_type: e.target.value }))
              }
              className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm"
            >
              <option value="">Select Boat Type</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Engine Driven">Engine Driven</option>
              <option value="Manual (Paddle/Oar)">Manual (Paddle/Oar)</option>
            </select>
            {errors.boat_type && (
              <p className="text-sm text-red-500">{errors.boat_type[0]}</p>
            )}
          </div>

          {/* District Dropdown */}
          <div className="space-y-1">
            <p className="text-xs text-gray-500 uppercase tracking-wide">District</p>
            <select
              value={draft.district_id ?? ""}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, district_id: e.target.value }))
              }
              className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm"
            >
              <option value="">Select District</option>
              {districts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.district_name}
                </option>
              ))}
            </select>
            {errors.district_id && (
              <p className="text-sm text-red-500">{errors.district_id[0]}</p>
            )}

          </div>

          {/* Ghat Dropdown */}
          <div className="space-y-1">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Assigned Ghat</p>
            <select
              value={draft.ghaat_id ?? ""}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, ghaat_id: e.target.value }))
              }
              className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm"
            >
              <option value="">Select Ghat</option>
              {ghaats.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.ghaat_name}
                </option>
              ))}
            </select>
            {errors.ghaat_id && (
              <p className="text-sm text-red-500">{errors.ghaat_id[0]}</p>
            )}

          </div>

          {/* Text Inputs */}
          <Editable label="Pilot Name" field="pilot_name" error={errors.pilot_name} />
          <Editable label="Pilot License No." field="pilot_license_no" error={errors.pilot_license_no} />
          <Editable label="Support Staff" field="support_staff" error={errors.support_staff} />
          <Editable label="Engine Details" field="engine_details" error={errors.engine_details} />
          <Editable label="Passenger Capacity" field="passenger_capacity" error={errors.passenger_capacity} />
          <Editable label="Year of Manufacture" field="year_of_manufacture" error={errors.year_of_manufacture} />
          <Editable label="Registration Authority" field="registration_authority" error={errors.registration_authority} />

        </div>
      </div>



      {/* remarks */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Additional Remarks</h2>
        <input
          value={draft.remarks ?? ""}
          onChange={(e) => setDraft({ ...draft, remarks: e.target.value })}
          className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm"
          placeholder="Add remarks…"
        />
      </div>

      {/* image */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Boat Image</h2>

        {imgDraft ? (
          <>
            <div className="w-full sm:w-80 rounded-lg shadow overflow-hidden">
              <img
                src={URL.createObjectURL(imgDraft)}
                alt="Preview"
                className="w-full h-64 object-cover"
              />
            </div>

            <button
              onClick={() => setImgDraft(null)}
              className="mt-3 px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <div className="w-full sm:w-80 rounded-lg shadow overflow-hidden">
              {boat.image ? (
                <img
                  src={
                    boat.image.startsWith("blob:")
                      ? boat.image
                      : `http://localhost:8000/storage/${boat.image}`
                  }
                  alt="Boat"
                  className="w-full h-64 object-cover"
                />
              ) : (
                <div className="w-full h-64 flex items-center justify-center bg-gray-50 text-gray-400">
                  No image
                </div>
              )}
            </div>

            <button
              onClick={() => document.getElementById("imgInput").click()}
              className="mt-2 inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              <FaCamera /> Edit
            </button>

            <input
              id="imgInput"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files[0] && setImgDraft(e.target.files[0])}
            />
          </>
        )}
      </div>

      {/* save button */}
      <div className="pt-4 border-t flex justify-center">
        <button
          type="button"
          onClick={handleSaveAll}
          disabled={saving}
          className="px-6 py-3 bg-blue-600 text-white rounded font-medium disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}