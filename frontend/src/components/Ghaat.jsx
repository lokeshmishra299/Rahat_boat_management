import React, { useState } from "react";
import { FaWater, FaListAlt, FaPlusCircle, FaCamera } from "react-icons/fa";

/* ─────────────────────────── demo rows; replace with real API later ─────────────────────────── */
const demoGhaats = [
  {
    name: "Dashashwamedh Ghaat",
    district: "Varanasi",
    river: "Ganga",
    boatsAssigned: "5/10",
    capacity: 10,
    status: "Operational",
  },
  {
    name: "Gomti Ghaat",
    district: "Lucknow",
    river: "Gomti",
    boatsAssigned: "3/8",
    capacity: 8,
    status: "Operational",
  },
];

const upDistricts = [
  "Agra",
  "Aligarh",
  "Ambedkar Nagar",
  "Auraiya",
  "Azamgarh",
  "Baghpat",
  "Bahraich",
  "Balarampur",
  "Banda",
  "Barabanki",
  "Ballia",
  "Bareilly",
  "Basti",
  "Bijnor",
  "Budaun",
  "Bulandshahr",
  "Chandauli",
  "Chitrakoot",
  "Deoria",
  "Etah",
  "Etawah",
  "Farrukhabad",
  "Fatehpur",
  "Firozabad",
  "Gautam Buddh Nagar",
  "Ghaziabad",
  "Ghazipur",
  "Gonda",
  "Gorakhpur",
  "Hamirpur",
  "Hapur",
  "Hardoi",
  "Hathras",
  "Jalaun",
  "Jaunpur",
  "Jhansi",
  "Kannauj",
  "Kanpur Dehat",
  "Kanpur Nagar",
  "Kushinagar",
  "Lakhimpur Kheri",
  "Lalitpur",
  "Lucknow",
  "Maharajganj",
  "Mahoba",
  "Mainpuri",
  "Mathura",
  "Mau",
  "Meerut",
  "Mirzapur",
  "Moradabad",
  "Muzaffarnagar",
  "Pilibhit",
  "Pratapgarh",
  "Prayagraj",
  "Rae Bareli",
  "Rampur",
  "Saharanpur",
  "Sant Kabir Nagar",
  "Shahjahanpur",
  "Shamli",
  "Shrawasti",
  "Sidharthnagar",
  "Sitapur",
  "Sonebhadra",
  "Sultanpur",
  "Unnao",
  "Varanasi",
];

const inputClass =
  "w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition";

