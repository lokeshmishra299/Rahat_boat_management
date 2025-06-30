// src/pages/ResetPassword.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import Footer from "../components/Footer";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE ?? "http://127.0.0.1:8000/api",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

const ResetPassword = () => {
  const navigate   = useNavigate();
  const { state }  = useLocation();
  const email      = state?.email ?? "";
  const otp        = state?.otp ?? "";

  const [password, setPassword]             = useState("");
  const [confirmPassword, setConfirmPwd]    = useState("");
  const [showPwd, setShowPwd]               = useState(false);
  const [loading, setLoading]               = useState(false);
  const [errors, setErrors]                 = useState({});

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
      } else toast.error(err.response?.data?.message || "Something went wrong.");
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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#e3a5b6] via-[#d1a4cb] to-[#5782c4] text-gray-900">
      <Toaster position="top-right" />

      {/* Centered Card */}
      <div className="flex-grow flex items-center mt-10 justify-center px-4">
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

          <h1 className="text-center text-lg font-bold text-[#1f4068] tracking-wide mb-1">
            Rahat Boat Management
          </h1>
          <p className="text-center text-sm text-white/80 mb-4">
            Please set your new password
          </p>

          <form onSubmit={handleReset} className="space-y-4">
            {/* New password */}
            <div>
              <label className="block text-sm font-medium mb-1">
                New Password
              </label>
              <span className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-md bg-[#1f4068] px-4 py-3 pr-10 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/80"
                >
                  {showPwd ? <FaEyeSlash /> : <FaEye />}
                </button>
              </span>
              {renderErrors("password")}
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Confirm Password
              </label>
              <input
                type={showPwd ? "text" : "password"}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPwd(e.target.value)}
                className="w-full rounded-md bg-[#1f4068] px-4 py-3 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white"
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