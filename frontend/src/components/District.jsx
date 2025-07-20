// src/components/DistrictDashboard.jsx
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

/* ——— STATUS colours ——— */
const STATUS_COLORS = {
  Good: "bg-blue-100 text-blue-700",
  Excellent: "bg-emerald-100 text-emerald-700",
  Fair: "bg-amber-100 text-amber-700",
  Poor: "bg-red-100 text-red-700",
};

/* ——— authorised axios instance ——— */
const token = localStorage.getItem("access_token");

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE ?? "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  },
  withCredentials: true, 
});

export default function DistrictDashboard() {
  const navigate = useNavigate();

  const [counts, setCounts] = useState({
    total_districts_with_ghaats: 0,
    total_district: 0,
    total_ghaats: 0,
    total_registered_boats: 0,
  });

  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/districts-ghat");
        setCounts(res.data?.data ?? {});
      } catch {}
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/district-dashboard");
        const rows = (res.data?.data ?? []).map((d) => ({
          district: d.district_name,
          boats: d.total_boats,
          ghaats: d.total_ghaats,
          completion: parseInt(d.fill_percentage),
          lastUpdate: d.latest_updated_at,
          status: d.status,
        }));
        setDistricts(rows);
      } catch {} finally {
        setLoading(false);
      }
    })();
  }, []);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");

  const filteredRows = useMemo(
    () =>
      districts.filter(
        (r) =>
          r.district.toLowerCase().includes(search.toLowerCase()) &&
          (statusFilter === "All Status" || r.status === statusFilter),
      ),
    [districts, search, statusFilter],
  );

  const avgCompletion = districts.length
    ? Math.round(districts.reduce((s, r) => s + r.completion, 0) / districts.length)
    : 0;

  const metrics = [
    {
      label: "Total Districts",
      value: counts.total_districts_with_ghaats || "0",
      subtitle: `${counts.total_district || 0} districts total`,
      dot: "bg-blue-500",
      // onClick: () => alert("Total Districts clicked"),
    },
    {
      label: "Total Boats",
      value: counts.total_registered_boats || "0",
      subtitle: "Across all districts",
      dot: "bg-emerald-500",
      onClick: () => navigate("/dashboard/boats?tab=directory"),
    },
    {
      label: "Total Ghaats",
      value: counts.total_ghaats || "0",
      subtitle: "River ports operational",
      dot: "bg-purple-500",
      onClick: () => navigate("/dashboard/ghats?tab=directory"),
    },
    // {
    //   label: "Avg Completion",
    //   value: `${avgCompletion}%`,
    //   subtitle: "Data entry progress",
    //   dot: "bg-orange-500",
    //   onClick: () => {},
    // },
  ];

  return (
    <div className="space-y-8 p-6 bg-gray-50 min-h-screen">
      {/* metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((m) => (
          <div
            key={m.label}
            onClick={m.onClick}
            className="bg-white rounded-xl shadow p-6 cursor-pointer transform transition-transform duration-200 hover:scale-[1.03] hover:shadow-lg"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase font-medium text-gray-500">{m.label}</p>
                <p className="text-3xl font-extrabold text-gray-900">{m.value}</p>
              </div>
              <span className={`h-3 w-3 rounded-full ${m.dot}`} />
            </div>
            <p className="text-xs text-gray-400 mt-1">{m.subtitle}</p>
          </div>
        ))}
      </div>

      {/* dashboard table */}
      <div className="bg-white rounded-xl shadow p-8 space-y-6">
        <header className="space-y-1">
          <h2 className="text-xl font-semibold">District Monitoring Dashboard</h2>
          <p className="text-sm text-gray-500">
            Monitor boat and ghat registration progress across all districts
          </p>
        </header>

        {/* filters */}
        <div className="flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
            <input
              type="text"
              placeholder="Search districts…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 min-w-[150px]"
          >
            <option>All Status</option>
            <option>Excellent</option>
            <option>Good</option>
            <option>Fair</option>
            <option>Poor</option>
          </select>
        </div>

        {/* table */}
        <div className="overflow-x-auto">
          <table className="min-w-full w-full text-sm">
            <thead className="border-b text-gray-500">
              <tr>
                <th className="py-3 px-4 text-left font-medium">District</th>
                <th className="py-3 px-4 text-center font-medium">Boats</th>
                <th className="py-3 px-4 text-center font-medium">Ghaats</th>
                {/* <th className="py-3 px-4 text-center font-medium">Completion</th> */}
                <th className="py-3 px-4 text-center font-medium">Last Update</th>
                {/* <th className="py-3 px-4 text-center font-medium">Status</th> */}
                {/* <th className="py-3 px-4 text-center font-medium">Actions</th> */}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={7} className="py-8 text-center">
                    Loading…
                  </td>
                </tr>
              )}

              {!loading &&
                filteredRows.map((r) => (
                  <tr key={r.district} className="border-b last:border-0">
                    <td className="py-3 px-4 font-medium text-gray-800">{r.district}</td>
                    <td className="py-3 px-4 text-center">{r.boats}</td>
                    <td className="py-3 px-4 text-center">{r.ghaats}</td>
                    {/* <td className="py-3 px-4 text-center w-48">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-gray-700 min-w-[2.5rem]">{r.completion}%</span>
                        <div className="flex-1 bg-gray-200 h-2 rounded-full">
                          <div className="bg-gray-800 h-2 rounded-full" style={{ width: `${r.completion}%` }} />
                        </div>
                      </div>
                    </td> */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">{r.lastUpdate}</td>
                    {/* <td className="py-3 px-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[r.status]}`}>{r.status}</span>
                    </td> */}
                    {/* <td className="py-3 px-4 text-center">
                      <button className="text-blue-600 hover:underline font-medium">View Details</button>
                    </td> */}
                  </tr>
                ))}

              {!loading && filteredRows.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">
                    No districts match your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}