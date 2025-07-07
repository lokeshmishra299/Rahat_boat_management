// src/pages/ResetPassword.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import Footer from "../components/Footer";

const token = localStorage.getItem("access_token");

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE ?? "http://127.0.0.1:8000/api",
  headers: {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }), // dynamically add token if available
  },
  withCredentials: true, // only required if your Laravel Sanctum setup uses cookies
});


const ResetPassword = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const email = state?.email ?? "";
  const otp = state?.otp ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPwd] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleReset = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      const { data } = await api.post("/reset-password", {
        email,
        otp,
        password,
        password_confirmation: confirmPassword,
      });

      if (data.status === "success") {
        toast.success("Password reset successfully!");
        setTimeout(() => navigate("/login"), 1200);
      } else {
        toast.error(data.message || "Reset failed.");
      }
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.data || {});
      } else {
        toast.error(err.response?.data?.message || "Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  };

  const renderErrors = (field) =>
    errors[field]?.map((msg, i) => (
      <p key={i} className="text-sm text-red-600 mt-1">
        {msg}
      </p>
    ));

  const container = {
    hidden: { opacity: 0, scale: 0.9, y: 40 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.7, ease: "easeOut" },
    },
  };

  return (
    <div className="relative min-h-screen flex flex-col text-gray-900 bg-gradient-to-br from-[#e3a5b6] via-[#d1a4cb] to-[#5782c4]">
      <Toaster position="top-right" />

      {/* Background Layers */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('/images/boat3.jpg')` }}
      />
      <div className="absolute inset-0 bg-black/20" />
      <div className="absolute inset-0 bg-gradient-to-br from-[#000000]/15" />

      {/* Centered Card */}
      <div className="relative flex-grow flex items-center mt-10 justify-center px-4">
        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md rounded-2xl bg-white/20 backdrop-blur-xl shadow-xl p-4 sm:p-6"
        >
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <div className="bg-[#0b2d5e] rounded-full p-2 ring-4 ring-white/30">
              <img
                src="/images/Rahat.jpeg"
                alt="Rahat logo"
                className="h-20 w-20 sm:h-24 sm:w-24 rounded-full object-cover"
              />
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-center text-lg font-bold text-[#1f4068] tracking-wide mb-1">
            Rahat Boat Management
          </h1>
          <h2 className="text-center text-2xl font-extrabold text-white mb-1">
            Reset Password
          </h2>
          <p className="text-center text-sm text-white/80 mb-4">
            Please set your new password
          </p>

          <form onSubmit={handleReset} className="space-y-4">
            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-10 rounded-md bg-[#1f4068] text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/80"
                >
                  {showPwd ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {renderErrors("password")}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Confirm Password
              </label>
              <input
                type={showPwd ? "text" : "password"}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPwd(e.target.value)}
                className="w-full px-4 py-3 rounded-md bg-[#1f4068] text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white"
              />
              {renderErrors("confirm_password")}
            </div>

            {/* Submit */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-md text-white font-semibold transition ${
                loading
                  ? "bg-blue-300 cursor-not-allowed"
                  : "bg-[#1f4068] hover:bg-[#163358]"
              }`}
            >
              {loading ? "Resetting…" : "RESET PASSWORD"}
            </motion.button>
          </form>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="text-center text-white text-sm opacity-80">
        <Footer />
      </footer>
    </div>
  );
};

export default ResetPassword;