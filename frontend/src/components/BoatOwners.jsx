import React, { useState } from "react";
import axios from "axios";

const BASE_URL = import.meta.env.VlITE_API_BASE ?? "http://localhost:8000/api";

const token = localStorage.getItem("access_token");

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  },
});

const BoatOwners = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    contact: "",
    aadhar: "",
    boats: "",
    dob: "",
    pincode: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="p-6 min-h-screen flex justify-center items-start ">
      <div className="w-full max-w-6xl border border-gray-200 bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <h1 className="text-2xl font-bold mb-6 text-green-600 md:col-span-2">
            Boat Owner Details
          </h1>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value.replace(/[^a-zA-Z\s]/g, ""),
                })
              }
               className="w-full border-2 rounded px-3 py-2 focus:border-green-500 focus:outline-none"


              placeholder="Enter name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
                  className="w-full border-2 rounded px-3 py-2 focus:border-green-500 focus:outline-none"

              placeholder="Enter email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact No *
            </label>
            <input
              type="tel"
              name="contact"
              value={form.contact}
              onChange={(e) =>
                setForm({
                  ...form,
                  contact: e.target.value.replace(/[^0-9]/g, "").slice(0, 10),
                })
              }
                 className="w-full border-2 rounded px-3 py-2 focus:border-green-500 focus:outline-none"

              placeholder="Enter contact"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Aadhar No
            </label>
            <input
              type="tel"
              name="aadhar"
              value={form.aadhar}
              onChange={(e) =>
                setForm({
                  ...form,
                  aadhar: e.target.value.replace(/[^0-9]/g, "").slice(0, 12),
                })
              }
                className="w-full border-2 rounded px-3 py-2 focus:border-green-500 focus:outline-none"

              placeholder="Enter Aadhar No"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              No of Boats Owned
            </label>
            <input
              type="number"
              name="boats"
              value={form.boats}
              onChange={handleChange}
                 className="w-full border-2 rounded px-3 py-2 focus:border-green-500 focus:outline-none"

              placeholder="Enter number of boats"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date of Birth *
            </label>
            <input
              type="date"
              name="dob"
              value={form.dob}
              onChange={handleChange}
                className="w-full border-2 rounded px-3 py-2 focus:border-green-500 focus:outline-none"

            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pincode
            </label>
            <input
              type="tel"
              name="pincode"
              value={form.pincode}
              onChange={(e) =>
                setForm({
                  ...form,
                  pincode: e.target.value.replace(/[^0-9]/g, "").slice(0, 6),
                })
              }
           className="w-full border-2 rounded px-3 py-2 focus:border-green-500 focus:outline-none"


              placeholder="Enter Pincode"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-center py-5 ">
          <button className="bg-green-500 hover:bg-green-600 text-white font-semibold px-8  py-2 rounded-full">
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default BoatOwners;