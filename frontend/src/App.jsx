
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
   
    <Route path="/" element={<Dashboard />}>
      <Route index element={<></>} />
      <Route path="boats" element={<Boats />} />
      <Route path="ghaats" element={<Ghaat />} />
      <Route path="districts" element={<District />} />
      <Route path="life-jackets" element={<LifeJacket />} />
      <Route path="inspection" element={<Inspection />} />
      <Route path="usermanagment" element={<Usermanagment />} />
    </Route>

    <Route path="/login" element={<Login />} />
  </Routes>
);

export default App;