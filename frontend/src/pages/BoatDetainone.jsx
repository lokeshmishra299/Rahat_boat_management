// src/pages/BoatDetailOne.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
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
          🚤 Boat Details – {boat.registration_no}
        </h1>
      </div>

      {/* General Info */}
      <div>
        <h2 className="text-xl font-semibold mb-4">General Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <Info label="Pilot Name" value={boat.pilot_name ?? 'N/A'} />
         <Info label="Boat Type" value={boat.boat_type ?? 'N/A'} />

{(boat.boat_type === "Hybrid" || boat.boat_type === "Engine Driven") && (
  <Info label="Engine Details" value={boat.engine_details ?? 'N/A'} />
)}

          <Info label="District Name" value={boat.district?.district_name ?? 'N/A'} />
          <Info label="Assigned Ghat" value={boat.ghaat?.ghaat_name ?? 'N/A'} />
          
          <Info label="Pilot License No." value={boat.pilot_license_no ?? 'N/A'} />
          <Info label="Support Staff" value={boat.support_staff ?? 'N/A'} />
         
          <Info label="Passenger Capacity" value={boat.passenger_capacity ?? 'N/A'} />
          <Info label="Year of Manufacture" value={boat.year_of_manufacture ?? 'N/A'} />
          <Info label="Registration Authority" value={boat.registration_authority ?? 'N/A'} />
          <Info label="Additional Remarks" value={boat.remarks} span="sm:col-span-2" />
        </div>
      </div>

      {/* Boat Owner Details */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Boat Owner Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <Info label="Name" value={boat.owner_name ?? 'N/A'} />
          <Info label="Email" value={boat.owner_email ?? 'N/A'} />
          <Info label="Contact" value={boat.owner_number ??'N/A'} />
          <Info label="Aadhar No" value={boat.owner_adhar_no ??'N/A'} />
          <Info label="DOB" value={boat.owner_dob ?? 'N/A'} />
          <Info label="Pincode" value={boat.owner_pincode ??'N/A'} />
          <Info label="No. of Boats Owned" value={boat.owner_boat_owned ?? 'N/A'} />
        </div>
      </div>

      {/* Family Members */}
      {familyMembers.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Owner Family Members</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {familyMembers.map((member, idx) => (
              <div key={idx} className="bg-gray-50 border p-3 rounded">
                {/* <p className="text-sm text-gray-600">Member {idx + 1}</p> */}
                <p className="font-semibold text-gray-800">{member}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Image & Geo Info */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-center">Boat Image</h2>
        <div className="flex justify-center">
          <div className="w-full sm:w-80 rounded-lg shadow overflow-hidden">
            {boat.image ? (
              <div className="text-center mb-4">
                <img
                  src={`http://localhost:8000/storage/${boat.image}`}
                  alt="Boat"
                  className="w-full max-w-md mx-auto rounded shadow"
                />
                <div className="mt-4 text-sm text-gray-700 space-y-1">
                  <p><strong>Location:</strong> {boat.location || "N/A"}</p>
                  <p><strong>Pincode:</strong> {boat.pincode || "N/A"}</p>
                  {/* <p><strong>Latitude:</strong> {boat.latitude || "N/A"}</p>
                  <p><strong>Longitude:</strong> {boat.longitude || "N/A"}</p> */}
                </div>
              </div>
            ) : (
              <div className="w-full h-64 flex items-center justify-center bg-gray-100 text-gray-400">
                No Image Available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Back Button */}
      <div className="pt-4 border-t flex justify-center">
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          Go Back
        </button>
      </div>
    </div>
  );
}