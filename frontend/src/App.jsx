// src/App.jsx
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
import BoatDetail from "./pages/BoatDetail";

import GhaatDetail from "./pages/GhaatDetail";
import ForgotPassword from "./pages/ForgotPassword";
import SendOtp from "./pages/SendOtp";
import ResetPassword from "./pages/ResetPassword";
import BoatDetailone from "./pages/BoatDetainone";
import GhaatDetailView from "./pages/GhaatDetailView";
import BoatOwner from "./components/BoatOwnerDetail"; 
import Pilot from "./components/Poilet";
import BoatOwnerView from "./pages/BoatOwnerView";
import BoatOwnerEdit from "./pages/BoatOwnerEdit";
import PiloteView from "./pages/PilotView";
import PiloteEdit from "./pages/PiloteEdit";
import InspectionView from "./pages/InspectionView";
import UserListEdit from "./pages/UserListEdit";
import UserListView from "./pages/UserListView";

const App = () => (
  <Routes>
    {/* public routes */}
    <Route path="/" element={<Login />} />
    <Route path="/login" element={<Login />} />
  <Route path="/forgot-password" element={<ForgotPassword />} />
   <Route path="/send-otp" element={<SendOtp />} />
      <Route path="/reset-password" element={<ResetPassword />} />


    {/* protected dashboard area */}
    <Route path="/dashboard" element={<Dashboard />}>
      <Route index element={<></>} />
      <Route path="boats/boatdetails/:id" element={<BoatDetail />} />
      <Route path="boats/boatdetailsone/:id" element={<BoatDetailone/>} />


      <Route path="boats" element={<Boats />} />
    
{/* id added */}
      <Route path="ghaats" element={<Ghaat />} />
      <Route path="ghaats/ghaatdetails/:id" element={<GhaatDetail />}/>
      <Route path="ghaats/ghaatdetailsview/:id" element={<GhaatDetailView />}/>

      <Route path="boatOwner" element={<BoatOwner />} />
<Route path="boatowner/boatownerview/:id" element={<BoatOwnerView />} />
        <Route path="boatowner/boatowneredit/:id" element={<BoatOwnerEdit />} />

        <Route path="poilet/pioletview/:id" element={<PiloteView />} />
        <Route path="poilet/pioletedit/:id" element={<PiloteEdit />} />
        <Route path="inspection/inspectionview/:id" element={<InspectionView />} />


{/* forget pass */}
  {/* <Route path="forgot-password" element={<ForgotPassword />} /> */}
      <Route path="districts" element={<District />} />
      <Route path="life-jackets" element={<LifeJacket />} />
      <Route path="inspection" element={<Inspection />} />
    
      <Route path="usermanagment" element={<Usermanagment />} />

      <Route path="usermanagment/userlistview/:id" element={<UserListView/>} />
        <Route path="usermanagment/userlistedit/:id" element={<UserListEdit />} />
      <Route path="poilet" element={<Pilot />} />
    </Route>
  </Routes>
);

export default App;
