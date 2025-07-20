import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FaTrash, FaUserTie } from "react-icons/fa";
import toast from "react-hot-toast";
import { Navigate, useNavigate } from "react-router-dom";
import Webcam from "react-webcam";
import { FaCamera } from "react-icons/fa";

const BASE_URL = import.meta.env.VITE_API_BASE ?? "http://localhost:8000/api";
const token = localStorage.getItem("access_token");
const user = JSON.parse(localStorage.getItem("user"));

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  },
});

const BoatOwners = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    number: "",
    adhar_no: "",
    boat_owned: "",
    dob: "",
    pincode: "",
    district_id: user?.role_id === 2 ? user.district_id : "",
    latitude: "",
  longitude: "",
  location: "", 
  });

  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [locationLoaded, setLocationLoaded] = useState(false);


  const webcamRef = useRef(null);
  const [showCamera, setShowCamera] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoName, setPhotoName] = useState("");
  const [coords, setCoords] = useState({ lat: "", lon: "" });
  const [locationName, setLocationName] = useState("");

  const [districts, setDistricts] = useState([]);

  useEffect(() => {
    api
      .get("/district-list")
      .then((res) => setDistricts(res.data.data || []))
      .catch((err) => console.error("Failed to fetch districts", err));
  }, []);

const fetchLocation = () => {
  setLocationLoaded(false);

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;
      setCoords({ lat: latitude, lon: longitude });

      try {
        const res = await fetch(
          `${BASE_URL}/reverse-geocode?lat=${latitude}&lon=${longitude}`
        );
        const data = await res.json();

        const address = data.display_name || "";
        const pincode = data.address?.postcode || "";

        setLocationName(address);

        setForm((prev) => ({
          ...prev,
          latitude,
          longitude,
          location: address,
          pincode: pincode,
        }));

        setTimeout(() => {
          setLocationLoaded(true);
        }, 1000);
      } catch (err) {
        console.error("Error fetching reverse geocode:", err);
        setLocationLoaded(false);
      }
    },
    (error) => {
      console.error("Error fetching location:", error);
      setLocationLoaded(false);
    }
  );
};


  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

