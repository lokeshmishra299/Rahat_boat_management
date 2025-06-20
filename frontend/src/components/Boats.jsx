// src/pages/Boats.jsx
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { FaShip, FaListAlt, FaPlusCircle, FaCamera } from "react-icons/fa";

/* ══════════════════ AXIOS CONFIG ══════════════════ */
const BASE_URL = "http://localhost:8000/api";
const token = localStorage.getItem("access_token");

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` })
  }
});

/* ══════════════════ COMPONENT ══════════════════ */
const Boats = () => {
  const [view, setView] = useState("register");

  /* districts (matches Ghaat.jsx) */
  const [districts, setDistricts] = useState([]);
  const [loadingDistricts, setLoadingDistricts] = useState(true);
  const [districtError, setDistrictError] = useState("");

  /* boat list */
  const [boats, setBoats] = useState([]);
  const [loadingBoats, setLoadingBoats] = useState(true);
  const [boatsError, setBoatsError] = useState("");

  /* modal */
  const [showModal, setShowModal] = useState(false);
  const [selectedBoat, setSelectedBoat] = useState(null);

  /* form */
  const emptyForm = {
    regNumber: "",
    district: "",
    type: "",
    pilotName: "",
    license: "",
    staffCount: "",
    engine: "",
    capacity: "",
    year: "",
    ghat: "",
    authority: "",
    additionalInfo: ""
  };
  const [form, setForm] = useState(emptyForm);
  const [photoName, setPhotoName] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);
  const [errors, setErrors] = useState({});

  /* helpers */
  const inputClass =
    "w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500";
  const field = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const fieldNum = (k) => (e) =>
    setForm((f) => ({
      ...f,
      [k]: e.target.value === "" ? "" : Math.max(0, parseInt(e.target.value, 10))
    }));

  /* ── Load districts (exactly like Ghaat.jsx) ── */
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/district-list");
        setDistricts(Array.isArray(res.data.data) ? res.data.data : []);
      } catch {
        setDistrictError("Could not load districts.");
      } finally {
        setLoadingDistricts(false);
      }
    })();
  }, []);

  /* ── Load boats ── */
  const loadBoats = useCallback(async () => {
    setLoadingBoats(true);
    setBoatsError("");
    try {
      const { data } = await api.get("/boat-list");
      setBoats(Array.isArray(data) ? data : data.data || []);
    } catch {
      setBoatsError("Could not fetch boats.");
    } finally {
      setLoadingBoats(false);
    }
  }, []);

  useEffect(() => {
    loadBoats();
  }, [loadBoats]);

  /* ── Submit form ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert(null);
    setErrors({});
    setSaving(true);

    const fd = new FormData();
    fd.append("registration_no", form.regNumber);
    fd.append("district", form.district);
    fd.append("boat_type", form.type);
    fd.append("pilot_name", form.pilotName);
    fd.append("pilot_license_no", form.license);
    fd.append("support_staff", form.staffCount);
    fd.append("engine_details", form.engine);
    fd.append("passenger_capacity", form.capacity);
    fd.append("year_of_manufacture", form.year);
    fd.append("assigned_ghat", form.ghat);
    fd.append("registration_authority", form.authority);
    fd.append("remarks", form.additionalInfo);
    if (photoFile) fd.append("image", photoFile);

    try {
      const { data } = await api.post("/boats", fd, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAlert({ ok: true, msg: data.message || "Boat registered successfully." });
      await loadBoats();
      setForm(emptyForm);
      setPhotoName("");
      setPhotoFile(null);
      setView("directory");
    } catch (err) {
      const v = err.response?.data;
      if (v?.data && typeof v.data === "object") setErrors(v.data);
      setAlert({
        ok: false,
        msg: v?.message || "Registration failed. Please review the form."
      });
    } finally {
      setSaving(false);
    }
  };

  /* ── Render ── */
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-white px-4 sm:px-10 py-10">
      <Header />
      <Tabs view={view} setView={setView} />

      {view === "register" ? (
        <RegisterForm
          {...{
            form,
            field,
            fieldNum,
            inputClass,
            loadingDistricts,
            districtError,
            districts,
            photoName,
            setPhotoName,
            setPhotoFile,
            errors,
            alert,
            saving,
            handleSubmit
          }}
        />
      ) : (
        <DirectoryTable
          boats={boats}
          loading={loadingBoats}
          error={boatsError}
          onView={(b) => {
            setSelectedBoat(b);
            setShowModal(true);
          }}
        />
      )}

      {showModal && selectedBoat && (
        <Modal onClose={() => setShowModal(false)}>
          <BoatDetails boat={selectedBoat} />
        </Modal>
      )}
    </div>
  );
};

/* ═════════ Header ═════════ */
const Header = () => (
  <div className="text-center mb-10">
    <div className="inline-flex items-center justify-center bg-green-100 rounded-full p-3 shadow">
      <FaShip className="text-green-600 text-2xl" />
    </div>
    <h2 className="text-3xl sm:text-4xl font-bold text-green-800 mt-4">
      Boat Management
    </h2>
    <p className="text-gray-600 mt-2 max-w-xl mx-auto">
      Register and track rescue boats with comprehensive documentation and
      real‑time monitoring
    </p>
  </div>
);

/* ═════════ Tabs ═════════ */
const Tabs = ({ view, setView }) => (
  <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-10">
    {[
      ["register", <FaPlusCircle key="plus" />, "Register New Boat"],
      ["directory", <FaListAlt key="list" />, "Boat Directory"]
    ].map(([id, icon, label]) => (
      <button
        key={id}
        onClick={() => setView(id)}
        className={`flex items-center gap-2 px-6 py-2 rounded-full font-semibold transition ${
          view === id
            ? id === "register"
              ? "bg-green-600 text-white"
              : "bg-sky-600 text-white"
            : id === "register"
            ? "bg-white text-green-700 hover:bg-green-50 shadow"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200 shadow"
        }`}
      >
        {icon} {label}
      </button>
    ))}
  </div>
);

/* ═════════ Register Form ═════════ */
const RegisterForm = ({
  form,
  field,
  fieldNum,
  inputClass,
  loadingDistricts,
  districtError,
  districts,
  photoName,
  setPhotoName,
  setPhotoFile,
  errors,
  alert,
  saving,
  handleSubmit
}) => (
  <div className="bg-white rounded-xl shadow-md p-8 max-w-6xl mx-auto border">
    {alert && (
      <div
        className={`mb-6 text-center py-2 rounded ${
          alert.ok ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
        }`}
      >
        {alert.msg}
      </div>
    )}

    {/* photo upload */}
    <div className="bg-green-50 border border-dashed border-green-300 rounded-lg p-6 text-center mb-8">
      <div className="flex justify-center mb-4">
        <div className="bg-white rounded-full p-3 shadow inline-flex">
          <FaCamera className="text-green-500 text-xl" />
        </div>
      </div>
      <p className="text-green-800 font-semibold mb-1">
        Upload Boat Photo (geo‑tag)
      </p>
      <p className="text-gray-600 text-sm mb-4">
        Capture or upload a photo where the registration number is visible and
        GPS coordinates are embedded.
      </p>
      <input
        id="boat-photo"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files[0]) {
            setPhotoName(e.target.files[0].name);
            setPhotoFile(e.target.files[0]);
          }
        }}
      />
      <label htmlFor="boat-photo">
        <span className="cursor-pointer bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full font-medium transition inline-block">
          Choose Photo
        </span>
      </label>
      {photoName && (
        <p className="text-sm text-green-700 mt-2">Selected: {photoName}</p>
      )}
    </div>

    {/* form fields */}
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Input
        label="Registration Number *"
        name="regNumber"
        value={form.regNumber}
        onChange={field("regNumber")}
        error={errors.registration_no}
        placeholder="UP‑XXX‑000"
      />

      {/* District dropdown (identical to Ghaat.jsx) */}
      <div>
        <label className="text-sm font-medium mb-1">
          District <span className="text-red-500">*</span>
        </label>
        <select
          name="district"
          value={form.district}
          onChange={field("district")}
          className={inputClass}
        >
          {loadingDistricts ? (
            <option>Loading…</option>
          ) : districtError ? (
            <option>{districtError}</option>
          ) : (
            <>
              <option value="">Select District</option>
              {districts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.district_name}
                </option>
              ))}
            </>
          )}
        </select>
        {errors.district && (
          <p className="text-red-500 text-sm mt-1">{errors.district}</p>
        )}
      </div>

      <Select
        label="Boat Type *"
        name="type"
        value={form.type}
        onChange={field("type")}
        options={["Hybrid", "Engine Driven", "Manual (Paddle/Oar)"]}
        error={errors.boat_type}
      />

      <Input
        label="Pilot Name *"
        name="pilotName"
        value={form.pilotName}
        onChange={field("pilotName")}
        error={errors.pilot_name}
      />

      <Input
        label="Pilot License Number"
        name="license"
        value={form.license}
        onChange={field("license")}
        error={errors.pilot_license_no}
      />

      <Input
        label="Support Staff Count *"
        name="staffCount"
        type="number"
        min="0"
        value={form.staffCount}
        onChange={fieldNum("staffCount")}
        error={errors.support_staff}
      />

      <Input
        label="Engine Details"
        name="engine"
        value={form.engine}
        onChange={field("engine")}
        error={errors.engine_details}
        placeholder="e.g., 40 HP Yamaha"
      />

      <Input
        label="Passenger Capacity"
        name="capacity"
        type="number"
        min="0"
        value={form.capacity}
        onChange={fieldNum("capacity")}
        error={errors.passenger_capacity}
      />

      <Input
        label="Year of Manufacture"
        name="year"
        type="number"
        min="1950"
        max={new Date().getFullYear()}
        value={form.year}
        onChange={fieldNum("year")}
        error={errors.year_of_manufacture}
        placeholder="YYYY"
      />

      <Input
        label="Assigned Ghat *"
        name="ghat"
        value={form.ghat}
        onChange={field("ghat")}
        error={errors.assigned_ghat}
      />

      <Select
        label="Registration Authority *"
        name="authority"
        value={form.authority}
        onChange={field("authority")}
        options={[
          "District Collector",
          "Sub‑Divisional Magistrate",
          "Circle Officer",
          "Block Development Officer"
        ]}
        error={errors.registration_authority}
      />

      {/* remarks */}
      <div className="md:col-span-2">
        <label className="text-sm font-medium mb-1">Additional Remarks</label>
        <textarea
          name="additionalInfo"
          value={form.additionalInfo}
          onChange={field("additionalInfo")}
          rows="3"
          placeholder="Any additional information about the boat"
          className={inputClass}
        />
        {errors.remarks && (
          <p className="text-red-500 text-sm mt-1">{errors.remarks}</p>
        )}
      </div>

      {/* submit */}
      <div className="md:col-span-2 text-center mt-4">
        <button
          type="submit"
          disabled={saving}
          className={`bg-green-600 hover:bg-green-700 text-white font-semibold px-10 py-2 rounded-full transition ${
            saving && "opacity-50 cursor-not-allowed"
          }`}
        >
          {saving ? "Saving…" : "Register Boat"}
        </button>
      </div>
    </form>
  </div>
);

/* ═════════ Directory Table ═════════ */
const DirectoryTable = ({ boats, loading, error, onView }) => (
  <div className="bg-white rounded-xl shadow-md p-8 max-w-6xl mx-auto border">
    <h3 className="text-2xl font-bold text-center text-sky-700 mb-4">
      Registered Boats
    </h3>
    <p className="text-gray-600 text-center mb-6">
      Complete fleet directory with real‑time status and operational details
    </p>

    {loading ? (
      <p className="text-center text-gray-500">Loading…</p>
    ) : error ? (
      <p className="text-center text-red-500">{error}</p>
    ) : boats.length === 0 ? (
      <p className="text-center text-gray-500">No boats registered yet.</p>
    ) : (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left font-semibold text-gray-700">
              <th className="px-4 py-3">Reg. No.</th>
              <th className="px-4 py-3">Pilot</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">District</th>
              <th className="px-4 py-3">Ghat</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {boats.map((b) => (
              <tr key={b.regNumber || b.registration_no} className="hover:bg-gray-50">
                <td className="px-4 py-2 font-semibold">
                  {b.regNumber || b.registration_no}
                </td>
                <td className="px-4 py-2">{b.pilotName || b.pilot_name}</td>
                <td className="px-4 py-2">{b.type || b.boat_type}</td>
                <td className="px-4 py-2">{b.district}</td>
                <td className="px-4 py-2">{b.ghat || b.assigned_ghat}</td>
                <td className="px-4 py-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      (b.status || "Active") === "Active"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {b.status || "Active"}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => onView(b)}
                    className="text-sky-600 hover:underline"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

/* ═════════ Modal ═════════ */
const Modal = ({ children, onClose }) => (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative">
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
      >
        &times;
      </button>
      {children}
    </div>
  </div>
);

/* ═════════ Boat Details inside modal ═════════ */
const BoatDetails = ({ boat }) => (
  <div>
    <h3 className="text-xl font-bold mb-4 text-center">Boat Details</h3>
    <ul className="space-y-1 text-sm max-h-96 overflow-auto pr-2">
      {Object.entries(boat).map(([key, value]) => (
        <li key={key} className="flex justify-between border-b py-1">
          <span className="font-medium capitalize mr-4 whitespace-nowrap">
            {key.replace(/_/g, " ")}
          </span>
          <span className="text-gray-700 text-right break-all flex-1">
            {String(value)}
          </span>
        </li>
      ))}
    </ul>
  </div>
);

/* ═════════ small inputs (re‑usable) ═════════ */
const Input = ({ label, error, ...rest }) => (
  <div>
    <label className="text-sm font-medium mb-1">{label}</label>
    <input
      {...rest}
      className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
    />
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
);

const Select = ({ label, options, error, ...rest }) => (
  <div>
    <label className="text-sm font-medium mb-1">{label}</label>
    <select
      {...rest}
      className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
    >
      <option value="">Select</option>
      {options.map((o) => (
        <option key={o}>{o}</option>
      ))}
    </select>
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
);

export default Boats;