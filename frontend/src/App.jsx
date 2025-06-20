import React from "react";
import { Routes, Route } from "react-router-dom";

import Dashboard from "./components/Dashboard";

import Boats from "./components/Boats";
import Ghaat from "./components/Ghaat";
import District from "./components/District";
import LifeJacket from "./components/LifeJacket";
import Inspection from "./components/Inspection";
import Usermanagment from "./components/Usermanagment";

import Login from "./components/Login";

const App = () => (
  <Routes>
    {/* 🔑 Default route now renders Login instead of Dashboard */}
    <Route path="/login" element={<Login />} />

    {/* 📂 Auth‑protected area begins at /dashboard */}
    <Route path="/dashboard" element={<Dashboard />}>
      <Route index element={<></>} />
      <Route path="boats" element={<Boats />} />
      <Route path="ghaats" element={<Ghaat />} />
      <Route path="districts" element={<District />} />
      <Route path="life-jackets" element={<LifeJacket />} />
      <Route path="inspection" element={<Inspection />} />
      <Route path="usermanagment" element={<Usermanagment />} />
    </Route>
    <Route path="/" element={<Login />} />


  
  </Routes>
);

export default App;