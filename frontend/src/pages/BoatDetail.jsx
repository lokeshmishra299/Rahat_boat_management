// src/pages/BoatDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
  headers: localStorage.getItem("access_token")
    ? { Authorization: `Bearer ${localStorage.getItem("access_token")}` }
    : {},
});

export default function BoatDetail() {
  const { id }    = useParams();
  const { state } = useLocation();

  /* ───── load boat ───── */
  const [boat, setBoat]     = useState(state || null);
  const [loading, setLoading] = useState(!state);
  const [error, setError]     = useState("");

  useEffect(() => {
    if (state) return;
    api.get(`/boat-list/${id}`)
      .then(r =>
        r.data?.status === "success"
          ? setBoat(r.data.data)
          : setError("Boat not found.")
      )
      .catch(() => setError("Could not load boat details."))
      .finally(() => setLoading(false));
  }, [id, state]);

  if (loading) return <p className="p-6">Loading…</p>;
  if (error)   return <p className="p-6 text-red-500">{error}</p>;
  if (!boat)   return null;

  /* ───── inline-edit state ───── */
  const [editingKey, setEditingKey] = useState(null);
  const [draft, setDraft]           = useState("");
  const [imgDraft, setImgDraft]     = useState(null);  // File | null

  const startEdit = key => {
    setEditingKey(key);
    setDraft(boat[key] ?? "");
  };

  const saveField = key => {
    const updated = { ...boat, [key]: draft };
    setBoat(updated);
    setEditingKey(null);
    // OPTIONAL: persist
    // api.put(`/boats/${boat.id}`, { [key]: draft }).catch(console.error);
  };

  /* ───── reusable blocks ───── */
  const Editable = ({ label, field }) => (
    <div className="space-y-1">
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>

      {editingKey === field ? (
        <div className="flex gap-2">
          <input
            value={draft}
            onChange={e => setDraft(e.target.value)}
            className="w-full bg-white border border-blue-400 rounded px-3 py-2 text-sm"
            autoFocus
          />
          <button
            onClick={() => saveField(field)}
            className="px-3 py-2 bg-blue-600 text-white text-sm rounded"
          >
            Save
          </button>
        </div>
      ) : (
        <div
          onDoubleClick={() => startEdit(field)}
          title="Double-click to edit"
          className="bg-gray-100 rounded-md px-3 py-2 text-sm text-gray-800 border cursor-pointer"
        >
          {boat[field] ?? "—"}
        </div>
      )}
    </div>
  );

  const Info = ({ label, value }) => (
    <div className="space-y-1">
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
      <div className="bg-gray-100 rounded-md px-3 py-2 text-sm text-gray-800 border">
        {value ?? "—"}
      </div>
    </div>
  );

  /* ───── save image handler ───── */
  const saveImage = () => {
    if (!imgDraft) return;
    const previewURL = URL.createObjectURL(imgDraft);
    setBoat(prev => ({ ...prev, image: previewURL })); // local preview
    setImgDraft(null);

    // OPTIONAL: backend upload
    /*
      const fd = new FormData();
      fd.append("image", imgDraft);
      api.post(`/boats/${boat.id}/image`, fd)
         .catch(console.error);
    */
  };

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-md border space-y-10">
      {/* Header */}
      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold text-blue-700 mb-1">
          🚤 Boat Detail – #{boat.registration_no}
        </h1>
        <p className="text-sm text-gray-500">Unique ID: {boat.id}</p>
      </div>

      {/* General Information */}
      <div>
        <h2 className="text-xl font-semibold text-gray-700 mb-4">General Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <Editable label="Boat Type"              field="boat_type"            />
          <Info     label="District"               value={boat.district?.district_name}/>
          <Info     label="Assigned Ghat"          value={boat.ghaat?.ghaat_name}/>
          <Editable label="Pilot Name"             field="pilot_name"           />
          <Editable label="Pilot License Number"   field="pilot_license_no"     />
          <Editable label="Support Staff Count"    field="support_staff"        />
          <Editable label="Engine Details"         field="engine_details"       />
          <Editable label="Passenger Capacity"     field="passenger_capacity"   />
          <Editable label="Year of Manufacture"    field="year_of_manufacture"  />
          <Editable label="Registration Authority" field="registration_authority"/>
        </div>
      </div>

      {/* Additional Remarks */}
      <div>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Additional Remarks</h2>
        {editingKey === "remarks" ? (
          <>
            <textarea
              rows={4}
              value={draft}
              onChange={e => setDraft(e.target.value)}
              className="w-full bg-white border border-blue-400 rounded px-3 py-2 text-sm"
            />
            <button
              onClick={() => saveField("remarks")}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
            >
              Save Remarks
            </button>
          </>
        ) : (
          <div
            onDoubleClick={() => startEdit("remarks")}
            className="bg-gray-50 border rounded-md p-4 text-sm text-gray-800 min-h-[60px] cursor-pointer"
          >
            {boat.remarks || (
              <span className="italic text-gray-400">No remarks provided.</span>
            )}
          </div>
        )}
      </div>

      {/* Image */}
      <div>
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Boat Image</h2>

        {imgDraft ? (
          <>
            {/* preview new selection */}
            <div className="w-full sm:w-[320px] border rounded-md overflow-hidden shadow mb-3">
              <img
                src={URL.createObjectURL(imgDraft)}
                alt="Preview"
                className="w-full object-cover"
              />
            </div>
            <button
              onClick={saveImage}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Save Image
            </button>
            <button
              onClick={() => setImgDraft(null)}
              className="ml-3 px-4 py-2 bg-gray-300 rounded"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            {boat.image ? (
              <div
                onDoubleClick={() => document.getElementById("imgInput").click()}
                className="w-full sm:w-[320px] border rounded-md overflow-hidden shadow cursor-pointer"
                title="Double-click to replace image"
              >
                <img
                  src={
                    boat.image.startsWith("blob:")
                      ? boat.image // local preview URL
                      : `http://localhost:8000/storage/${boat.image}`
                  }
                  alt="Boat"
                  className="w-full object-cover"
                />
              </div>
            ) : (
              <p
                onDoubleClick={() => document.getElementById("imgInput").click()}
                className="italic text-gray-400 cursor-pointer"
                title="Double-click to add image"
              >
                No image available (double-click to add)
              </p>
            )}
            <input
              id="imgInput"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => e.target.files[0] && setImgDraft(e.target.files[0])}
            />
          </>
        )}
      </div>
    </div>
  );
}