export default function Ghaat() {
  /* register ⬌ directory */
  const [view, setView] = useState("register");
  const [photoName, setPhotoName] = useState("");
  const [ghaats, setGhaats] = useState(demoGhaats);

  /* form state */
  const [formData, setFormData] = useState({
    ghatName: "",
    district: "",
    riverName: "",
    boatCapacity: "",
    roadAccessibility: "",
    contactPerson: "",
    contactNumber: "",
    nearestHospital: "",
    availableFacilities: "",
  });

  const handleChange = (e) =>
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const required = [
      "ghatName",
      "district",
      "riverName",
      "boatCapacity",
      "roadAccessibility",
    ];
    if (required.some((f) => !formData[f])) {
      alert("Please fill all required fields!");
      return;
    }
    setGhaats((prev) => [
      ...prev,
      {
        name: formData.ghatName,
        district: formData.district,
        river: formData.riverName,
        boatsAssigned: "0/" + formData.boatCapacity,
        capacity: formData.boatCapacity,
        status: "Operational",
      },
    ]);
    alert("Ghaat Registered Successfully!");
    setFormData({
      ghatName: "",
      district: "",
      riverName: "",
      boatCapacity: "",
      roadAccessibility: "",
      contactPerson: "",
      contactNumber: "",
      nearestHospital: "",
      availableFacilities: "",
    });
    setPhotoName("");
    setView("directory");
  };

  /* ─────────────────────────────── UI ─────────────────────────────── */
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
          Register and manage important riverbank Ghaats used for ferry,
          worship, or rescue operations
        </p>
      </div>

      {/* tab buttons */}
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
          onClick={() => setView("directory")}
          className={`flex items-center gap-2 px-6 py-2 rounded-full font-semibold transition ${
            view === "directory"
              ? "bg-sky-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200 shadow"
          }`}
        >
          <FaListAlt /> Ghaat Directory
        </button>
      </div>

      {view === "register" ? (
        /* ---------------- Register form ---------------- */
        <div className="bg-white rounded-xl shadow-md p-8 max-w-6xl mx-auto border">
          <div className="flex justify-center mb-4">
            <div className="bg-indigo-100 rounded-full p-4">
              <FaWater className="text-indigo-600 text-3xl" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-center text-indigo-700 mb-4">
            Register New River Port
          </h3>
          <p className="text-gray-600 text-center max-w-2xl mx-auto mb-6">
            Document and register a new ghaat with precise location data and
            visual proof
          </p>

          {/* photo upload */}
          <div className="bg-indigo-50 border border-dashed border-indigo-300 rounded-lg p-6 text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-white rounded-full p-3 shadow inline-flex">
                <FaCamera className="text-indigo-500 text-xl" />
              </div>
            </div>
            <p className="text-indigo-800 font-semibold mb-1">
              Upload Ghaat Geotagged Photo
            </p>
            <p className="text-gray-600 text-sm mb-4">
              Capture or upload a photo with <strong>GPS coordinates</strong>.
            </p>

            <input
              id="ghaat-photo"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) =>
                e.target.files[0] && setPhotoName(e.target.files[0].name)
              }
            />
            <label htmlFor="ghaat-photo">
              <span className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-full font-medium transition inline-block">
                Choose Photo
              </span>
            </label>
            {photoName && (
              <p className="text-sm text-indigo-700 mt-2">
                Uploaded: {photoName}
              </p>
            )}
          </div>

          {/* actual form */}
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <div>
              <label className="block text-sm font-medium mb-1">
                Ghaat Name *
              </label>
              <input
                name="ghatName"
                value={formData.ghatName}
                onChange={handleChange}
                placeholder="Enter ghaat name"
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                District *
              </label>
              <select
                name="district"
                value={formData.district}
                onChange={handleChange}
                className={inputClass}
                required
              >
                <option value="">Select District</option>

                {/* render every district dynamically */}
                {upDistricts.map((dist) => (
                  <option key={dist} value={dist}>
                    {dist}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                River Name *
              </label>
              <select
                name="riverName"
                value={formData.riverName}
                onChange={handleChange}
                className={inputClass}
                required
              >
                <option value="">Select River</option>
                <option>Ganga</option>
                <option>Yamuna</option>
                <option>Gomti</option>
                <option>Ghaghra</option>
                <option>Rapit</option>
                <option>Sarda</option>
                <option>Kali</option>
                <option>Ramganga</option>
                <option>Betwa</option>
                <option>Ken</option>
                <option>Chamble</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Boat Capacity *
              </label>
              <input
                type="number"
                name="boatCapacity"
                value={formData.boatCapacity}
                onChange={handleChange}
                placeholder="Maximum boat "
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Road Accessibility *
              </label>
              <select
                name="roadAccessibility"
                value={formData.roadAccessibility}
                onChange={handleChange}
                className={inputClass}
                required
              >
                <option value="">Select Accessibility</option>
                <option>Excellent(paved Road)</option>
                <option>Good(metalled Road)</option>
                <option>Fair(Gravel Road)</option>
                <option>Poor(Kutcha Road)</option>
             
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Contact Person
              </label>
              <input
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleChange}
                placeholder="Name of local contact"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Contact Number
              </label>
              <input
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                placeholder="Mobile number"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Nearest Hospital
              </label>
              <input
                name="nearestHospital"
                value={formData.nearestHospital}
                onChange={handleChange}
                placeholder="Hospital name and distance"
                className={inputClass}
              />
            </div>
            <div className="md:col-span-3">
              <label className="block text-sm font-medium mb-1">
                Available Facilities *
              </label>
              <textarea
                name="availableFacilities"
                value={formData.availableFacilities}
                onChange={handleChange}
                placeholder="e.g., Boat Parking, First Aid Station, Communication Tower, Storage"
                className={inputClass + " resize-none h-24"}
                required
              />
            </div>
            <div className="md:col-span-3 flex justify-center mt-4">
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-2 rounded-full transition"
              >
                Submit Ghaat Details
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* ---------------- Directory table ---------------- */
        <div className="bg-white rounded-xl shadow-md p-8 max-w-6xl mx-auto border">
          <h3 className="text-2xl font-bold text-center text-blue-800 mb-4">
            Registered Ghaats
          </h3>
          <p className="text-gray-600 text-center mb-6">
            Complete directory of all registered river ports with real‑time
            status
          </p>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm text-left">
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
                {ghaats.map((g, i) => (
                  <tr key={i}>
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
                      <button className="text-indigo-600 border border-indigo-600 px-3 py-1 rounded-full text-xs hover:bg-indigo-50">
                        View Details
                      </button>
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
}
