// src/pages/Boats.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaShip, FaEdit, FaEye, FaListAlt, FaPlusCircle, FaCamera } from "react-icons/fa";
import Webcam from "react-webcam";
import { Toaster, toast } from 'react-hot-toast';
import { useSearchParams } from "react-router-dom";
import { FaDownload } from "react-icons/fa";



const BASE_URL = import.meta.env.VITE_API_BASE ?? "http://localhost:8000/api";

const token = localStorage.getItem("access_token");

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  },
});

const Boats = () => {
  const navigate = useNavigate();
  const [vieww, setVieww] = useState("register");

  // Webcam and geolocation states
  const webcamRef = useRef(null);
  const [showCamera, setShowCamera] = useState(false);
  const [coords, setCoords] = useState({ lat: "", lon: "" });
  const [pincode, setPincode] = useState("");
  const [locationName, setLocationName] = useState("");

  // Districts
  const [districts, setDistricts] = useState([]);
  const [loadingDistricts, setLoadingDistricts] = useState(true);
  const [districtError, setDistrictError] = useState("");

  // Ghaats
  const [ghaats, setGhaats] = useState([]);
  const [loadingGhaats, setLoadingGhaats] = useState(true);
  const [ghaatError, setGhaatError] = useState("");

  // Boats
  const [boats, setBoats] = useState([]);
  const [loadingBoats, setLoadingBoats] = useState(true);
  const [boatsError, setBoatsError] = useState("");

  // Form
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
    additionalInfo: "",
  };
  const [form, setForm] = useState(emptyForm);
  const [photoName, setPhotoName] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const inputClass = "w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500";

  const field = (k) => (e) => {
    const value = e.target.value;

    if (k === "pilotName" && /[^a-zA-Z\s]/.test(value)) return;

    setForm((f) => ({ ...f, [k]: value }));
  };

  const fieldNum = (k) => (e) =>
    setForm((f) => ({
      ...f,
      [k]: e.target.value === "" ? "" : Math.max(0, parseInt(e.target.value, 10)),
    }));

  // Webcam capture function
  const captureFromWebcam = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    const byteString = atob(imageSrc.split(",")[1]);
    const mimeString = imageSrc.split(",")[0].split(":")[1].split(";")[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: mimeString });
    const file = new File([blob], "captured.jpg", { type: mimeString });

    setPhotoFile(file);
    setPhotoName("captured.jpg");
    setShowCamera(false);

    navigator.geolocation.getCurrentPosition(async (pos) => {
      const lat = pos.coords.latitude.toFixed(6);
      const lon = pos.coords.longitude.toFixed(6);
      setCoords({ lat, lon });

      const pin = await getPincode(lat, lon);
      setPincode(pin);

      if (pin) {
        const loc = await getLocationFromPincode(pin);
        setLocationName(loc);
      }
    });
  };

  // Helper functions for geolocation
  async function getPincode(lat, lon) {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
      const data = await res.json();
      return data.address.postcode || "";
    } catch {
      return "";
    }
  }

  async function getLocationFromPincode(pincode) {
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      const data = await res.json();
      if (data[0].Status === "Success" && data[0].PostOffice?.length > 0) {
        return `${data[0].PostOffice[0].Name}, ${data[0].PostOffice[0].District}`;
      }
      return "N/A";
    } catch {
      return "N/A";
    }
  }

  // Load districts
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

  // Load ghaats
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/ghaat-list");
        setGhaats(Array.isArray(res.data.data) ? res.data.data : []);
      } catch {
        setGhaatError("Could not load ghaat list.");
      } finally {
        setLoadingGhaats(false);
      }
    })();
  }, []);

  // Load boats
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

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSaving(true);

    const fd = new FormData();
    fd.append("registration_no", form.regNumber);
    fd.append("district_id", form.district);
    fd.append("boat_type", form.type);
    fd.append("pilot_name", form.pilotName);
    fd.append("pilot_license_no", form.license);
    fd.append("support_staff", form.staffCount);
    fd.append("engine_details", form.engine);
    fd.append("passenger_capacity", form.capacity);
    fd.append("year_of_manufacture", form.year);
    fd.append("ghaat_id", form.ghat);
    fd.append("registration_authority", form.authority);
    fd.append("remarks", form.additionalInfo);
    fd.append("latitude", coords.lat);
    fd.append("longitude", coords.lon);
    fd.append("pincode", pincode);
    fd.append("location", locationName);
    if (photoFile) fd.append("image", photoFile);

    try {
      const { data } = await axios.post(`${BASE_URL}/boats`, fd, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success(data.message || "Boat registered successfully!");
      await loadBoats();
      setForm(emptyForm);
      setPhotoName("");
      setPhotoFile(null);
      setCoords({ lat: "", lon: "" });
      setPincode("");
      setTimeout(() => setView("directory"), 1000);
    } catch (err) {
      const v = err.response?.data;
      if (v?.data && typeof v.data === "object") setErrors(v.data);
      // toast.error("Please check the form fields and try again.");
    } finally {
      setSaving(false);
    }
  };

  const [searchParams] = useSearchParams();
