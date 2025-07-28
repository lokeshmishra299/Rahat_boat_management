// src/pages/Boats.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom"; // ✅ Add this

import axios from "axios";
import {
  FaShip,
  FaEdit,
  FaEye,
  FaListAlt,
  FaPlusCircle,
  FaCamera,
} from "react-icons/fa";
import Webcam from "react-webcam";
import { Toaster, toast } from "react-hot-toast";
import { useSearchParams } from "react-router-dom";
import { FaDownload } from "react-icons/fa";
import { FaTrash } from "react-icons/fa";

const BASE_URL = import.meta.env.VITE_API_BASE ?? "http://localhost:8000/api";

const token = localStorage.getItem("access_token");

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    // "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  },
});

const Boats = () => {
  const navigate = useNavigate();
  const { id: ownerId } = useParams();
  const [vieww, setVieww] = useState("register");
  const user = JSON.parse(localStorage.getItem("user"));

  // Webcam and geolocation states
  const webcamRef = useRef(null);
  const [showCamera, setShowCamera] = useState(false);
const [boatLocationStatus, setBoatLocationStatus] = useState({
  loaded: false,
  loading: false,
  error: null
});
const [pilotLocationStatus, setPilotLocationStatus] = useState({
  loaded: false,
  loading: false,
  error: null
});
  // const [coords, setCoords] = useState({ lat: "", lon: "" });
  // const [pincode, setPincode] = useState("");
  // const [locationName, setLocationName] = useState("");
  const [boatCoords, setBoatCoords] = useState({ lat: "", lon: "" });
  const [boatPincode, setBoatPincode] = useState("");
  const [boatLocationName, setBoatLocationName] = useState("");

  const [pilotCoords, setPilotCoords] = useState({ lat: "", lon: "" });
  const [pilotPincode, setPilotPincode] = useState("");
  const [pilotLocationName, setPilotLocationName] = useState("");

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


  const locationLoading =
    !boatCoords.lat ||
    !boatCoords.lon ||
    !pilotCoords.lat ||
    !pilotCoords.lon ||
    !boatPincode ||
    !pilotPincode ||
    !boatLocationName ||
    !pilotLocationName;


  // Form
  const emptyForm = {
    regNumber: "",
    district: user?.district_id || "",
    type: "",
    pilotName: "",
    license: "",
    addharNo: "",
    contactNo: "",
    staffCount: "",
    engine: "",
    capacity: "",
    year: "",
    ghat: "",
    authority: "",
    additionalInfo: "",
  };
  const [form, setForm] = useState(emptyForm);
  const [cameraPurpose, setCameraPurpose] = useState(null); // 'boat' or 'pilot'
  const [boatPhotoName, setBoatPhotoName] = useState("");
  const [boatPhotoFile, setBoatPhotoFile] = useState(null);
  const [pilotPhotoName, setPilotPhotoName] = useState("");
  const [pilotPhotoFile, setPilotPhotoFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const inputClass =
    "w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500";

  const field = (k) => (e) => {
    const value = e.target.value;

    if (k === "pilotName" && /[^a-zA-Z\s]/.test(value)) return;

    setForm((f) => ({ ...f, [k]: value }));
  };

  const fieldNum = (k) => (e) =>
    setForm((f) => ({
      ...f,
      [k]:
        e.target.value === "" ? "" : Math.max(0, parseInt(e.target.value, 10)),
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

  if (cameraPurpose === "boat") {
    const file = new File([blob], "boat_captured.jpg", { type: mimeString });
    setBoatPhotoFile(file);
    setBoatPhotoName("boat_captured.jpg");
    setBoatLocationStatus({ loaded: false, loading: true, error: null });

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude.toFixed(6);
        const lon = pos.coords.longitude.toFixed(6);
        setBoatCoords({ lat, lon });

        try {
          const pin = await getPincode(lat, lon);
          setBoatPincode(pin);

          const loc = pin ? await getLocationFromPincode(pin) : "N/A";
          setBoatLocationName(loc);
          
          setBoatLocationStatus({ loaded: true, loading: false, error: null });
        } catch (err) {
          setBoatLocationStatus({ loaded: false, loading: false, error: err.message });
        }
      },
      (err) => {
        console.error("Location error", err);
        const errorMsg = err.code === 1 
          ? "Location permission denied" 
          : "Failed to get location. Please check GPS access.";
        setBoatLocationStatus({ loaded: false, loading: false, error: errorMsg });
        toast.error(errorMsg, { id: "location-error" });
      }
    );
  } else {
    const file = new File([blob], "pilot_captured.jpg", { type: mimeString });
    setPilotPhotoFile(file);
    setPilotPhotoName("pilot_captured.jpg");
    setPilotLocationStatus({ loaded: false, loading: true, error: null });

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude.toFixed(6);
        const lon = pos.coords.longitude.toFixed(6);
        setPilotCoords({ lat, lon });

        try {
          const pin = await getPincode(lat, lon);
          setPilotPincode(pin);

          const loc = pin ? await getLocationFromPincode(pin) : "N/A";
          setPilotLocationName(loc);
          
          setPilotLocationStatus({ loaded: true, loading: false, error: null });
        } catch (err) {
          setPilotLocationStatus({ loaded: false, loading: false, error: err.message });
        }
      },
      (err) => {
        console.error("Location error", err);
        const errorMsg = err.code === 1 
          ? "Location permission denied" 
          : "Failed to get location. Please check GPS access.";
        setPilotLocationStatus({ loaded: false, loading: false, error: errorMsg });
        toast.error(errorMsg, { id: "location-error" });
      }
    );
  }

  setShowCamera(false);
};
  // Helper functions for geolocation
  async function getPincode(lat, lon) {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
      );
      const data = await res.json();
      return data.address.postcode || "";
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
      const { data } = await api.get(`/boat-owner/${ownerId}/boats`);
      setBoats(Array.isArray(data.data) ? data.data : []);
    } catch {
      setBoatsError("Could not fetch boats.");
    } finally {
      setLoadingBoats(false);
    }
  }, [ownerId]);

  useEffect(() => {
    loadBoats();
  }, [loadBoats]);

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
      const boatPhotoWithMissingLocation = boatPhotoFile && !boatLocationStatus.loaded;
  const pilotPhotoWithMissingLocation = pilotPhotoFile && !pilotLocationStatus.loaded;
  
  if (boatPhotoWithMissingLocation || pilotPhotoWithMissingLocation) {
    let errorMessage = "Please wait for location data to load:";
    if (boatPhotoWithMissingLocation) {
      errorMessage += "\n- Boat photo location is still loading";
      if (boatLocationStatus.error) {
        errorMessage += ` (Error: ${boatLocationStatus.error})`;
      }
    }
    if (pilotPhotoWithMissingLocation) {
      errorMessage += "\n- Pilot photo location is still loading";
      if (pilotLocationStatus.error) {
        errorMessage += ` (Error: ${pilotLocationStatus.error})`;
      }
    }
    
    toast.error(errorMessage, { duration: 5000 });
    return;
  }

    setErrors({});
    setSaving(true);

    const fd = new FormData();
    fd.append("registration_no", form.regNumber || "");
    fd.append("district_id", form.district || "");
    fd.append("boat_type", form.type || "");
    fd.append("pilot_name", form.pilotName || "");
    fd.append("pilot_license_no", form.license || "");
    fd.append("adhar_no", form.addharNo || "");
    fd.append("contact_no", form.contactNo || "");
    fd.append("support_staff", form.staffCount || "");
    fd.append("engine_details", form.engine || "");
    fd.append("passenger_capacity", form.capacity || "");
    fd.append("year_of_manufacture", form.year || "");
    fd.append("ghaat_id", form.ghat || "");
    fd.append("registration_authority", form.authority || "");
    fd.append("remarks", form.additionalInfo || "");
    if (boatPhotoFile) {
      fd.append("boat_image", boatPhotoFile);
      fd.append("boat_latitude", boatCoords.lat || "");
      fd.append("boat_longitude", boatCoords.lon || "");
      fd.append("boat_pincode", boatPincode || "");
      fd.append("boat_location", boatLocationName || "");
    }

    if (pilotPhotoFile) {
      fd.append("pilot_image", pilotPhotoFile);
      fd.append("pilot_latitude", pilotCoords.lat || "");
      fd.append("pilot_longitude", pilotCoords.lon || "");
      fd.append("pilot_pincode", pilotPincode || "");
      fd.append("pilot_location", pilotLocationName || "");
    }
    if (boatPhotoFile) fd.append("boat_image", boatPhotoFile);
    if (pilotPhotoFile) fd.append("pilot_image", pilotPhotoFile);

    const familyNames = members.map((m) => m.name).filter(Boolean);
    fd.append(
      "owner_family_name",
      familyNames.length ? familyNames.join(",") : ""
    );

    try {
      const response = await api.post(`/boat-owner/${ownerId}/boats`, fd, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success(response.data?.message || "Boat registered successfully!");

      setTimeout(() => {
        navigate("/dashboard/addboatowner");
      }, 1000);

      await loadBoats();
      setForm(emptyForm);
      setBoatPhotoName("");
      setBoatPhotoFile(null);
      setPilotPhotoName("");
      setPilotPhotoFile(null);
      setBoatCoords({ lat: "", lon: "" });
      setPilotCoords({ lat: "", lon: "" });
      setBoatPincode("");
      setPilotPincode("");
      setBoatLocationName("");
      setPilotLocationName("");
      setMembers([]);
      setTimeout(() => setView("directory"), 1000);

    } catch (err) {
      console.error("Form submit failed", err);

      const v = err.response?.data;
      if (v?.data && typeof v.data === "object") {
        setErrors(v.data);
      } else {
        toast.error("Something went wrong, please try again.");
      }
    } finally {
      setSaving(false);
    }

  };

  const [searchParams] = useSearchParams();
  const initialView =
    searchParams.get("tab") === "directory" ? "directory" : "register";
  const [view, setView] = useState(initialView); // ✅ yahi sahi hai

  useEffect(() => {
    if (user?.role_id !== 1 && user?.district_id) {
      setForm((prev) => {
        if (prev.district !== user.district_id) {
          return { ...prev, district: user.district_id };
        }
        return prev;
      });
    }
  }, [user]);

  //   const [view, setView] = useState("register");
  // const [searchParams] = useSearchParams();

  // useEffect(() => {
  //   const tab = searchParams.get("tab");
  //   if (tab === "directory") {
  //     setView("directory");
  //     loadBoats(); // call only if you have this function
  //   }
  // }, [searchParams]);

  const [members, setMembers] = useState([]);

  const addMember = () => {
    setMembers([...members, { name: "" }]);
  };

  const handleChange = (index, value) => {
    const updated = [...members];
    updated[index].name = value;
    setMembers(updated);
  };

  const removeMember = (index) => {
    const updated = members.filter((_, i) => i !== index);
    setMembers(updated);
  };

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
        {user?.role_id !== 1 && (
          <button
            style={{
              WebkitTapHighlightColor: "transparent",
              outline: "none",
              WebkitFocusRingColor: "transparent",
            }}
            onClick={() => setView("register")}
            className={`flex items-center gap-2 px-6 py-2 rounded-full font-semibold transition ${view === "register"
              ? "bg-green-600 text-white"
              : "bg-white text-green-700 hover:bg-green-50 shadow"
              }`}
          >
            <FaPlusCircle /> Register New Boat
          </button>
        )}

        {/* Always show directory button */}
        <button
          onClick={() => {
            setView("directory");
            loadBoats(); // Ensure this is defined and fetching properly
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
          <h3 className="text-white text-xl mb-4">
            Capturing {cameraPurpose === "boat" ? "Boat" : "Pilot"} Photo
          </h3>
          <Webcam
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            className="rounded-lg shadow-lg max-w-full w-96"
            videoConstraints={{ facingMode: "environment" }}
            onUserMediaError={(err) => {
              console.error("Camera permission error", err);
              toast.error(
                "Camera access denied. Please allow camera permission in your browser settings.",
                {
                  id: "camera-error",
                }
              );
            }}
            onUserMedia={() => {
              console.log("Camera access granted");
            }}
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

      {view === "register" && user?.role_id !== 1 ? (
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

            {/* Capture Buttons */}
            <div className="flex items-center justify-center gap-2">
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button
                  onClick={() => {
                    setCameraPurpose("boat");
                    setShowCamera(true);
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full font-medium transition"
                >
                  <FaCamera className="inline mr-2" /> Capture Boat
                </button>
                <button
                  onClick={() => {
                    setCameraPurpose("pilot");
                    setShowCamera(true);
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full font-medium transition"
                >
                  <FaCamera className="inline mr-2" /> Capture Pilot
                </button>
              </div>
            </div>

            {/* Boat Photo Preview & Error */}
            <div className="mt-4">
              {boatPhotoName && (
                <p className="text-sm text-green-700">
                  Boat Photo: {boatPhotoName}
                </p>
              )}
              {errors.boat_image && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.boat_image[0]}
                </p>
              )}
            </div>

            {/* Pilot Photo Preview & Error */}
            <div className="mt-4">
              {pilotPhotoName && (
                <p className="text-sm text-blue-700">
                  Pilot Photo: {pilotPhotoName}
                </p>
              )}
              {errors.pilot_image && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.pilot_image[0]}
                </p>
              )}
            </div>
          </div>


          {/* Location Info */}
          {/* In your JSX, update the location info display */}
          {(boatCoords.lat || boatCoords.lon) && cameraPurpose === "boat" && (
            <div className="mb-6 p-3 bg-blue-50 rounded-lg text-center">
              <p className="font-medium text-blue-800">
                {/* Boat Location: {boatCoords.lat}, {boatCoords.lon} |  */}
                Pincode: {boatPincode} | {boatLocationName}
              </p>
            </div>
          )}

          {(pilotCoords.lat || pilotCoords.lon) && cameraPurpose === "pilot" && (
            <div className="mb-6 p-3 bg-green-50 rounded-lg text-center">
              <p className="font-medium text-green-800">
                {/* Pilot Location: {pilotCoords.lat}, {pilotCoords.lon} |  */}
                Pincode: {pilotPincode} | {pilotLocationName}
              </p>
            </div>
          )}

  
{/* {boatPhotoFile && (
  <div className="mb-4 p-3 rounded-lg text-center" style={{
    backgroundColor: boatLocationStatus.loaded 
      ? '#f0fdf4' 
      : boatLocationStatus.error 
        ? '#fef2f2' 
        : '#fffbeb'
  }}>
    <p className={`font-medium ${
      boatLocationStatus.loaded 
        ? 'text-green-800' 
        : boatLocationStatus.error 
          ? 'text-red-800' 
          : 'text-yellow-800'
    }`}>
      {boatLocationStatus.loaded ? (
        `Boat Location: ${boatLocationName} | Pincode: ${boatPincode}`
      ) : boatLocationStatus.error ? (
        `Error: ${boatLocationStatus.error}`
      ) : boatLocationStatus.loading ? (
        'Loading boat location data...'
      ) : (
        'Boat location data pending...'
      )}
    </p>
  </div>
)}


{pilotPhotoFile && (
  <div className="mb-4 p-3 rounded-lg text-center" style={{
    backgroundColor: pilotLocationStatus.loaded 
      ? '#f0fdf4' 
      : pilotLocationStatus.error 
        ? '#fef2f2' 
        : '#fffbeb'
  }}>
    <p className={`font-medium ${
      pilotLocationStatus.loaded 
        ? 'text-green-800' 
        : pilotLocationStatus.error 
          ? 'text-red-800' 
          : 'text-yellow-800'
    }`}>
      {pilotLocationStatus.loaded ? (
        `Pilot Location: ${pilotLocationName} | Pincode: ${pilotPincode}`
      ) : pilotLocationStatus.error ? (
        `Error: ${pilotLocationStatus.error}`
      ) : pilotLocationStatus.loading ? (
        'Loading pilot location data...'
      ) : (
        'Pilot location data pending...'
      )}
    </p>
  </div>
)} */}
          {(boatPhotoFile || pilotPhotoFile) && (
            <div className="mb-6 flex flex-col sm:flex-row justify-center gap-4">
              {boatPhotoFile && (
                <div className="text-center">
                  <p className="text-sm font-medium mb-1">Boat Photo</p>
                  <img
                    src={URL.createObjectURL(boatPhotoFile)}
                    alt="Boat Preview"
                  />
                </div>
              )}
              {pilotPhotoFile && (
                <div className="text-center">
                  <p className="text-sm font-medium mb-1">Pilot Photo</p>
                  <img
                    src={URL.createObjectURL(pilotPhotoFile)}
                    alt="Pilot Preview"
                  />
                </div>
              )}
            </div>
          )}

          {/* Boat Registration Form */}
          <form onSubmit={handleSubmit} className="">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Registration Number "
                name="regNumber"
                value={form.regNumber}
                onChange={field("regNumber")}
                error={errors.registration_no}
                placeholder="Enter Registration Number"
              />

              {!user?.role_id && (
                <div>
                  <label className="text-sm font-medium mb-1">District *</label>
                  <select
                    name="district"
                    value={form.district}
                    onChange={field("district")}
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
                    <p className="text-red-500 text-sm mt-1">
                      {errors.district_id}
                    </p>
                  )}
                </div>
              )}



              <Select
                label="Boat Type *"
                name="type"
                value={form.type}
                onChange={field("type")}
                options={["Hybrid", "Engine Driven", "Manual (Paddle/Oar)"]}
                error={errors.boat_type}
              />

              {(form.type === "Hybrid" || form.type === "Engine Driven") && (
                <div className="">
                  <Input
                    label="Engine Details"
                    name="engine"
                    value={form.engine}
                    onChange={field("engine")}
                    placeholder="Enter Engine Details"
                  />
                </div>
              )}


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

              {/* Pilot Details Section */}
              <div className="col-span-full mt-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
                  Pilot Details
                </h2>
              </div>

              <Input
                label="Name *"
                name="pilotName"
                value={form.pilotName}
                onChange={field("pilotName")}
                error={errors.pilot_name}
                placeholder="Enter Pilot Name"
              />

              <Input
                label="License Number *"
                name="license"
                value={form.license}
                onChange={field("license")}
                error={errors.pilot_license_no}
                placeholder="Enter License Number"
              />

              <Input
                label="Aadhaar Number *"
                name="addharNo"
                value={form.addharNo}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  if (val.length <= 12) {
                    field("addharNo")({ target: { value: val } });
                  }
                }}
                maxLength={12}
                inputMode="numeric"
                error={errors.adhar_no}
                placeholder="Enter Aadhaar Number"
              />

              <Input
                label="Contact Number *"
                name="contactNo"
                value={form.contactNo}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  if (val.length <= 10) {
                    field("contactNo")({ target: { value: val } });
                  }
                }}
                maxLength={10}
                inputMode="numeric"
                error={errors.contact_no}
                placeholder="Enter Contact Number"
              />

            </div>


            <div className="md:col-span-2 mt-5">
              <label className="text-sm font-medium mb-2">
                Additional Remarks
              </label>
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
  disabled={
    saving || 
    (boatPhotoFile && !boatLocationStatus.loaded) || 
    (pilotPhotoFile && !pilotLocationStatus.loaded)
  }
  className={`bg-green-600 hover:bg-green-700 text-white font-semibold px-10 py-2 rounded-full transition ${
    saving || 
    (boatPhotoFile && !boatLocationStatus.loaded) || 
    (pilotPhotoFile && !pilotLocationStatus.loaded) 
      ? "opacity-50 cursor-not-allowed" 
      : ""
  }`}
