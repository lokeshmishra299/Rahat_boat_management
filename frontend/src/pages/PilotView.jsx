// src/pages/PiloteView.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE ?? "http://localhost:8000/api";

const token = localStorage.getItem("access_token");

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    skip_zrok_interstitial: "true",
    ...(token && { Authorization: `Bearer ${token}` }),
  },
});

const Field = ({ label, value }) => (
  <div>
    <p className="text-xs uppercase text-gray-500 font-semibold mb-1">{label}</p>
    <div className="bg-gray-100 rounded-md px-3 py-2 text-sm text-gray-800 border">
      {value ?? "—"}
    </div>
  </div>
);

export default function PiloteView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [pilot, setPilot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get(`/pilot-list/${id}`)
      .then((res) => {
        if (res.data?.status === "success") {
          setPilot(res.data.data);
        } else {
          setError("Pilot not found.");
        }
      })
      .catch(() => setError("Failed to load data."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="p-6">Loading...</p>;
  if (error) return <p className="p-6 text-red-500">{error}</p>;
  if (!pilot) return null;

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-md border space-y-10">
      <div className="border-b pb-4">
        <h1 className="text-3xl text-center font-bold text-indigo-700 mb-1">
          🧭 Pilot Details - {pilot.name}
        </h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <Field label="Name" value={pilot.name} />
        <Field label="Mobile No" value={pilot.number} />
        <Field label="Email" value={pilot.email} />
        <Field label="Aadhar No" value={pilot.adhar} />
        <Field label="Date of Birth" value={pilot.dob} />
        <Field label="No. of Boats" value={pilot.no_of_boat} />
        <Field label="Registration No" value={pilot.registration_no} />
        {/* <Field label="Relation" value={pilot.relation} /> */}
        {/* <Field label="District" value={pilot.district?.district_name ?? "—"} /> */}
      </div>

      {/* Family Section */}
      <div className="pt-6 border-t">
        <h2 className="text-xl font-semibold text-gray-700 mb-4 text-center">
          👥 Family Members
        </h2>
        {pilot.pilot_family.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-700 border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Mobile</th>
                  <th className="px-4 py-2">Aadhar</th>
                  <th className="px-4 py-2">Relation</th>
                </tr>
              </thead>
              <tbody>
                {pilot.pilot_family.map((member) => (
                  <tr key={member.id} className="border-t">
                    <td className="px-4 py-2 capitalize">{member.name}</td>
                    <td className="px-4 py-2">{member.mobile}</td>
                    <td className="px-4 py-2">{member.adhar}</td>
                    <td className="px-4 py-2 capitalize">{member.relation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-500">No family members added.</p>
        )}
      </div>

      <div className="pt-4 border-t flex justify-center">
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-3 bg-indigo-600 text-white rounded font-medium hover:bg-indigo-700"
        >
          ← Back
        </button>
      </div>
    </div>
  );
}