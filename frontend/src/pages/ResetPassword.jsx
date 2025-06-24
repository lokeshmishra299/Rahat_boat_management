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
  const navigate = useNavigate();
  const location = useLocation();
  const { email, otp } = location.state || {};

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleReset = async (e) => {
    e.preventDefault();
    setErrors({});

    setLoading(true);
    try {
      const response = await api.post("/reset-password", {
        email,
        otp,
        password,
        password_confirmation: confirmPassword,
      });

      if (response.data.status === "success") {
        toast.success("Password reset successfully!");
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      } else {
        toast.error(response.data.message || "Reset failed.");
      }
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.data || {});
      } else if (err.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error("Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  };

  const renderErrors = (field) =>
    errors[field]?.map((msg, idx) => (
      <p key={idx} className="text-sm text-red-600 mt-1">
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
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-br from-indigo-200 to-slate-200 relative overflow-hidden text-gray-900">
      <Toaster position="top-right" />
      <motion.div className="absolute -top-32 left-1/2 -translate-x-1/2 h-[28rem] w-[28rem] bg-emerald-500/40 blur-[120px] rounded-full" />
      <motion.div className="absolute -bottom-40 right-1/2 translate-x-1/3 h-[24rem] w-[24rem] bg-fuchsia-600/40 blur-[120px] rounded-full" />

      <div className="flex-grow flex justify-center items-center px-4 sm:px-8 py-10">
        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="relative z-10 w-full max-w-sm bg-gray-300 backdrop-blur-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] rounded-lg p-6"
        >
          <motion.div
            initial={{ rotateY: 90 }}
            animate={{ rotateY: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="flex justify-center mb-4"
          >
            <img
              src="/images/Rahat.jpeg"
              alt="Relief Commissioner logo"
              className="h-20 w-20 object-cover rounded-full ring-4 ring-white/30"
            />
          </motion.div>

          <h1 className="text-xl font-extrabold text-center tracking-wide mb-2">
            Rahat Boat Management
          </h1>

          <p className="text-center text-sm text-slate-600 mb-6">
            Please set your new password
          </p>

          <form onSubmit={handleReset} className="space-y-4">
            <label className="block">
              <span className="block text-sm font-medium mb-1">New Password</span>
              <span className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="peer w-full rounded-lg bg-white/90 px-4 py-2 pr-10 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 peer-focus:text-emerald-600"
                >
                  {showPwd ? <FaEyeSlash /> : <FaEye />}
                </button>
              </span>
              {renderErrors("password")}
            </label>

            <label className="block">
              <span className="block text-sm font-medium mb-1">Confirm Password</span>
              <input
                type={showPwd ? "text" : "password"}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-lg bg-white/90 px-4 py-2 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition shadow-inner"
              />
              {renderErrors("confirm_password")}
            </label>

            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              type="submit"
              disabled={loading}
              className={`w-full py-2 rounded-lg font-semibold tracking-wide transition focus:outline-none focus:ring-2 shadow-lg ${
                loading
                  ? "bg-emerald-400 cursor-not-allowed"
                  : "bg-blue-500 text-white focus:ring-emerald-400 shadow-emerald-600/30"
              }`}
            >
              {loading ? "Resetting…" : "Reset Password"}
            </motion.button>
          </form>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
};

export default ResetPassword;
