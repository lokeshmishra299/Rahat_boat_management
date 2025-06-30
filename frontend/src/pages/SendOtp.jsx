// src/pages/SendOtp.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Footer from "../components/Footer";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE ?? "http://127.0.0.1:8000/api",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

const SendOtp = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const email = state?.email || "";

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!email) navigate("/forgot-password");
  }, [email, navigate]);

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const res = await api.post("/verify-otp", { email, otp });
      if (res.data.status === "success") {
        navigate("/reset-password", { state: { email, otp } });
      } else setErrorMessage(res.data.message || "Invalid OTP");
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || "Something went wrong. Try again."
      );
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
          <h2 className="text-center text-2xl font-extrabold text-white mb-1">
            Enter OTP
          </h2>
          <p className="text-center text-sm text-white/80 mb-6">
            5‑digit OTP sent to your registered email
          </p>

          <form onSubmit={handleVerifyOtp} className="space-y-6">
            {/* OTP boxes */}
            <div className="flex justify-between gap-2">
              {[0, 1, 2, 3, 4].map((i) => (
                <input
                  key={i}
                  id={`otp-${i}`}
                  type="text"
                  maxLength={1}
                  className="w-12 h-12 text-center text-lg rounded-md bg-[#1f4068] text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white"
                  value={otp[i] || ""}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (/^\d?$/.test(v)) {
                      const arr = otp.split("");
                      arr[i] = v;
                      setOtp(arr.join(""));
                      if (v && document.getElementById(`otp-${i + 1}`))
                        document.getElementById(`otp-${i + 1}`).focus();
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace" && !otp[i] && i > 0) {
                      document.getElementById(`otp-${i - 1}`)?.focus();
                    }
                  }}
                />
              ))}
            </div>

            {errorMessage && (
              <p className="text-sm text-red-600">{errorMessage}</p>
            )}

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
              {loading ? "Verifying…" : "VERIFY OTP"}
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

export default SendOtp;