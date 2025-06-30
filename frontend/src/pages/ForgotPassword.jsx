// src/pages/ForgotPassword.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaEnvelope, FaArrowLeft } from "react-icons/fa"; // ← added
import Footer from "../components/Footer";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE ?? "http://127.0.0.1:8000/api",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

const handleReset = async (e) => {
  e.preventDefault();
  setLoading(true);
  setErrorMessage("");

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email.trim()) {
    setErrorMessage("Email is required.");
    setLoading(false);
    return;
  }

  if (!emailRegex.test(email)) {
    setErrorMessage("Please enter a valid email address.");
    setLoading(false);
    return;
  }

  try {
    const checkRes = await api.post("/forgot-password-check", { email });
    if (checkRes.data.status === "success") {
      const otpRes = await api.post("/send-otp", { email });
      if (otpRes.data.status === "success") {
        setEmail("");
        toast.success("OTP sent successfully");
        navigate("/send-otp", { state: { email } });
      } else {
        setErrorMessage(otpRes.data.message || "Failed to send OTP.");
      }
    } else {
      setErrorMessage(checkRes.data.message || "Email check failed.");
    }
  } catch (err) {
    if (err.response?.status === 422) {
      const errors = err.response.data.data;
      if (errors?.email) setErrorMessage(errors.email);
      else setErrorMessage("Validation failed. Check input.");
    } else if (err.response?.data?.message) {
      setErrorMessage(err.response.data.message);
    } else setErrorMessage("Something went wrong.");
  } finally {
    setLoading(false);
  }
};


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
      <div className="flex-grow flex items-center mt-10 justify-center px-4">
        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md rounded-2xl bg-white/20 backdrop-blur-xl shadow-xl p-4 sm:p-6"
        >
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
          <h2 className="text-center text-2xl font-extrabold text-white mb-1">
            Forgot Password
          </h2>
          <p className="text-center text-sm text-white/80 mb-4">
            Enter your registered email to reset your password
          </p>

          <form onSubmit={handleReset} className="space-y-4">
            <div className="relative">
              <input
                type="text"
                required
                placeholder="Email ID"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 pr-10 rounded-md bg-[#1f4068] text-white placeholder-white/80 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <FaEnvelope className="absolute right-3 top-1/2 -translate-y-1/2 text-white/80" />
            </div>

            {errorMessage && (
              <p className="text-sm text-red-600">{errorMessage}</p>
            )}

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
              {loading ? "Sending…" : "SEND OTP CODE"}
            </motion.button>

            {/* ⬅️ Back to login below OTP button */}
            {/* ⬅️ Back to login centered below button */}
<div className="text-center mt-3">
  <button
    type="button"
    onClick={() => navigate("/login")}
    className="text-sm text-[#163358] hover:underline font-semibold inline-flex items-center gap-2 justify-center"
  >
    <FaArrowLeft />
    Back to Login
  </button>
</div>

          </form>
        </motion.div>
      </div>

      <footer className="text-center text-white text-sm opacity-80">
        <Footer />
      </footer>
    </div>
  );
};

export default ForgotPassword;