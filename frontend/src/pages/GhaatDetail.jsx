import React, { useEffect, useState, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaCamera } from "react-icons/fa";
import ReactWebcam from "react-webcam";
import { Toaster, toast } from 'react-hot-toast';



const BASE_URL = import.meta.env.VITE_API_BASE ?? "http://localhost:8000/api";

const token = localStorage.getItem("access_token");

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  },
});


const toTitleCase = (str) => {
  return str.replace(/\w\S*/g, (txt) =>
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

export default function GhaatDetail() {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));


  const [ghaat, setGhaat] = useState(state || null);
  const [draft, setDraft] = useState(state || null);
  const [loading, setLoading] = useState(!state);
  const [districts, setDistricts] = useState([]);
  const [rivers, setRivers] = useState([]);
  

  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});
  const [editing, setEditing] = useState(null);
  const [temp, setTemp] = useState("");
  const [imgDraft, setImgDraft] = useState(null);
  const [saving, setSaving] = useState(false);


  const [coords, setCoords] = useState({ lat: "", lon: "" });
  const [pincode, setPincode] = useState("");
  const [locationName, setLocationName] = useState("");

  const [showCamera, setShowCamera] = useState(false);
  const webcamRef = useRef(null);

  const getPincode = async (lat, lon) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
      const data = await res.json();
      return data.address.postcode || "";
    } catch {
      return "";
    }
  };

  const getLocationFromPincode = async (pin) => {
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
      const data = await res.json();
      if (data[0].Status === "Success" && data[0].PostOffice?.length > 0) {
        const postOffice = data[0].PostOffice[0];
        return `${postOffice.Name}, ${postOffice.District}`;
      }
    } catch {
      return "";
    }
    return "";
  };

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
    setImgDraft(file);
    setShowCamera(false);

    navigator.geolocation.getCurrentPosition(async (pos) => {
      const lat = pos.coords.latitude.toFixed(6);
      const lon = pos.coords.longitude.toFixed(6);
      setCoords({ lat, lon });

      const pin = await getPincode(lat, lon);
      setPincode(pin);
      let loc = "";

      if (pin) {
        loc = await getLocationFromPincode(pin);
        setLocationName(loc);
      }
      setDraft((prev) => ({
        ...prev,
        latitude: lat,
        longitude: lon,
        pincode: pin,
        location: loc,
      }));

    });
  };

  useEffect(() => {
    if (state) return;
    api
      .get(`/ghaat-list/${id}`)
      .then((r) => {
        if (r.data?.status === "success") {
          setGhaat(r.data.data);
          setDraft(r.data.data);
        } else {
          setError("Ghat not found.");
        }
      })
      .catch(() => setError("Could not load ghat details."))
      .finally(() => setLoading(false));
  }, [id, state]);



  useEffect(() => {
    api.get("/district-list")
      .then(res => {
        if (res.data?.status === "success") setDistricts(res.data.data);
      })
      .catch(() => console.error("Failed to load districts"));

    api.get("/river-list")
      .then(res => {
        if (res.data?.status === "success") setRivers(res.data.data);
      })
      .catch(() => console.error("Failed to load rivers"));
  }, []);

  useEffect(() => {
    if (draft?.latitude && draft?.longitude) {
      setCoords({ lat: draft.latitude, lon: draft.longitude });
      getPincode(draft.latitude, draft.longitude).then((pin) => {
        setPincode(pin);
        if (pin) {
          getLocationFromPincode(pin).then(setLocationName);
        }
      });
    }
  }, [draft?.latitude, draft?.longitude]);

  if (loading) return <p className="p-6">Loading…</p>;
  if (error) return <p className="p-6 text-red-500">{error}</p>;
  if (!draft) return null;

  const startEdit = (k) => {
    setEditing(k);
    setTemp(draft[k] ?? "");

  setErrors((prev) => {
    const newErrors = { ...prev };
    delete newErrors[k];
    return newErrors;
  });
};

  const commit = (k) => {
    setDraft({ ...draft, [k]: temp });
    setEditing(null);
  };

  const handleSaveAll = () => {
    setSaving(true);
    setErrors({});

    const formData = new FormData();
    [
      ["ghaat_name", draft.ghaat_name],
      ["latitude", draft.latitude],
      ["longitude", draft.longitude],
      ["pincode", draft.pincode],
      ["location", draft.location],
      ["district_id", draft.district_id],
      ["river_id", draft.river_id],
      ["boat_capacity", draft.boat_capacity],
      ["road_accessibility", draft.road_accessibility],
      ["contact_person", draft.contact_person],
      ["contact_number", draft.contact_number],
      ["nearest_hospital", draft.nearest_hospital],
      ["available_facilities", draft.available_facilities],
      ["additional_info", draft.additional_info],
      ["status", draft.status || "0"],
    ].forEach(([k, v]) => formData.append(k, v || ""));

    if (imgDraft) formData.append("photo_path", imgDraft);

    api
      .post(`/edit-ghaat-details/${ghaat.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => {
          console.log("API Response:", r.data);

        if (r.data?.status === "success") {
          setGhaat(r.data.data);
                toast.success("Ghat details updated successfully!");
          navigate("/dashboard/ghaats");
        } else if (r.data?.errors) {
              console.log("Validation errors:", r.data.errors);

          setErrors(r.data.errors);
        }
      }).catch((err) => {
  console.log("API error:", err.response?.data);
  if (err.response?.data?.errors) setErrors(err.response.data.errors);
})
      .finally(() => setSaving(false));
  };

const EditableCell = ({ k, label, value, districts, rivers, editing, temp, setTemp, startEdit, commit, errors }) => {
  const isReadOnly = ["location", "pincode", "registered_boats_count"].includes(k);
  const isNumberOnly = k === "boat_capacity" || k === "contact_number";
  const isStringOnly = k === "contact_person";

  // District dropdown
  if (k === "district_id") {
    return (
      <div>
        <p className="text-xs text-gray-500 font-semibold mb-1">{label}</p>
        {editing === k ? (
          <>
            <select
              value={temp}
              onChange={(e) => setTemp(e.target.value)}
              onBlur={() => commit(k)}
              className="w-full bg-white border border-indigo-400 rounded px-3 py-2 text-sm"
              autoFocus
            >
              <option value="">Select District</option>
              {districts.map(d => (
                <option key={d.id} value={d.id}>{d.district_name}</option>
              ))}
            </select>
            {errors[k] && <p className="text-xs text-red-500">{errors[k][0]}</p>}
          </>
        ) : (
          <div
            onClick={() => startEdit(k)}
            className="bg-gray-100 rounded-md px-3 py-2 text-sm text-gray-800 border cursor-pointer"
          >
            {districts.find(d => d.id === value)?.district_name || "—"}
          </div>
        )}
      </div>
    );
  }

  // Road Accessibility dropdown
  if (k === "road_accessibility") {
    const options = [
      "Excellent(Paved Road)",
      "Good(Metalled Road)",
      "FairGravel Road)",
      "Poor(Kutcha Road)"
    ];

    return (
      <div>
        <p className="text-xs text-gray-500 font-semibold mb-1">{label}</p>
        {editing === k ? (
          <>
            <select
              value={temp}
              onChange={(e) => setTemp(e.target.value)}
              onBlur={() => commit(k)}
              className="w-full bg-white border border-indigo-400 rounded px-3 py-2 text-sm"
              autoFocus
            >
              <option value="">Select Accessibility</option>
              {options.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            {errors[k] && <p className="text-xs text-red-500">{errors[k][0]}</p>}
          </>
        ) : (
          <div
            onClick={() => startEdit(k)}
            className="bg-gray-100 rounded-md px-3 py-2 text-sm text-gray-800 border cursor-pointer"
          >
            {value || "—"}
          </div>
        )}
      </div>
    );
  }

  // River dropdown
  if (k === "river_id") {
    return (
      <div>
        <p className="text-xs text-gray-500 font-semibold mb-1">{label}</p>
        {editing === k ? (
          <>
            <select
              value={temp}
              onChange={(e) => setTemp(e.target.value)}
              onBlur={() => commit(k)}
              className="w-full bg-white border border-indigo-400 rounded px-3 py-2 text-sm"
              autoFocus
            >
              <option value="">Select River</option>
              {rivers.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
            {errors[k] && <p className="text-xs text-red-500">{errors[k][0]}</p>}
          </>
        ) : (
          <div
            onClick={() => startEdit(k)}
            className="bg-gray-100 rounded-md px-3 py-2 text-sm text-gray-800 border cursor-pointer"
          >
            {rivers.find(r => r.id === value)?.name || "—"}
          </div>
        )}
      </div>
    );
  }

  // Default Input (Text or Number)
  return (
    <div>
      <p className="text-xs text-gray-500 font-semibold mb-1">{label}</p>
      {editing === k && !isReadOnly ? (
        <input
          type={isNumberOnly ? "number" : "text"}
          value={temp}
          onChange={(e) => {
            const val = e.target.value;
            if (isNumberOnly) {
              if (val === "" || /^[0-9\b]+$/.test(val)) {
                setTemp(val);
              }
            } else if (isStringOnly) {
              if (val === "" || /^[a-zA-Z\s\b]+$/.test(val)) {
                setTemp(val);
              }
            } else if (k === "ghaat_name") {
              if (val === "" || /^[a-zA-Z\s]+$/.test(val)) {
                setTemp(val);
              }
            } else {
              setTemp(val);
            }
          }}
          onBlur={() => commit(k)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), commit(k))}
          className={`w-full bg-white rounded px-3 py-2 text-sm border ${
            errors[k] ? "border-red-500" : "border-indigo-400"
          }`}
          autoFocus
        />
      ) : (
        <div
          onClick={() => !isReadOnly && startEdit(k)}
          className={`bg-gray-100 rounded-md px-3 py-2 text-sm border ${
            isReadOnly ? "cursor-default" : "cursor-pointer"
          } ${!value ? "text-gray-400 " : "text-gray-800"}`}
          style={{ minHeight: "2.5rem" }}
        >
          {value || `Enter ${toTitleCase(label)}`}
        </div>
      )}
      {errors[k] && <p className="text-xs text-red-500 mt-1">{errors[k][0]}</p>}
    </div>
  );
};


  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-md border space-y-10">
      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold text-indigo-700 mb-1">
          🏜️ Ghat Details – {draft.ghaat_name}
        </h1>
        {/* <p className="text-sm text-gray-500">Unique ID: {draft.id}</p> */}
      </div>
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
  <EditableCell k="ghaat_name" label="Ghat Name" value={draft.ghaat_name} districts={districts} rivers={rivers} editing={editing} temp={temp} setTemp={setTemp} startEdit={startEdit} commit={commit} errors={errors} />
  {/* <EditableCell k="location" label="Location" value={draft.location} districts={districts} rivers={rivers} editing={editing} temp={temp} setTemp={setTemp} startEdit={startEdit} commit={commit} errors={errors} /> */}
  {/* <EditableCell k="pincode" label="Pincode" value={draft.pincode} districts={districts} rivers={rivers} editing={editing} temp={temp} setTemp={setTemp} startEdit={startEdit} commit={commit} errors={errors} /> */}
  <EditableCell k="boat_capacity" label="Boat Capacity" value={draft.boat_capacity} districts={districts} rivers={rivers} editing={editing} temp={temp} setTemp={setTemp} startEdit={startEdit} commit={commit} errors={errors} />
  <EditableCell k="road_accessibility" label="Road Accessibility" value={draft.road_accessibility} districts={districts} rivers={rivers} editing={editing} temp={temp} setTemp={setTemp} startEdit={startEdit} commit={commit} errors={errors} />
  {/* <EditableCell k="contact_person" label="Contact Person" value={draft.contact_person} districts={districts} rivers={rivers} editing={editing} temp={temp} setTemp={setTemp} startEdit={startEdit} commit={commit} errors={errors} />
  <EditableCell k="contact_number" label="Contact Number" value={draft.contact_number} districts={districts} rivers={rivers} editing={editing} temp={temp} setTemp={setTemp} startEdit={startEdit} commit={commit} errors={errors} /> */}
  <EditableCell k="nearest_hospital" label="Nearest Hospital" value={draft.nearest_hospital} districts={districts} rivers={rivers} editing={editing} temp={temp} setTemp={setTemp} startEdit={startEdit} commit={commit} errors={errors} />
  <EditableCell k="available_facilities" label="Available Facilities" value={draft.available_facilities} districts={districts} rivers={rivers} editing={editing} temp={temp} setTemp={setTemp} startEdit={startEdit} commit={commit} errors={errors} />
  <EditableCell k="additional_info" label="Additional Info" value={draft.additional_info} districts={districts} rivers={rivers} editing={editing} temp={temp} setTemp={setTemp} startEdit={startEdit} commit={commit} errors={errors} />
  <EditableCell k="registered_boats_count" label="Registered Boats" value={draft.registered_boats_count} districts={districts} rivers={rivers} editing={editing} temp={temp} setTemp={setTemp} startEdit={startEdit} commit={commit} errors={errors} />
  {user?.role_id !== 2 && (
  <EditableCell
    k="district_id"
    label="District"
    value={draft.district_id}
    districts={districts}
    rivers={rivers}
    editing={editing}
    temp={temp}
    setTemp={setTemp}
    startEdit={startEdit}
    commit={commit}
    errors={errors}
  />
)}

  <EditableCell k="river_id" label="River" value={draft.river_id} districts={districts} rivers={rivers} editing={editing} temp={temp} setTemp={setTemp} startEdit={startEdit} commit={commit} errors={errors} />
</div>

<div className="mt-8">
  <h2 className="text-xl font-semibold text-gray-700 mb-3 text-center">
    Ghat Photo
  </h2>

  {showCamera && (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-50 p-4">
      <ReactWebcam
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

  <div className="w-full flex flex-col items-center justify-center">
    {imgDraft ? (
      <img
        src={URL.createObjectURL(imgDraft)}
        alt="Preview"
        className="w-full sm:w-80 h-64 object-cover rounded shadow border mb-3"
      />
    ) : draft.photo_path ? (
      <img
        src={`http://localhost:8000/storage/${draft.photo_path}`}
        alt="Ghaat"
        className="w-full sm:w-80 h-64 object-cover rounded shadow border mb-3"
      />
    ) : (
      <p className="italic text-gray-400 mb-2">No image available</p>
    )}


    <div className="mt-3 text-sm text-gray-600 text-center">
      {/* <p>
        Latitude: <span className="font-medium">{coords.lat || "—"}</span>
      </p>
      <p>
        Longitude: <span className="font-medium">{coords.lon || "—"}</span>
      </p> */}
      <p>
        Pincode: <span className="font-medium">{pincode || "—"}</span>
      </p>
      <p>
        Location: <span className="font-medium">{locationName || "—"}</span>
      </p>
    </div>

         <div className="flex gap-2 mt-4 justify-center">
  <button
    onClick={() => setShowCamera(true)}
    className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded font-medium transition"
  >
    <FaCamera className="text-base" /> Update Photo
  </button>

  <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded font-medium transition">
    <FaCamera className="text-base" /> Upload Photo
    <input
      type="file"
      accept="image/*"
      className="hidden"
      onChange={(e) => e.target.files[0] && setImgDraft(e.target.files[0])}
    />
  </label>
</div>
  </div>
</div>


      <div className="pt-4 border-t flex justify-center">
        <button
          onClick={handleSaveAll}
          disabled={saving}
          className="px-6 py-3 bg-indigo-600 text-white rounded font-medium disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
