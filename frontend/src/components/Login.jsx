import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaEnvelope, FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Toaster, toast } from "react-hot-toast";
import Footer from "./Footer";

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
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("access_token")) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      setErrors({ email: "Email is required." });
      setLoading(false);
      return;
    }
    if (!emailRegex.test(email)) {
      setErrors({ email: "Please enter a valid email address." });
      setLoading(false);
      return;
    }

    if (!password) {
      setErrors({ password: "Password is required." });
      setLoading(false);
      return;
    }

    try {
      const { data } = await api.post("login", { email, password, remember });
      const token = data?.access_token ?? data?.token ?? data?.data?.access_token ?? null;
      const user = data?.user ?? data?.data?.user ?? null;

      if (token) {
        localStorage.setItem("access_token", token);
        if (user) {
          localStorage.setItem("user", JSON.stringify(user));
        }
        toast.success("Login successful!");
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1000);
      } else {
        setErrors({ password: "Unexpected response from server." });
      }
    } catch (err) {
      const apiErrors = err.response?.data?.data;
      const generalMsg = err.response?.data?.message;

      if (apiErrors) {
        setErrors(apiErrors);
      } else if (generalMsg) {
        setErrors({ password: generalMsg });
      } else {
        setErrors({ password: "Something went wrong." });
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
    <div className="relative min-h-screen flex flex-col text-gray-900 ">
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
          <h2 className="text-center text-lg font-bold text-[#1f4068] tracking-wide mb-1">
            Rahat Boat Management
          </h2>
          <p className="text-center text-sm text-white/80 mb-4">Log in to continue</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="relative text-white font-semibold">
              <input
                type="text"
                placeholder="Email ID"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 pr-10 rounded-md bg-[#1f4068] text-white placeholder-white/80 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <FaEnvelope className="absolute right-3 top-1/2 -translate-y-1/2 text-white/80" />
              {errors.email && (
                <p className="text-sm text-red-600 mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="relative text-white font-semibold">
              <input
                type={showPwd ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-10 rounded-md bg-[#1f4068] text-white placeholder-white/80 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <button
                type="button"
                onClick={() => setShowPwd((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/80"
              >
                {showPwd ? <FaEyeSlash /> : <FaEye />}
              </button>
              {errors.password && (
                <p className="text-sm text-red-600 mt-1">{errors.password}</p>
              )}
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between text-white text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="cursor-pointer"
                />
                <span className="text-[#1f4068] cursor-pointer">Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="hover:underline font-semibold text-[#1f4068]"
              >
                Forgot Password?
              </button>
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
              {loading ? "Logging in…" : "LOGIN"}
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

export default Login;