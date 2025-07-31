import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaShip, FaPlusCircle, FaEye } from "react-icons/fa";
import axios from "axios";


const BASE_URL = import.meta.env.VITE_API_BASE ?? "http://localhost:8000/api";
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
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));
  

  // Fetch owners from API
  const fetchOwners = async () => {
    setLoading(true);
    try {
      const res = await api.get("/boat-owner-list");
      if (res.data.status === "success") {
        setOwners(res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch boat owners:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOwners();
  }, []);

  return (
    <div className="min-h-screen w-full px-6 py-8">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center rounded-full p-3 shadow">
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
            className="bg-blue-600 text-white px-4 py-2 flex items-center gap-2 rounded hover:bg-blue-700 transition"
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
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Contact No</th>
                <th className="px-4 py-3">Aadhar No</th>
                <th className="px-4 py-3">No of Boats Owned</th>
                <th className="px-4 py-3">Pincode</th>
                <th className="px-4 py-3">Tehsil</th>
                <th className="px-4 py-3"> Ghat In-charge</th>
                <th className="px-4 py-3">Add</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-6">
                    Loading...
                  </td>
                </tr>
              ) : owners.length > 0 ? (
                owners.map((owner, idx) => (
                  <tr key={owner.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2">{idx + 1}</td>
                    <td className="px-4 py-2 font-semibold">{owner.name || "—"}</td>
                    <td className="px-4 py-2">{owner.number || "NA"}</td>
                    <td className="px-4 py-2">{owner.adhar_no || "NA"}</td>
                    <div className="flex flex-row ">
                      
                    <td className="px-4 py-2">{owner.boats_count?? "NA"} 
                    </td>
                  <FaEye 
                     onClick={() => navigate(`/dashboard/addboatowner/${owner.id}/boats?tab=directory`)}
                     className="mt-3 text-green-500" />
                    </div>
                    <td className="px-4 py-2">{owner.pincode ?? "NA"}</td>
                    <td className="px-4 py-2">
                     <h2>{owner.tehsil_name || "NA"}</h2>
                    </td>
                    <td className="px-4 py-2">
                      <h3>{owner.user?.name || "NA"}</h3>
                    </td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => navigate(`/dashboard/addboatowner/${owner.id}/boats`)}
                        className="text-sky-600 hover:text-sky-800"
                      >
                        + Add Boats
                      </button>
                    </td>
                    
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-6 text-gray-500">
                    No boat owners found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AddBoatOwner;