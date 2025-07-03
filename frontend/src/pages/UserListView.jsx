// src/pages/UserListView.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
  headers: localStorage.getItem("access_token")
    ? { Authorization: `Bearer ${localStorage.getItem("access_token")}` }
    : {},
});

const Field = ({ label, value }) => (
  <div>
    <p className="text-xs uppercase text-gray-500 font-semibold mb-1">{label}</p>
    <div className="bg-gray-100 rounded-md px-3 py-2 text-sm text-gray-800 border">
      {value ?? "—"}
    </div>
  </div>
);

export default function UserListView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get(`/user-list/${id}`)
      .then((res) => {
        if (res.data?.status === "success") {
          setUser(res.data.data);
        } else {
          setError("User not found.");
        }
      })
      .catch(() => setError("Failed to load data."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="p-6">Loading...</p>;
  if (error) return <p className="p-6 text-red-500">{error}</p>;
  if (!user) return null;

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-md border space-y-10">
      <div className="border-b pb-4">
        <h1 className="text-3xl text-center font-bold text-indigo-700 mb-1">
          👤 User Details - {user.name}
        </h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <Field label="Full Name" value={user.name} />
        <Field label="Email" value={user.email} />
        <Field label="Contact No" value={user.number} />
        <Field label="District" value={user.district?.district_name} />
        <Field label="Designation" value={user.designation?.name ?? "—"} />
        <Field label="Assign Role" value={user.role?.name} />
        {/* <Field label="Password" value={user.password1} /> */}
      </div>

      <div className="pt-4 border-t flex justify-center">
        {/* <button
          onClick={() => navigate(-1)}
          className="px-6 py-3 bg-indigo-600 text-white rounded font-medium hover:bg-indigo-700"
        >
          ← Back
        </button> */}
      </div>
    </div>
  );
}