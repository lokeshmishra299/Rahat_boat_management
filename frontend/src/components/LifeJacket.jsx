// src/components/LifeJacket.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Toaster, toast } from 'react-hot-toast';



/* ── API helper (token-aware) ── */
const api = axios.create({
  baseURL: "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
    ...(localStorage.getItem("access_token") && {
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    }),
  },
});

/* ───────────────────────────────────────────────────────── */
import { useSearchParams } from "react-router-dom";
export default function LifeJacket() {
  // const [tab, setTab] = useState("record");
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") === "directory" ? "tracking" : "record";
  const [tab, setTab] = useState(initialTab);

  const [reload, setReload] = useState(false);

  /* headline stats & rows for tracking */
  const [stats, setStats] = useState({
    allocated: 0,
    distributed: 0,
    efficiency: "0%",
  });
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  /* fetch summary + table every time reload flips */
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await api.get("/life-jackets-tracking");
        const summary = res.data?.data?.summary ?? {};
        const list = res.data?.data?.data ?? [];

        setStats({
          allocated: summary.total_allocated_jackets ?? 0,
          distributed: summary.total_distributed_jackets ?? 0,
          efficiency: summary.efficiency_percent ?? "0%",
        });
        setRows(list);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [reload]);

  /* cards config */
  const cards = [
    { label: "Total Allocated", val: stats.allocated, emoji: "📦", bg: "orange" },
    { label: "Distributed", val: stats.distributed, emoji: "🛟", bg: "green" },
    {
      label: "Distribution Rate",
      val: stats.efficiency,
      emoji: "📈",
      bg: "blue",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 px-6 py-10">
      <Toaster position="top-right" reverseOrder={false} />

      {/* statistic cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {cards.map((c) => (
          <article
            key={c.label}
            className={`rounded-xl p-6 flex items-center gap-4 bg-${c.bg}-50`}
          >
            <span
              className={`grid place-content-center h-10 w-10 rounded-lg text-2xl text-${c.bg}-600 bg-${c.bg}-100`}
            >
              {c.emoji}
            </span>
            <div>
              <p className={`text-${c.bg}-700 font-semibold`}>{c.label}</p>
              <p className={`text-2xl font-bold text-${c.bg}-800`}>
                {loading ? "…" : c.val}
              </p>
            </div>
          </article>
        ))}
      </section>

      {/* tab switcher */}
      <nav className="mb-10 flex flex-col sm:flex-row justify-center gap-4">
        {[
          { id: "record", label: "📦 Record Distribution" },
          { id: "tracking", label: "📊 Distribution Tracking" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-6 py-2 rounded-full font-semibold ${tab === t.id
                ? "bg-orange-600 text-white"
                : "bg-white text-slate-700 shadow hover:bg-slate-50"
              }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {tab === "record" ? (
        <RecordForm
          onSaved={() => {
            setTab("tracking");
            setReload((f) => !f);
          }}
        />
      ) : (
        <DistributionTracking rows={rows} stats={stats} loading={loading} />
      )}
    </div>
  );
}

/* ───────────────────────────── RecordForm ───────────────────────────── */
function RecordForm({ onSaved }) {
  const inputCls =
    "w-full border border-slate-300 rounded-lg px-4 py-2 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500";

  /* dropdown data */
  const [districts, setDistricts] = useState([]);
  const [ghaats, setGhaats] = useState([]);

  /* form & validation */
  const [val, setVal] = useState({
    district: "",
    ghat: "",
    boats: "",
    perBoat: "",
    total: "",
    allocated: "",
    date: "",
    received: "",
    phone: "",
    notes: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const ph = {
    boats: "Enter number of boats",
    perBoat: "Jackets per boat",
    total: "Total jackets distributed",
    allocated: "Total jackets allocated",
    phone: "10-digit mobile number",
    notes: "Any additional information",
  };
  const reqMsg = "This field is required.";

  /* fetch dropdown options */
  useEffect(() => {
    (async () => {
      try {
        const d = await api.get("/district-list");
        setDistricts(d.data.data || []);
        console.log(d.data)
      } catch { }
      try {
        const g = await api.get("/ghaat-list");
        setGhaats(g.data.data || []);
      } catch { }
    })();
  }, []);

  /* handlers */
  const handle = (e) =>
    setVal((v) => ({ ...v, [e.target.name]: e.target.value }));

  const digits = (name) => (e) =>
    setVal((v) => ({
      ...v,
      [name]: e.target.value.replace(/\D/g, "").slice(0, 10),
    }));

  /* submit */
  const submit = async (e) => {
    e.preventDefault();

    setSubmitting(true);   // show  “Saving…”
    setErrors({});         // clear old errors first

    /* ---------- 1. client‑side quick checks (optional) ---------- */
    const early = {};
    // if (!districts.find((d) => d.district_name === val.district)) {
    //   early.district = "Select a valid district.";
    // }
    // if (!ghaats.find((g) => g.ghaat_name === val.ghat)) {
    //   early.ghat = "Select a valid ghat.";
    // }
    // if (Object.keys(early).length) setErrors(early);   // **do not return** – let backend run too

    /* ---------- 2. build payload (use '' when id not found) ---------- */
    const dist = districts.find((d) => d.district_name === val.district) || {};
    const ghat = ghaats.find((g) => g.ghaat_name === val.ghat) || {};

    const payload = {
      district_id: dist.id ?? "",
      ghaat_id: ghat.id ?? "",
      no_of_boats: +val.boats,
      jackets_per_boat: +val.perBoat,
      total_jackets: +val.total,
      total_allocated_jackets: +val.allocated,
      distribution_date: val.date,
      received_by: val.received,
      phone: val.phone,
      distribution_notes: val.notes,
    };

    /* ---------- 3. send request & handle errors ---------- */
    try {
      await api.post("/life-jackets", payload);

      toast.success("Distribution saved!");
      setVal({
        district: "", ghat: "", boats: "", perBoat: "", total: "",
        allocated: "", date: "", received: "", phone: "", notes: "",
      });
      onSaved();
    } catch (err) {
      const apiErr =
        err.response?.data?.errors   // Laravel 422
        || err.response?.data?.data; // sometimes wrapped in data

      if (apiErr && typeof apiErr === "object") {
        const map = {
          district_id: "district",
          ghaat_id: "ghat",
          no_of_boats: "boats",
          jackets_per_boat: "perBoat",
          total_jackets: "total",
          total_allocated_jackets: "allocated",
          distribution_date: "date",
          received_by: "received",
          phone: "phone",
          distribution_notes: "notes",
        };

        setErrors(
          Object.fromEntries(
            Object.entries(apiErr).map(([k, v]) => [
              map[k] ?? k,
              Array.isArray(v) ? v[0] : v,
            ])
          )
        );
      } else {
        // alert("Save failed.");
      }
    } finally {
      setSubmitting(false); // re‑enable button
    }
  };


  /* ghat options filtered by district */
  const filteredGhaats = ghaats.filter(
    (g) => g.district_record?.district_name === val.district
  );




  return (
    <form onSubmit={submit} className="bg-white shadow p-8 rounded-xl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* District */}
        <div>
          <label className="block text-sm font-medium mb-1">District *</label>
          <select
            name="district"
            value={val.district}
            onChange={handle}
            className={inputCls}
          >
            <option value="">Select District</option>
            {districts.map((d) => (
              <option key={d.id}>{d.district_name}</option>
            ))}
          </select>
          {errors.district && (
            <p className="text-xs text-red-600 mt-1">{errors.district}</p>
          )}
        </div>

        {/* Ghaat */}
        <div>
          <label className="block text-sm font-medium mb-1">Ghaat *</label>
          <select
            name="ghat"
            value={val.ghat}
            onChange={handle}
            className={inputCls}
          >
            <option value="">Select Ghaat</option>
            {filteredGhaats.map((g) => (
              <option key={g.id}>{g.ghaat_name}</option>
            ))}
          </select>
          {errors.ghat && (
            <p className="text-xs text-red-600 mt-1">{errors.ghat}</p>
          )}
        </div>

        {/* Boats */}
        <div>
          <label className="block text-sm font-medium mb-1">Boats *</label>
          <input
            name="boats"
            value={val.boats}
            onChange={digits("boats")}
            placeholder={ph.boats}
            className={inputCls}
            inputMode="numeric"
          />
          {errors.boats && (
            <p className="text-xs text-red-600 mt-1">{errors.boats}</p>
          )}
        </div>

        {/* Jackets per boat */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Jackets / Boat *
          </label>
          <input
            name="perBoat"
            value={val.perBoat}
            onChange={digits("perBoat")}
            placeholder={ph.perBoat}
            className={inputCls}
            inputMode="numeric"
          />
          {errors.perBoat && (
            <p className="text-xs text-red-600 mt-1">{errors.perBoat}</p>
          )}
        </div>

        {/* Total distributed */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Total Jackets *
          </label>
          <input
            name="total"
            value={val.total}
            onChange={digits("total")}
            placeholder={ph.total}
            className={inputCls}
            inputMode="numeric"
          />
          {errors.total && (
            <p className="text-xs text-red-600 mt-1">{errors.total}</p>
          )}
        </div>

        {/* Total allocated */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Total Allocated *
          </label>
          <input
            name="allocated"
            value={val.allocated}
            onChange={digits("allocated")}
            placeholder={ph.allocated}
            className={inputCls}
            inputMode="numeric"
          />
          {errors.allocated && (
            <p className="text-xs text-red-600 mt-1">{errors.allocated}</p>
          )}
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Distribution Date *
          </label>
          <input
            type="date"
            name="date"
            value={val.date}
            onChange={handle}
            className={inputCls}
          />
          {errors.date && (
            <p className="text-xs text-red-600 mt-1">{errors.date}</p>
          )}
        </div>

        {/* Received by (optional) */}
        <div>
          <label className="block text-sm font-medium mb-1">Received By</label>
          <input
            name="received"
            value={val.received}
            onChange={handle}
            placeholder="Name of receiving officer"
            className={inputCls}
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium mb-1">Phone</label>
          <input
            name="phone"
            value={val.phone}
            onChange={digits("phone")}
            placeholder={ph.phone}
            className={inputCls}
            inputMode="numeric"
          />
          {errors.phone && (
            <p className="text-xs text-red-600 mt-1">{errors.phone}</p>
          )}
        </div>

        {/* Notes */}
        <div className="md:col-span-3">
          <label className="block text-sm font-medium mb-1">Notes</label>
          <textarea
            name="notes"
            value={val.notes}
            onChange={handle}
            placeholder={ph.notes}
            rows={3}
            className={inputCls}
          />
        </div>
      </div>

      <div className="mt-6 flex items-center justify-center">
        <button
          disabled={submitting}
          className={`px-8 py-3 rounded-full font-semibold ${submitting
              ? "bg-slate-400 cursor-not-allowed"
              : "bg-orange-600 text-white hover:bg-orange-700"
            }`}
        >
          {submitting ? "Saving…" : "Record Distribution"}
        </button>
      </div>
    </form>
  );
}

/* ──────────────────────── Distribution Tracking ─────────────────────── */
function DistributionTracking({ rows, stats, loading }) {
  const { useState: useToggle } = React;
  if (loading) return <p className="text-center text-slate-500">Loading…</p>;

  const pct = stats.allocated
    ? ((stats.distributed / stats.allocated) * 100).toFixed(1)
    : "0.0";

  /* group by district */
  const grouped = rows.reduce((acc, r) => {
    (acc[r.district] = acc[r.district] || []).push(r);
    return acc;
  }, {});

  const [open, setOpen] = useToggle({});

  const toggle = (d) => setOpen((o) => ({ ...o, [d]: !o[d] }));

  return (
    <div className="space-y-10">
      <section>
        <h2 className="text-xl font-bold text-orange-600">
          Distribution Tracking
        </h2>
        <p className="text-slate-600 text-sm">
          Monitor life jacket distribution across all districts and ghaats
        </p>
      </section>

      {/* ── Progress Summary ── */}
      <section className="bg-orange-50 p-6 rounded-xl shadow">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <h1 className="text-slate-700 text-lg sm:text-xl md:text-2xl font-semibold">
            Overall Distribution Progress
          </h1>
          <span className="text-base sm:text-sm font-bold text-slate-600">
            {pct}%
          </span>
        </div>

        <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
          <div className="h-full bg-orange-600" style={{ width: `${pct}%` }} />
        </div>

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 mt-4">
          <span className="text-sm font-medium text-orange-700">
            {stats.distributed} distributed
          </span>
          <span className="text-sm font-medium text-slate-500">
            {stats.allocated} total allocated
          </span>
        </div>
      </section>

      {/* table or empty */}
      {rows.length === 0 ? (
        <div className="bg-white shadow rounded-xl p-8 text-center text-slate-500">
          No distribution records found.
        </div>
      ) : (
        <div className="bg-white shadow rounded-xl p-6 overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="px-4 py-3 font-medium text-center">District</th>
                <th className="px-4 py-3 font-medium text-center">Ghaat</th>
                <th className="px-4 py-3 font-medium text-center">Boats</th>
                <th className="px-4 py-3 font-medium text-center">Allocated</th>
                <th className="px-4 py-3 font-medium text-center">Distributed</th>
                <th className="px-4 py-3 font-medium text-center">Date</th>
                <th className="px-4 py-3 font-medium text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(grouped).map(([district, distRows]) => (
                <React.Fragment key={district}>
                  {/* Always show first row */}
                  {/* Always show first row */}
                  <tr className="border-t border-slate-200">
                    <td className="px-4 py-3 font-semibold text-center">
                      {distRows.length > 1 ? (
                        <span
                          className="cursor-pointer "
                          onClick={() => toggle(district)}
                        >
                          {open[district] ? "−" : "+"} {district}
                        </span>
                      ) : (
                        district
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">{distRows[0].ghaat}</td>
                    <td className="px-4 py-3 text-center">{distRows[0].boats}</td>
                    <td className="px-4 py-3 text-center">{distRows[0].total_allocated}</td>
                    <td className="px-4 py-3 text-center">{distRows[0].total_distributed}</td>
                    <td className="px-4 py-3 text-center">
                      {distRows[0].children?.[0]?.distribution_date || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-center">{distRows[0].status}</td>
                  </tr>

                  {/* Show additional rows only when expanded */}
                  {/* Show additional rows only when expanded */}
                  {open[district] && distRows.flatMap(r =>
                    r.children?.map((child, idx) => (
                      <tr key={idx} className="border-t border-slate-200">
                        <td className="px-6 py-3 text-center">{r.district}</td>
                        <td className="px-4 py-3 text-center">{r.ghaat}</td>
                        <td className="px-4 py-3 text-center">{child.boats}</td>
                        <td className="px-4 py-3 text-center">{child.total_allocated}</td>
                        <td className="px-4 py-3 text-center">{child.total_distributed}</td>
                        <td className="px-4 py-3 text-center">{child.distribution_date}</td>
                        <td className="px-4 py-3 text-center ">{child.status}</td>
                      </tr>
                    )) || []
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}