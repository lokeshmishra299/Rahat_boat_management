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
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import AddBoatOwner from "./components/AddBoatOwner";
import BoatOwners from "./components/BoatOwners";

const App = () => (
  <Routes>
    {/* public routes */}
   <Route
      path="/"
      element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      }
    />
    <Route
      path="/login"
      element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      }
    />
    <Route
      path="/forgot-password"
      element={
        <PublicRoute>
          <ForgotPassword />
        </PublicRoute>
      }
    />
    <Route
      path="/send-otp"
      element={
        <PublicRoute>
          <SendOtp />
        </PublicRoute>
      }
    />
    <Route
      path="/reset-password"
      element={
        <PublicRoute>
          <ResetPassword />
        </PublicRoute>
      }
    />


    {/* protected dashboard area */}
    {/* Protected Routes */}
    <Route
      path="/dashboard"
      element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      }
    >
      <Route index element={<></>} />
      <Route path="boats/boatdetails/:id" element={<BoatDetail />} />
      <Route path="boats/boatdetailsone/:id" element={<BoatDetailone/>} />


      <Route path="addboatowner/boats" element={<Boats />} />
      <Route path="addboatowner" element={<AddBoatOwner />} />
      <Route path="addboatowner/boat-owners" element={<BoatOwners />} />
    
{/* id added */}
      <Route path="ghats" element={<Ghaat />} />
      <Route path="ghats/ghatdetails/:id" element={<GhaatDetail />}/>
      <Route path="ghats/ghatdetailsview/:id" element={<GhaatDetailView />}/>

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
