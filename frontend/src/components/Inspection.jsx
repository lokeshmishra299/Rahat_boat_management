// src/components/Inspection.jsx
import React, { useState } from "react";
import axios from "axios";
import { useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Select from "react-select";

/* ------------ Axios setup ------------ */
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
  {/* 🌟 Modern Responsive Tab Bar */}
  <div className="flex flex-wrap justify-center gap-3 sm:gap-4 md:gap-6 mb-8 px-2">
    {tabs.map((t) => (
      <button
        key={t.id}
        onClick={() => setActiveTab(t.id)}
        className={`py-2 px-5 rounded-full font-medium text-sm md:text-base shadow-sm transition-all duration-200
          ${
            activeTab === t.id
              ? "bg-violet-600 text-white shadow-md scale-105"
              : "bg-gray-100 text-gray-700 hover:bg-violet-100 hover:text-violet-700"
          }`}
      >
        {t.label}
      </button>
    ))}
  </div>

  {/* 👇 Tab Content */}
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
  setFormErrors({});
  setLoading(true);

  try {
    // 🔎 Boat-ID Lookup
    const { data: lookupRes } = await api.post("/boat-id-lookup", {
      registration_no: form.register_boat_id,
    });

    const boatId = lookupRes?.data?.id;

    if (!boatId) {
      // 🛑 Custom error if boat not found
      setFormErrors({
        register_boat_id: "Boat not found. Please enter a valid registration number.",
      });
      setLoading(false);
      return;
    }

    // ✅ Submit to backend (no client-side validation)
    await api.post("/conduct-inspection", {
      ...form,
      register_boat_id: boatId,
    });

    toast.success("Inspection saved successfully!");

    // 🔄 Reset form
    setForm({
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

  } catch (err) {
    // 🧹 Handle backend errors cleanly
    let apiErr = err.response?.data?.errors || {};

    // ⚠️ If only `message` returned (e.g., Boat not found)
    if (!Object.keys(apiErr).length && err.response?.data?.message) {
      apiErr.register_boat_id = err.response.data.message;
    }

    // 🔄 Map Laravel's `registration_no` → frontend `register_boat_id`
    if (apiErr.registration_no) {
      apiErr.register_boat_id = apiErr.registration_no;
      delete apiErr.registration_no;
    }

    // 🔤 Convert array errors to string
    apiErr = Object.fromEntries(
      Object.entries(apiErr).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v])
    );

    setFormErrors(apiErr);
    console.error("Backend validation:", apiErr);
  } finally {
    setLoading(false);
  }
};

const [boatOptions, setBoatOptions] = useState([]);

useEffect(() => {
  const fetchBoatNumbers = async () => {
    try {
      const res = await api.get("/boat-registration-no");
      if (res.data?.status === "success") {
        setBoatOptions(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch boat registration numbers", err);
    }
  };

  fetchBoatNumbers();
}, []);



  return (
    <>
            <Toaster position="top-right" reverseOrder={false} />
      <h2 className="text-2xl font-semibold text-center mb-1">
      
        Annual Boat Inspection Form
      </h2>
      <p className="text-gray-600 text-center mb-6">
        Complete annual safety and compliance inspection for rescue boats
      </p>

   

      <form onSubmit={handleSubmit}>
        {/* info grid */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
  {/* Boat Register Name */}
 
<div>
  <label htmlFor="register_boat_id" className="block text-gray-700 font-semibold mb-1">
    Boat Registration Number *
  </label>

  <Select
    id="register_boat_id"
    options={boatOptions.map((boat) => ({
      value: boat.registration_no,
      label: boat.registration_no,
    }))}
    value={
      form.register_boat_id
        ? {
            value: form.register_boat_id,
            label: form.register_boat_id,
          }
        : null
    }
    onChange={(selected) =>
      setForm((prev) => ({
        ...prev,
        register_boat_id: selected?.value || "",
      }))
    }
    placeholder="Select Boat Registration Number"
    isClearable
    className="react-select-container"
    classNamePrefix="react-select"
  />

  {formErrors.register_boat_id && (
    <p className="text-red-500 text-sm mt-1">
      {formErrors.register_boat_id}
    </p>
  )}
</div>

  {/* Inspection Date */}
  <div>
    <label htmlFor="inspection_date" className="block text-gray-700 font-semibold mb-1">
      Inspection Date *
    </label>
    <input
      id="inspection_date"
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

  {/* Inspector Name */}
 <div>
  <label htmlFor="inspector_name" className="block text-gray-700 font-semibold mb-1">
    Inspector Name *
  </label>
  <input
    id="inspector_name"
    className="border p-2 rounded w-full"
    placeholder="Inspector Name *"
    value={form.inspector_name}
    onChange={(e) => {
      const value = e.target.value;
      if (/^[a-zA-Z\s]*$/.test(value)) {
        setForm((prev) => ({ ...prev, inspector_name: value }));
      }
    }}
  />
  {formErrors.inspector_name && (
    <p className="text-red-500 text-sm mt-1">
      {formErrors.inspector_name}
    </p>
  )}
</div>


  {/* Inspector ID */}
  <div>
    <label htmlFor="inspector_id" className="block text-gray-700 font-semibold mb-1">
      Inspector ID
    </label>
    <input
      id="inspector_id"
      className="border p-2 rounded w-full"
      placeholder="Inspector ID"
      value={form.inspector_id}
      onChange={field("inspector_id")}
    />
    {formErrors.inspector_id && (
      <p className="text-red-500 text-sm mt-1">
        {formErrors.inspector_id}
      </p>
    )}
  </div>
</div>

        {/* checklist */}
        <h1 className=" font-semibold text-gray-800 mb-4">Inspection Checklist</h1>
    
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
            className={`bg-violet-600 font-semibold hover:bg-violet-700 text-white px-6 py-2 rounded-full w-full md:w-auto ${
              loading && "opacity-50 cursor-not-allowed"
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
    api
      .get("/analytics")
      .then((res) => {
        const apiData = res?.data?.data;
        console.log(apiData);
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4  gap-6">
        {kpis.map((k) => (
          <div key={k.label} className="bg-white rounded-xl shadow p-6 cursor-pointer transform transition-transform duration-200 hover:scale-[1.03] hover:shadow-lg  relative">
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