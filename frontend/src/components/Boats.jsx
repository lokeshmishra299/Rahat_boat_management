// src/pages/Boats.jsx
import React, { useState } from "react";
import { FaShip, FaListAlt, FaPlusCircle, FaCamera } from "react-icons/fa";

/* ───── Uttar Pradesh: all 75 districts ───── */
const upDistricts = [
  "Agra","Aligarh","Ambedkar Nagar","Auraiya","Azamgarh","Baghpat","Bahraich",
  "Balarampur","Banda","Barabanki","Ballia","Bareilly","Basti","Bijnor","Budaun",
  "Bulandshahr","Chandauli","Chitrakoot","Deoria","Etah","Etawah","Farrukhabad",
  "Fatehpur","Firozabad","Gautam Buddh Nagar","Ghaziabad","Ghazipur","Gonda",
  "Gorakhpur","Hamirpur","Hapur","Hardoi","Hathras","Jalaun","Jaunpur","Jhansi",
  "Kannauj","Kanpur Dehat","Kanpur Nagar","Kushinagar","Lakhimpur Kheri","Lalitpur",
  "Lucknow","Maharajganj","Mahoba","Mainpuri","Mathura","Mau","Meerut","Mirzapur",
  "Moradabad","Muzaffarnagar","Pilibhit","Pratapgarh","Prayagraj","Rae Bareli",
  "Rampur","Saharanpur","Sant Kabir Nagar","Shahjahanpur","Shamli","Shrawasti",
  "Sidharthnagar","Sitapur","Sonebhadra","Sultanpur","Unnao","Varanasi"
];

