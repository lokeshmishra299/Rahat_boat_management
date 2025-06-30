// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "./Header";

// icons
import { MdSpaceDashboard } from "react-icons/md";
import {
  FaShip,
  FaWater,
  FaMapMarkedAlt,
  FaShieldAlt,
  FaUsersCog,
  FaUserTie,
  FaUserShield,
} from "react-icons/fa";
import { FaClipboardCheck } from "react-icons/fa6";
import Footer from "./Footer";
const BASE_URL = import.meta.env.VITE_API_BASE ?? "http://localhost:8000/api";


/* ───── Axios with token ───── */
const token = localStorage.getItem("access_token");
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  },
  withCredentials: true, 
});

/* ───── Stat card ───── */
const StatCard = ({ icon, title, value, change }) => (
  <div className="bg-white p-5 rounded-lg shadow border border-gray-100 min-h-[160px] flex flex-col justify-between">
    <div>
      <div className="text-2xl mb-2">{icon}</div>
      <h3 className="text-sm text-gray-500">{title}</h3>
    </div>
    <div>
      <p className="text-2xl font-semibold">{value}</p>
      <p className="text-sm text-green-500 mt-1">{change}</p>
    </div>
  </div>
);

/* ───── Activity icon map ───── */
const activityIcon = (title) => {
  const t = title.toLowerCase();
  if (t.includes("inspection")) return "📋";
  if (t.includes("life jacket")) return "🦺";
  if (t.includes("maintenance")) return "🛠️";
  return "🚤";
};

