// src/components/Ghaat.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaWater, FaPlusCircle, FaListAlt, FaCamera } from "react-icons/fa";

/* ------------ API CONFIG ------------ */
const BASE_URL = "http://localhost:8000/api";
const token    = localStorage.getItem("access_token");

const api = axios.create({
  baseURL : BASE_URL,
  headers : {
    "Content-Type" : "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  },
});

/* ------------ CONST ------------ */
const inputClass =
  "w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition";
const statusMap = {
  "0": "Operational",
  "1": "Not Operational",
  "2": "Under Maintenance",
  "3": "Closed",
};

/* ==================================== */
export default function Ghaat() {
  const [view, setView] = useState("register");
  const navigate        = useNavigate();

  /* ---------- local state ---------- */
  const [photoFile, photoFileSet] = useState(null);
  const [photoName, photoNameSet] = useState("");
  const [coords, coordsSet]       = useState({ lat: "", lon: "" });

  const [rivers,    riversSet]    = useState([]);
  const [districts, districtsSet] = useState([]);
  const [ghaats,    ghaatsSet]    = useState([]);

  const [formData, formSet] = useState({
    ghatName           : "",
    district           : "",
    riverName          : "",
    boatCapacity       : "",
    roadAccessibility  : "",
    availableFacilities: "",
    contactPerson      : "",
    contactNumber      : "",
    nearestHospital    : "",
    additionalInfo     : "",
  });
  const [errors, errorsSet] = useState({});

  /* ---------- fetch dropdown data ---------- */
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/river-list");
        riversSet(Array.isArray(data.data) ? data.data : []);
      } catch { riversSet([]); }

      try {
        const { data } = await api.get("/district-list");
        districtsSet(Array.isArray(data.data) ? data.data : []);
      } catch { districtsSet([]); }
    })();
  }, []);

  /* ---------- fetch directory ---------- */
  const fetchGhaatList = useCallback(async () => {
    try {
      const { data } = await api.get("/ghaat-list");
      const list = Array.isArray(data.data)
        ? data.data.map(d => ({
            id           : d.id,
            name         : d.ghaat_name,
            district     : d.district_record?.district_name || d.district_id,
            river        : d.river_record?.name           || d.river_id,
            boatsAssigned: `${d.registered_boats_count}/${d.boat_capacity}`,
            capacity     : d.boat_capacity,
            status       : statusMap[d.status] ?? "Operational",
            raw          : d,
          }))
        : [];
      ghaatsSet(list);
    } catch { ghaatsSet([]); }
  }, []);

  /* ---------- helpers ---------- */
  const handleChange  = e =>
    formSet(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleNumeric = key => e =>
    formSet(f => ({ ...f, [key]: e.target.value.replace(/\D/g,"").slice(0,10) }));

  const askLocation = () =>
    navigator.geolocation &&
    navigator.geolocation.getCurrentPosition(pos =>
      coordsSet({
        lat: pos.coords.latitude .toFixed(6),
        lon: pos.coords.longitude.toFixed(6),
      })
    );

  /* ---------- submit ---------- */
  const handleSubmit = async e => {
    e.preventDefault();
    errorsSet({});
    /* simple validation */
    const required = ["ghatName","district","riverName","boatCapacity",
                      "roadAccessibility","availableFacilities"];
    const miss = {};
    required.forEach(k => !formData[k] && (miss[k] = "Required"));
    if (formData.contactNumber && formData.contactNumber.length > 10)
      miss.contactNumber = "Max 10 digits";
    if (Object.keys(miss).length) return errorsSet(miss);

    const fd = new FormData();
    Object.entries({
      ghaat_name          : formData.ghatName,
      district_id         : formData.district,
      river_id            : formData.riverName,
      boat_capacity       : formData.boatCapacity,
      road_accessibility  : formData.roadAccessibility,
      available_facilities: formData.availableFacilities,
      contact_person      : formData.contactPerson,
      contact_number      : formData.contactNumber,
      nearest_hospital    : formData.nearestHospital,
      additional_info     : formData.additionalInfo,
      latitude            : coords.lat,
      longitude           : coords.lon,
    }).forEach(([k,v]) => fd.append(k,v));
    if (photoFile) fd.append("photo_path", photoFile);

    try {
      await api.post("/register-ghaat", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Ghaat registered!");
      /* reset + refresh */
      formSet({
        ghatName:"",district:"",riverName:"",boatCapacity:"",roadAccessibility:"",
        availableFacilities:"",contactPerson:"",contactNumber:"",
        nearestHospital:"",additionalInfo:"",
      });
      photoFileSet(null); photoNameSet(""); coordsSet({ lat:"", lon:"" });
      setView("directory");
      fetchGhaatList();
    } catch (err) {
      const v = err.response?.data;
      if (v?.data && typeof v.data === "object") errorsSet(v.data);
      else alert("Registration failed");
    }
  };

  /* =============== JSX =============== */
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-white px-4 sm:px-12 py-10">
      {/* ---------- Header ---------- */}
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

      {/* ---------- Tabs ---------- */}
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
          onClick={() => { setView("directory"); fetchGhaatList(); }}
          className={`flex items-center gap-2 px-6 py-2 rounded-full font-semibold transition ${
            view === "directory"
              ? "bg-sky-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200 shadow"
          }`}
        >
          <FaListAlt /> Ghaat Directory
        </button>
      </div>

      {/* ============ REGISTER FORM ============ */}
      {view === "register" && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-md p-8 max-w-6xl mx-auto border grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* --- Photo / GPS Block --- */}
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
              {/* Choose Photo */}
              <label htmlFor="ghaat-photo" className="w-full sm:w-auto">
                <span className="block text-center cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-full font-medium">
                  Choose Photo
                </span>
              </label>

              {/* Open Camera */}
              <span
                className="block w-full sm:w-auto text-center cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-full font-medium"
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
              onChange={e => {
                const f = e.target.files[0];
                if (f && /image\/(jpeg|png)/.test(f.type)) {
                  photoFileSet(f); photoNameSet(f.name); askLocation();
                } else alert("Only JPEG/PNG allowed");
              }}
            />
            <input
              id="ghaat-camera"
              type="file"
              accept="image/jpeg, image/png"
              capture="camera"
              className="hidden"
              onChange={e => {
                const f = e.target.files[0];
                if (f && /image\/(jpeg|png)/.test(f.type)) {
                  photoFileSet(f); photoNameSet(f.name);
                } else alert("Only JPEG/PNG allowed");
              }}
            />
          </div>

          {/* ----------- Text Inputs ----------- */}
          <Input label="Ghaat Name *"        name="ghatName"         value={formData.ghatName}         onChange={handleChange}        err={errors.ghatName} />
          <Select label="District *"         name="district"         value={formData.district}         onChange={handleChange}        err={errors.district}        options={districts.map(d=>({value:d.id,label:d.district_name}))} />
          <Select label="River *"            name="riverName"        value={formData.riverName}        onChange={handleChange}        err={errors.riverName}       options={rivers   .map(r=>({value:r.id,label:r.name}))} />
          <Input label="Boat Capacity *"     name="boatCapacity"     value={formData.boatCapacity}     onChange={handleNumeric("boatCapacity")} err={errors.boatCapacity}     type="number" inputMode="numeric" />
          <Input label="Road Accessibility *"name="roadAccessibility"value={formData.roadAccessibility}onChange={handleChange}        err={errors.roadAccessibility}/>
          <Input label="Available Facilities *" name="availableFacilities" value={formData.availableFacilities} onChange={handleChange} err={errors.availableFacilities}/>
          <Input label="Contact Person"      name="contactPerson"    value={formData.contactPerson}    onChange={handleChange}        err={errors.contactPerson}/>
          <Input label="Contact Number"      name="contactNumber"    value={formData.contactNumber}    onChange={handleNumeric("contactNumber")} err={errors.contactNumber} inputMode="numeric" />
          <Input label="Nearest Hospital"    name="nearestHospital"  value={formData.nearestHospital}  onChange={handleChange}        err={errors.nearestHospital}  className="md:col-span-2"/>
          
          {/* Additional Info textarea */}
          <div className="md:col-span-3">
            <label className="block text-sm font-medium mb-1">
              Additional Info
            </label>
            <textarea
              name="additionalInfo"
              rows={3}
              value={formData.additionalInfo}
              onChange={handleChange}
              placeholder="Any other details"
              className={inputClass}
            />
            {errors.additionalInfo && (
              <p className="text-red-500 text-sm mt-1">
                {errors.additionalInfo}
              </p>
            )}
          </div>

          {/* Submit */}
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

      {/* ============ DIRECTORY ============ */}
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
                  {ghaats.map(g => (
                    <tr key={g.id} className="hover:bg-gray-50">
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
                          onClick={() =>
                            navigate(`/dashboard/ghaats/ghaatdetails/${g.id}`, {
                              state: g.raw,
                            })
                          }
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
    </div>
  );
}

/* ---------- Tiny reusable input/select ---------- */
const Input = ({ label, err, className="", ...rest }) => (
  <div className={className}>
    <label className="block text-sm font-medium mb-1">{label}</label>
    <input {...rest} className={inputClass} />
    {err && <p className="text-red-500 text-sm mt-1">{err}</p>}
  </div>
);

const Select = ({ label, options, err, ...rest }) => (
  <div>
    <label className="block text-sm font-medium mb-1">{label}</label>
    <select {...rest} className={inputClass}>
      <option value="">Select</option>
      {options.map(o =>
        typeof o === "string"
          ? <option key={o}>{o}</option>
          : <option key={o.value} value={o.value}>{o.label}</option>
      )}
    </select>
    {err && <p className="text-red-500 text-sm mt-1">{err}</p>}
  </div>
);