const Boats = () => {
  /* which panel is open? 'register' | 'directory' */
  const [view, setView] = useState("register");          // default: register form
  const [photoName, setPhotoName] = useState("");

  /* demo directory — replace with API call later */
  const [boats, setBoats] = useState([
    {
      regNumber: "UP-VAR-001",
      pilotName: "Ram Kumar",
      type: "Engine Driven",
      district: "Varanasi",
      ghat: "Dashashwamedh Ghat",
      status: "Active"
    }
  ]);

  /* form state */
  const [formData, setFormData] = useState({
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
  });

  /* helpers */
  const inputClass =
    "w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500";

  const handleChange = (e) =>
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();

    /* simple required‑field check */
    const required = ["regNumber", "district", "type", "pilotName", "ghat", "authority"];
    if (required.some((f) => !formData[f])) {
      alert("Please fill all required fields!");
      return;
    }

    setBoats((prev) => [
      ...prev,
      { ...formData, status: "Active" }            // default status
    ]);

    alert("Boat Registered Successfully!");

    /* reset form */
    setFormData({
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
    });
    setPhotoName("");
    setView("directory");
  };

  /* ─── UI ─────────────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-white px-4 sm:px-10 py-10">
      {/* header */}
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

      {/* tabs */}
      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-10">
        <button
          onClick={() => setView("register")}
          className={`flex items-center gap-2 px-6 py-2 rounded-full font-semibold transition ${
            view === "register"
              ? "bg-green-600 text-white"
              : "bg-white text-green-700 hover:bg-green-50 shadow"
          }`}
        >
          <FaPlusCircle /> Register New Boat
        </button>

        <button
          onClick={() => setView("directory")}
          className={`flex items-center gap-2 px-6 py-2 rounded-full font-semibold transition ${
            view === "directory"
              ? "bg-sky-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200 shadow"
          }`}
        >
          <FaListAlt /> Boat Directory
        </button>
      </div>

      {view === "register" ? (
        /* ─── Register Form ─── */
        <div className="bg-white rounded-xl shadow-md p-8 max-w-6xl mx-auto border">
          {/* photo upload */}
          <div className="bg-green-50 border border-dashed border-green-300 rounded-lg p-6 text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-white rounded-full p-3 shadow inline-flex">
                <FaCamera className="text-green-500 text-xl" />
              </div>
            </div>
            <p className="text-green-800 font-semibold mb-1">
              Upload Boat Geotagged Photo
            </p>
            <p className="text-gray-600 text-sm mb-4">
              Capture or upload a photo where the registration number is visible
              &amp; GPS coordinates are embedded.
            </p>

            <input
              id="boat-photo"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) =>
                e.target.files[0] && setPhotoName(e.target.files[0].name)
              }
            />
            <label htmlFor="boat-photo">
              <span className="cursor-pointer bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full font-medium transition inline-block">
                Choose Photo
              </span>
            </label>
            {photoName && (
              <p className="text-sm text-green-700 mt-2">Uploaded: {photoName}</p>
            )}
          </div>

          {/* actual form */}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Registration Number */}
            <div>
              <label className="text-sm font-medium mb-1">
                Registration Number <span className="text-red-500">*</span>
              </label>
              <input
                name="regNumber"
                value={formData.regNumber}
                onChange={handleChange}
                placeholder="UP-XXX-000"
                className={inputClass}
              />
            </div>

            {/* District */}
            <div>
              <label className="text-sm font-medium mb-1">
                District <span className="text-red-500">*</span>
              </label>
              <select
                name="district"
                value={formData.district}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">Select District</option>
                {upDistricts.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Boat Type */}
            <div>
              <label className="text-sm font-medium mb-1">
                Boat Type <span className="text-red-500">*</span>
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">Select Type</option>
                <option>Hybrid</option>
                <option>Engine Driven</option>
                <option>Manual (Paddle/Oar)</option>
              </select>
            </div>

            {/* Pilot Name */}
            <div>
              <label className="text-sm font-medium mb-1">
                Pilot Name <span className="text-red-500">*</span>
              </label>
              <input
                name="pilotName"
                value={formData.pilotName}
                onChange={handleChange}
                placeholder="Enter pilot’s full name"
                className={inputClass}
              />
            </div>

            {/* Pilot License */}
            <div>
              <label className="text-sm font-medium mb-1">
                Pilot License Number
              </label>
              <input
                name="license"
                value={formData.license}
                onChange={handleChange}
                placeholder="License number"
                className={inputClass}
              />
            </div>

            {/* Support Staff */}
            <div>
              <label className="text-sm font-medium mb-1">
                Support Staff Count <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="staffCount"
                value={formData.staffCount}
                onChange={handleChange}
                placeholder="Enter staff count"
                className={inputClass}
              />
            </div>

            {/* Engine */}
            <div>
              <label className="text-sm font-medium mb-1">Engine Details</label>
              <input
                name="engine"
                value={formData.engine}
                onChange={handleChange}
                placeholder="e.g., 40 HP Yamaha"
                className={inputClass}
              />
            </div>

            {/* Capacity */}
            <div>
              <label className="text-sm font-medium mb-1">Passenger Capacity</label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                placeholder="Maximum passengers"
                className={inputClass}
              />
            </div>

            {/* Year */}
            <div>
              <label className="text-sm font-medium mb-1">Year of Manufacture</label>
              <input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleChange}
                placeholder="YYYY"
                min="1950"
                max={new Date().getFullYear()}
                className={inputClass}
              />
            </div>

            {/* Ghat */}
            <div>
              <label className="text-sm font-medium mb-1">
                Assigned Ghaat <span className="text-red-500">*</span>
              </label>
              <input
                name="ghat"
                value={formData.ghat}
                onChange={handleChange}
                placeholder="Enter ghat name"
                className={inputClass}
              />
            </div>

            {/* Authority */}
            <div>
              <label className="text-sm font-medium mb-1">
                Registration Authority <span className="text-red-500">*</span>
              </label>
              <select
                name="authority"
                value={formData.authority}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">Select Authority</option>
                <option>District Collector</option>
                <option>Sub‑Divisional Magistrate</option>
                <option>Circle Officer</option>
                <option>Block Development Officer</option>
              </select>
            </div>

            {/* Remarks */}
            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-1">Additional Remarks</label>
              <textarea
                name="additionalInfo"
                value={formData.additionalInfo}
                onChange={handleChange}
                rows="3"
                placeholder="Any additional information about the boat"
                className={inputClass}
              />
            </div>

            {/* submit */}
            <div className="md:col-span-2 text-center mt-4">
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white font-semibold px-10 py-2 rounded-full transition"
              >
                Register Boat
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* ─── Directory ─── */
        <div className="bg-white rounded-xl shadow-md p-8 max-w-6xl mx-auto border">
          <h3 className="text-2xl font-bold text-center text-sky-700 mb-4">
            Registered Boats
          </h3>
          <p className="text-gray-600 text-center mb-6">
            Complete fleet directory with real‑time status and operational details
          </p>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr className="text-left text-sm font-semibold text-gray-700">
                  <th className="px-4 py-3">Reg. No.</th>
                  <th className="px-4 py-3">Pilot</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">District</th>
                  <th className="px-4 py-3">Ghat</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {boats.map((b) => (
                  <tr key={b.regNumber} className="text-sm">
                    <td className="px-4 py-2 font-semibold">{b.regNumber}</td>
                    <td className="px-4 py-2">{b.pilotName}</td>
                    <td className="px-4 py-2">{b.type}</td>
                    <td className="px-4 py-2">{b.district}</td>
                    <td className="px-4 py-2">{b.ghat}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          b.status === "Active"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Boats;
