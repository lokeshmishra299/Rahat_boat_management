import React, { useState } from "react";

const upDistricts = [
  "Agra", "Aligarh", "Ambedkar Nagar", "Auraiya", "Azamgarh", "Baghpat", "Bahraich",
  "Balarampur", "Banda", "Barabanki", "Ballia", "Bareilly", "Basti", "Bijnor", "Budaun",
  "Bulandshahr", "Chandauli", "Chitrakoot", "Deoria", "Etah", "Etawah", "Farrukhabad",
  "Fatehpur", "Firozabad", "Gautam Buddh Nagar", "Ghaziabad", "Ghazipur", "Gonda",
  "Gorakhpur", "Hamirpur", "Hapur", "Hardoi", "Hathras", "Jalaun", "Jaunpur", "Jhansi",
  "Kannauj", "Kanpur Dehat", "Kanpur Nagar", "Kushinagar", "Lakhimpur Kheri", "Lalitpur",
  "Lucknow", "Maharajganj", "Mahoba", "Mainpuri", "Mathura", "Mau", "Meerut", "Mirzapur",
  "Moradabad", "Muzaffarnagar", "Pilibhit", "Pratapgarh", "Prayagraj", "Rae Bareli",
  "Rampur", "Saharanpur", "Sant Kabir Nagar", "Shahjahanpur", "Shamli", "Shrawasti",
  "Sidharthnagar", "Sitapur", "Sonebhadra", "Sultanpur", "Unnao", "Varanasi"
];

