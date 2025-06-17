import React, { useState, useMemo } from "react";

// ————————————————————————————————————————————————————————————
// FULL DATASET
const DATA = [
  { district: "Agra", boats: 28, ghaats: 4, completion: 78, lastUpdate: "2024-01-10", status: "Good" },
  { district: "Allahabad", boats: 32, ghaats: 6, completion: 85, lastUpdate: "2024-01-11", status: "Excellent" },
  { district: "Azamgarh", boats: 15, ghaats: 3, completion: 65, lastUpdate: "2024-01-09", status: "Fair" },
  { district: "Bareilly", boats: 22, ghaats: 5, completion: 72, lastUpdate: "2024-01-10", status: "Good" },
  { district: "Deoria", boats: 18, ghaats: 4, completion: 68, lastUpdate: "2024-01-08", status: "Fair" },
  { district: "Ghaziabad", boats: 25, ghaats: 3, completion: 88, lastUpdate: "2024-01-11", status: "Excellent" },
  { district: "Gorakhpur", boats: 30, ghaats: 7, completion: 82, lastUpdate: "2024-01-10", status: "Good" },
  { district: "Jaunpur", boats: 20, ghaats: 5, completion: 70, lastUpdate: "2024-01-09", status: "Fair" },
  { district: "Kanpur Nagar", boats: 35, ghaats: 7, completion: 82, lastUpdate: "2024-01-11", status: "Good" },
  { district: "Lucknow", boats: 45, ghaats: 8, completion: 92, lastUpdate: "2024-01-11", status: "Excellent" },
  { district: "Meerut", boats: 27, ghaats: 4, completion: 75, lastUpdate: "2024-01-10", status: "Good" },
  { district: "Mirzapur", boats: 24, ghaats: 6, completion: 80, lastUpdate: "2024-01-10", status: "Good" },
  { district: "Moradabad", boats: 19, ghaats: 3, completion: 66, lastUpdate: "2024-01-09", status: "Fair" },
  { district: "Muzaffarnagar", boats: 16, ghaats: 2, completion: 62, lastUpdate: "2024-01-08", status: "Fair" },
  { district: "Saharanpur", boats: 21, ghaats: 4, completion: 73, lastUpdate: "2024-01-10", status: "Good" },
  { district: "Varanasi", boats: 29, ghaats: 5, completion: 85, lastUpdate: "2024-01-10", status: "Good" },
];

const STATUS_COLORS = {
  Good: "bg-blue-100 text-blue-700",
  Excellent: "bg-emerald-100 text-emerald-700",
  Fair: "bg-amber-100 text-amber-700",
};

export default function DistrictDashboard() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");

  const rows = useMemo(() => {
    return DATA.filter((row) => {
      const matchesSearch = row.district.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "All Status" || row.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter]);

  const totalDistricts = DATA.length;
  const totalBoats = DATA.reduce((sum, r) => sum + r.boats, 0);
  const totalGhaats = DATA.reduce((sum, r) => sum + r.ghaats, 0);
  const avgCompletion = Math.round(DATA.reduce((sum, r) => sum + r.completion, 0) / DATA.length);

  const metrics = [
    {
      label: "Total Districts",
      value: totalDistricts,
      subtitle: "All 75 districts covered",
      dot: "bg-blue-500",
    },
    {
      label: "Total Boats",
      value: totalBoats,
      subtitle: "Across all districts",
      dot: "bg-emerald-500",
    },
    {
      label: "Total Ghaats",
      value: totalGhaats,
      subtitle: "River ports operational",
      dot: "bg-purple-500",
    },
    {
      label: "Avg Completion",
      value: `${avgCompletion}%`,
      subtitle: "Data entry progress",
      dot: "bg-orange-500",
    },
  ];

  return (
    <div className="space-y-8 p-6 bg-gray-50 min-h-screen">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((m) => (
          <div key={m.label} className="bg-white rounded-xl shadow p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase font-medium text-gray-500">
                  {m.label}
                </p>
                <p className="text-3xl font-extrabold text-gray-900">
                  {m.value}
                </p>
              </div>
              <span className={`h-3 w-3 rounded-full ${m.dot}`}></span>
            </div>
            <p className="text-xs text-gray-400 mt-1">{m.subtitle}</p>
          </div>
        ))}
      </div>

      {/* Dashboard Table */}
      <div className="bg-white rounded-xl shadow p-8 space-y-6">
        <header className="space-y-1">
          <h2 className="text-xl font-semibold">District Monitoring Dashboard</h2>
          <p className="text-sm text-gray-500">
            Monitor boat and ghat registration progress across all 75 districts
          </p>
        </header>

        {/* Controls */}
        <div className="flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
            <input
              type="text"
              placeholder="Search districts..."
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
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b text-gray-500">
              <tr>
                {["District", "Boats", "Ghaats", "Completion", "Last Update", "Status", "Actions"].map((h) => (
                  <th key={h} className="py-3 pr-4 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.district} className="border-b last:border-0">
                  <td className="py-3 pr-4 font-medium text-gray-800">{row.district}</td>
                  <td className="py-3 pr-4">{row.boats}</td>
                  <td className="py-3 pr-4">{row.ghaats}</td>
                  <td className="py-3 pr-4 w-48">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-700 min-w-[2.5rem]">
                        {row.completion}%
                      </span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gray-800 h-2 rounded-full"
                          style={{ width: `${row.completion}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-4 whitespace-nowrap">{row.lastUpdate}</td>
                  <td className="py-3 pr-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold inline-block ${STATUS_COLORS[row.status]}`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <button className="text-blue-600 hover:underline font-medium">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
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
      {/* Overview: Top and Bottom Districts */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-6 shadow-md mb-10">
  {/* Top Performing */}
  <div className="bg-white rounded-xl shadow p-6">
    <h3 className="text-lg font-semibold mb-1">Top Performing Districts</h3>
    <p className="text-sm text-gray-500 mb-4">Districts with highest completion rates</p>
    <div className="space-y-3">
      {DATA.sort((a, b) => b.completion - a.completion).slice(0, 5).map((d) => (
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

  {/* Needs Attention */}
  <div className="bg-white rounded-xl shadow p-6 mb-10">
    <h3 className="text-lg font-semibold mb-1">Needs Attention</h3>
    <p className="text-sm text-gray-500 mb-4">Districts requiring immediate focus</p>
    <div className="space-y-3">
      {DATA.sort((a, b) => a.completion - b.completion).slice(0, 5).map((d) => (
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
