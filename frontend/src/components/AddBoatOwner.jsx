import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaShip,FaPlusCircle } from "react-icons/fa";
import axios from 'axios';

const BASE_URL = import.meta.env.VlITE_API_BASE ?? "http://localhost:8000/api";

const token = localStorage.getItem("access_token");

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  },
});

const AddBoatOwner = () => {
  const navigate = useNavigate();

  const user = {
    role_id: 2, // Change to 1 to test role-based visibility
  };

  const boats = [
    {
      id: 1,
      registration_no: "UP12345",
      contectNo: "9999999999",
      boat_type: "Engine Driven",
      district: { district_name: "Varanasi" },
      status: "Active",
    },
    {
      id: 2,
      registration_no: "BR98765",
      contectNo: "Anil Sharma",
      boat_type: "Hybrid",
      district: { district_name: "Patna" },
      status: "Inactive",
    },
    {
      id: 3,
      registration_no: "GJ54321",
      pilot_name: "Mehul Patel",
      boat_type: "Manual",
      district: null,
      status: "Active",
    },
  ];

  return (
    <div className="min-h-screen w-full  px-6 py-8">
    <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center  rounded-full p-3 shadow">
              <FaShip className="text-green-600 text-2xl" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-green-800 mt-4">
              Boat Management
            </h2>
            <p className="text-gray-600 mt-2 max-w-xl mx-auto">
              Register and track rescue boats with comprehensive documentation
            </p>
          </div>
      <div className="w-full max-w-6xl border border-gray-300 bg-white rounded-lg shadow-md p-6 mx-auto">
        <div className="flex justify-end mb-6">
          <button
            onClick={() => navigate("/dashboard/addboatowner/boat-owners")}
            className="bg-blue-600 text-white px-4 py-2 flex items-center justify-center gap-2 rounded hover:bg-blue-700 transition"
          >
           <FaPlusCircle className="text-xl" />
 Add Boat Owners
          </button>
        </div>

        <div className="overflow-x-auto bg-white rounded shadow">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-100">
              <tr className="text-left font-semibold text-gray-700">
                <th className="px-4 py-3">Sr.No</th>
                <th className="px-4 py-3">Name.</th>
                <th className="px-4 py-3">Contect No</th>
                <th className="px-4 py-3">Aadhar No</th>
                <th className="px-4 py-3">No of Boats Owned</th>
                <th className="px-4 py-3">Pincode</th>
                <th className="px-4 py-3">Add</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {boats.map((boat, idx) => (
                <tr key={boat.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2">{idx + 1}</td>
                  <td className="px-4 py-2 font-semibold">{boat.registration_no}</td>
                  <td className="px-4 py-2">{boat.pilot_name}</td>
                  <td className="px-4 py-2">{boat.boat_type}</td>
                  <td className="px-4 py-2">{boat.district?.district_name || "—"}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        boat.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {boat.status || "Active"}
                    </span>
                  </td>
                  <td className="px-4 py-2 flex gap-3">
                    <button
                    onClick={()=>{
                        navigate("/dashboard/addboatowner/boats")
                    }}
                      className="text-sky-600 hover:text-sky-800">
                       + Add Boats
                    </button>

                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AddBoatOwner;