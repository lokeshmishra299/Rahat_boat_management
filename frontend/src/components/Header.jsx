// Header.jsx
import React, { useState, useEffect, useRef } from 'react';
import { FiUser } from 'react-icons/fi';
import { RiLogoutBoxRLine } from 'react-icons/ri';
import { IoClose } from 'react-icons/io5';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';

const Header = () => {
  const [openMenu, setOpenMenu] = useState(false);
  const menuRef = useRef(null);
  const [userName, setUserName] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [profile, setProfile] = useState({ name: '', email: '', designation: '' });
  const [loadingProf, setLoadingProf] = useState(false);
  const [errorProf, setErrorProf] = useState('');

  const navigate = useNavigate();
  const token = localStorage.getItem("access_token");

  const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE ?? "http://127.0.0.1:8000/api",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    withCredentials: true,
  });

  const [passwords, setPasswords] = useState({
    current_password: "",
    password: "",
    password_confirmation: "",
  });
  const [errors, setErrors] = useState({});
  const [updating, setUpdating] = useState(false);

  const handleUpdatePassword = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    setUpdating(true);
    setErrors({});

    // 🔒 Basic frontend validation
    if (!passwords.current_password.trim()) {
      setErrors(prev => ({ ...prev, current_password: "Old password is required" }));
      setUpdating(false);
      return;
    }
    if (!passwords.password.trim()) {
      setErrors(prev => ({ ...prev, password: "New password is required" }));
      setUpdating(false);
      return;
    }
    if (passwords.password !== passwords.password_confirmation) {
      setErrors(prev => ({ ...prev, password_confirmation: "Passwords do not match" }));
      setUpdating(false);
      return;
    }

    try {
      await api.post(`/update-password/${user?.id}`, passwords);
      toast.success("Password updated successfully");
      setShowChangePassword(false);
      setPasswords({
        current_password: "",
        password: "",
        password_confirmation: "",
      });
   } catch (err) {
  const res = err?.response?.data;
  if (res?.errors) {
    setErrors(res.errors); // Laravel style: errors object
  } else if (res?.data && typeof res.data === 'object') {
    setErrors(res.data); // Your custom format: data contains field errors
  } else if (res?.message) {
    setErrors({ current_password: res.message }); // Fallback
  }
}

 finally {
      setUpdating(false);
    }
  };


  useEffect(() => {
    if (!openMenu) return;
    const outside = (e) =>
      menuRef.current && !menuRef.current.contains(e.target) && setOpenMenu(false);
    document.addEventListener('mousedown', outside);
    return () => document.removeEventListener('mousedown', outside);
  }, [openMenu]);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      const parsed = JSON.parse(stored);
      setUserName(parsed.name || "Admin");
    }
  }, []);

  const handleProfile = async () => {
    setOpenMenu(false);
    setShowProfile(true);
    setLoadingProf(true);
    setErrorProf('');
    try {
      const { data } = await api.get("/user-profile");
      const user = data.data;
      setProfile({
        name: user.name || '',
        email: user.email || '',
        designation:
          user.role_id === 1
            ? 'District Nodal'
            : user.role_id === 2
              ? 'Ghat Incharge'
              : 'Admin',
      });
    } catch (err) {
      console.error(err);
      setErrorProf('Could not load profile.');
    } finally {
      setLoadingProf(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await api.post("/logout");
    } catch (err) {
      console.error("Logout error:", err?.response || err);
    } finally {
      localStorage.removeItem("access_token");
      toast.success("Logout Successfully");
      navigate("/login", { replace: true });
    }
  };


  return (
    <>
      <header className="flex flex-wrap items-center justify-between gap-4 px-4 py-4 bg-white shadow-sm">
        <Toaster position="top-right" />
        <div className="flex items-center gap-4 flex-wrap">
          <div className="bg-gradient-to-br from-purple-600 to-purple-800 text-white px-5 py-3 rounded-2xl font-extrabold text-2xl shadow-md">
            UP
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-purple-700">
              Relief Commissioner Portal
            </h1>
            <p className="text-sm text-gray-500 font-medium">
              Advanced Boat Management System · Uttar Pradesh
            </p>
          </div>
        </div>

        <div className="relative flex items-center gap-3 flex-wrap">
          <span className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full shadow-sm">
            🟢 75 Districts Online
          </span>

          <button
            onClick={() => setOpenMenu((p) => !p)}
            className="border px-4 py-1 rounded-md hover:bg-gray-100 transition text-sm font-medium"
          >
            {userName}
          </button>

          {openMenu && (
            <div
              ref={menuRef}
              className="absolute right-0 top-full mt-2 w-48 bg-white border rounded-md shadow-lg z-20 overflow-hidden"
            >
              <button
                onClick={handleProfile}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-purple-50 transition"
              >
                <FiUser className="text-purple-600" size={18} />
                <span>
                  {(() => {
                    const user = JSON.parse(localStorage.getItem("user"));
                    if (user?.role_id === 1) return "District Nodal";
                    if (user?.role_id === 2) return "Ghat Incharge";
                    return "Admin";
                  })()}
                </span>
              </button>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-red-50 border-t transition"
              >
                <RiLogoutBoxRLine className="text-red-600" size={18} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Profile Modal */}
      {showProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md mx-4 p-6 rounded-xl shadow-xl relative animate-fade-in">
            <button
              onClick={() => setShowProfile(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <IoClose size={22} />
            </button>
            <h2 className="text-xl font-semibold text-purple-700 mb-6 text-center">
              User Profile
            </h2>
            {loadingProf ? (
              <p className="text-center text-sm text-gray-500">Loading…</p>
            ) : errorProf ? (
              <p className="text-center text-sm text-red-600">{errorProf}</p>
            ) : (
              <div className="space-y-4">
                <InputField label="Name" value={profile.name} />
                <InputField label="Email" value={profile.email} type="email" />
                <InputField label="Designation" value={profile.designation} />
              </div>
            )}
            <button
              onClick={() => {
                setShowProfile(false);
                setShowChangePassword(true);
              }}
              className="mt-6 w-full py-2 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700 transition"
            >
              Update Password
            </button>
          </div>
        </div>
      )}
      {showChangePassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md mx-4 p-6 rounded-xl shadow-xl relative animate-fade-in">
            <button
              onClick={() => setShowChangePassword(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <IoClose size={22} />
            </button>

            <h2 className="text-xl font-semibold text-purple-700 mb-6 text-center">
              Change Password
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Old Password</label>
                <input
                  type="password"
                  name="current_password"
                  autoComplete="new-password"
                  value={passwords.current_password}
                  onChange={(e) =>
                    setPasswords({ ...passwords, current_password: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-300"
                /> 

              {errors.current_password && (
  <p className="text-red-500 text-sm mt-1">
    {Array.isArray(errors.current_password)
      ? errors.current_password[0]
      : errors.current_password}
  </p>
)}

              </div>

              <div>
                <label className="block text-sm font-medium mb-1">New Password</label>
                <input
                  type="password"
                  value={passwords.password}
                  onChange={(e) =>
                    setPasswords({ ...passwords, password: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-300"
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">
                    {Array.isArray(errors.password) ? errors.password[0] : errors.password}
                  </p>
                )}

              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Confirm Password</label>
                <input
                  type="password"
                  value={passwords.password_confirmation}
                  onChange={(e) =>
                    setPasswords({ ...passwords, password_confirmation: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-300"
                />
                {errors.password_confirmation && (
                  <p className="text-red-500 text-sm mt-1">
                    {Array.isArray(errors.password_confirmation) ? errors.password_confirmation[0] : errors.password_confirmation}
                  </p>
                )}

              </div>
            </div>

            <button
              onClick={handleUpdatePassword}
              className="mt-6 w-full py-2 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700 transition"
              disabled={updating}
            >
              {updating ? "Updating..." : "Update Password"}
            </button>
          </div>
        </div>
      )}

    </>
  );
};

const InputField = ({ label, value, type = 'text' }) => (
  <div>
    <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
    <input
      type={type}
      defaultValue={value}
      className="w-full px-4 py-2 border rounded-lg bg-gray-100 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-300"
    />
  </div>
);

export default Header;