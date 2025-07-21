// src/pages/BoatDetailOne.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE ?? "http://localhost:8000/api";
const API_BASE = BASE_URL.replace("/api", "");

const token = localStorage.getItem("access_token");
const user = JSON.parse(localStorage.getItem("user"));

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  },
});

export default function BoatDetailone() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [boat, setBoat] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/boat-list/${id}`)
      .then((res) => {
        if (res.data?.status === "success") setBoat(res.data.data);
        else setError("Boat not found.");
      })
      .catch(() => setError("Error fetching boat details."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="p-6">Loading…</p>;
  if (error) return <p className="p-6 text-red-500">{error}</p>;
  if (!boat) return null;

  const Info = ({ label, value, span }) => (
    <div className={`space-y-1 ${span || ""}`}>
      <p className="text-xs text-gray-500 tracking-wide">{label}</p>
      <div className="bg-gray-100 rounded-md px-3 py-2 text-sm text-gray-800 border">
        {value ?? "—"}
      </div>
    </div>
  );

  const familyMembers = boat.owner_family_name
    ? boat.owner_family_name.split(",").map((name) => name.trim())
    : [];

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-md border space-y-10">
      {/* Header */}
      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold text-blue-700 mb-1">
          🚤 Boat Details: {boat.boat_uid}
        </h1>
      </div>

      {/* General Info */}
      <div>
        <h2 className="text-xl font-semibold mb-4">General Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <Info label="Registration Number" value={boat.registration_no} />
          <Info label="Boat Type" value={boat.boat_type} />
          
          {(boat.boat_type === "Hybrid" || boat.boat_type === "Engine Driven") && (
            <Info label="Engine Details" value={boat.engine_details} />
          )}

          <Info label="District" value={boat.district?.district_name} />
          <Info label="Assigned Ghat" value={boat.ghaat?.ghaat_name} />
          <Info label="Registration Authority" value={boat.registration_authority} />
          <Info label="Support Staff Count" value={boat.support_staff} />
          <Info label="Passenger Capacity" value={boat.passenger_capacity} />
          <Info label="Year of Manufacture" value={boat.year_of_manufacture} />
          <Info label="Status" value={boat.status || "Active"} />
          <Info label="Additional Remarks" value={boat.remarks} span="sm:col-span-2" />
        </div>
      </div>

      {/* Pilot Details */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Pilot Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <Info label="Pilot Name" value={boat.pilot_name} />
          <Info label="License Number" value={boat.pilot_license_no} />
          <Info label="Aadhaar Number" value={boat.adhar_no} />
          <Info label="Contact Number" value={boat.contact_no} />
        </div>
      </div>

      {/* Location Information */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Location Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <Info label="Latitude" value={boat.latitude} />
          <Info label="Longitude" value={boat.longitude} />
          <Info label="Pincode" value={boat.pincode} />
          <Info label="Location Name" value={boat.location} span="sm:col-span-2" />
        </div>
      </div>

      {/* Family Members */}
      {familyMembers.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Owner Family Members</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {familyMembers.map((member, idx) => (
              <div key={idx} className="bg-gray-50 border p-3 rounded">
                <p className="font-semibold text-gray-800">{member}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Images Section */}
      <div className="flex flex-col lg:flex-row items-start justify-center gap-8">
  {/* Boat Image */}
  <div className="space-y-4 w-full lg:w-auto">
    <h2 className="text-xl font-semibold mb-2 text-center lg:text-left">Boat Image</h2>
    <div className="flex justify-center lg:justify-start">
      <div className="w-full sm:w-80 rounded-lg shadow overflow-hidden">
        {boat.image ? (
          <div className="text-center mb-4">
            <img
              src={`${API_BASE}/storage/${boat.image}?nocache=1`}
              alt="Boat"
              className="w-full max-w-md mx-auto rounded shadow"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/no-image.png";
              }}
            />
          </div>
        ) : (
          <div className="w-full h-64 flex items-center justify-center bg-gray-100 text-gray-400">
            No Boat Image Available
          </div>
        )}
      </div>
    </div>
  </div>

  {/* Pilot Image */}
  <div className="space-y-4 w-full lg:w-auto">
    <h2 className="text-xl font-semibold mb-2 text-center lg:text-left">Pilot Image</h2>
    <div className="flex justify-center lg:justify-start">
      <div className="w-full sm:w-80 rounded-lg shadow overflow-hidden">
        {boat.pilot_image ? (
          <div className="text-center mb-4">
            <img
              src={`${API_BASE}/storage/${boat.pilot_image}?nocache=1`}
              alt="Pilot"
              className="w-full max-w-md mx-auto rounded shadow"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/no-image.png";
              }}
            />
          </div>
        ) : (
          <div className="w-full h-64 flex items-center justify-center bg-gray-100 text-gray-400">
            No Pilot Image Available
          </div>
        )}
      </div>
    </div>
  </div>
</div>


      {/* Back Button */}
      <div className="pt-4 border-t flex justify-center">
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
        >
          Go Back
        </button>
      </div>
    </div>
  );
}