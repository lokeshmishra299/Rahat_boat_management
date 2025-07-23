// src/components/Ghaat.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaWater, FaPlusCircle, FaListAlt, FaCamera } from "react-icons/fa";
import Webcam from "react-webcam";
import { Toaster, toast } from "react-hot-toast";
import { FaEye, FaEdit } from "react-icons/fa";
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

const inputClass =
  "w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition";
const statusMap = {
  0: "Operational",
  1: "Not Operational",
  2: "Under Maintenance",
  3: "Closed",
};

export default function Ghaat() {
  const [loading, setLoading] = useState(false);
  // const [view, setView] = useState("register");
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const [searchParams] = useSearchParams();
  const initialView =
    searchParams.get("tab") === "directory" ? "directory" : "register";
  const [view, setView] = useState(initialView);

  useEffect(() => {
    const tab = searchParams.get("tab");

    if (user?.role_id === 1 || user?.role_id===3) {
      setView("directory");
    } else {
      setView(tab === "directory" ? "directory" : "register");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Webcam and geolocation states
  const webcamRef = useRef(null);
  const [showCamera, setShowCamera] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoName, setPhotoName] = useState("");
  const [coords, setCoords] = useState({ lat: "", lon: "" });
  const [pincode, setPincode] = useState("");
  const [locationName, setLocationName] = useState("");

  // Data states
  const [rivers, setRivers] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [ghaats, setGhaats] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    ghatName: "",
    district: "",
    riverName: "",
    boatCapacity: "",
    roadAccessibility: "",
    availableFacilities: "",
    // contactNumber: "",
    // contactPerson: "",
    nearestHospital: "",
    additionalInfo: "",
    policeStationName: "",
    policeStationMobile: "",
    policeStationAddress: "",
  });
  const [errors, setErrors] = useState({});

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
     const res = await fetch(`${BASE_URL}/reverse-geocode?lat=${lat}&lon=${lon}`);
const data = await res.json();
return data.address?.postcode || "";

    } catch {
      return "";
    }
  }

  async function getLocationFromPincode(pincode) {
    try {
      const res = await fetch(
        `https://api.postalpincode.in/pincode/${pincode}`
      );
      const data = await res.json();
      if (data[0].Status === "Success" && data[0].PostOffice?.length > 0) {
        return `${data[0].PostOffice[0].Name}, ${data[0].PostOffice[0].District}`;
      }
      return "N/A";
    } catch {
      return "N/A";
    }
  }

  useEffect(() => {
    if (user?.role_id === 2 && user?.district_id) {
      setFormData((prev) => ({
        ...prev,
        district: user.district_id.toString(),
      }));
    }
  }, []);

  // Load initial data
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/river-list");
        setRivers(Array.isArray(data.data) ? data.data : []);
      } catch {
        setRivers([]);
      }

      try {
        const { data } = await api.get("/district-list");
        setDistricts(Array.isArray(data.data) ? data.data : []);
      } catch {
        setDistricts([]);
      }
    })();
  }, []);

  // Fetch ghaat list
  const fetchGhaatList = useCallback(async () => {
    try {
      const { data } = await api.get("/ghaat-list");
      const list = Array.isArray(data.data)
        ? data.data.map((d) => ({
          id: d.id,
          name: d.ghaat_name,
          district: d.district_record?.district_name || d.district_id,
          riverName: d.river?.name || `River #${d.river_id}`,

          boatsAssigned: `${d.registered_boats_count}/${d.boat_capacity}`,
          capacity: d.boat_capacity,
          status: statusMap[d.status] ?? "Operational",
          raw: d, // Keep full object if needed
        }))
        : [];

      setGhaats(list);
    } catch {
      setGhaats([]);
    }
  }, []);

  useEffect(() => {
    if (view === "directory") {
      fetchGhaatList();
    }
  }, [view, fetchGhaatList]);

  // Form handlers
  const handleChange = (e) =>
    setFormData((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleNumeric = (key) => (e) =>
    setFormData((f) => ({
      ...f,
      [key]: e.target.value.replace(/\D/g, "").slice(0, 10),
    }));

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const fd = new FormData();
    Object.entries({
      ghaat_name: formData.ghatName,
      district_id: formData.district,
      river_id: formData.riverName,
      boat_capacity: formData.boatCapacity,
      road_accessibility: formData.roadAccessibility,
      available_facilities: formData.availableFacilities,
      // contact_person: formData.contactPerson,
      // contact_number: formData.contactNumber,
      nearest_hospital: formData.nearestHospital,
      additional_info: formData.additionalInfo,
      latitude: coords.lat,
      longitude: coords.lon,
      location: locationName,
      pincode: pincode,
      police_station_name: formData.policeStationName,
      police_mobile: formData.policeStationMobile,
      station_address: formData.policeStationAddress,
    }).forEach(([k, v]) => fd.append(k, v));
    if (photoFile) fd.append("photo_path", photoFile);

    try {
      await api.post("/register-ghaat", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Ghaat registered successfully!");
      setFormData({
        ghatName: "",
        district: "",
        riverName: "",
        boatCapacity: "",
        roadAccessibility: "",
        availableFacilities: "",
        // contactNumber: "",
        // contactPerson: "",
        nearestHospital: "",
        additionalInfo: "",
      });
      setPhotoFile(null);
      setPhotoName("");
      setCoords({ lat: "", lon: "" });
      setPincode("");
      setView("directory");
      fetchGhaatList();
    } catch (err) {
      const v = err.response?.data;
      if (v?.errors && typeof v.errors === "object") {
        const mapBackendToFrontend = {
          ghaat_name: "ghatName",
          district_id: "district",
          river_id: "riverName",
          boat_capacity: "boatCapacity",
          road_accessibility: "roadAccessibility",
          available_facilities: "availableFacilities",
          // contact_person: "contactPerson",
          // contact_number: "contactNumber",
          nearest_hospital: "nearestHospital",
          additional_info: "additionalInfo",
          photo_path: "photoPath",
          police_station_name: "policeStationName",
          police_mobile: "policeStationMobile",
          station_address: "policeStationAddress",
        };

        const mappedErrors = {};
        for (const [k, vList] of Object.entries(v.errors)) {
          const frontendKey = mapBackendToFrontend[k] || k;
          mappedErrors[frontendKey] = vList[0];
        }
        setErrors(mappedErrors);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-white px-4 sm:px-12 py-10">
      <Toaster position="top-right" reverseOrder={false} />

      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center bg-indigo-100 rounded-full p-3 shadow">
          <FaWater className="text-indigo-600 text-2xl" />
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-indigo-800 mt-4">
          Ghat Management
        </h2>
        <p className="text-gray-600 mt-2 max-w-xl mx-auto">
          Register and manage riverbank Ghats
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-10">
        {/* Show "Register New Ghaat" button only if role_id !== 1 */}
        {user?.role_id !== 1 && user?.role_id!==3 && (
          <button
            onClick={() => setView("register")}
            className={`flex items-center gap-2 px-6 py-2 rounded-full font-semibold transition ${view === "register"
                ? "bg-indigo-600 text-white"
                : "bg-white text-indigo-700 hover:bg-indigo-50 shadow"
              }`}
          >
            <FaPlusCircle /> Register New Ghat
          </button>
        )}

        {/* Always show Ghaat Directory button */}
        <button
          onClick={() => {
            setView("directory");
            fetchGhaatList();
          }}
          className={`flex items-center gap-2 px-6 py-2 rounded-full font-semibold transition ${view === "directory"
              ? "bg-sky-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200 shadow"
            }`}
        >
          <FaListAlt /> Ghat Directory
        </button>
      </div>

      {/* Register View */}
      {view === "register" && user?.role_id !== 1 && (
        <div className="bg-white rounded-xl shadow-md p-8 max-w-6xl mx-auto border">
          {/* Photo Upload Section */}
          <div className="bg-indigo-50 border border-dashed border-indigo-300 rounded-lg p-6 text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-white rounded-full p-3 shadow inline-flex">
                <FaCamera className="text-indigo-500 text-xl" />
              </div>
            </div>
            <p className="text-indigo-800 font-semibold mb-1">
              Upload Ghat Photo (Geo-Tag)
            </p>
            <p className="text-gray-600 text-sm mb-4">
              Capture or upload a photo with GPS coordinates
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={() => setShowCamera(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-full font-medium transition"
              >
                <FaCamera className="inline mr-2" /> Capture Photo
              </button>

              {/* <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-medium transition inline-block text-center">
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
              </label> */}
            </div>

            {photoName && (
              <p className="text-sm text-indigo-700 mt-2">
                Selected: {photoName}
              </p>
            )}

            {errors.photoPath && (
              <p className="text-red-500 text-sm text-center mt-2">
                {errors.photoPath}
              </p>
            )}
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

          {/* Location Info */}
          {(coords.lat || coords.lon) && (
            <div className="mb-6 p-3 bg-blue-50 rounded-lg text-center">
              <p className="font-medium text-blue-800">
                {/* Location: {coords.lat}, {coords.lon} | Pincode: {pincode} | {locationName} */}
                Pincode: {pincode} | {locationName}
              </p>
            </div>
          )}

          {/* Photo Preview */}
          {photoFile && (
            <div className="mb-6 flex justify-center">
              <img
                src={URL.createObjectURL(photoFile)}
                alt="Preview"
                className="rounded shadow w-[90%] max-w-[400px] object-contain"
              />
            </div>
          )}

          {/* Ghaat Registration Form */}
          <form onSubmit={handleSubmit} className="">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Input
                label="Ghat Name *"
                name="ghatName"
                value={formData.ghatName}
                onChange={(e) => {
                  const val = e.target.value;
                  if (/^[a-zA-Z\s.-]*$/.test(val)) {
                    handleChange(e);
                  }
                }}
                err={errors.ghatName}
                placeholder="Enter Ghat Name"
              />

              {user?.role_id === 2 ? (
                // Hidden input only – nothing shown on screen
                <input
                  type="hidden"
                  name="district"
                  value={formData.district}
                />
              ) : (
                <Select
                  label="District *"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  err={errors.district}
                  options={districts.map((d) => ({
                    value: d.id,
                    label: d.district_name,
                  }))}
                />
              )}

              <Select
                label="River/Pond/Lake/Dam *"
                name="riverName"
                value={formData.riverName}
                onChange={handleChange}
                err={errors.riverName}
                options={rivers.map((r) => ({ value: r.id, label: r.name }))}
              />

              {/* <Input
              label="Boat Capacity *"
              name="boatCapacity"
              value={formData.boatCapacity}
              onChange={handleNumeric("boatCapacity")}
              err={errors.boatCapacity}
              type="number"
              inputMode="numeric"
              placeholder="Enter Boat Capacity"
            /> */}

              <Select
                label="Road Accessibility"
                name="roadAccessibility"
                value={formData.roadAccessibility}
                onChange={handleChange}
                err={errors.roadAccessibility}
                options={[
                  {
                    value: "Excellent(Paved Road)",
                    label: "Excellent(Paved Road)",
                  },
                  {
                    value: "Good(Metalled Road)",
                    label: "Good(Metalled Road)",
                  },
                  { value: "FairGravel Road)", label: "Fair(Gravel Road)" },
                  { value: "Poor(Kutcha Road)", label: "Poor(Kutcha Road)" },
                ]}
              />

              <Input
                label="Available Facilities"
                name="availableFacilities"
                value={formData.availableFacilities}
                onChange={handleChange}
                err={errors.availableFacilities}
                placeholder="Enter Available Facilities"
              />

              <Input
                label="Nearest Hospital"
                name="nearestHospital"
                value={formData.nearestHospital}
                onChange={handleChange}
                // err={errors.nearestHospital}
                className="md:col-span-1"
                placeholder="Enter Nearest Hospital"
              />
            </div>
            {/* <Input
              label="Contact Number *"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleNumeric("contactNumber")}
              err={errors.contactNumber}
              inputMode="numeric"
              placeholder="Enter Contact Number"
            />

            <Input
              label="Contact Person"
              name="contactPerson"
              value={formData.contactPerson}
              onChange={(e) => {
                const val = e.target.value;
                if (/^[a-zA-Z\s]*$/.test(val)) {
                  handleChange(e);
                }
              }}
              // err={errors.contactPerson}
              placeholder="Enter Contact Person"
            /> */}

            <div className="my-8">
              <h1 className="text-xl font-bold  text-indigo-700 ">Nearest Police Station</h1>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-5">
                {/* Police Station Name */}
                <Input
                  label="Name*"
                  name="policeStationName"
                  value={formData.policeStationName}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^[a-zA-Z\s.-]*$/.test(val)) {
                      handleChange(e);
                    }
                  }}
                  err={errors.policeStationName}
                  placeholder="Enter Police Station Name"
                />

                {/* Mobile Number */}
                <Input
                  label="Mobile No*"
                  name="policeStationMobile"
                  value={formData.policeStationMobile}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^\d{0,10}$/.test(val)) {
                      handleChange(e);
                    }
                  }}
                  err={errors.policeStationMobile}
                  placeholder="Enter Police Station Mobile Number"
                />

                {/* Full Address */}
                <Input
                  label="Full Address*"
                  name="policeStationAddress"
                  value={formData.policeStationAddress}
                  onChange={handleChange}
                  err={errors.policeStationAddress}
                  placeholder="Enter Full Address"
                />
              </div>
            </div>

            <div className="md:col-span-3">
              <label className="block text-sm font-medium mb-1">
                Additional Info
              </label>
              <textarea
                name="additionalInfo"
                rows={3}
                value={formData.additionalInfo}
                onChange={handleChange}
                placeholder="Enter Any Other Details"
                className={inputClass}
              />
              {errors.additionalInfo && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.additionalInfo}
                </p>
              )}
            </div>

            <div className="md:col-span-3 text-center mt-4">
<button
  type="submit"
  disabled={
    loading ||
    !coords.lat ||
    !coords.lon ||
    !pincode ||
    !locationName
  }
  className={`bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-10 py-2 rounded-full ${
    loading || !coords.lat || !coords.lon || !pincode || !locationName
      ? "opacity-50 cursor-not-allowed"
      : ""
  }`}
>
  {loading ? "Saving..." : "Register Ghat"}
</button>


            </div>
          </form>
        </div>
      )}

      {/* Directory View */}
      {view === "directory" && (
        <div className="bg-white rounded-xl shadow-md p-8 max-w-6xl mx-auto border">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <h3 className="text-xl sm:text-2xl font-bold text-blue-800 text-center sm:text-left">
              Registered Ghats
            </h3>
            <button
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 sm:px-4 sm:py-2 rounded-md transition-colors w-full sm:w-auto justify-center sm:justify-end"
              onClick={() => {
                // Prepare CSV headers
                const headers = [
                  "Sr.No",
                  "Ghat Name",
                  "District",
                  "River",
                  "Boats Assigned",
                  "Capacity",
                  "Status",
                ];

                // Prepare CSV rows
                const rows = ghaats.map((g, idx) => [
                  idx + 1,
                  `"${g.name}"`,
                  `"${g.district}"`,
                  `"${g.river}"`,
                  `"${g.boatsAssigned}"`,
                  `"${g.capacity}"`,
                  `"${g.status}"`,
                ]);

                // Combine headers and rows
                const csvContent = [
                  headers.join(","),
                  ...rows.map((row) => row.join(",")),
                ].join("\n");

                // Create and trigger download
                const blob = new Blob([csvContent], {
                  type: "text/csv;charset=utf-8;",
                });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.setAttribute("href", url);
                link.setAttribute(
                  "download",
                  `ghaats_report_${new Date().toISOString().slice(0, 10)}.csv`
                );
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
            >
              <FaDownload className="text-sm sm:text-base" />
              <span className="text-sm sm:text-base">Export Report</span>
            </button>
          </div>

          {ghaats.length === 0 ? (
            <p className="text-center text-gray-500">No data found..</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="px-6 py-3 font-bold text-center">Sr.No</th>
                    <th className="px-6 py-3 font-bold text-center">
                      Ghat Name
                    </th>
                    <th className="px-6 py-3 font-bold text-center">
                      District
                    </th>
                    <th className="px-6 py-3 font-bold text-center">River/Pond/Lake/Dam</th>
                    {/* <th className="px-6 py-3 font-bold text-center">
                      Boats Assigned
                    </th> */}
                    {/* <th className="px-6 py-3 font-bold text-center">Capacity</th> */}
                    <th className="px-6 py-3 font-bold text-center">Status</th>
                    <th className="px-6 py-3 font-bold text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {ghaats.map((g, idx) => (
                    <tr
                      key={g.id}
                      className="hover:bg-gray-50 transition duration-150"
                    >
                      <td className="px-6 py-4 text-center">{idx + 1}</td>
                      <td className="px-6 py-4 font-semibold text-center">
                        {g.name}
                      </td>
                      <td className="px-6 py-4 text-center">{g.district}</td>
                      <td className="px-6 py-4 text-center">{g.riverName}</td>
                      {/* <td className="px-6 py-4 text-center">
                        {g.boatsAssigned}
                      </td> */}
                      {/* <td className="px-6 py-4 text-center">{g.capacity}</td> */}
                      <td className="px-6 py-4 text-center">
                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-200 text-green-700 text-center">
                          {g.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex gap-4 justify-center">
                          <button
                            onClick={() =>
                              navigate(
                                `/dashboard/ghats/ghatdetailsview/${g.id}`,
                                {
                                  state: { ...g.raw, readOnly: true },
                                }
                              )
                            }
                            className="flex items-center gap-1  text-indigo-600 hover:underline"
                          >
                            <FaEye />
                          </button>
                          {user?.role_id !== 1 && user?.role_id!==3 && (
                            <button
                              onClick={() =>
                                navigate(
                                  `/dashboard/ghats/ghatdetails/${g.id}`,
                                  { state: g.raw }
                                )
                              }
                              className="flex items-center gap-1 text-emerald-600 hover:underline"
                            >
                              <FaEdit />
                            </button>
                          )}
                        </div>
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

/* ------------ Reusable Inputs ------------ */
function Input({
  label,
  name,
  value,
  onChange,
  err,
  type = "text",
  inputMode,
  placeholder,
  className,
}) {
  return (
    <div className={`flex flex-col ${className || ""}`}>
      <label className="block text-sm font-medium mb-1" htmlFor={name}>
        {label}
      </label>
      <input
        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        type={type}
        inputMode={inputMode}
        placeholder={placeholder}
      />
      {err && <p className="text-red-500 text-sm mt-1">{err}</p>}
    </div>
  );
}

function Select({ label, name, value, onChange, err, options }) {
  return (
    <div className="flex flex-col">
      <label className="block text-sm font-medium mb-1" htmlFor={name}>
        {label}
      </label>
      <select
        id={name}
        name={name}
        className={`border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${err ? "border-gray-500" : "border-gray-300"
          }`}
        value={value}
        onChange={onChange}
      >
        <option value="">-- Select --</option>
        {options.map((opt) => (
          <option key={opt.value || opt} value={opt.value || opt}>
            {opt.label || opt}
          </option>
        ))}
      </select>
      {err && <p className="text-red-500 text-sm mt-1">{err}</p>}
    </div>
  );
}