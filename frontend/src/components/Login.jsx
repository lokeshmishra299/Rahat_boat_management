// components/Login.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaEnvelope, FaEye, FaEyeSlash, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Toaster, toast } from "react-hot-toast";       // ← toast

/* ---------- Axios instance ---------- */
const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE ??
    "http://127.0.0.1:8000/api",          // fallback tunnel
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

const Login = () => {
  /* ——— login form state ——— */
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  /* ——— reset‑password modal ——— */
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const navigate = useNavigate();

  /* ——— auto‑redirect if already logged in ——— */
  useEffect(() => {
    if (localStorage.getItem("access_token")) navigate("/", { replace: true });
  }, [navigate]);

  /* ——— login submit ——— */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await api.post("login", { email, password, remember });

      const token =
        data?.access_token ?? data?.token ?? data?.data?.access_token ?? null;

      if (token) {
        localStorage.setItem("access_token", token);
        toast.success("Login successful!");             // ✅ success toast
        navigate("/dashboard", { replace: true });
      } else {
        toast.error("Unexpected response – token missing.");
      }
    } catch (err) {
      console.error("Login error:", err);
      toast.error("Please enter correct information."); // ❌ failure toast
    } finally {
      setLoading(false);
    }
  };

  /* ——— forgot‑password submit ——— */
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

  /* ——— animation configs ——— */
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

  /* ——— JSX ——— */
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-950 via-indigo-900 to-slate-900 relative overflow-hidden text-white">
      <Toaster position="top-right" />                 {/* ← toaster */}

      {/* Blurs */}
      <motion.div
        className="absolute -top-32 left-1/2 -translate-x-1/2 h-[36rem] w-[36rem] bg-emerald-500/40 blur-[160px] rounded-full"
        variants={float}
        animate="animate"
      />
      <motion.div
        className="absolute -bottom-40 right-1/2 translate-x-1/3 h-[32rem] w-[32rem] bg-fuchsia-600/40 blur-[160px] rounded-full"
        variants={floatReverse}
        animate="animate"
      />

      {/* Card */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-[92%] max-w-sm bg-white/10 backdrop-blur-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] rounded-3xl p-8"
      >
        {/* Logo */}
        <motion.div
          initial={{ rotateY: 90 }}
          animate={{ rotateY: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="flex justify-center mb-6"
        >
          <img
            src="/images/Rahat.jpeg"
            alt="Relief Commissioner logo"
            className="h-24 w-24 object-cover rounded-full ring-4 ring-white/30"
          />
        </motion.div>

        <h1 className="text-2xl font-extrabold text-center tracking-wide">
          Rahat Boat Management
        </h1>
        <p className="text-center text-sm text-slate-300 mt-1">
          Log&nbsp;in to continue
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {/* Email */}
          <label className="block">
            <span className="block text-sm font-medium mb-1">Email</span>
            <span className="relative">
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="peer w-full rounded-lg bg-white/90 px-4 py-2 pr-10 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition shadow-inner"
              />
              <FaEnvelope className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 peer-focus:text-emerald-600" />
            </span>
          </label>

          {/* Password */}
          <label className="block">
            <span className="block text-sm font-medium mb-1">Password</span>
            <span className="relative">
              <input
                type={showPwd ? "text" : "password"}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="peer w-full rounded-lg bg-white/90 px-4 py-2 pr-10 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition shadow-inner"
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 peer-focus:text-emerald-600"
                aria-label={showPwd ? "Hide password" : "Show password"}
              >
                {showPwd ? <FaEyeSlash /> : <FaEye />}
              </button>
            </span>
          </label>

          {/* Options */}
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
              onClick={() => {
                setShowReset(true);
                setResetEmail("");
              }}
              className="hover:underline text-emerald-300"
            >
              Forgot password?
            </button>
          </div>

          {/* Submit */}
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            type="submit"
            disabled={loading}
            aria-disabled={loading}
            className={`w-full py-2 rounded-lg font-semibold tracking-wide transition focus:outline-none focus:ring-2 shadow-lg ${
              loading
                ? "bg-emerald-400 cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-500 focus:ring-emerald-400 shadow-emerald-600/30"
            }`}
          >
            {loading ? "Logging in…" : "Log In"}
          </motion.button>
        </form>
      </motion.div>

      {/* ----- Reset Password Modal ----- */}
      <AnimatePresence>
        {showReset && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-20"
          >
            {/* dialog */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              className="relative bg-white/10 backdrop-blur-2xl rounded-2xl p-6 w-[92%] max-w-md shadow-2xl text-white"
            >
              <button
                className="absolute top-3 right-3 text-slate-300 hover:text-white"
                aria-label="Close"
                onClick={() => setShowReset(false)}
              >
                <FaTimes />
              </button>

              <h2 className="text-xl font-bold mb-2 text-center">
                Forgot your password?
              </h2>
              <p className="text-sm text-slate-300 mb-4 text-center">
                Enter your registered email address and we'll send you a reset
                link.
              </p>

              <form onSubmit={handleReset} className="space-y-4">
                <label className="block">
                  <span className="block text-sm font-medium mb-1">Email</span>
                  <span className="relative">
                    <input
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="peer w-full rounded-lg bg-white/90 px-4 py-2 pr-10 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition shadow-inner"
                    />
                    <FaEnvelope className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 peer-focus:text-emerald-600" />
                  </span>
                </label>

                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  type="submit"
                  disabled={resetLoading}
                  aria-disabled={resetLoading}
                  className={`w-full py-2 rounded-lg font-semibold tracking-wide transition focus:outline-none focus:ring-2 shadow-lg ${
                    resetLoading
                      ? "bg-emerald-400 cursor-not-allowed"
                      : "bg-emerald-600 hover:bg-emerald-500 focus:ring-emerald-400 shadow-emerald-600/30"
                  }`}
                >
                  {resetLoading ? "Sending…" : "Send reset link"}
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="absolute bottom-4 w-full text-center text-xs text-slate-400">
        Office of the Relief Commissioner, Govt.&nbsp;of&nbsp;Uttar&nbsp;Pradesh © 2025 | Developed by&nbsp;
        <span className="text-emerald-300">CMP Techsseract LLP</span>&nbsp;| Powered by&nbsp;
        <span className="text-fuchsia-300">UPDESCO</span>
      </footer>
    </div>
  );
};

export default Login;