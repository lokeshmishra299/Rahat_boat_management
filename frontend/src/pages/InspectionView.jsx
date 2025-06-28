// src/pages/InspectionView.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { IoArrowBackOutline } from "react-icons/io5";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
  headers: localStorage.getItem("access_token")
    ? { Authorization: `Bearer ${localStorage.getItem("access_token")}` }
    : {},
});

export default function InspectionView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [inspection, setInspection] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/boat-inspection/${id}`)
      .then((res) =>
        res.data?.status === "success"
          ? setInspection(res.data.data)
          : setError("Inspection record not found.")
      )
      .catch(() => setError("Error fetching inspection details."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="p-6">Loading…</p>;
  if (error) return <p className="p-6 text-red-500">{error}</p>;
  if (!inspection) return null;

  const Info = ({ label, value, span }) => (
    <div className={`space-y-1 ${span ? span : ""}`}>
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
      <div className="bg-gray-100 rounded-md px-3 py-2 text-sm text-gray-800 border">
        {value ?? "—"}
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-md border space-y-10">
      {/* Back Button */}
      {/* <button
        onClick={() => navigate(-1)}
        className="px-2 py-2 bg-gray-600 text-white font-bold rounded-full absolute hover:bg-gray-700"
      >
        <IoArrowBackOutline />
      </button> */}

      {/* Header */}
      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold text-center text-blue-700">
          📝 Inspection Details – #{inspection.inspector_id}
        </h1>
      </div>

      {/* Info Grid */}
      <div>
        <h2 className="text-xl font-semibold mb-4">General Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <Info label="Boat Registration" value={inspection.boat?.registration_no} />
          <Info label="Inspection ID" value={inspection.inspector_id} />
          <Info label="Inspection Date" value={inspection.inspection_date} />

          <Info label="Inspector" value={inspection.inspector_name} />
          <Info label="Status" value={inspection.overall_status} />
          <Info label="Valid Until" value={inspection.inspection_date} />

          <Info label="District" value={inspection.boat?.district?.district_name} />
          <Info label="Assigned Ghat" value={inspection.boat?.ghaat?.ghaat_name} />
        </div>
      </div>

      <div className="pt-4 border-t flex justify-center">
        {/* Footer / Future Buttons */}
      </div>
    </div>
  );
}