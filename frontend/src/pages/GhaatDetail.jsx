// src/pages/GhaatDetail.jsx
import React, { useState } from "react";
import { useParams, useLocation } from "react-router-dom";

/* human-readable labels */
const prettify = (k) =>
  k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export default function GhaatDetail() {
  const { id }    = useParams();
  const { state } = useLocation();

  /* hard-refresh fallback */
  if (!state)
    return (
      <div className="p-6">
        <h2 className="text-xl font-bold text-red-600 mb-2">No data supplied</h2>
        <p>Ghaat ID: {id}</p>
      </div>
    );

  /* local, editable copy */
  const [ghaat, setGhaat] = useState(state);
  const [editingKey, setEdit] = useState(null);
  const [draft, setDraft] = useState("");

  /* image edit state */
  const [imgDraft, setImgDraft] = useState(null); // File | null

  /* ---------- inline text edit ---------- */
  const startEdit = (k) => {
    setEdit(k);
    setDraft(ghaat[k] ?? "");
  };

  const saveField = (k) => {
    setGhaat((g) => ({ ...g, [k]: draft }));
    setEdit(null);

    /*  API पर सेव करें — उदाहरण
        api.put(`/ghaats/${ghaat.id}`, { [k]: draft }).catch(console.error);
    */
  };

  /* ---------- image save ---------- */
  const saveImage = () => {
    if (!imgDraft) return;

    const previewURL = URL.createObjectURL(imgDraft); // instant preview
    setGhaat((g) => ({ ...g, photo_path: previewURL }));
    setImgDraft(null);

    /*  बैक-एंड पर भेजना हो तो —
        const fd = new FormData();
        fd.append("photo_path", imgDraft);
        api.post(`/ghaats/${ghaat.id}/photo`, fd).catch(console.error);
    */
  };

  /* ---------- small display component ---------- */
  const Display = ({ k, v }) => (
    <div key={k} className="space-y-1">
      <p className="text-xs uppercase text-gray-500 font-semibold">
        {prettify(k)}
      </p>
      {editingKey === k ? (
        <div className="flex gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="w-full bg-white border border-indigo-400 rounded px-3 py-2 text-sm"
            autoFocus
          />
          <button
            onClick={() => saveField(k)}
            className="px-3 py-2 bg-indigo-600 text-white text-sm rounded"
          >
            Save
          </button>
        </div>
      ) : (
        <div
          onDoubleClick={() => startEdit(k)}
          title="Double-click to edit"
          className="bg-gray-100 rounded-md px-3 py-2 text-sm text-gray-800 border cursor-pointer"
        >
          {String(v) || "—"}
        </div>
      )}
    </div>
  );

  /* ---------- UI ---------- */
  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-md border space-y-10">
      {/* header */}
      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold text-indigo-700 mb-1">
          🏞️ Ghaat Details – {ghaat.ghaat_name || `#${ghaat.id}`}
        </h1>
        <p className="text-sm text-gray-500">Unique ID: {ghaat.id}</p>
      </div>

      {/* info grid (photo_path हटाया) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {Object.entries(ghaat).map(([k, v]) =>
          ["created_at", "updated_at", "photo_path"].includes(k) ? null : (
            <Display key={k} k={k} v={v} />
          )
        )}
      </div>

      {/* ---------------- Photo Section ---------------- */}
      <div>
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Ghaat Photo</h2>

        {imgDraft ? (
          <>
            {/* preview chosen image */}
            <div className="w-full sm:w-[320px] border rounded-md overflow-hidden shadow mb-3">
              <img
                src={URL.createObjectURL(imgDraft)}
                alt="Preview"
                className="w-full object-cover"
              />
            </div>
            <button
              onClick={saveImage}
              className="px-4 py-2 bg-indigo-600 text-white rounded"
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
            {ghaat.photo_path ? (
              <div
                onDoubleClick={() => document.getElementById("photoInput").click()}
                className="w-full sm:w-[320px] border rounded-md overflow-hidden shadow cursor-pointer"
                title="Double-click to replace image"
              >
                <img
                  src={
                    ghaat.photo_path.startsWith("blob:")
                      ? ghaat.photo_path
                      : `http://localhost:8000/storage/${ghaat.photo_path}`
                  }
                  alt="Ghaat"
                  className="w-full object-cover"
                />
              </div>
            ) : (
              <p
                onDoubleClick={() => document.getElementById("photoInput").click()}
                className="italic text-gray-400 cursor-pointer"
                title="Double-click to add image"
              >
                No image available (double-click to add)
              </p>
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
    </div>
  );
}