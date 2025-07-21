// src/components/LifeJacket.jsx
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Toaster, toast } from "react-hot-toast";
// import {Html5QrcodeScanner} from "html5-qrcode";
// import { Html5Qrcode } from "html5-qrcode";
import { MdQrCodeScanner } from "react-icons/md";
import { IoBanOutline } from "react-icons/io5";
import Select from "react-select";
import QRCode from "react-qr-code";
import QRCodeLib from "qrcode";
import JSZip from "jszip";
import { saveAs } from "file-saver";

/* ── API helper (token-aware) ── */
const BASE_URL = import.meta.env.VITE_API_BASE ?? "http://localhost:8000/api";

const token = localStorage.getItem("access_token");

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  },
});

/* ───────────────────────────────────────────────────────── */
import { useSearchParams } from "react-router-dom";
export default function LifeJacket() {
  // Scaner
  const qrCodeRegionId = "qr-reader";
  const qrInstanceRef = useRef(null);
  const [scannedData, setScannedData] = useState("");
  const [scanning, setScanning] = useState(false);
  const [startScanTrigger, setStartScanTrigger] = useState(false);
  //   const [boats, setBoats] = useState([]);
  // const [selectedBoatCapacity, setSelectedBoatCapacity] = useState(0);

  useEffect(() => {
    if (!startScanTrigger) return;

    const html5QrCode = new Html5Qrcode(qrCodeRegionId);
    qrInstanceRef.current = html5QrCode; // store reference

    const config = { fps: 10, qrbox: 250 };

    html5QrCode
      .start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          setScannedData(decodedText);
          html5QrCode.stop().then(() => {
            html5QrCode.clear();
            qrInstanceRef.current = null;
            setScanning(false);
            setStartScanTrigger(false);
          });
        },
        (errorMessage) => {
          console.warn("QR error", errorMessage);
        }
      )
      .catch((err) => {
        console.error("Unable to start scanning", err);
        qrInstanceRef.current = null;
        setScanning(false);
        setStartScanTrigger(false);
      });
  }, [startScanTrigger]);

  const startScanning = () => {
    setScannedData("");
    setScanning(true);
    setStartScanTrigger(true); // trigger scanner after div is in DOM
  };

  const [searchParams] = useSearchParams();
  const initialTab =
    searchParams.get("tab") === "directory" ? "tracking" : "record";
  const [tab, setTab] = useState(initialTab);

  const storedUser = JSON.parse(localStorage.getItem("user"));
  const roleId = storedUser?.role_id;
  const [autoBoatCount, setAutoBoatCount] = useState("");

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
        const params = {};

        if (roleId === 1 || roleId === 2) {
          params.district_id = storedUser.district_id;
        }

        const res = await api.get("/life-jackets-tracking", { params });

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
    { label: "Total Target", val: stats.allocated, emoji: "📦", bg: "orange" },
    {
      label: "Total Distributed",
      val: stats.distributed,
      emoji: "🛟",
      bg: "green",
    },
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
          roleId={roleId}
          storedUser={storedUser}
        />
      ) : (
        <DistributionTracking rows={rows} stats={stats} loading={loading} />
      )}
    </div>
  );
}

