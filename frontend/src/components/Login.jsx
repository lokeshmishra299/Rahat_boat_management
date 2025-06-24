import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaEnvelope, FaEye, FaEyeSlash, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Toaster, toast } from "react-hot-toast";
import Footer from "./Footer";

/* ---------- Axios instance ---------- */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE ?? "http://127.0.0.1:8000/api",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("access_token")) navigate("/", { replace: true });
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("login", { email, password, remember });
      const token =
        data?.access_token ?? data?.token ?? data?.data?.access_token ?? null;
      if (token) {
        localStorage.setItem("access_token", token);
        toast.success("Login successful!");
        setTimeout(() => navigate("/dashboard", { replace: true }), 2000);
      } else {
        toast.error("Unexpected response – token missing.");
      }
    } catch (err) {
      console.error("Login error:", err);
      toast.error("Please enter correct information.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setResetLoading(true);
    try {
      await api.post("/forgot-password", { email: resetEmail });
      toast.success("If the email exists, a reset link has been sent.");
      setShowReset(false);
    } catch (err) {
      console.error("Reset error:", err);
      toast.error("Unable to send reset link.");
    } finally {
      setResetLoading(false);
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
  const float = {
    animate: {
      y: [0, 25, 0],
      x: [0, 25, 0],
      rotate: [0, 15, 0],
      transition: { duration: 14, repeat: Infinity, ease: "easeInOut" },
    },
  };
  const floatReverse = {
    animate: {
      y: [0, -25, 0],
      x: [0, -25, 0],
      rotate: [0, -15, 0],
      transition: { duration: 16, repeat: Infinity, ease: "easeInOut" },
    },
  };

  return (
    <div className="h-screen flex flex-col justify-between pt-12 items-center bg-gradient-to-br from-indigo-200 
     to-slate-200 relative overflow-hidden text-gray-900 px-4 sm:px-8 py-4">

      <Toaster position="top-right" />

      {/* Blurs */}
      <motion.div
        className="absolute -top-32 left-1/2 -translate-x-1/2 h-[28rem] w-[28rem] bg-emerald-500/40 blur-[120px] rounded-full"
        variants={float}
        animate="animate"
      />
      <motion.div
        className="absolute -bottom-40 right-1/2 translate-x-1/3 h-[24rem] w-[24rem]  blur-[120px] rounded-full"
        variants={floatReverse}
        animate="animate"
      />

      {/* Card */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-[92%] max-w-sm 	bg-gray-300 backdrop-blur-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] rounded-lg p-6"
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

        <h1 className="text-xl font-extrabold text-center tracking-wide">
          Rahat Boat Management
        </h1>
        <p className="text-center text-sm text-slate-300 mt-1">
          Log&nbsp;in to continue
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="block text-sm font-medium mb-1">Email</span>
            <span className="relative">
              <input
                type="email"
                required
                placeholder="Enter Your Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="peer w-full rounded-lg bg-white/90 px-4 py-2 pr-10 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition shadow-inner"
              />
              <FaEnvelope className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 peer-focus:text-emerald-600" />
            </span>
          </label>

          <label className="block">
            <span className="block text-sm font-medium mb-1">Password</span>
            <span className="relative">
              <input
                type={showPwd ? "text" : "password"}
                required
                placeholder="Enter Your Password"
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
          </label>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 accent-emerald-600 focus:ring-emerald-500"
              />
              Remember me
            </label>
            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              className="hover:underline text-blue-600"
            >
              Forgot password?
            </button>

          </div>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            type="submit"
            disabled={loading}
            aria-disabled={loading}
            className={`w-full py-2 rounded-lg font-semibold tracking-wide transition focus:outline-none focus:ring-2 shadow-lg ${loading
                ? "bg-emerald-400 cursor-not-allowed"
                : "bg-blue-500 text-white focus:ring-emerald-400 shadow-emerald-600/30"
              }`}
          >
            {loading ? "Logging in…" : "Log In"}
          </motion.button>
        </form>
      </motion.div>



      <Footer />
    </div>
  );
};

export default Login;