>
  {saving ? "Saving..." : "Register Boat"}
</button>
            </div>


          </form>
        </div>
      ) : (
<div className="bg-white rounded-xl shadow-md p-6 sm:p-8 max-w-6xl mx-auto border relative">
          {/* Header + Filter + Export */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <h3 className="text-xl sm:text-2xl font-bold text-sky-700 text-center sm:text-left">
              Registered Boats
            </h3>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <select
                name="district"
                value={form.district}
                onChange={(e) => setForm({ ...form, district: e.target.value })}
                className="w-full sm:w-52 border border-blue-500 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                { (
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
                <p className="text-red-500 text-sm mt-1">
                  {errors.district_id}
                </p>
              )}

              <button
                onClick={() => {
                  const headers = [
                    "Sr.No",
                    "Registration No",
                    "Pilot",
                    "Boat Type",
                    "District",
                    "Status",
                  ];
                  const filteredBoats = form.district
                    ? boats.filter(
                        (b) => String(b.district_id) === form.district
                      )
                    : boats;

                  const rows = filteredBoats.map((boat, index) => [
                    index + 1,
                    `"${boat.boat_uid}"`,
                    `"${boat.pilot_name}"`,
                    `"${boat.boat_type}"`,
                    `"${boat.district?.district_name || "N/A"}"`,
                    `"${boat.status || "Active"}"`,
                  ]);

                  const csvContent = [
                    headers.join(","),
                    ...rows.map((row) => row.join(",")),
                  ].join("\n");

                  const blob = new Blob([csvContent], {
                    type: "text/csv;charset=utf-8;",
                  });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement("a");
                  link.setAttribute("href", url);
                  link.setAttribute(
                    "download",
                    `boat_report_${new Date().toISOString().slice(0, 10)}.csv`
                  );
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-md transition w-full sm:w-auto justify-center"
              >
                <FaDownload className="text-base" />
                <span className="text-sm">Export Report</span>
              </button>
            </div>
          </div>

          {/* Table / Status */}
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
                    <th className="px-4 py-3">Reg. No</th>
                    <th className="px-4 py-3">Pilot</th>
                    <th className="px-4 py-3">Type</th>
                    {user.role_id!==1 && user?.role_id!==2 &&(
                    <th className="px-4 py-3">District</th>
                      )}
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {boats
                    .filter((boat) =>
                      form.district
                        ? String(boat.district_id) === form.district
                        : true
                    )
                    .sort((a, b) => a.boat_uid?.localeCompare(b.boat_uid)) // Optional sorting
                    .map((boat, idx) => (
                      <tr key={boat.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2">{idx + 1}</td>
                        <td className="px-4 py-2 font-semibold">
                          {boat.boat_uid || "N/A"}
                        </td>
                        <td className="px-4 py-2">{boat.pilot_name}</td>
                        <td className="px-4 py-2">{boat.boat_type}</td>
                        {user.role_id!==1 && user?.role_id!==2 &&(
                        <td className="px-4 py-2">
                          {boat.district?.district_name || "—"}
                        </td>
                          )}
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
                              navigate(
                                `/dashboard/boats/boatdetailsone/${boat.id}`,
                                {
                                  state: { ...boat, readOnly: true },
                                }
                              )
                            }
                            className="text-sky-600 hover:text-sky-800"
                            title="View"
                          >
                            <FaEye className="text-lg" />
                          </button>
                          {user?.role_id !== 1 && (
                            <button
                              onClick={() =>
                                navigate(
                                  `/dashboard/boats/boatdetails/${boat.id}`,
                                  {
                                    state: boat,
                                  }
                                )
                              }
                              className="text-green-600 hover:text-green-800"
                              title="Edit"
                            >
                              <FaEdit className="text-lg" />
                            </button>
                          )}
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