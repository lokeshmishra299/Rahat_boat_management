// src/components/Ghaat.jsx
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { FaWater, FaPlusCircle, FaListAlt, FaCamera } from "react-icons/fa";

/* ---------- API CONFIG ---------- */
const BASE_URL = "http://localhost:8000/api";
const token = localStorage.getItem("access_token");

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  },
});

/* ---------- INPUT STYLE ---------- */
const inputClass =
  "w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition";

export default function Ghaat() {
  const [view, setView] = useState("register");

  /* file & location */
  const [photoFile, setPhotoFile] = useState(null);
  const [photoName, setPhotoName] = useState("");
  const [coords, setCoords] = useState({ lat: "", lon: "" });

  /* lists */
  const [rivers, setRivers] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [ghaats, setGhaats] = useState([]);

  /* modal */
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);

  /* form & errors */
  const [formData, setFormData] = useState({
    ghatName: "",
    district: "",
    riverName: "",
    boatCapacity: "",
    roadAccessibility: "",
    availableFacilities: "",
    contactPerson: "",
    contactNumber: "",
    nearestHospital: "",
    additionalInfo: "",
  });
  const [errors, setErrors] = useState({});

  /* ---------- fetch rivers & districts ---------- */
  useEffect(() => {
    (async () => {
      try {
        const r = await api.get("/river-list");
        setRivers(Array.isArray(r.data.data) ? r.data.data : []);
      } catch {
        setRivers([]);
      }
      try {
        const d = await api.get("/district-list");
        setDistricts(Array.isArray(d.data.data) ? d.data.data : []);
      } catch {
        setDistricts([]);
      }
    })();
  }, []);

  /* ---------- fetch ghaats list ---------- */
  const statusMap = {
    "0": "Operational",
    "1": "Not Operational",
    "2": "Under Maintenance",
    "3": "Closed",
  };
  const fetchGhaatList = useCallback(async () => {
    try {
      const res = await api.get("/ghaat-list");
      const list = Array.isArray(res.data.data)
        ? res.data.data.map((d) => ({
            id: d.id,
            name: d.ghaat_name,
            district: d.district_record?.district_name || d.district_id,
            river: d.river_record?.name || d.river_id,
            boatsAssigned: `${d.registered_boats_count}/${d.boat_capacity}`,
            capacity: d.boat_capacity,
            status: statusMap[d.status] ?? "Operational",
            raw: d,
          }))
        : [];
      setGhaats(list);
    } catch {
      setGhaats([]);
    }
  }, []);

  /* ---------- helpers ---------- */
  const handleChange = (e) =>
    setFormData((f) => ({ ...f, [e.target.name]: e.target.value }));

  /* numeric‑only handler (max 10 digits) */
  const handleNumeric = (name) => (e) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
    setFormData((f) => ({ ...f, [name]: digits }));
  };

  const askLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setCoords({
          lat: pos.coords.latitude.toFixed(6),
          lon: pos.coords.longitude.toFixed(6),
        }),
      () => {}
    );
  };

  /* ---------- submit ---------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    const required = [
      "ghatName",
      "district",
      "riverName",
      "boatCapacity",
      "roadAccessibility",
      "availableFacilities",
    ];
    const missing = {};
    required.forEach((k) => {
      if (!formData[k]) missing[k] = "This field is required.";
    });
    if (formData.contactNumber && formData.contactNumber.length > 10)
      missing.contactNumber = "Maximum 10 digits allowed.";
    if (Object.keys(missing).length) {
      setErrors(missing);
      return;
    }

    const fd = new FormData();
    Object.entries({
      ghaat_name: formData.ghatName,
      district_id: formData.district,
      river_id: formData.riverName,
      boat_capacity: formData.boatCapacity,
      road_accessibility: formData.roadAccessibility,
      available_facilities: formData.availableFacilities,
      contact_person: formData.contactPerson,
      contact_number: formData.contactNumber,
      nearest_hospital: formData.nearestHospital,
      additional_info: formData.additionalInfo,
      latitude: coords.lat,
      longitude: coords.lon,
    }).forEach(([k, v]) => fd.append(k, v));
    if (photoFile) fd.append("photo_path", photoFile);

    try {
      const { data } = await api.post("/register-ghaat", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert(data.message || "Ghaat registered!");

      /* reset form */
      setFormData({
        ghatName: "",
        district: "",
        riverName: "",
        boatCapacity: "",
        roadAccessibility: "",
        availableFacilities: "",
        contactPerson: "",
        contactNumber: "",
        nearestHospital: "",
        additionalInfo: "",
      });
      setPhotoFile(null);
      setPhotoName("");
      setCoords({ lat: "", lon: "" });

      /* switch to directory and refresh list */
      setView("directory");
      await fetchGhaatList();
    } catch (err) {
      const v = err.response?.data;
      if (v?.data && typeof v.data === "object") setErrors(v.data);
      else alert("Registration failed.");
    }
  };

  /* ---------- UI ---------- */
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-white px-4 sm:px-12 py-10">
      {/* header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center bg-indigo-100 rounded-full p-3 shadow">
          <FaWater className="text-indigo-600 text-2xl" />
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-indigo-800 mt-4">
          Ghaat Management
        </h2>
        <p className="text-gray-600 mt-2 max-w-xl mx-auto">
          Register and manage riverbank Ghaats
        </p>
      </div>

      {/* tabs */}
      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-10">
        <button
          onClick={() => setView("register")}
          className={`flex items-center gap-2 px-6 py-2 rounded-full font-semibold transition ${
            view === "register"
              ? "bg-indigo-600 text-white"
              : "bg-white text-indigo-700 hover:bg-indigo-50 shadow"
          }`}
        >
          <FaPlusCircle /> Register New Ghaat
        </button>
        <button
          onClick={() => {
            setView("directory");
            fetchGhaatList();
          }}
          className={`flex items-center gap-2 px-6 py-2 rounded-full font-semibold transition ${
            view === "directory"
              ? "bg-sky-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200 shadow"
          }`}
        >
          <FaListAlt /> Ghaat Directory
        </button>
      </div>

      {/* ---------------- REGISTER FORM ---------------- */}
      {view === "register" && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-md p-8 max-w-6xl mx-auto border grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* photo block */}
          <div className="md:col-span-3">
            <div className="bg-indigo-50 border border-dashed border-indigo-300 rounded-lg p-6 text-center">
              <FaCamera className="text-indigo-500 text-2xl mb-2 mx-auto" />
              <p className="text-indigo-800 font-semibold mb-1">
                Upload Ghaat Geotagged Photo
              </p>
              <p className="text-gray-600 text-sm">
                Capture or upload a photo with <strong>GPS coordinates</strong>.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-5 mt-4 w-full">
              <label htmlFor="ghaat-photo" className="w-full sm:w-auto">
                <span className="block text-center cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-full font-medium">
                  Choose Photo
                </span>
              </label>
              <span
                className="block text-center cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-full font-medium"
                onClick={() => {
                  askLocation();
                  document.getElementById("ghaat-camera").click();
                }}
              >
                Open Camera
              </span>
            </div>

            {photoName && (
              <p className="text-sm text-indigo-700 mt-2 text-center">
                Selected: {photoName}
              </p>
            )}

            <input
              id="ghaat-photo"
              type="file"
              accept="image/jpeg, image/png"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files[0];
                if (f && (f.type === "image/jpeg" || f.type === "image/png")) {
                  setPhotoFile(f);
                  setPhotoName(f.name);
                  askLocation();
                } else {
                  alert("Only JPEG or PNG files are allowed.");
                }
              }}
            />
            <input
              id="ghaat-camera"
              type="file"
              accept="image/jpeg, image/png"
              capture="camera"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files[0];
                if (f && (f.type === "image/jpeg" || f.type === "image/png")) {
                  setPhotoFile(f);
                  setPhotoName(f.name);
                } else {
                  alert("Only JPEG or PNG files are allowed.");
                }
              }}
            />
          </div>

          {/* --------- Main inputs with error labels --------- */}
          <div>
            <label className="block text-sm font-medium mb-1">Ghaat Name *</label>
            <input
              name="ghatName"
              value={formData.ghatName}
              onChange={handleChange}
              placeholder="Enter Ghaat Name"
              className={inputClass}
            />
            {errors.ghatName && (
              <p className="text-red-500 text-sm mt-1">{errors.ghatName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">District *</label>
            <select
              name="district"
              value={formData.district}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">Select District</option>
              {districts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.district_name}
                </option>
              ))}
            </select>
            {errors.district && (
              <p className="text-red-500 text-sm mt-1">{errors.district}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">River Name *</label>
            <select
              name="riverName"
              value={formData.riverName}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">Select River</option>
              {rivers.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
            {errors.riverName && (
              <p className="text-red-500 text-sm mt-1">{errors.riverName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Boat Capacity *</label>
            <input
              name="boatCapacity"
              placeholder="Maximum Boat Capacity"
              value={formData.boatCapacity}
              onChange={handleNumeric("boatCapacity")}
              className={inputClass}
              inputMode="numeric"
              pattern="\d*"
            />
            {errors.boatCapacity && (
              <p className="text-red-500 text-sm mt-1">{errors.boatCapacity}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Road Accessibility *</label>
            <input
              name="roadAccessibility"
              placeholder="e.g. Paved Road"
              value={formData.roadAccessibility}
              onChange={handleChange}
              className={inputClass}
            />
            {errors.roadAccessibility && (
              <p className="text-red-500 text-sm mt-1">{errors.roadAccessibility}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Available Facilities *</label>
            <input
              name="availableFacilities"
              placeholder="Parking, First Aid, etc."
              value={formData.availableFacilities}
              onChange={handleChange}
              className={inputClass}
            />
            {errors.availableFacilities && (
              <p className="text-red-500 text-sm mt-1">{errors.availableFacilities}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Contact Person</label>
            <input
              name="contactPerson"
              placeholder="Name of Contact Person"
              value={formData.contactPerson}
              onChange={handleChange}
              className={inputClass}
            />
            {errors.contactPerson && (
              <p className="text-red-500 text-sm mt-1">{errors.contactPerson}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Contact Number</label>
            <input
              name="contactNumber"
              placeholder="Mobile Number"
              value={formData.contactNumber}
              onChange={handleNumeric("contactNumber")}
              className={inputClass}
              inputMode="numeric"
              pattern="\d*"
            />
            {errors.contactNumber && (
              <p className="text-red-500 text-sm mt-1">{errors.contactNumber}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Nearest Hospital</label>
            <input
              name="nearestHospital"
              placeholder="Hospital & distance"
              value={formData.nearestHospital}
              onChange={handleChange}
              className={inputClass}
            />
            {errors.nearestHospital && (
              <p className="text-red-500 text-sm mt-1">{errors.nearestHospital}</p>
            )}
          </div>

          <div className="md:col-span-3">
            <label className="block text-sm font-medium mb-1">Additional Info</label>
            <textarea
              name="additionalInfo"
              value={formData.additionalInfo}
              onChange={handleChange}
              rows={3}
              placeholder="Any other details"
              className={inputClass}
            />
            {errors.additionalInfo && (
              <p className="text-red-500 text-sm mt-1">{errors.additionalInfo}</p>
            )}
          </div>

          <div className="md:col-span-3 text-center mt-4">
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-10 py-2 rounded-full"
            >
              Register Ghaat
            </button>
          </div>
        </form>
      )}

      {/* ---------------- DIRECTORY ---------------- */}
      {view === "directory" && (
        <div className="bg-white rounded-xl shadow-md p-8 max-w-6xl mx-auto border">
          <h3 className="text-2xl font-bold text-center text-blue-800 mb-4">
            Registered Ghaats
          </h3>
          {ghaats.length === 0 ? (
            <p className="text-center text-gray-500">No ghaats registered yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Ghaat Name</th>
                    <th className="px-6 py-3 font-semibold">District</th>
                    <th className="px-6 py-3 font-semibold">River</th>
                    <th className="px-6 py-3 font-semibold">Boats Assigned</th>
                    <th className="px-6 py-3 font-semibold">Capacity</th>
                    <th className="px-6 py-3 font-semibold">Status</th>
                    <th className="px-6 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {ghaats.map((g) => (
                    <tr key={g.id}>
                      <td className="px-6 py-4">{g.name}</td>
                      <td className="px-6 py-4">{g.district}</td>
                      <td className="px-6 py-4">{g.river}</td>
                      <td className="px-6 py-4">{g.boatsAssigned}</td>
                      <td className="px-6 py-4">{g.capacity}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                          {g.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => {
                            setSelected(g.raw);
                            setShowModal(true);
                          }}
                          className="text-indigo-600 hover:underline"
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
      )}

      {/* ---------------- MODAL ---------------- */}
      {showModal && selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-2xl relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
            >
              &times;
            </button>
            <h3 className="text-2xl font-bold text-center text-indigo-800 mb-4">
              Ghaat Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-2">
              {Object.entries(selected).map(([k, v]) => (
                <div key={k} className="border rounded-lg p-3 bg-gray-50">
                  <p className="text-xs font-semibold text-gray-500 uppercase">
                    {k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                  </p>
                  <p className="text-sm text-gray-800 mt-1 break-words">
                    {String(v) || "—"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}