/* ───────────────────────────── RecordForm ───────────────────────────── */
function RecordForm({ onSaved, roleId, storedUser }) {



  const [show, setshow] = useState(false);
  //  const [showQR, setShowQR] = useState(false);
  //  const handleGenerate = () => setShowQR(true);
  const inputCls =
    "w-full border border-slate-300 rounded-lg px-4 py-2 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500";

  /* dropdown data */
  const [districts, setDistricts] = useState([]);
  const [hide, showhide] = useState(false);
  // const [ghaats, setGhaats] = useState([]);
  const [ghaats, setGhaats] = useState([]);
  const [boats, setBoats] = useState([]);
  const [selectedBoatCapacity, setSelectedBoatCapacity] = useState(0);


  /* form & validation */
  const [val, setVal] = useState({
    district_id: "",
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

  const handleDownload = async () => {
    try {
      // Validate all required fields
      const requiredFields = {
        district_id: "District",
        ghat: "Ghat",
        boats: "Boat",
        total: "Total Jackets",
        date: "Distribution Date"
      };

      const missingFields = [];
      for (const [field, name] of Object.entries(requiredFields)) {
        if (!val[field]) {
          missingFields.push(name);
        }
      }

      if (missingFields.length > 0) {
        // toast.error(`Please fill all required fields: ${missingFields.join(", ")}`);
        return;
      }

      const zip = new JSZip();
      const folder = zip.folder("qr-codes");

      const districtName = districts.find(d => d.id == val.district_id)?.district_name || "Unknown";
      const ghatName = ghaats.find(g => g.id == val.ghat)?.ghaat_name || "Unknown";

      for (let i = 0; i < val.total; i++) {
        const qrValue = `ID ${i + 1} | District: ${districtName} | Ghat: ${ghatName} | Boat: ${val.boats} | Date: ${val.date}`;

        const dataUrl = await QRCodeLib.toDataURL(qrValue, {
          width: 500,
          margin: 1
        });

        const base64 = dataUrl.split(",")[1];
        folder.file(`qr_${i + 1}.png`, base64, { base64: true });
      }

      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, "life-jackets-qr-codes.zip");
      toast.success("QR codes downloaded successfully!");
    } catch (err) {
      console.error("QR download failed:", err);
      toast.error("Failed to generate QR codes");
    }
  };

  const autoBoatCount = async (ghatName = "") => {
    if (!ghatName) return;

    const selectedGhat = ghaats.find((g) => g.ghaat_name === ghatName);
    const ghat_id = selectedGhat?.id;
    const district_id = storedUser?.district_id || val.district_id;

    if (ghat_id && district_id) {
      try {
        const res = await api.post("/ghaat-boat-count", {
          ghat_id,
          district_id,
        });
        const data = res.data?.data;

        const boatText = `${data.total_boats} boats (total capacity ${data.total_capacity})`;

        setVal((v) => ({
          ...v,
          boats: boatText,
          total: (parseInt(data.total_capacity || 0) + 1).toString(),
        }));
      } catch (error) {
        console.error("Error fetching boat count", error);
        setVal((v) => ({ ...v, boats: "" }));
      }
    }
  };

  useEffect(() => {
    if ((roleId === 1 || roleId === 2) && storedUser?.district_id) {
      setVal((v) => ({ ...v, district_id: storedUser.district_id }));
    }
  }, [roleId, storedUser]);

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
        console.log(d.data);
      } catch { }
      try {
        const g = await api.get("/ghaat-list");
        setGhaats(g.data.data || []);
      } catch { }
    })();
  }, []);

  //   const [boats, setBoats] = useState([]);

  // const [boats, setBoats] = useState([]);
  // const [selectedBoatCapacity, setSelectedBoatCapacity] = useState(0);

  const fetchBoatsByGhat = async (ghatId) => {
    try {
      const res = await api.post("/boats-by-ghaat", { ghaat_id: ghatId });

      if (res.data.status === "success") {
        const boats = res.data.data
          .filter(item => item.boat_uid !== null)
          .map(item => ({
            value: item.boat_uid,
            label: item.boat_uid,
            capacity: item.passenger_capacity
          }));

        const firstBoat = boats[0];

        setBoats(boats);
        setSelectedBoatCapacity(firstBoat?.capacity || 0);

        setVal(prev => ({
          ...prev,
          boats: firstBoat?.value || "",
          total: firstBoat?.capacity ? (firstBoat.capacity + 1).toString() : "0"
        }));
      }
    } catch (err) {
      console.error("Error fetching boats by ghat:", err);
    }
  };



  /* handlers */
  const handle = (e) => {
    const { name, value } = e.target;
    setVal((v) => {
      const updated = { ...v, [name]: value };

      if (name === "ghat") {
        // value is now ghat_id (string)
        const ghat_id = value;
        let district_id = storedUser?.district_id;

        if (!district_id && updated.district_id) {
          district_id = updated.district_id;
        }

        if (ghat_id && district_id) {
          const ghatName = ghaats.find((g) => g.id === parseInt(ghat_id))?.ghaat_name || "";
          autoBoatCount(ghatName);  // pass name for this function
          fetchBoatsByGhat(ghat_id);
        }
      }
      return updated;
    });
  };


  const digits = (name) => (e) =>
    setVal((v) => ({
      ...v,
      [name]: e.target.value.replace(/\D/g, "").slice(0, 10),
    }));

  /* submit */
  const submit = async (e) => {
    e.preventDefault();

    setSubmitting(true); // show  “Saving…”
    setErrors({}); // clear old errors first

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
    const dist =
      districts.find((d) => d.district_name === val.district) ||
      districts.find((d) => d.id == val.district_id) ||
      {};

    const ghat = ghaats.find((g) => g.ghaat_name === val.ghat) || {};

    const payload = {
      district_id: dist.id ?? "",
      ghaat_id: val.ghat ?? "",
      no_of_boats: val.boats,  // send just the number
      total_jackets: parseInt(val.total),
      distribution_date: val.date,
      received_by: val.received,
      distribution_notes: val.notes,
    };

    /* ---------- 3. send request & handle errors ---------- */
    try {
      await api.post("/life-jackets", payload);

      toast.success("Distribution saved!");
      setVal({
        district: "",
        district_id: "",
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

      onSaved();
    } catch (err) {
      const apiErr =
        err.response?.data?.errors || // Laravel 422
        err.response?.data?.data; // sometimes wrapped in data

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
    (g) => g.district_id === parseInt(val.district_id)
  );
  return (
    <form onSubmit={submit} className="bg-white shadow p-8 rounded-xl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* District */}
        {roleId !== 1 && roleId !== 2 && (
          <div>
            <label className="block text-sm font-medium mb-1">District *</label>
            <select
              name="district_id"
              value={val.district_id}
              onChange={handle}
              className={inputCls}
            >
              <option value="">Select District</option>
              {districts.map((district) => (
                <option key={district.id} value={district.id}>
                  {district.district_name}
                </option>
              ))}
            </select>
            {errors.district_id && (
              <p className="text-xs text-red-600 mt-1">{errors.district_id}</p>
            )}
          </div>
        )}

        {/* Ghaat */}
        <div>
          <label className="block text-sm font-medium mb-1">Ghat *</label>
          <select
            name="ghat"
            value={val.ghat}
            onChange={handle}
            className={inputCls}
          >
            <option value="">Select Ghat</option>
            {filteredGhaats.map((g) => (
              <option key={g.id} value={g.id}>
                {g.ghaat_name}
              </option>
            ))}
          </select>
          {errors.ghat && (
            <p className="text-xs text-red-600 mt-1">{errors.ghat}</p>
          )}
        </div>

        {/* Boats */}

        {/* // Inside your component: */}
        <div>
          <label className="block text-sm font-medium mb-1">Boats *</label>
          <Select
            className="react-select-container"
            classNamePrefix="react-select"
            options={boats}
            value={boats.find(option => option.value === val.boats) || null}
            onChange={(selectedOption) => {
              const capacity = selectedOption?.capacity || 0;
              setSelectedBoatCapacity(capacity);
              setVal(prev => ({
                ...prev,
                boats: selectedOption?.value || "",
                total: capacity ? (capacity + 1).toString() : "0"
              }));
            }}
            isSearchable
            placeholder={boats.length === 0 ? "No boats available" : "Select Boat"}
            noOptionsMessage={() => "No boats found for this ghat"}
            isDisabled={boats.length === 0}
            styles={{
              control: (base) => ({
                ...base,
                backgroundColor: "#f3f4f6",
                borderColor: boats.length === 0 ? "#ef4444" : "#d1d5db",
                minHeight: "42px",
              }),
              option: (base, { isFocused }) => ({
                ...base,
                backgroundColor: isFocused ? "#e0f2fe" : "white",
                color: "#1e3a8a",
              }),
            }}
          />

          {errors?.boats && (
            <p className="text-xs text-red-600 mt-1">{errors.boats}</p>
          )}
        </div>


        <div>
          <label className="block text-sm font-medium mb-1">
            Total Jackets *
          </label>
          <input
            type="text"
            name="total"
            value={val.total || ""}
            readOnly
            className={`${inputCls} bg-gray-100 cursor-not-allowed`}
            title="Automatically calculated from boat capacity"
          />
          {/* <p className="text-xs text-gray-500 mt-1">
    Calculated from boat capacity: {selectedBoatCapacity} passengers + 1
  </p> */}
          {errors.total && (
            <p className="text-xs text-red-600 mt-1">{errors.total}</p>
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
          <label className="block text-sm font-medium mb-1">Received By *</label>
          <input
            name="received"
            value={val.received}
            onChange={handle}
            placeholder="Received by boat officer"
            className={inputCls}
          />
        </div>

        {/* QR Scaneer */}
        {/* QR Scanner */}
        <div className="p-4 bg-white rounded-lg shadow-md">
          {/* Header row with button */}
          <div className="flex justify-center sm:justify-start mt-4">
            <button
              onClick={handleDownload}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow transition duration-300"
            >
              Download QR
            </button>
          </div>

          {/* Hidden QR grid - you can enable it by uncommenting below if needed */}

          {hide && (
            <div className="sm:flex flex-wrap gap-4 justify-start">
              {Array.from({ length: parseInt(val.total || 0) }).map(
                (_, index) => {
                  const districtName =
                    districts.find((d) => d.id == val.district_id)
                      ?.district_name || "Unknown";

                  return (
                    <div
                      key={index}
                      className="p-2 border border-gray-300 rounded-lg shadow-sm bg-gray-50"
                    >
                      <QRCode
                        size={200}
                        bgColor="white"
                        fgColor="black"
                        value={`Id ${index + 1
                          } | District: ${districtName}, Ghat: ${val.ghat
                          }, Boat: ${val.boats}, Date: ${val.date}`}
                      />
                      <p className="mt-2 text-sm text-center text-gray-600">
                        QR {index + 1}
                      </p>
                    </div>
                  );
                }
              )}
            </div>
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
          Monitor life jacket distribution across all districts and ghats
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
                <th className="px-4 py-3 font-medium">District</th>
                <th className="px-4 py-3 font-medium">Ghat</th>
                <th className="px-4 py-3 font-medium">Boats</th>
                <th className="px-4 py-3 font-medium">Allocated</th>
                <th className="px-4 py-3 font-medium">Distributed</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(grouped).map(([district, distRows]) => (
                <React.Fragment key={district}>
                  {/* Always show first row */}
                  {/* Always show first row */}
                  <tr className="border-t border-slate-200">
                    <td className="px-4 py-3 font-semibold">
                      {distRows.length > 1 ? (
                        <span
                          className="cursor-pointer"
                          onClick={() => toggle(district)}
                        >
                          {open[district] ? "−" : "+"} {district}
                        </span>
                      ) : (
                        district
                      )}
                    </td>
                    <td className="px-4 py-3">{distRows[0].ghaat}</td>
                    <td className="px-4 py-3">{distRows[0].boats}</td>
                    <td className="px-4 py-3">{distRows[0].total_allocated}</td>
                    <td className="px-4 py-3">
                      {distRows[0].total_distributed}
                    </td>
                    <td className="px-4 py-3">
                      {distRows[0].children?.[0]?.distribution_date || "N/A"}
                    </td>
                    <td className="px-4 py-3">{distRows[0].status}</td>
                  </tr>

                  {/* Show additional rows only when expanded */}
                  {/* Show additional rows only when expanded */}
                  {open[district] &&
                    distRows.flatMap(
                      (r) =>
                        r.children?.map((child, idx) => (
                          <tr key={idx} className="border-t border-slate-200">
                            <td className="px-6 py-3">{r.district}</td>
                            <td className="px-4 py-3">{r.ghaat}</td>
                            <td className="px-4 py-3">{child.boats}</td>
                            <td className="px-4 py-3">
                              {child.total_allocated}
                            </td>
                            <td className="px-4 py-3">
                              {child.total_distributed}
                            </td>
                            <td className="px-4 py-3">
                              {child.distribution_date}
                            </td>
                            <td className="px-4 py-3 ">{child.status}</td>
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