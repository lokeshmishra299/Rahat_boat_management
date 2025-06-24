import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaEnvelope } from "react-icons/fa";
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
      // Laravel validation error
      const errors = err.response.data.data;
      if (errors?.email) {
        setErrorMessage(errors.email); // Only show email error
      } else {
        setErrorMessage("Please Enter Correct Email ID.");
      }
    } else if (err.response?.data?.message) {
      setErrorMessage(err.response.data.message);
    } else {
      setErrorMessage("Something went wrong.");
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
          Forgot Password
        </h1>
        <p className="text-center text-sm text-slate-600 mt-2 mb-8">
          Enter your registered email to reset your password
        </p>

        <form onSubmit={handleReset} className="space-y-6">
          <label className="block">
            <span className="block text-sm font-medium mb-2">Email Address</span>
            <span className="relative">
              <input
                type="email"
                
                placeholder="Enter your Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="peer w-full rounded-lg bg-white/90 px-4 py-3 pr-10 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition shadow-inner"
              />
              <FaEnvelope className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 peer-focus:text-emerald-600" />
            </span>
          </label>

          {errorMessage && (
            <p className="text-sm text-red-600">{errorMessage}</p>
          )}

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-md font-semibold tracking-wide transition focus:outline-none focus:ring-2 shadow-lg ${
              loading
                ? "bg-emerald-400 cursor-not-allowed"
                : "bg-blue-500 text-white focus:ring-emerald-400 shadow-emerald-600/30"
            }`}
          >
            {loading ? "Checking…" : "Send OTP Code"}
          </motion.button>
        </form>
      </motion.div>

      <div className="absolute bottom-0 w-full">
        <Footer />
      </div>
    </div>
  );
};

export default ForgotPassword;