const captureFromWebcam = () => {
  const imageSrc = webcamRef.current.getScreenshot();
  if (imageSrc) {
    const byteString = atob(imageSrc.split(",")[1]);
    const mimeString = imageSrc.split(",")[0].split(":")[1].split(";")[0];

    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    const blob = new Blob([ab], { type: mimeString });
    const file = new File([blob], "webcam-photo.jpg", { type: mimeString });

    setPhotoFile(file);
    setPhotoName("captured.jpg");
    setShowCamera(false);

    // ✅ Fetch location AFTER capturing photo
    fetchLocation();
  }
};


  const handleMemberChange = (index, value) => {
    const updated = [...members];
    updated[index].name = value.replace(/[^a-zA-Z\s]/g, "");
    setMembers(updated);
  };

  const addMember = () => {
    setMembers([...members, { name: "" }]);
  };

  const removeMember = (index) => {
    const updated = [...members];
    updated.splice(index, 1);
    setMembers(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!locationLoaded) {
    toast.error("Please wait, fetching location...");
    return;
  }

    setLoading(true);
    setMessage("");
    setErrors({});

    const formData = new FormData();

formData.append("name", form.name);
formData.append("number", form.number);
formData.append("email", form.email);
formData.append("adhar_no", form.adhar_no);
formData.append("boat_owned", form.boat_owned);
formData.append("dob", form.dob);
formData.append("district_id", form.district_id);
formData.append("latitude", form.latitude);
formData.append("longitude", form.longitude);
formData.append("location", form.location);
formData.append("pincode", form.pincode);



    if (photoFile) {
      formData.append("photo", photoFile); // this should match backend field name
    }

    members.forEach((m, index) => {
      formData.append(`owner_family_name[${index}]`, m.name);
    });

    try {
      await api.post("/boat-owner", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Boat owner submitted successfully!");
      navigate("/dashboard/addboatowner");
      setForm({
        name: "",
        email: "",
        number: "",
        adhar_no: "",
        boat_owned: "",
        dob: "",
        pincode: "",
        district_id: user?.role_id === 2 ? user.district_id : "",
      });
      setMembers([]);
      setPhotoFile(null);
      setPhotoName("");
    } catch (error) {
      console.log("Backend Error:", error.response?.data);

      const backendErrors = error.response?.data?.data;
      if (backendErrors) {
        const mappedErrors = {};
        Object.entries(backendErrors).forEach(([key, value]) => {
          if (key.startsWith("owner_family_name")) {
            const match = key.match(/owner_family_name\.(\d+)/);
            if (match) {
              const index = parseInt(match[1]);
              if (!mappedErrors.family) mappedErrors.family = {};
              mappedErrors.family[index] = value[0];
            }
          } else {
            mappedErrors[key] = value[0];
          }
        });
        setErrors(mappedErrors);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 min-h-screen flex justify-center items-start">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-6xl border border-gray-200 bg-white rounded-lg shadow-md p-6"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center rounded-full p-3 shadow">
            <FaUserTie className="text-green-600 text-2xl" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-green-800 mt-4">
            Boat Owner Details
          </h2>
          <p className="text-gray-600 mt-2 max-w-xl mx-auto">
            View and track rescue boats linked to each boat owner.
          </p>
        </div>

        {/* 📷 Webcam + Location Block */}
        <div className="bg-green-50 border border-dashed border-green-300 rounded-lg p-6 text-center mb-8">
          {/* Header Section with Camera Icon */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-white rounded-full p-3 shadow inline-flex">
                <FaCamera className="text-green-500 text-xl" />
              </div>
            </div>

            <p className="text-green-800 font-semibold mb-1">
              Upload Boat Owner Photo (Geo-Tag)
            </p>
            <p className="text-gray-600 text-sm mb-4">
              Capture or upload a photo with GPS coordinates
            </p>

              
              <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                type="button"
                onClick={() => setShowCamera(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full font-medium transition"
              >
                <FaCamera className="inline mr-2" />
                Capture Photo
              </button>
            </div>
             {photoName && (
              <p className="text-sm text-green-700 mt-2">
                Selected: {photoName}
              </p>
            )}
          </div>
        </div>
                <div className={`mb-6 p-3  rounded-lg text-center ${locationName ?"bg-blue-50" : "" } `}>
                 
                  <p className="font-medium text-blue-800">
                    {locationName}
                  </p>
                </div>
          {/* Webcam & Location Section */}
          {showCamera && (
            <div className="fixed inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-50 p-4">
              {/* Webcam View */}
     
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                className="rounded-lg shadow-lg max-w-full w-96"
                  videoConstraints={{facingMode: "environment" }}
                />
            
                  <button
                    type="button"
                    onClick={captureFromWebcam}
                    className="mt-4 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full"
                  >
                     Capture
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCamera(false)}
                    className="mt-2 text-sm text-white underline"
                  >
                    Cancel
                  </button>
           
             
              </div>
                )}

              {/* 📍 Location + Preview */}
          


                {photoFile && (
                  <div className="mb-6 flex justify-center">
                   
                    <img
                      src={URL.createObjectURL(photoFile)}
                      alt="Captured"
                      className="rounded shadow w-[90%] max-w-[400px] object-contain"
                    />
                  </div>
          )}
            

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* <h1 className="text-2xl font-bold mb-6 text-green-600 md:col-span-2">
            Boat Owner Details
          </h1> */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value.replace(/[^a-zA-Z\s]/g, ""),
                })
              }
              className="w-full border-2 rounded px-3 py-2 focus:border-green-500 focus:outline-none"
              placeholder="Enter name"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full border-2 rounded px-3 py-2 focus:border-green-500 focus:outline-none"
              placeholder="Enter email"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {user?.role_id === 2 ? (
            <>
              <input
                type="hidden"
                name="district_id"
                value={form.district_id}
              />
            </>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                District *
              </label>
              <select
                name="district_id"
                value={form.district_id}
                onChange={handleChange}
                className="w-full border-2 rounded px-3 py-2 focus:border-green-500 focus:outline-none"
              >
                <option value="">Select District</option>
                {districts.map((district) => (
                  <option key={district.id} value={district.id}>
                    {district.district_name}
                  </option>
                ))}
              </select>
              {errors.district_id && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.district_id}
                </p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact No *
            </label>
            <input
              type="tel"
              name="number"
              value={form.number}
              onChange={(e) =>
                setForm({
                  ...form,
                  number: e.target.value.replace(/[^0-9]/g, "").slice(0, 10),
                })
              }
              className="w-full border-2 rounded px-3 py-2 focus:border-green-500 focus:outline-none"
              placeholder="Enter contact"
            />
            {errors.number && (
              <p className="text-red-500 text-sm mt-1">{errors.number}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Aadhar No
            </label>
            <input
              type="tel"
              name="adhar_no"
              value={form.adhar_no}
              onChange={(e) =>
                setForm({
                  ...form,
                  adhar_no: e.target.value.replace(/[^0-9]/g, "").slice(0, 12),
                })
              }
              className="w-full border-2 rounded px-3 py-2 focus:border-green-500 focus:outline-none"
              placeholder="Enter Aadhar No"
            />
            {errors.adhar_no && (
              <p className="text-red-500 text-sm mt-1">{errors.adhar_no}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              No of Boats Owned
            </label>
            <input
              type="number"
              name="boat_owned"
              value={form.boat_owned}
              onChange={handleChange}
              className="w-full border-2 rounded px-3 py-2 focus:border-green-500 focus:outline-none"
              placeholder="Enter number of boats"
            />
            {errors.boat_owned && (
              <p className="text-red-500 text-sm mt-1">{errors.boat_owned}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date of Birth *
            </label>
            <input
              type="date"
              name="dob"
              value={form.dob}
              onChange={handleChange}
              className="w-full border-2 rounded px-3 py-2 focus:border-green-500 focus:outline-none"
            />
            {errors.dob && (
              <p className="text-red-500 text-sm mt-1">{errors.dob}</p>
            )}
          </div>

          {/* <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pincode
            </label>
            <input
              type="tel"
              name="pincode"
              value={form.pincode}
              onChange={(e) =>
                setForm({
                  ...form,
                  pincode: e.target.value.replace(/[^0-9]/g, "").slice(0, 6),
                })
              }
              className="w-full border-2 rounded px-3 py-2 focus:border-green-500 focus:outline-none"
              placeholder="Enter Pincode"
            />
            {errors.pincode && (
              <p className="text-red-500 text-sm mt-1">{errors.pincode}</p>
            )}
          </div> */}
        </div>

        {/* Family Members */}
        <div className="mt-10 col-span-1">
          <label className="font-medium text-lg block mb-4 text-sky-700">
            Family Members
          </label>

          {members.map((member, index) => (
            <div
              key={index}
              className="grid md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded border mb-4 items-center"
            >
              <div className="col-span-1">
                <input
                  type="text"
                  placeholder="Name"
                  value={member.name}
                  onChange={(e) => handleMemberChange(index, e.target.value)}
                  className="w-full p-2 border rounded"
                />
                {errors.family?.[index] && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.family[index]}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => removeMember(index)}
                className="text-red-600 hover:text-red-800"
                title="Remove"
              >
                <FaTrash />
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addMember}
            className="mt-2 px-4 py-2 bg-green-600 text-white rounded-full font-semibold hover:bg-green-700"
          >
            Add Family Member
          </button>
        </div>

        {/* Submit */}
        <div className="mt-6 flex justify-center py-5">
          <button
            type="submit"
            disabled={loading}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold px-8 py-2 rounded-full"
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </div>

        {message && (
          <p className="text-center text-sm text-blue-600 font-medium mt-4">
            {message}
          </p>
        )}
      </form>
    </div>
  );
};

export default BoatOwners;