const initialView = searchParams.get("tab") === "directory" ? "directory" : "register";
const [view, setView] = useState(initialView); // ✅ yahi sahi hai

// optional, url se live update:
useEffect(() => {
  const tab = searchParams.get("tab");
  setView(tab === "directory" ? "directory" : "register");
}, [searchParams]);


//   const [view, setView] = useState("register");
// const [searchParams] = useSearchParams();

// useEffect(() => {
//   const tab = searchParams.get("tab");
//   if (tab === "directory") {
//     setView("directory");
//     loadBoats(); // call only if you have this function
//   }
// }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-white px-4 sm:px-10 py-10">
      <Toaster position="top-right" reverseOrder={false} />
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center bg-green-100 rounded-full p-3 shadow">
          <FaShip className="text-green-600 text-2xl" />
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-green-800 mt-4">
          Boat Management
        </h2>
        <p className="text-gray-600 mt-2 max-w-xl mx-auto">
          Register and track rescue boats with comprehensive documentation
        </p>
      </div>


      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-10">
        <button
          onClick={() => setView("register")}
          className={`flex items-center gap-2 px-6 py-2 rounded-full font-semibold transition ${view === "register"
            ? "bg-green-600 text-white"
            : "bg-white text-green-700 hover:bg-green-50 shadow"
            }`}
        >
          <FaPlusCircle /> Register New Boat
        </button>
        <button
          onClick={() => {
            setView("directory");
            loadBoats();
          }}
          className={`flex items-center gap-2 px-6 py-2 rounded-full font-semibold transition ${view === "directory"
            ? "bg-sky-600 text-white"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200 shadow"
            }`}
        >
          <FaListAlt /> Boat Directory
        </button>
      </div>

      

      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-50 p-4">
          <Webcam
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            className="rounded-lg shadow-lg max-w-full w-96"
            videoConstraints={{ facingMode: "environment" }}
          />
          <button
            onClick={captureFromWebcam}
            className="mt-4 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full"
          >
            Capture
          </button>
          <button
            onClick={() => setShowCamera(false)}
            className="mt-2 text-sm text-white underline"
          >
            Cancel
          </button>
        </div>
      )}

      {view === "register" ? (
        <div className="bg-white rounded-xl shadow-md p-8 max-w-6xl mx-auto border">
          {/* Photo Upload Section */}
          <div className="bg-green-50 border border-dashed border-green-300 rounded-lg p-6 text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-white rounded-full p-3 shadow inline-flex">
                <FaCamera className="text-green-500 text-xl" />
              </div>
            </div>
            <p className="text-green-800 font-semibold mb-1">
              Upload Boat Photo (Geo-Tag)
            </p>
            <p className="text-gray-600 text-sm mb-4">
              Capture or upload a photo with GPS coordinates
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={() => setShowCamera(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full font-medium transition"
              >
                <FaCamera className="inline mr-2" /> Capture Photo
              </button>

              <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-medium transition inline-block text-center">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setPhotoName(file.name);
                      setPhotoFile(file);
                    }
                  }}
                />
                Choose Photo
              </label>
            </div>

            {photoName && (
              <p className="text-sm text-green-700 mt-2">Selected: {photoName}</p>
            )}
          </div>

          {/* Location Info */}
          {(coords.lat || coords.lon) && (
            <div className="mb-6 p-3 bg-blue-50 rounded-lg text-center">
              <p className="font-medium text-blue-800">
                Location: {coords.lat}, {coords.lon} | Pincode: {pincode} | {locationName}
              </p>
            </div>
          )}

          {/* Photo Preview */}
          {photoFile && (
            <div className="mb-6 text-center">
              <img
                src={URL.createObjectURL(photoFile)}
                alt="Preview"
                className="rounded shadow max-w-xs mx-auto"
              />
            </div>
          )}

          {/* Boat Registration Form */}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Registration Number *"
              name="regNumber"
              value={form.regNumber}
              onChange={field("regNumber")}
              error={errors.registration_no}
              placeholder="Enter Registration Number"
            />

            <div>
              <label className="text-sm font-medium mb-1">District *</label>
              <select
                name="district"
                value={form.district}
                onChange={field("district")}
                error={errors.district_id}
                className={inputClass}
              >
                {loadingDistricts ? (
                  <option>Loading...</option>
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
              {errors.district_id && (
                <p className="text-red-500 text-sm mt-1">{errors.district_id}</p>
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
              placeholder="Enter Pilot Name"
            />

            <Input
              label="Pilot License Number *"
              name="license"
              value={form.license}
              onChange={field("license")}
              error={errors.pilot_license_no}
              placeholder="Enter License Number"
            />

            <Input
              label="Support Staff Count *"
              name="staffCount"
              type="number"
              min="0"
              value={form.staffCount}
              onChange={fieldNum("staffCount")}
              error={errors.support_staff}
              placeholder="Enter Staff Count"
            />

            <Input
              label="Engine Details"
              name="engine"
              value={form.engine}
              onChange={field("engine")}
              // error={errors.engine_details}
              placeholder="Enter Engine Details"
            />

            <Input
              label="Passenger Capacity *"
              name="capacity"
              type="number"
              min="0"
              value={form.capacity}
              onChange={fieldNum("capacity")}
              error={errors.passenger_capacity}
              placeholder="Enter Capacity"
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
              placeholder="Enter Year"
            />

            <div>
              <label className="text-sm font-medium mb-1">Ghat *</label>
              <select
                name="ghat"
                value={form.ghat}
                onChange={field("ghat")}
                className={inputClass}
                disabled={!form.district}
              >
                {!form.district ? (
                  <option>Select district first</option>
                ) : loadingGhaats ? (
                  <option>Loading...</option>
                ) : ghaatError ? (
                  <option>{ghaatError}</option>
                ) : (
                  <>
                    <option value="">Select Ghat</option>
                    {ghaats
                      .filter((g) => g.district_id == form.district)
                      .map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.ghaat_name}
                        </option>
                      ))}
                  </>
                )}
              </select>
              {errors.ghaat_id && (
                <p className="text-red-500 text-sm mt-1">{errors.ghaat_id}</p>
              )}
            </div>

            <Select
              label="Registration Authority *"
              name="authority"
              value={form.authority}
              onChange={field("authority")}
              options={[
                "District Collector",
                "Sub-Divisional Magistrate",
                "Circle Officer",
                "Block Development Officer",
              ]}
              error={errors.registration_authority}
            />

            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-1">Additional Remarks</label>
              <textarea
                name="additionalInfo"
                value={form.additionalInfo}
                onChange={field("additionalInfo")}
                rows="3"
                placeholder="Any additional information"
                className={inputClass}
              />
              {errors.remarks && (
                <p className="text-red-500 text-sm mt-1">{errors.remarks}</p>
              )}
            </div>

            <div className="md:col-span-2 text-center mt-4">
              <button
                type="submit"
                disabled={saving}
                className={`bg-green-600 hover:bg-green-700 text-white font-semibold px-10 py-2 rounded-full transition ${saving ? "opacity-50 cursor-not-allowed" : ""
                  }`}
              >
                {saving ? "Saving..." : "Register Boat"}
              </button>
            </div>
          </form>
        </div>
      ) : (
<div className="bg-white rounded-xl shadow-md p-8 max-w-6xl mx-auto border relative">
  <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
    <h3 className="text-xl sm:text-2xl font-bold text-sky-700 text-center sm:text-left">
      Registered Boats
    </h3>
    <button 
      className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-3 py-1 sm:px-4 sm:py-2 rounded-md transition-colors w-full sm:w-auto justify-center"
      onClick={() => {
        // CSV Export Functionality
        const headers = [
          "Sr.No",
          "Registration No",
          "Pilot",
          "Boat Type",
          "District",
          "Status"
        ];

        const rows = boats.map((boat, index) => [
          index + 1,
          `"${boat.registration_no}"`,
          `"${boat.pilot_name}"`,
          `"${boat.boat_type}"`,
          `"${boat.district?.district_name || 'N/A'}"`,
          `"${boat.status || 'Active'}"`
        ]);

        const csvContent = [
          headers.join(","),
          ...rows.map(row => row.join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `boat_report_${new Date().toISOString().slice(0,10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }}
    >
      <FaDownload className="text-sm sm:text-base" /> 
      <span className="text-sm sm:text-base">Export Report</span>
    </button>
  </div>

  {loadingBoats ? (
    <p className="text-center text-gray-500">Loading...</p>
  ) : boatsError ? (
    <p className="text-center text-red-500">{boatsError}</p>
  ) : boats.length === 0 ? (
    <p className="text-center text-gray-500">No boats registered yet</p>
  ) : (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr className="text-left font-semibold text-gray-700">
            <th className="px-4 py-3">Sr.No</th>
            <th className="px-4 py-3">Reg. No.</th>
            <th className="px-4 py-3">Pilot</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">District</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {boats.map((boat, idx) => (
            <tr key={boat.id} className="hover:bg-gray-50">
              <td className="px-4 py-2">{idx + 1}</td>
              <td className="px-4 py-2 font-semibold">
                {boat.registration_no}
              </td>
              <td className="px-4 py-2">{boat.pilot_name}</td>
              <td className="px-4 py-2">{boat.boat_type}</td>
              <td className="px-4 py-2">
                {boat.district?.district_name || "—"}
              </td>
              <td className="px-4 py-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    boat.status === "Active"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {boat.status || "Active"}
                </span>
              </td>
              <td className="px-4 py-2 flex gap-3">
                <button
                  onClick={() =>
                    navigate(`/dashboard/boats/boatdetailsone/${boat.id}`, {
                      state: { ...boat, readOnly: true },
                    })
                  }
                  className="text-sky-600 hover:text-sky-800"
                  title="View"
                >
                  <FaEye className="text-lg" />
                </button>
                <button
                  onClick={() =>
                    navigate(`/dashboard/boats/boatdetails/${boat.id}`, {
                      state: boat,
                    })
                  }
                  className="text-green-600 hover:text-green-800"
                  title="Edit"
                >
                  <FaEdit className="text-lg" />
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
};

// Reusable components
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
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
);

export default Boats;