export default function LifeJacket() {
  const [currentTab, setCurrentTab] = useState("record");

  const stats = [
    { label: "Total Allocated", value: 80, color: "orange", emoji: "📦" },
    { label: "Distributed", value: 75, color: "green", emoji: "🛟" },
    { label: "Distribution Rate", value: "93.8%", color: "blue", emoji: "📈" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 px-6 py-10">
      <header className="text-center space-y-4 mb-10">
        <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 grid place-content-center text-3xl shadow-lg">
          🛡️
        </div>
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600">
          Life Jacket Distribution
        </h1>
        <p className="text-slate-600 max-w-lg mx-auto">
          Manage and track life‑jacket distribution across all rescue boats and ghaats
        </p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {stats.map((s) => (
          <article key={s.label} className={`rounded-xl shadow p-6 bg-${s.color}-50 flex items-center gap-4`}>
            <span className={`text-2xl h-10 w-10 grid place-content-center rounded-lg text-${s.color}-600 bg-${s.color}-100`}>{s.emoji}</span>
            <div>
              <p className={`text-${s.color}-700 font-semibold`}>{s.label}</p>
              <p className={`text-2xl font-bold text-${s.color}-800`}>{s.value}</p>
            </div>
          </article>
        ))}
      </section>

      {/* ✅ Updated Tab Switcher - Fully Rounded & Spaced */}
      <nav className="flex justify-center mb-10">
        <div className="flex gap-4">
          {[
            { id: "record", label: "📦 Record Distribution" },
            { id: "tracking", label: "📊 Distribution Tracking" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setCurrentTab(t.id)}
              className={`rounded-full px-6 py-2 text-sm font-semibold transition-colors ${
                currentTab === t.id
                  ? "bg-gradient-to-r from-orange-600 to-red-500 text-white shadow-lg"
                  : "bg-white text-slate-600 hover:bg-slate-50 shadow"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      {currentTab === "record" ? <RecordForm /> : <DistributionTracking />}
    </div>
  );
}

function RecordForm() {
  const labelStyle = "text-sm font-medium text-slate-700";
  const inputStyle = "w-full border border-slate-300 rounded-lg px-4 py-2 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent";

  return (
    <form className="bg-white rounded-3xl shadow-lg p-8 space-y-8">
      <header className="space-y-2 text-center">
        <div className="mx-auto h-12 w-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 grid place-content-center text-2xl text-white">
          🛯
        </div>
        <h2 className="text-xl font-bold text-orange-600">Record Life Jacket Distribution</h2>
        <p className="text-slate-600 text-sm max-w-md mx-auto">
          Document and track life‑jacket distribution to rescue boats and ghaats
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-1">
          <label className={labelStyle}>District <span className="text-red-600">*</span></label>
          <select required className={inputStyle}>
            <option value="">Select District</option>
            {upDistricts.map((district) => (
              <option key={district}>{district}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className={labelStyle}>Ghaat Name <span className="text-red-600">*</span></label>
          <input type="text" required placeholder="Enter ghat name" className={inputStyle} />
        </div>

        <div className="space-y-1">
          <label className={labelStyle}>Number of Boats <span className="text-red-600">*</span></label>
          <input type="number" required placeholder="Boats at this ghat" className={inputStyle} />
        </div>

        <div className="space-y-1">
          <label className={labelStyle}>Jackets per Boat <span className="text-red-600">*</span></label>
          <select required className={inputStyle}>
            <option value="">Select quantity</option>
            {[2, 4, 6, 8, 10].map((q) => (
              <option key={q}>{q}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className={labelStyle}>Total Jackets <span className="text-red-600">*</span></label>
          <input type="number" required placeholder="Total quantity distributed" className={inputStyle} />
        </div>

        <div className="space-y-1">
          <label className={labelStyle}>Distribution Date <span className="text-red-600">*</span></label>
          <input type="date" required className={inputStyle} />
        </div>

        <div className="space-y-1">
          <label className={labelStyle}>Received By</label>
          <input type="text" placeholder="Name of receiving officer" className={inputStyle} />
        </div>

        <div className="space-y-1">
          <label className={labelStyle}>Contact Number</label>
          <input type="tel" placeholder="Mobile number" className={inputStyle} />
        </div>
      </div>

      <div className="space-y-1">
        <label className={labelStyle}>Distribution Notes</label>
        <textarea rows={3} placeholder="Any additional information about the distribution" className={inputStyle} />
      </div>

      <div className="text-center">
        <button type="submit" className="px-8 py-3 rounded-full bg-gradient-to-r from-orange-600 to-red-500 text-white font-semibold shadow-lg hover:opacity-90">
          Record Distribution
        </button>
      </div>
    </form>
  );
}

function DistributionTracking() {
  const data = [
    {
      district: "Varanasi",
      ghat: "Dashashwamedh Ghaat",
      boats: 5,
      allocated: 50,
      distributed: 45,
      date: "2024-01-15",
      status: "Completed",
    },
    {
      district: "Lucknow",
      ghat: "Gomti Ghaat",
      boats: 3,
      allocated: 30,
      distributed: 30,
      date: "2024-01-10",
      status: "Completed",
    },
  ];

  const totalAllocated = data.reduce((sum, row) => sum + row.allocated, 0);
  const totalDistributed = data.reduce((sum, row) => sum + row.distributed, 0);
  const percentage = ((totalDistributed / totalAllocated) * 100).toFixed(1);

  return (
    <div className="space-y-10">
      <section className="space-y-2">
        <h2 className="text-xl font-bold text-orange-600">Distribution Tracking</h2>
        <p className="text-slate-600 text-sm">
          Monitor life jacket distribution across all districts and ghaats
        </p>
      </section>

      <section className="bg-orange-50 p-6 rounded-xl shadow">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-orange-700">{totalDistributed} distributed</span>
          <span className="text-sm font-medium text-slate-500">{totalAllocated} total allocated</span>
        </div>
        <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
          <div className="h-full bg-orange-600" style={{ width: `${percentage}%` }}></div>
        </div>
        <div className="text-right text-sm font-semibold text-orange-700 mt-1">
          {percentage}%
        </div>
      </section>

      <section className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-slate-100 text-slate-700">
            <tr>
              <th className="px-4 py-3 font-medium">District</th>
              <th className="px-4 py-3 font-medium">Ghaat</th>
              <th className="px-4 py-3 font-medium">Boats</th>
              <th className="px-4 py-3 font-medium">Allocated</th>
              <th className="px-4 py-3 font-medium">Distributed</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index} className="border-t border-slate-200">
                <td className="px-4 py-3 font-semibold text-slate-800">{row.district}</td>
                <td className="px-4 py-3 text-slate-700">{row.ghat}</td>
                <td className="px-4 py-3">{row.boats}</td>
                <td className="px-4 py-3">{row.allocated}</td>
                <td className="px-4 py-3">{row.distributed}</td>
                <td className="px-4 py-3">{row.date}</td>
                <td className="px-4 py-3">
                  <span className="inline-block rounded-full bg-green-100 text-green-800 text-xs font-semibold px-3 py-1">
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