const Dashboard = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);

  /* fetch stats once */
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/dashboard-stats");
        if (data?.data) setStats(data.data);
      } catch (e) {
        if (e.response?.status === 401) navigate("/login");
      }
    })();
  }, [navigate]);

  /* helpers for nav pills */
  const isActive = (seg) =>
    seg === "."
      ? pathname === "/dashboard" || pathname === "/dashboard/"
      : pathname.startsWith(`/dashboard/${seg}`);

  const linkCls = (seg, bg) =>
    `px-4 py-1 rounded-full font-medium ${
      isActive(seg) ? `text-white ${bg}` : "text-gray-600 hover:text-blue-600"
    }`;

  const statusCls = {
    completed: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    failed: "bg-red-100 text-red-700",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* nav bar */}
      <div className="w-full sm:w-[97%] mx-auto flex justify-center mt-5 px-2">
        <nav className="flex overflow-x-auto scroll-smooth whitespace-nowrap py-3 bg-white shadow-md rounded-full w-full hide-scrollbar">
          <div className="flex flex-nowrap gap-2 sm:gap-4 px-4 mx-auto">
            <Link to="." className={linkCls(".", "bg-blue-600")}>
              <MdSpaceDashboard className="inline-block mr-2 text-xl" />
              Dashboard
            </Link>
            <Link to="boats" className={linkCls("boats", "bg-green-500")}>
              <FaShip className="inline-block mr-2 text-lg" />
              Boats
            </Link>
            <Link to="ghaats" className={linkCls("ghaats", "bg-sky-500")}>
              <FaWater className="inline-block mr-2 text-lg" />
              Ghaats
            </Link>
            <Link to="districts" className={linkCls("districts", "bg-red-500")}>
              <FaMapMarkedAlt className="inline-block mr-2 text-lg" />
              Districts
            </Link>
            <Link to="life-jackets" className={linkCls("life-jackets", "bg-orange-400")}>
              <FaShieldAlt className="inline-block mr-2 text-lg" />
              Life Jackets
            </Link>
            <Link to="inspection" className={linkCls("inspection", "bg-purple-500")}>
              <FaClipboardCheck className="inline-block mr-2 text-lg" />
              Inspection
            </Link>
            <Link to="usermanagment" className={linkCls("usermanagment", "bg-yellow-400")}>
              <FaUsersCog className="inline-block mr-2 text-lg" />
              User Management
            </Link>
            <Link to="boatowner" className={linkCls("boatowner", "bg-rose-500")}>
              <FaUserTie className="inline-block mr-2 text-lg" />
              Boat Owner
            </Link>
            <Link to="poilet" className={linkCls("poilet", "bg-[#008080]")}>
              <FaUserShield className="inline-block mr-2 text-lg" />
              Pilot
            </Link>
          </div>
        </nav>

        <style>{`
          .hide-scrollbar::-webkit-scrollbar { display: none; }
          .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>
      </div>

      {isActive(".") ? (
        <main className="p-6">
          {/* page heading */}
          <h2 className="flex items-center justify-center gap-2 text-3xl font-bold text-blue-700 mb-1">
            <div className="bg-blue-400 p-2 rounded-xl shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2" />
              </svg>
            </div>
            Operations Dashboard
          </h2>
          <p className="text-center text-gray-500 font-semibold text-sm  mb-6">
            Real‑time monitoring and management of rescue operations across Uttar&nbsp;Pradesh
          </p>

          {/* top stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 font-semibold">
            <div
              className="transform transition-transform duration-200 hover:scale-[1.03] hover:shadow-lg cursor-pointer"
              onClick={() => navigate("/dashboard/boats?tab=directory")}
            >
              <StatCard
                icon="🚤"
                title="Total Boats"
                value={<span className="font-extrabold">{stats?.total_boats.count ?? "—"}</span>}
                change={stats ? `+${stats.total_boats.difference} from last month` : "—"}
              />
            </div>

            <div
              className="transform transition-transform duration-200 hover:scale-[1.03] hover:shadow-lg cursor-pointer"
              onClick={() => navigate("/dashboard/ghaats?tab=directory")}
            >
              <StatCard
                icon="🌊"
                title="Active Ghaats"
                value={<span className="font-extrabold">{stats?.active_ghaats.count ?? "—"}</span>}
                change={stats ? `+${stats.active_ghaats.difference} from last month` : "—"}
              />
            </div>

            <div
              className="transform transition-transform duration-200 hover:scale-[1.03] hover:shadow-lg cursor-pointer"
              onClick={() => navigate("/dashboard/districts")}
            >
              <StatCard
                icon="📍"
                title="Districts Covered"
                value={<span className="font-extrabold">{stats?.districts_covered.count ?? "—"}</span>}
                change={stats ? `+${stats.districts_covered.difference} from last month` : "—"}
              />
            </div>

            <div
              className="transform transition-transform duration-200 hover:scale-[1.03] hover:shadow-lg cursor-pointer"
              onClick={() => navigate("/dashboard/life-jackets?tab=directory")}
            >
              <StatCard
                icon="🦺"
                title="Life Jackets"
                value={<span className="font-extrabold">{stats?.life_jackets.count ?? "—"}</span>}
                change={stats ? `+${stats.life_jackets.difference} from last month` : "—"}
              />
            </div>
          </div>

          {/* activity & districts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
            {/* recent activity */}
            <div className="bg-white p-5 rounded-lg shadow border">
              <h3 className="text-xl font-bold text-blue-700 mb-1">Recent Activity</h3>
              <p className="text-sm text-gray-500 mb-4">Latest updates from across the state</p>
              {(stats?.recent_activities || []).map((a, i) => (
                <div key={i} className="flex justify-between items-center bg-gray-50 hover:bg-gray-100 p-3 rounded-md mb-3">
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl">{activityIcon(a.title)}</div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-800">{a.title}</h4>
                      <p className="text-sm text-gray-500">{a.location}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-1 rounded-full ${statusCls[a.status] || "bg-gray-100 text-gray-700"}`}>
                      {a.status}
                    </span>
                    <p className="text-xs text-gray-400">{a.time_ago}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* top districts */}
            <div className="bg-white p-5 rounded-lg shadow border">
              <h3 className="text-xl font-bold text-purple-700 mb-1">Top Districts by Completion</h3>
              <p className="text-sm text-gray-500 mb-4">Data entry and registration progress</p>
              {[
                { name: "Lucknow", color: "green", percent: 92, boats: 45 },
                { name: "Varanasi", color: "blue", percent: 88, boats: 38 },
                { name: "Allahabad", color: "purple", percent: 85, boats: 32 },
                { name: "Agra", color: "orange", percent: 78, boats: 28 },
                { name: "Kanpur", color: "pink", percent: 82, boats: 27 },
              ].map((d, i) => (
                <div key={i} className="mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center space-x-2">
                      <span className={`h-3 w-3 rounded-full bg-${d.color}-500`} />
                      <span className="font-medium">{d.name}</span>
                    </div>
                    <span className="font-semibold text-gray-700">{d.percent}%</span>
                  </div>
                  <div className="w-full bg-gray-200 h-2 rounded-full">
                    <div className="h-2 bg-black rounded-full" style={{ width: `${d.percent}%` }} />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">🚤 {d.boats} boats</div>
                </div>
              ))}
            </div>
          </div>
        </main>
      ) : (
        <Outlet />
      )}
      <Footer />
    </div>
  );
};

export default Dashboard;