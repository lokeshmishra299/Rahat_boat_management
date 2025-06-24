import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaLock } from "react-icons/fa";
import Footer from "../components/Footer";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE ?? "http://127.0.0.1:8000/api",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

const SendOtp = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || ""; 

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!email) {
      navigate("/forgot-password");
    }
  }, [email, navigate]);

const handleVerifyOtp = async (e) => {
  e.preventDefault();
  setLoading(true);
  setErrorMessage("");

  try {
    const response = await api.post("/verify-otp", { email, otp });

    if (response.data.status === "success") {
      navigate("/reset-password", { state: { email, otp } });
    } else {
      setErrorMessage(response.data.message || "Invalid OTP");
    }
  } catch (err) {
    console.error("OTP verify error:", err);

    if (err.response && err.response.data && err.response.data.message) {
      setErrorMessage(err.response.data.message);
    } else {
      setErrorMessage("Something went wrong. Try again later.");
    }
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
    <div className="h-screen w-full flex justify-center items-center bg-gradient-to-br from-indigo-200 to-slate-200 relative overflow-hidden text-gray-900 px-4 sm:px-8 py-4">

      <motion.div className="absolute -top-32 left-1/2 -translate-x-1/2 h-[28rem] w-[28rem] bg-emerald-500/40 blur-[120px] rounded-sm" />
      <motion.div className="absolute -bottom-40 right-1/2 translate-x-1/3 h-[24rem] w-[24rem] bg-fuchsia-600/40 blur-[120px] rounded-full" />

      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-[92%] max-w-sm bg-gray-300 backdrop-blur-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] rounded-lg p-8"
      >

        <motion.div initial={{ rotateY: 90 }} animate={{ rotateY: 0 }} transition={{ delay: 0.5, duration: 0.6 }} className="flex justify-center mb-4">
          <img src="/images/Rahat.jpeg" alt="Relief Commissioner logo" className="h-20 w-20 object-cover rounded-full ring-4 ring-white/30" />
        </motion.div>

        <h1 className="text-xl font-extrabold text-center tracking-wide mb-4">
          Rahat Boat Management
        </h1>

        <h1 className="text-2xl font-extrabold text-center tracking-wide text-blue-700">
          Please Enter OTP
        </h1>
        <p className="text-center text-sm text-slate-600 mt-2 mb-8">
          5 digit OTP has been sent to your registered Email ID.
        </p>

        <form onSubmit={handleVerifyOtp} className="space-y-6">
          <label className="block">
            <span className="block text-sm font-medium mb-2">Enter OTP</span>
            <div className="flex justify-between gap-2">
              {[0, 1, 2, 3, 4].map((index) => (
                <input
                  key={index}
                  type="text"
                  maxLength={1}
                  className="w-12 h-12 text-center text-xl rounded-lg border border-gray-400 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={otp[index] || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^\d?$/.test(val)) {
                      const newOtp = otp.split("");
                      newOtp[index] = val;
                      setOtp(newOtp.join(""));

                      // Move to next input automatically
                      const next = document.getElementById(`otp-${index + 1}`);
                      if (val && next) next.focus();
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace" && !otp[index] && index > 0) {
                      const prev = document.getElementById(`otp-${index - 1}`);
                      if (prev) prev.focus();
                    }
                  }}
                  id={`otp-${index}`}
                />
              ))}
            </div>
          </label>

          {errorMessage && (
            <p className="text-sm text-red-600">{errorMessage}</p>
          )}

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-md font-semibold tracking-wide transition focus:outline-none focus:ring-2 shadow-lg ${loading
                ? "bg-emerald-400 cursor-not-allowed"
                : "bg-blue-500 text-white focus:ring-emerald-400 shadow-emerald-600/30"
              }`}
          >
            {loading ? "Verifying…" : "Verify OTP"}
          </motion.button>
        </form>
      </motion.div>

      <div className="absolute bottom-0 w-full">
        <Footer />
      </div>
    </div>
  );
};

export default SendOtp;
