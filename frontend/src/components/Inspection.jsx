// src/components/Inspection.jsx
import React, { useState } from "react";
import axios from "axios";
import { useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

/* ------------ Axios setup ------------ */
const BASE_URL = "http://127.0.0.1:8000/api";
const token = localStorage.getItem("access_token");
console.log(token); // change if tunnel alters;
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    skip_zrok_interstitial: "true",
    ...(token && { Authorization: `Bearer ${token}` }),
  },
});



const tabs = [
  { id: "conduct", label: "Conduct Inspection" },
  { id: "records", label: "Inspection Records" },
  { id: "schedule", label: "Inspection Schedule" },
  { id: "analytics", label: "Analytics" },
];

const Inspection = () => {
  const [activeTab, setActiveTab] = useState("conduct");
  return (
    <div className="p-4 md:p-8 min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* tab bar */}
        <div className="flex justify-center space-x-6 border-b border-gray-200 mb-8">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`py-2 px-4 font-medium border-b-2 transition ${activeTab === t.id
                  ? "border-violet-600 text-violet-600"
                  : "border-transparent text-gray-500 hover:text-violet-600"
                }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === "conduct" && <ConductForm />}
        {activeTab === "records" && <Records />}
        {activeTab === "schedule" && <Schedule />}
        {activeTab === "analytics" && <Analytics />}
      </div>
    </div>
  );
};

// const navigate = useNavigate()
export default Inspection;

/* ================================= Conduct Form ================================= */
const checklistItems = [
  "Hull Integrity",
  "Engine Performance",
  "Life Jackets",
  "Fire Extinguisher",
  "First Aid Kit",
  "Communication Radio",
  "Gps System",
  "Navigation Lights",
  "Fuel Lines",
  "Electrical Wiring",
  "Propeller",
  "Steering",
];

const ConductForm = () => {
  const [form, setForm] = useState({
    register_boat_id: "",
    inspection_date: "",
    inspector_name: "",
    inspector_id: "",
    hull_condition: "Good",
    engine_condition: "Good",
    safety_equipment: "Complete",
    overall_status: "Passed",
    recommendations: "",
    inspection_remarks: "",
    inspection_checklist: [],
  });

  const [formErrors, setFormErrors] = useState({});

  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);

  const field = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const toggle = (item) =>
    setForm((f) => ({
      ...f,
      inspection_checklist: f.inspection_checklist.includes(item)
        ? f.inspection_checklist.filter((i) => i !== item)
        : [...f.inspection_checklist, item],
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert(null);
    setLoading(true);
    setFormErrors({});

    try {
      // Step 1: Lookup ID by registration number
      const lookupRes = await api.post("/boat-id-lookup", {
        registration_no: form.register_boat_id,
      });

      const boatId = lookupRes.data?.data?.id;

      if (!boatId) {
        setAlert({
          ok: false,
          msg: "Boat ID not found for given registration number.",
        });
        setLoading(false);
        return;
      }

      // Step 2: Prepare payload with actual boat ID
      const payload = {
        ...form,
        register_boat_id: boatId, // ✅ use ID, not registration no
      };

      // Step 3: Submit inspection
      await api.post("/conduct-inspection", payload);

      setAlert({ ok: true, msg: "Inspection saved successfully!" });
      setFormErrors({});
      setForm((f) => ({
        ...f,
        inspection_date: "",
        inspector_name: "",
        inspector_id: "",
        recommendations: "",
        inspection_remarks: "",
        inspection_checklist: [],
      }));
    } catch (err) {
      const errors = err.response?.data?.data;
      if (errors) {
        setFormErrors(errors);
      } else {
        setAlert({
          ok: false,
          msg: err.response?.data?.message || "Something went wrong.",
        });
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h2 className="text-2xl font-semibold text-center mb-1">
        Annual Boat Inspection Form
      </h2>
      <p className="text-gray-600 text-center mb-6">
        Complete annual safety and compliance inspection for rescue boats
      </p>

      {alert && (
        <div
          className={`mb-6 text-center py-2 rounded ${alert.ok ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}
        >
          {alert.msg}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* info grid */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div>
            <input
              className="border p-2 rounded w-full"
              placeholder="Boat Registration Number *"
              value={form.register_boat_id}
              onChange={field("register_boat_id")}
            />
            {formErrors.register_boat_id && (
              <p className="text-red-500 text-sm mt-1">
                {formErrors.register_boat_id}
              </p>
            )}
          </div>

          <div>
            <input
              type="date"
              className="border p-2 rounded w-full"
              value={form.inspection_date}
              onChange={field("inspection_date")}
            />
            {formErrors.inspection_date && (
              <p className="text-red-500 text-sm mt-1">
                {formErrors.inspection_date}
              </p>
            )}
          </div>

          <div>
            <input
              className="border p-2 rounded w-full"
              placeholder="Inspector Name *"
              value={form.inspector_name}
              onChange={field("inspector_name")}
            />
            {formErrors.inspector_name && (
              <p className="text-red-500 text-sm mt-1">
                {formErrors.inspector_name}
              </p>
            )}
          </div>

          <div className="md:col-span-3">
            <input
              className="border p-2 rounded w-full"
              placeholder="Inspector ID"
              value={form.inspector_id}
              onChange={field("inspector_id")}
            />
          </div>
        </div>

        {/* checklist */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {checklistItems.map((item) => (
            <label key={item} className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="form-checkbox"
                checked={form.inspection_checklist.includes(item)}
                onChange={() => toggle(item)}
              />
              <span>{item}</span>
            </label>
          ))}
        </div>

        {/* selects */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          {[
            [
              "hull_condition",
              "Hull Condition",
              ["Excellent", "Good", "Fair", "Poor"],
            ],
            [
              "engine_condition",
              "Engine Condition",
              ["Excellent", "Good", "Fair", "Poor"],
            ],
            [
              "safety_equipment",
              "Safety Equipment",
              ["Complete", "Partial", "Inadequate"],
            ],
            [
              "overall_status",
              "Overall Status",
              ["Passed", "Failed", "Conditional Pass"],
            ],
          ].map(([key, label, opts]) => (
            <div key={key}>
              <label className="block text-sm font-medium mb-2">
                {label} *
              </label>
              <select
                value={form[key]}
                onChange={field(key)}
                className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                {opts.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
              {formErrors[key] && (
                <p className="text-red-500 text-sm mt-1">{formErrors[key]}</p>
              )}
            </div>
          ))}
        </div>

        {/* text areas */}
        <Textarea
          label="Recommendation"
          placeholder="Any recommendations"
          value={form.recommendations}
          onChange={field("recommendations")}
        />
        <Textarea
          label="Inspection Remark"
          placeholder="Additional comments"
          value={form.inspection_remarks}
          onChange={field("inspection_remarks")}
        />

        <div className="flex justify-center mt-6">
          <button
            disabled={loading}
            className={`bg-violet-600 hover:bg-violet-700 text-white px-6 py-2 rounded w-full md:w-auto ${loading && "opacity-50 cursor-not-allowed"
              }`}
          >
            {loading ? "Saving…" : "Complete Inspection"}
          </button>
        </div>
      </form>
    </>
  );
};

const Textarea = ({ label, value, onChange, placeholder }) => (
  <div className="mb-6">
    <label className="block text-sm font-medium mb-2">{label}</label>
    <textarea
      rows={3}
      className="border w-full p-2 rounded focus:ring-2 focus:ring-violet-500"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
    />
  </div>
);

/* ================================= Records ================================= */
const sampleRecords = [
  {
    reg: "UP-VAR-001",
    date: "2024‑01‑15",
    inspector: "Rajesh Kumar",
    status: "Passed",
    color: "green",
    valid: "2025‑01‑15",
    district: "Varanasi",
  },
  {
    reg: "UP-LKO-005",
    date: "2024‑01‑10",
    inspector: "Sunil Singh",
    status: "Failed",
    color: "red",
    valid: "N/A",
    district: "Lucknow",
  },
];


const Records = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const badge = (status) =>
    status === "Pass" || status === "Passed" || status === "0"
      ? ["green-100", "green-600"]
      : ["red-100", "red-600"];

  useEffect(() => {
    api
      .get("/conduct-inspection-records")
      .then((res) =>
        res.data?.status === "success"
          ? setRecords(res.data.data || [])
          : setError("No records found.")
      )
      .catch(() => setError("Could not load records."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-center mt-8">Loading…</p>;
  if (error) return <p className="text-center mt-8 text-red-500">{error}</p>;

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold text-center mb-1">
        Inspection Records
      </h2>
      <p className="text-gray-600 text-center mb-6">
        History of boat inspections
      </p>

      <div className="overflow-x-auto rounded-lg shadow bg-white">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-4 py-3 border-b text-center">S.No</th>
              <th className="px-4 py-3 border-b">Boat Registration</th>
              <th className="px-4 py-3 border-b text-center">Inspection Date</th>
              <th className="px-4 py-3 border-b">Inspector</th>
              <th className="px-4 py-3 border-b text-center">Status</th>
              <th className="px-4 py-3 border-b text-center">Valid Until</th>
              <th className="px-4 py-3 border-b">District</th>
              <th className="px-4 py-3 border-b text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {records.map((r, index) => {
              const statusText =
                r.overall_status || (r.status === "0" ? "Pass" : "Fail") || "—";
              const [bg, text] = badge(statusText);
              const inspectionDate = r.inspection_date?.split("T")[0] ?? "—";

              return (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 border-b text-center">{index + 1}</td>
                  <td className="px-4 py-3 border-b">
                    {r.boat?.registration_no || "—"}
                  </td>
                  <td className="px-4 py-3 border-b text-center">{inspectionDate}</td>
                  <td className="px-4 py-3 border-b">{r.inspector_name || "—"}</td>
                  <td className="px-4 py-3 border-b text-center">
                    <span
                      className={`bg-${bg} text-${text} px-3 py-1 rounded-full text-xs font-medium`}
                    >
                      {statusText}
                    </span>
                  </td>
                  <td className="px-4 py-3 border-b text-center">{inspectionDate}</td>
                  <td className="px-4 py-3 border-b">
                    {r.boat?.district?.district_name || "—"}
                  </td>
                  <td className="px-4 py-3 border-b text-center">
                    <button
                      onClick={() => navigate(`/dashboard/inspection/inspectionview/${r.id}`)}
                      className="text-sm px-4 py-1 border rounded hover:bg-gray-100"
                    >
                      View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};


/* ================================= Schedule ================================= */
const upcoming = [
  { reg: "UP-AGR-003", district: "Agra", due: "2024‑02‑15", days: 15 },
  { reg: "UP-ALL-007", district: "Allahabad", due: "2024‑02‑20", days: 20 },
  { reg: "UP-KAN-002", district: "Kanpur", due: "2024‑02‑25", days: 25 },
  { reg: "UP-GOR-004", district: "Gorakhpur", due: "2024‑03‑01", days: 30 },
];


const Schedule = () => {
  const [schedule, setSchedule] = useState([]);
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState(null); // New state

  useEffect(() => {
    api
      .get("/upcoming-inspections")
      .then((res) => {
        if (res.data?.status === "success") {
          setSchedule(res.data.data || []);
        }
      })
      .catch(() => {
        setSchedule([]);
      });
  }, []);

  const getCalendarDays = () => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const calendar = [];

    for (let i = 0; i < firstDay; i++) {
      calendar.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      calendar.push(new Date(year, month, day));
    }

    return calendar;
  };

  const getStatus = (date) => {
    if (!date) return "";
    const formatted = date.toISOString().split("T")[0];
    const item = schedule.find((s) => s.due_date === formatted);
    if (!item) return "";
    if (item.days_left < 0) return "bg-red-200";
    if (item.days_left <= 3) return "bg-yellow-200";
    return "bg-green-200";
  };

  const isSelected = (date) => {
    return (
      selectedDate &&
      date &&
      date.toDateString() === selectedDate.toDateString()
    );
  };

  const calendarDays = getCalendarDays();
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const years = Array.from({ length: 51 }, (_, i) => 2000 + i); // 2000 to 2050

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Upcoming Inspections */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-1">Upcoming Inspections</h2>
        <p className="text-sm text-gray-600 mb-4">Boats due soon</p>
        {schedule.length === 0 ? (
          <p className="text-sm text-gray-500">No upcoming inspections.</p>
        ) : (
          schedule.map((u) => (
            <div
              key={u.registration_no}
              className="flex justify-between bg-yellow-50 p-3 rounded mb-3"
            >
              <div>
                <div className="font-medium">{u.registration_no}</div>
                <div className="text-sm text-gray-600">{u.district}</div>
              </div>
              <div className="text-sm text-right">
                <div className="text-gray-700">Due: {u.due_date}</div>
                <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                  {u.days_left} days
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Calendar with Month & Year Select */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-1">Inspection Calendar</h2>
        <p className="text-sm text-gray-600 mb-4">Monthly overview</p>

        {/* Month & Year Selectors */}
        <div className="flex space-x-4 mb-4 ">
          <select className="cursor-pointer"
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}

          >
            {months.map((m, i) => (
              <option key={i} value={i}>{m}</option>
            ))}
          </select>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="border rounded px-2 py-1"
          >
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2 text-sm text-gray-700 mb-4">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="font-medium text-center">{d}</div>
          ))}
          {calendarDays.map((date, i) => (
            <div
              key={i}
              onClick={() => date && setSelectedDate(date)}
              className={`h-10 flex items-center justify-center border rounded cursor-pointer
                ${getStatus(date)} 
                ${isSelected(date) ? "ring-2 ring-blue-500" : "border-gray-200"}
              `}
            >
              {date ? date.getDate() : ""}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex space-x-6 text-sm">
          {[
            ["bg-red-200", "Overdue"],
            ["bg-yellow-200", "Due Soon"],
            ["bg-green-200", "Completed"],
          ].map(([color, label]) => (
            <div key={label} className="flex items-center space-x-2">
              <div className={`w-3 h-3 ${color} rounded-full`} />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


/* ================================= Analytics ================================= */
const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/analytics", {
      // headers: {
      //   Authorization: `Bearer ${token}`,
      // },
      // withCredentials: true,
    })

      .then((res) => {
        const apiData = res?.data?.data;
        console.log("anamm data", apiData);
        if (apiData) {
          setData(apiData);
        } else {
          console.error("Unexpected API format", res);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching analytics:", err);
        setLoading(false);
      });
  }, []);

  if (loading || !data) {
    return (
      <div className="text-center py-10 text-gray-600">
        Loading analytics…
      </div>
    );
  }

  // Extract safely with fallback to 0
  const {
    total_boat = 0,
    total_inspected = 0,
    pass_rate_percent = 0,
    pending = 0,
    passed = 0,
    failed = 0,
    conditional_pass = 0,
  } = data;

  const kpis = [
    {
      label: "Total Boats",
      value: total_boat,
      sub: "Registered fleet",
      color: "bg-blue-500",
    },
    {
      label: "Inspected",
      value: total_inspected,
      sub: "This year",
      color: "bg-green-500",
    },
    {
      label: "Pass Rate",
      value: `${pass_rate_percent}%`,
      sub: "Success rate",
      color: "bg-violet-500",
    },
    {
      label: "Pending",
      value: pending,
      sub: "Awaiting inspection",
      color: "bg-orange-500",
    },
  ];

  const inspected = passed + failed + conditional_pass;
  const pct =
    total_boat > 0 ? ((inspected / total_boat) * 100).toFixed(1) + "%" : "0%";

  return (
    <div className="space-y-8 mb-8">
      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((k) => (
          <div key={k.label} className="bg-white p-6 rounded-lg shadow relative">
            <span
              className={`absolute top-4 right-4 w-3 h-3 rounded-full ${k.color}`}
            />
            <p className="text-sm text-gray-600">{k.label}</p>
            <p className="text-3xl font-bold mt-1">{k.value}</p>
            <p className="text-xs text-gray-500 mt-1">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Progress */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-1">
          Inspection Status Overview
        </h2>
        <p className="text-sm text-gray-600 mb-4">Year‑to‑date progress</p>
        <div className="relative w-full h-3 bg-gray-200 rounded mb-2">
          <div
            className="absolute top-0 left-0 h-3 bg-gray-900 rounded"
            style={{ width: pct }}
          />
          <span className="absolute right-0 -top-5 text-sm text-gray-600">
            {inspected}/{total_boat}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {[
            ["Passed", passed, "green"],
            ["Failed", failed, "red"],
            ["Conditional", conditional_pass, "yellow"],
          ].map(([label, value, color]) => (
            <div
              key={label}
              className={`bg-${color}-50 text-center py-6 rounded`}
            >
              <p className={`text-3xl font-bold text-${color}-600`}>{value}</p>
              <p className={`mt-1 text-sm text-${color}-700`}>{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};