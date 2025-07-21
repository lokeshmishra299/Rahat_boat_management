// src/pages/BoatDetail.jsx
import React, { useEffect, useState, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaCamera, FaTrash } from "react-icons/fa";
import Webcam from "react-webcam";
import toast from "react-hot-toast";

/* ---------- API ---------- */
const BASE_URL = import.meta.env.VITE_API_BASE ?? "http://localhost:8000/api";
const API_BASE = BASE_URL.replace("/api", "");

const token = localStorage.getItem("access_token");

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  },
});

const Editable = ({ label, field, error, value, onChange }) => {
  const isNumberOnly = ["support_staff", "passenger_capacity", "year_of_manufacture", "owner_boat_owned"].includes(field);
  const isSelect = field === "registration_authority";
  const isTextOnly = field === "pilot_name" || field === "owner_name";
  const isAadhar = field === "owner_adhar_no" || field === "adhar_no";
  const isPhone = field === "owner_number" || field === "contact_no";

  const handleChange = (e) => {
    let val = e.target.value;

    if (isTextOnly) {
      val = val.replace(/[^a-zA-Z\s]/g, "");
    }

    if (isNumberOnly) {
      val = val.replace(/\D/g, "");
    }

    if (isAadhar) {
      val = val.replace(/\D/g, "").slice(0, 12);
    }

    if (isPhone) {
      val = val.replace(/\D/g, "").slice(0, 10);
    }

    onChange(field, val);
  };

  return (
    <div>
      <label className="text-sm font-medium mb-1 block">{label}</label>

      {isSelect ? (
        <select
          value={value || ""}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">Select</option>
          {[
            "District Collector",
            "Sub-Divisional Magistrate",
            "Circle Officer",
            "Block Development Officer",
          ].map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : field === "owner_dob" ? (
        <input
          type="date"
          value={value || ""}
          onChange={(e) => onChange(field, e.target.value)}
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      ) : (
        <input
          type={isNumberOnly ? "number" : "text"}
          value={value || ""}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      )}

      {error && (
        <p className="text-red-500 text-sm mt-1">
          {Array.isArray(error) ? error[0] : error}
        </p>
      )}
    </div>
  );
};

export default function BoatDetail() {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const webcamRef = useRef(null);
  const user = JSON.parse(localStorage.getItem("user"));

  const [boat, setBoat] = useState(state || null);
  const [draft, setDraft] = useState(state || {});
  const [loading, setLoad] = useState(!state);
  const [districts, setDistricts] = useState([]);
  const [ghaats, setGhaats] = useState([]);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});

  const [imgDraft, setImgDraft] = useState(null);
  const [pilotImgDraft, setPilotImgDraft] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showPilotCamera, setShowPilotCamera] = useState(false);
  const [coords, setCoords] = useState({ lat: "", lon: "" });
  const [pincode, setPincode] = useState("");
  const [locationName, setLocationName] = useState("");

  /* ─── fetch on hard-refresh ─── */
  useEffect(() => {
    if (state) return;
    api
      .get(`/boat-list/${id}`)
      .then((r) =>
        r.data?.status === "success"
          ? (setBoat(r.data.data), setDraft(r.data.data))
          : setError("Boat not found.")
      )
      .catch(() => setError("Could not load boat details."))
      .finally(() => setLoad(false));
  }, [id, state]);

  useEffect(() => {
    api.get("/district-list").then((res) => {
      if (res.data?.status === "success") {
        setDistricts(res.data.data);
      }
    });

    api.get("/ghaat-list").then((res) => {
      if (res.data?.status === "success") {
        setGhaats(res.data.data);
      }
    });
  }, []);

  // Webcam capture function
  const captureFromWebcam = (isPilot = false) => {
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

    if (isPilot) {
      setPilotImgDraft(file);
      setShowPilotCamera(false);
    } else {
      setImgDraft(file);
      setShowCamera(false);
    }

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
      const res = await api.get(`/reverse-geocode?lat=${lat}&lon=${lon}`);
      return res.data?.address?.postcode || "";
    } catch (err) {
      console.error("Error fetching pincode:", err);
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

  /* ─── save (text fields + optional image) ─── */

const handleSaveAll = () => {
  setSaving(true);
  setErrors({}); // Clear previous errors

  const fd = new FormData();
  Object.entries(draft).forEach(([k, v]) => fd.append(k, v ?? ""));
 if (imgDraft) fd.set("boat_image", imgDraft);

  if (pilotImgDraft) fd.set("pilot_image", pilotImgDraft);

  // Add location data
  if (coords.lat) fd.append("latitude", coords.lat);
  if (coords.lon) fd.append("longitude", coords.lon);
  if (pincode) fd.append("pincode", pincode);
  if (locationName) fd.append("location", locationName);

  api.post(`/edit-boat-details/${boat.id}`, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  })
  .then((response) => {
    if (response.data?.status === "success") {
      setBoat(response.data.data);
      setDraft(response.data.data);
      toast.success("Boat updated successfully");
      navigate("/dashboard/addboatowner");
    } else if (response.data?.status === "error") {
      // Handle error response with validation errors
      setErrors(response.data.data); // This matches your backend format
      toast.error(response.data.message); // Show the general error message
    }
  })
  .catch((error) => {
    console.log("API Error:", error.response); // For debugging
    
    if (error.response?.data?.status === "error") {
      // Your specific error format
      setErrors(error.response.data.data);
      toast.error(error.response.data.message);
    } else if (error.response?.data?.errors) {
      // Alternative error format
      setErrors(error.response.data.errors);
    } else if (error.message) {
      toast.error(error.message);
    } else {
      toast.error("An unknown error occurred");
    }
  })
  .finally(() => setSaving(false));
};
  
  /* ─── static field helper ─── */
  const Info = ({ label, value }) => (
    <div className="space-y-1">
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
      <div className="bg-gray-100 rounded-md px-3 py-2 text-sm text-gray-800 border">
        {value ?? "—"}
      </div>
    </div>
  );

  if (loading) return <p className="p-6">Loading…</p>;
  if (error) return <p className="p-6 text-red-500">{error}</p>;
  if (!boat) return null;

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-md border space-y-10">
      {/* Camera Modal */}
      {(showCamera || showPilotCamera) && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-4 rounded-lg shadow-lg flex flex-col items-center justify-center">
            <div className="w-full flex justify-center">
              <Webcam
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                className="rounded-lg shadow sm:w-96 w-full aspect-video object-cover"
                videoConstraints={{ facingMode: "environment" }}
              />
            </div>
            <button
              onClick={() => showPilotCamera ? captureFromWebcam(true) : captureFromWebcam(false)}
              className="mt-4 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full"
            >
              Capture
            </button>
            <button
              onClick={() => showPilotCamera ? setShowPilotCamera(false) : setShowCamera(false)}
              className="mt-2 text-sm text-gray-600 underline"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold text-blue-700 mb-1">
          🚤 Boat Detail {boat.boat_uid}
        </h1>
      </div>

      {/* Location Info */}
      {(coords.lat || coords.lon) && (
        <div className="p-3 bg-blue-50 rounded-lg text-center">
          <p className="font-medium text-blue-800">
            Location: {coords.lat}, {coords.lon} | Pincode: {pincode} | {locationName}
          </p>
        </div>
      )}

      {/* General Information Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Boat Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <Editable
            label="Registration Number"
            field="registration_no"
            value={draft.registration_no}
            error={errors.registration_no}
            onChange={(field, value) => setDraft((prev) => ({ ...prev, [field]: value }))}
          />

          <div className="space-y-1">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Boat Type</p>
            <select
              value={draft.boat_type ?? ""}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, boat_type: e.target.value }))
              }
              className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm"
            >
              <option value="">Select Boat Type</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Engine Driven">Engine Driven</option>
              <option value="Manual (Paddle/Oar)">Manual (Paddle/Oar)</option>
            </select>
            {errors.boat_type && (
              <p className="text-sm text-red-500">{errors.boat_type[0]}</p>
            )}
          </div>

          {(draft.boat_type === "Hybrid" || draft.boat_type === "Engine Driven") && (
            <Editable
              label="Engine Details"
              field="engine_details"
              value={draft.engine_details}
              error={errors.engine_details}
              onChange={(field, value) =>
                setDraft((prev) => ({ ...prev, [field]: value }))
              }
            />
          )}

          {!user?.role_id && (
            <div className="space-y-1">
              <p className="text-xs text-gray-500 uppercase tracking-wide">District</p>
              <select
                value={draft.district_id ?? ""}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, district_id: e.target.value }))
                }
                className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm"
              >
                <option value="">Select District</option>
                {districts.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.district_name}
                  </option>
                ))}
              </select>
              {errors.district_id && (
                <p className="text-sm text-red-500">{errors.district_id[0]}</p>
              )}
            </div>
          )}

          <div className="space-y-1">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Assigned Ghat</p>
            <select
              value={draft.ghaat_id ?? ""}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, ghaat_id: e.target.value }))
              }
              className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm"
            >
              <option value="">Select Ghat</option>
              {ghaats.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.ghaat_name}
                </option>
              ))}
            </select>
            {errors.ghaat_id && (
              <p className="text-sm text-red-500">{errors.ghaat_id[0]}</p>
            )}
          </div>

          <Editable
            label="Registration Authority"
            field="registration_authority"
            value={draft.registration_authority}
            error={errors.registration_authority}
            onChange={(field, value) => setDraft((prev) => ({ ...prev, [field]: value }))}
          />

          <Editable
            label="Support Staff"
            field="support_staff"
            value={draft.support_staff}
            error={errors.support_staff}
            onChange={(field, value) => setDraft((prev) => ({ ...prev, [field]: value }))}
          />

          <Editable
            label="Passenger Capacity"
            field="passenger_capacity"
            value={draft.passenger_capacity}
            error={errors.passenger_capacity}
            onChange={(field, value) => setDraft((prev) => ({ ...prev, [field]: value }))}
          />

          <Editable
            label="Year of Manufacture"
            field="year_of_manufacture"
            value={draft.year_of_manufacture}
            error={errors.year_of_manufacture}
            onChange={(field, value) => setDraft((prev) => ({ ...prev, [field]: value }))}
          />

          <Editable
            label="Additional Remarks"
            field="remarks"
            value={draft.remarks}
            error={errors.remarks}
            onChange={(field, value) => setDraft((prev) => ({ ...prev, [field]: value }))}
          />

          <Editable
            label="Status"
            field="status"
            value={draft.status}
            error={errors.status}
            onChange={(field, value) => setDraft((prev) => ({ ...prev, [field]: value }))}
          />
        </div>
      </div>

      {/* Pilot Information Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Pilot Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <Editable
            label="Pilot Name"
            field="pilot_name"
            value={draft.pilot_name}
            error={errors.pilot_name}
            onChange={(field, value) => setDraft((prev) => ({ ...prev, [field]: value }))}
          />

          <Editable
            label="Pilot License No."
            field="pilot_license_no"
            value={draft.pilot_license_no}
            error={errors.pilot_license_no}
            onChange={(field, value) => setDraft((prev) => ({ ...prev, [field]: value }))}
          />

          <Editable
            label="Aadhaar Number"
            field="adhar_no"
            value={draft.adhar_no}
            error={errors.adhar_no}
            onChange={(field, value) => setDraft((prev) => ({ ...prev, [field]: value }))}
          />

          <Editable
            label="Contact Number"
            field="contact_no"
            value={draft.contact_no}
            error={errors.contact_no}
            onChange={(field, value) => setDraft((prev) => ({ ...prev, [field]: value }))}
          />
        </div>
      </div>

  

       {/* Location Information */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Location Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <Editable
            label="Latitude"
            field="latitude"
            value={draft.latitude}
            error={errors.latitude}
            onChange={(field, value) => setDraft((prev) => ({ ...prev, [field]: value }))}
          />

          <Editable
            label="Longitude"
            field="longitude"
            value={draft.longitude}
            error={errors.longitude}
            onChange={(field, value) => setDraft((prev) => ({ ...prev, [field]: value }))}
          />

          <Editable
            label="Pincode"
            field="pincode"
            value={draft.pincode}
            error={errors.pincode}
            onChange={(field, value) => setDraft((prev) => ({ ...prev, [field]: value }))}
          />

          <Editable
            label="Location Name"
            field="location"
            value={draft.location}
            error={errors.location}
            onChange={(field, value) => setDraft((prev) => ({ ...prev, [field]: value }))}
            span="sm:col-span-2"
          />
        </div>
      </div>

      {/* Images Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Boat Image */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-center">Boat Image</h2>
          {imgDraft ? (
            <>
              <div className="flex justify-center">
                <div className="w-full sm:w-80 rounded-lg shadow overflow-hidden">
                  <img
                    src={URL.createObjectURL(imgDraft)}
                    alt="Preview"
                    className="w-full h-64 object-cover"
                  />
                </div>
              </div>
              <div className="flex justify-center mt-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => setImgDraft(null)}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition"
                  >
                    Cancel
                  </button>
                  {coords.lat && (
                    <div className="bg-blue-50 px-3 py-2 rounded text-sm text-blue-800">
                      Location captured
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="w-full flex flex-col items-center justify-center">
                <div className="sm:w-80 w-full rounded-lg shadow overflow-hidden">
                  {boat.image ? (
                    <img
                      src={
                        boat.image?.startsWith("blob:")
                          ? boat.image
                          : `${API_BASE}/storage/${boat.image}`
                      }
                      alt="Boat"
                      className="w-full h-64 object-cover"
                    />
                  ) : (
                    <div className="w-full h-64 flex items-center justify-center bg-gray-50 text-gray-400">
                      No image
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setShowCamera(true)}
                  className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded font-medium transition"
                >
                  <FaCamera /> Update Boat Photo
                </button>
              </div>
            </>
          )}
        </div>

        {/* Pilot Image */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-center">Pilot Image</h2>
          {pilotImgDraft ? (
            <>
              <div className="flex justify-center">
                <div className="w-full sm:w-80 rounded-lg shadow overflow-hidden">
                  <img
                    src={URL.createObjectURL(pilotImgDraft)}
                    alt="Preview"
                    className="w-full h-64 object-cover"
                  />
                </div>
              </div>
              <div className="flex justify-center mt-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => setPilotImgDraft(null)}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="w-full flex flex-col items-center justify-center">
                <div className="sm:w-80 w-full rounded-lg shadow overflow-hidden">
                  {boat.pilot_image ? (
                    <img
                      src={
                        boat.pilot_image?.startsWith("blob:")
                          ? boat.pilot_image
                          : `${API_BASE}/storage/${boat.pilot_image}`
                      }
                      alt="Pilot"
                      className="w-full h-64 object-cover"
                    />
                  ) : (
                    <div className="w-full h-64 flex items-center justify-center bg-gray-50 text-gray-400">
                      No image
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setShowPilotCamera(true)}
                  className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded font-medium transition"
                >
                  <FaCamera /> Update Pilot Photo
                </button>
              </div>
            </>
          )}
        </div>
      </div>

   

      {/* Save Button */}
      <div className="pt-4 border-t flex justify-center">
        <button
          type="button"
          onClick={handleSaveAll}
          disabled={saving}
          className="px-6 py-3 bg-blue-600 text-white rounded font-medium disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}