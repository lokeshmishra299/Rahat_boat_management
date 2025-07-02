// src/pages/GhaatDetailView.jsx
import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE ?? "http://localhost:8000/api";

const token = localStorage.getItem("access_token");

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  },
});

const Field = ({ label, value }) => (
  <div>
    <p className="text-xs  text-gray-500 font-semibold mb-1">
      {label}
    </p>
    <div className="bg-gray-100 rounded-md px-3 py-2 text-sm text-gray-800 border">
      {value ?? "—"}
    </div>
  </div>
);

export default function GhaatDetailView() {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  const [ghaat, setGhaat] = useState(state || null);
  const [loading, setLoading] = useState(!state);
  const [error, setError] = useState("");
  const [districts, setDistricts] = useState([]);
  const [rivers, setRivers] = useState([]);

  useEffect(() => {
    if (state) return;
    api
      .get(`/ghaat-list/${id}`)
      .then((r) =>
        r.data?.status === "success"
          ? setGhaat(r.data.data)
          : setError("Ghaat not found.")
      )
      .catch(() => setError("Could not load ghat details."))
      .finally(() => setLoading(false));
  }, [id, state]);

  useEffect(() => {
    api
      .get("/district-list")
      .then((res) => {
        if (res.data?.status === "success") setDistricts(res.data.data);
      })
      .catch(() => {});

    api
      .get("/river-list")
      .then((res) => {
        if (res.data?.status === "success") setRivers(res.data.data);
      })
      .catch(() => {});
  }, []);

  if (loading) return <p className="p-6">Loading…</p>;
  if (error) return <p className="p-6 text-red-500">{error}</p>;
  if (!ghaat) return null;

  const districtName =
    districts.find((d) => d.id === ghaat.district_id)?.district_name || "—";
  const riverName =
    rivers.find((r) => r.id === ghaat.river_id)?.name || "—";

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-md border space-y-10">
      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold text-indigo-700 mb-1">
          🏜️ Ghaat Details – {ghaat.ghaat_name}
        </h1>
        <p className="text-sm text-gray-500">Unique ID: {ghaat.id}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <Field label="Ghaat Name" value={ghaat.ghaat_name} />
        <Field label="Location" value={ghaat.location} />
        <Field label="Pincode" value={ghaat.pincode} />
        <Field label="Boat Capacity" value={ghaat.boat_capacity} />
        <Field label="Road Accessibility" value={ghaat.road_accessibility} />
        <Field label="Contact Person" value={ghaat.contact_person} />
        <Field label="Contact Number" value={ghaat.contact_number} />
        <Field label="Nearest Hospital" value={ghaat.nearest_hospital} />
        <Field label="Available Facilities" value={ghaat.available_facilities} />
        <Field label="Additional Info" value={ghaat.additional_info} />
        <Field label="Registered Boats" value={ghaat.registered_boats_count} />
        <Field label="District" value={districtName} />
        <Field label="River" value={riverName} />
        {/* <Field label="Latitude" value={ghaat.latitude} />
        <Field label="Longitude" value={ghaat.longitude} /> */}
      </div>

     <div>
  <h2 className="text-xl font-semibold text-gray-700 mb-3 text-center">
    Ghaat Photo
  </h2>

  <div className="w-full flex flex-col items-center justify-center">
    {ghaat.photo_path ? (
      <img
        src={`http://localhost:8000/storage/${ghaat.photo_path}`}
        alt="Ghaat"
        className="w-full sm:w-80 h-64 object-cover rounded shadow border"
      />
    ) : (
      <p className="italic text-gray-400 text-center">No image available</p>
    )}

    {/* Location Info Below Image */}
    <div className="mt-4 text-sm text-gray-700 space-y-1 text-center">
      <p><strong>Location:</strong> {ghaat.location || "N/A"}</p>
      <p><strong>Pincode:</strong> {ghaat.pincode || "N/A"}</p>
      {/* <p><strong>Latitude:</strong> {ghaat.latitude || "N/A"}</p>
      <p><strong>Longitude:</strong> {ghaat.longitude || "N/A"}</p> */}
    </div>
  </div>
</div>


      <div className="pt-4 border-t flex justify-center">
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-3 bg-indigo-600 text-white rounded font-medium"
        >
          Back
        </button>
      </div>
    </div>
  );
}