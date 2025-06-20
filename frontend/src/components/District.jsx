// src/components/DistrictDashboard.jsx
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";

/* ——— STATUS‑tag colours ——— */
const STATUS_COLORS = {
  Good:       "bg-blue-100 text-blue-700",
  Excellent:  "bg-emerald-100 text-emerald-700",
  Fair:       "bg-amber-100 text-amber-700",
  Poor:       "bg-red-100 text-red-700",
};

/* ——— authorised axios instance ——— */
const token = localStorage.getItem("access_token");          // 🔑 saved at login
const api   = axios.create({
  baseURL : "http://localhost:8000/api",
  headers : {
    "Content-Type" : "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),      // ← token attached
  },
});

export default function DistrictDashboard() {
  /* ——— metric counts ——— */
  const [counts, setCounts] = useState({
    total_districts_with_ghaats: 0,
    total_district:              0,
    total_ghaats:                0,
    total_registered_boats:      0,
  });

  /* ——— district table data ——— */
  const [districts, setDistricts] = useState([]);   // ← API se aayega
  const [loading,   setLoading]   = useState(true);

  /* fetch metric counts */
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/districts-ghat"); // GET with token
        setCounts(res.data?.data ?? {});
      } catch (err) {
        console.error("Count fetch error:", err);
      }
    })();
  }, []);

  /* fetch district rows */
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/district-dashboard");
        const rows = (res.data?.data ?? []).map((d) => ({
          district    : d.district_name,
          boats       : d.total_boats,
          ghaats      : d.total_ghaats,
          completion  : parseInt(d.fill_percentage),     // "78%" → 78
          lastUpdate  : d.latest_updated_at,
          status      : d.status,
        }));
        setDistricts(rows);
      } catch (err) {
        console.error("District fetch error:", err);
        toast.error("Unable to load district list.");   // optional
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* —— filters —— */
  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");

  const filteredRows = useMemo(() => (
    districts.filter(r => {
      const m1 = r.district.toLowerCase().includes(search.toLowerCase());
      const m2 = statusFilter === "All Status" || r.status === statusFilter;
      return m1 && m2;
    })
  ), [districts, search, statusFilter]);

  /* —— avg completion —— */
  const avgCompletion = districts.length
    ? Math.round(districts.reduce((s,r)=>s+r.completion,0)/districts.length)
    : 0;

  /* —— metric cards —— */
  const metrics = [
    {
      label   : "Total Districts",
      value   : counts.total_districts_with_ghaats || "‑‑",
      subtitle: `${counts.total_district || 0} districts total`,
      dot     : "bg-blue-500",
    },
    {
      label   : "Total Boats",
      value   : counts.total_registered_boats || "‑‑",
      subtitle: "Across all districts",
      dot     : "bg-emerald-500",
    },
    {
      label   : "Total Ghaats",
      value   : counts.total_ghaats || "‑‑",
      subtitle: "River ports operational",
      dot     : "bg-purple-500",
    },
    {
      label   : "Avg Completion",
      value   : `${avgCompletion}%`,
      subtitle: "Data entry progress",
      dot     : "bg-orange-500",
    },
  ];

  /* ——— JSX ——— */
  return (
    <div className="space-y-8 p-6 bg-gray-50 min-h-screen">
      {/* —— Metric cards —— */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map(m => (
          <div key={m.label} className="bg-white rounded-xl shadow p-6">
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

      {/* —— Dashboard table —— */}
      <div className="bg-white rounded-xl shadow p-8 space-y-6">
        <header className="space-y-1">
          <h2 className="text-xl font-semibold">District Monitoring Dashboard</h2>
          <p className="text-sm text-gray-500">
            Monitor boat and ghat registration progress across all 75 districts
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
              onChange={e => setSearch(e.target.value)}
              className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
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
          <table className="min-w-full text-sm">
            <thead className="border-b text-gray-500">
              <tr>
                {["District", "Boats", "Ghaats", "Completion", "Last Update", "Status", "Actions"]
                  .map(h => <th key={h} className="py-3 pr-4 font-medium">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={7} className="py-8 text-center">Loading…</td></tr>
              )}

              {!loading && filteredRows.map(r => (
                <tr key={r.district} className="border-b last:border-0">
                  <td className="py-3 pr-4 font-medium text-gray-800">{r.district}</td>
                  <td className="py-3 pr-4">{r.boats}</td>
                  <td className="py-3 pr-4">{r.ghaats}</td>
                  <td className="py-3 pr-4 w-48">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-700 min-w-[2.5rem]">{r.completion}%</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div className="bg-gray-800 h-2 rounded-full" style={{ width: `${r.completion}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-4 whitespace-nowrap">{r.lastUpdate}</td>
                  <td className="py-3 pr-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-block ${STATUS_COLORS[r.status]}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <button className="text-blue-600 hover:underline font-medium">View Details</button>
                  </td>
                </tr>
              ))}

              {!loading && filteredRows.length === 0 && (
                <tr><td colSpan={7} className="py-8 text-center text-gray-500">No districts match your criteria.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* —— Overview cards —— */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 shadow-md mb-10">
        {/* top performers */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold mb-1">Top Performing Districts</h3>
          <p className="text-sm text-gray-500 mb-4">Highest completion rates</p>
          <div className="space-y-3">
            {districts
              .slice()
              .sort((a,b)=>b.completion-a.completion)
              .slice(0,5)
              .map(d=>(
              <div key={d.district} className="flex justify-between items-center bg-green-50 rounded-lg px-4 py-2">
                <div>
                  <p className="font-medium">{d.district}</p>
                  <p className="text-xs text-gray-600">{d.boats} boats, {d.ghaats} ghaats</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-700">{d.completion}%</p>
                  <p className="text-xs text-green-600">{d.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* needs attention */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold mb-1">Needs Attention</h3>
          <p className="text-sm text-gray-500 mb-4">Lowest completion rates</p>
          <div className="space-y-3">
            {districts
              .slice()
              .sort((a,b)=>a.completion-b.completion)
              .slice(0,5)
              .map(d=>(
              <div key={d.district} className="flex justify-between items-center bg-yellow-50 rounded-lg px-4 py-2">
                <div>
                  <p className="font-medium">{d.district}</p>
                  <p className="text-xs text-gray-600">{d.boats} boats, {d.ghaats} ghaats</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-yellow-700">{d.completion}%</p>
                  <p className="text-xs text-yellow-600">{d.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}