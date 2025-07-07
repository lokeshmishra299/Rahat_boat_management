// Header.jsx
import React, { useState, useEffect, useRef } from 'react';
import { FiUser } from 'react-icons/fi';
import { RiLogoutBoxRLine } from 'react-icons/ri';
import { IoClose } from 'react-icons/io5';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';

const Header = () => {
  /* ───────────────────────────────────────────────────────── dropdown state */
  const [openMenu, setOpenMenu] = useState(false);
  const menuRef = useRef(null);
  const [userName, setUserName] = useState("");

  /* ───────────────────────────────────────────────────────── profile modal  */
  const [showProfile, setShowProfile] = useState(false);
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


  /* ───────── dropdown outside‑click close */
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

  /* ───────── open profile modal & fetch data */
  const handleProfile = async () => {
    setOpenMenu(false);
    setShowProfile(true);
    setLoadingProf(true);
    setErrorProf('');
    try {
      const token = localStorage.getItem('access_token');
      const { data } = await api.get("/user-profile");


      const user = data.data;
     setProfile({
  name: user.name || '',
  email: user.email || '',
  designation:
    user.role_id === 1
      ? 'District Nodal'
      : user.role_id === 2
      ? 'Ghat Nodal'
      : 'Admin',
});

    } catch (err) {
      console.error(err);
      setErrorProf('Could not load profile.');
    } finally {
      setLoadingProf(false);
    }
  };

  /* ───────── sign‑out */
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
      {/* ╭──────────────── Header bar ───────────────╮ */}
      <header className="flex flex-wrap items-center justify-between gap-4 px-4 py-4 bg-white shadow-sm">
        <Toaster position="top-right" />
        {/* Logo + Title */}
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

        {/* Status + Settings */}
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


          {/* Dropdown */}
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
                {/* <span>My Profile</span> */}
                <span>
                  {(() => {
                    const user = JSON.parse(localStorage.getItem("user"));
                    if (user?.role_id === 1) return "District Nodal";
                    if (user?.role_id === 2) return "Ghat Nodal";
                    return "My Profile";
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
      {/* ╰────────────────────────────────────────────╯ */}

      {/* ╭──────────────── Profile Modal ─────────────╮ */}
      {showProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md mx-4 p-6 rounded-xl shadow-xl relative animate-fade-in">
            {/* Close */}
            <button
              onClick={() => setShowProfile(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <IoClose size={22} />
            </button>

            <h2 className="text-xl font-semibold text-purple-700 mb-6 text-center">
              User Profile
            </h2>

            {/* Loading / error */}
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
              onClick={() => setShowProfile(false)}
              className="mt-6 w-full py-2 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
      {/* ╰────────────────────────────────────────────╯ */}
    </>
  );
};

/* ───────── tiny reusable read‑only input component ───────── */
const InputField = ({ label, value, type = 'text' }) => (
  <div>
    <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
    <input
      type={type}
      value={value}
      readOnly
      className="w-full px-4 py-2 border rounded-lg bg-gray-100 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-300"
    />
  </div>
);

export default Header;