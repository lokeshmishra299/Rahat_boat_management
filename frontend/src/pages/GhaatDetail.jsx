// src/pages/GhaatDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaCamera } from "react-icons/fa";


/* ---------- API ---------- */
const api = axios.create({
  baseURL: "http://localhost:8000/api",
  headers: localStorage.getItem("access_token")
    ? { Authorization: `Bearer ${localStorage.getItem("access_token")}` }
    : {},
});

/* pretty label */
const prettify = (k) =>
  k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export default function GhaatDetail() {
  const { id } = useParams();
  const { state } = useLocation();

  /* --- state --- */
  const [ghaat, setGhaat]   = useState(state || null);
  const [draft, setDraft]   = useState(state || null);
  const [loading, setLoad]  = useState(!state);
  const [error, setError]   = useState("");
  const [errors, setErrors] = useState({});

  const [editing, setEditing] = useState(null);
  const [temp, setTemp]       = useState("");

  const [imgDraft, setImgDraft] = useState(null);
  const [saving, setSaving]     = useState(false);

  /* --- fetch if hard-refresh --- */
  useEffect(() => {
    if (state) return;
    api
      .get(`/ghaat-list/${id}`)
      .then((r) =>
        r.data?.status === "success"
          ? (setGhaat(r.data.data), setDraft(r.data.data))
          : setError("Ghaat not found.")
      )
      .catch(() => setError("Could not load ghat details."))
      .finally(() => setLoad(false));
  }, [id, state]);

  if (loading) return <p className="p-6">Loading…</p>;
  if (error)   return <p className="p-6 text-red-500">{error}</p>;
  if (!draft)  return null;

  /* ---- edit helpers ---- */
  const startEdit = (k) => { setEditing(k); setTemp(draft[k] ?? ""); };
  const commit    = (k) => { setDraft({ ...draft, [k]: temp }); setEditing(null); };

  /* ---- image preview ---- */
  const saveImage = () => {
    if (!imgDraft) return;
    const url = URL.createObjectURL(imgDraft);
    setDraft({ ...draft, photo_path: url });
    setImgDraft(null);
  };

const navigate = useNavigate();


const handleSaveAll = () => {
  setSaving(true);
  setErrors({});

  const formData = new FormData();

  formData.append("ghaat_name", draft.ghaat_name || "");
  formData.append("latitude", draft.latitude || "");
  formData.append("longitude", draft.longitude || "");
  formData.append("district_id", String(draft.district_id || ""));
  formData.append("river_id", String(draft.river_id || ""));
  formData.append("boat_capacity", draft.boat_capacity || "");
  formData.append("road_accessibility", draft.road_accessibility || "");
  formData.append("contact_person", draft.contact_person || "");
  formData.append("contact_number", draft.contact_number || "");
  formData.append("nearest_hospital", draft.nearest_hospital || "");
  formData.append("available_facilities", draft.available_facilities || "");
  formData.append("additional_info", draft.additional_info || "");
  formData.append("status", draft.status || "0");

  if (imgDraft) {
    formData.append("photo_path", imgDraft);
  }

  api
    .post(`/edit-ghaat-details/${ghaat.id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    .then((r) => {
      if (r.data?.status === "success") {
        setGhaat(r.data.data);
        navigate("/dashboard/ghaats");
      } else if (r.data?.errors) {
        setErrors(r.data.errors);
      }
    })
    .catch((err) => {
      console.error(err);
      alert("Could not save changes");
    })
    .finally(() => {
      setSaving(false);
    });
};


  /* ---- cell ---- */
  const Cell = ({ k, v }) => (
    <div className="space-y-1">
      <p className="text-xs uppercase text-gray-500 font-semibold">{prettify(k)}</p>
      {editing === k ? (
        <>
          <input
            value={temp}
            onChange={(e) => setTemp(e.target.value)}
            onBlur={() => commit(k)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), commit(k))}
            className="w-full bg-white border border-indigo-400 rounded px-3 py-2 text-sm"
            autoFocus
          />
          {errors[k] && <p className="text-xs text-red-500">{errors[k][0]}</p>}
        </>
      ) : (
        <div
          onClick={() => startEdit(k)}
          className="bg-gray-100 rounded-md px-3 py-2 text-sm text-gray-800 border cursor-pointer"
        >
          {String(v) || "—"}
        </div>
      )}
    </div>
  );

  /* hide from grid */
  const HIDE = [
    "id", "latitude", "longitude",       // removed fields
    "photo_path", "created_at", "updated_at",
    "district_record", "river_record",
  ];

  /* ---- UI ---- */
  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-md border space-y-10">
      {/* header */}
      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold text-indigo-700 mb-1">
          🏞️ Ghaat Details – {draft.ghat_name || `#${draft.id}`}
        </h1>
        <p className="text-sm text-gray-500">Unique ID: {draft.id}</p>
      </div>

      {/* grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {Object.entries(draft).map(([k, v]) =>
          HIDE.includes(k) ? null : <Cell key={k} k={k} v={v} />
        )}
        <Cell k="district_name" v={draft.district_record?.district_name} />
        <Cell k="river_name"    v={draft.river_record?.name} />
      </div>

      {/* photo */}
      <div>
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Ghaat Photo</h2>
        {imgDraft ? (
          <>
            <div className="w-full sm:w-[320px] h-10 border rounded-md overflow-hidden shadow mb-3">
              <img src={URL.createObjectURL(imgDraft)} alt="Preview" className="w-full h-10 object-cover" />
            </div>
            {/* <button onClick={saveImage} className="px-4 py-2 bg-indigo-600 text-white rounded">Save Image</button> */}
            <button onClick={() => setImgDraft(null)} className="ml-3 px-4 py-2 bg-gray-300 rounded">Cancel</button>
          </>
        ) : (
          <>
            {draft.photo_path ? (
              <>
                <div onClick={() => document.getElementById("photoInput").click()} className="w-full sm:w-[320px] h-64 border rounded-md overflow-hidden shadow cursor-pointer">
                  <img src={draft.photo_path.startsWith("blob:") ? draft.photo_path : `http://localhost:8000/storage/${draft.photo_path}`} alt="Ghaat" className="w-full h-full object-cover" />
                </div>
                <button onClick={() => document.getElementById("photoInput").click()} className="mt-2 inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                  <FaCamera className="text-base" /> Edit
                </button>
              </>
            ) : (
              <div className="flex flex-col items-start gap-2">
                <p onClick={() => document.getElementById("photoInput").click()} className="italic text-gray-400 cursor-pointer">
                  No image available
                </p>
                <button onClick={() => document.getElementById("photoInput").click()} className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                  <FaCamera className="text-base" /> Add Image
                </button>
              </div>
            )}
            <input
              id="photoInput"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files[0] && setImgDraft(e.target.files[0])}
            />
          </>
        )}
      </div>

      {/* save */}
      <div className="pt-4 border-t flex justify-center">
        <button onClick={handleSaveAll} disabled={saving} className="px-6 py-3 bg-indigo-600 text-white rounded font-medium disabled:opacity-50">
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}