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

  const Info = ({ label, value }) => (
    <div className="space-y-1">
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
      <div className="bg-gray-100 rounded-md px-3 py-2 text-sm text-gray-800 border">
        {value ?? "—"}
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-md border space-y-10">
      {/* Header */}
      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold text-blue-700 mb-1">
          🚤 Boat Details – #{boat.registration_no}
        </h1>
      </div>

      {/* Info Grid */}
     <div>
  <h2 className="text-xl font-semibold mb-4">General Information</h2>
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
    <Info label="Boat Type" value={boat.boat_type} />
    <Info label="District Name" value={boat.district?.district_name} />
    <Info label="Assigned Ghat" value={boat.ghaat?.ghaat_name} />
    <Info label="Pilot Name" value={boat.pilot_name} />
    <Info label="Pilot License No." value={boat.pilot_license_no} />
    <Info label="Support Staff" value={boat.support_staff} />
    <Info label="Engine Details" value={boat.engine_details} />
    <Info label="Passenger Capacity" value={boat.passenger_capacity} />
    <Info label="Year of Manufacture" value={boat.year_of_manufacture} />
    <Info label="Registration Authority" value={boat.registration_authority} />
    
    {/* <Info label="Location" value={boat.location} />
    <Info label="Pincode" value={boat.pincode} />
    <Info label="Latitude" value={boat.latitude} />
    <Info label="Longitude" value={boat.longitude} /> */}
        <Info label="Additional Remarks" value={boat.remarks} />

  </div>

  {/* <div className="mt-6">
    <h2 className="text-xl font-semibold mb-2">Additional Remarks</h2>
    <div className="bg-gray-100 rounded px-3 py-2 text-sm border">
      {boat.remarks || "—"}
    </div>
  </div> */}
</div>


      {/* Image */}
<div>
  <h2 className="text-xl font-semibold mb-4 text-center">Boat Image</h2>
  
  <div className="flex justify-center">
    <div className="w-full sm:w-80 rounded-lg shadow overflow-hidden">
      {boat.image && (
        <div className="text-center mb-4">
          <img
            src={`http://localhost:8000/storage/${boat.image}`}
            alt="Boat"
            className="w-full max-w-md mx-auto rounded shadow"
          />

          <div className="mt-4 text-sm text-gray-700 space-y-1">
            <p><strong>Location:</strong> {boat.location || "N/A"}</p>
            <p><strong>Pincode:</strong> {boat.pincode || "N/A"}</p>
            {/* <p><strong>Latitude:</strong> {boat.latitude || "N/A"}</p> */}
            {/* <p><strong>Longitude:</strong> {boat.longitude || "N/A"}</p> */}
          </div>
        </div>
      )}
    </div>
  </div>
</div>


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