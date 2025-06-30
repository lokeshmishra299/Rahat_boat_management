import React, { useEffect, useState } from 'react';
import { FaUserTie, FaListAlt, FaPlusCircle, FaDownload } from 'react-icons/fa';
import axios from 'axios';

const BoatOwner = () => {
  const [activeTab, setActiveTab] = useState('register');

  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    aadhar: '',
    boatNo: '',
    registration: '',
    address: '',
    district: '',
    pincode: '',
    family: [{ name: '', age: '', relation: '' }],
    relation: ''
  });

  const [Saving, setSaving] = useState(false);

  const handleNumberInput = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    setFormData({ ...formData, [e.target.id]: value });
  };

  const handleTextInput = (e) => {
    const value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
    setFormData({ ...formData, [e.target.id]: value });
  };

  const handleMixedInput = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleFamilyChange = (index, field, value) => {
    const updatedFamily = [...formData.family];
    updatedFamily[index][field] = value;
    setFormData({ ...formData, family: updatedFamily });
  };

  const addFamilyMember = () => {
    setFormData({
      ...formData,
      family: [...formData.family, { name: '', age: '', relation: '' }],
    });
  };

  const removeFamilyMember = (index) => {
    const updatedFamily = formData.family.filter((_, i) => i !== index);
    setFormData({ ...formData, family: updatedFamily });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Submission logic here
  };

const BASE_URL = import.meta.env.VITE_API_BASE ?? "http://localhost:8000/api";

const token = localStorage.getItem("access_token");


const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  },
});

  //distick api
  const [districts, setDistricts] = useState([]);
  
  useEffect(()=>{
    api.get('/district-list')
    .then((res)=>{
      if(res.data.status == "success"){
        setDistricts(res.data.data)
      }
    })
    .catch((error)=>{
      console.error("Error fetching districts:", error);
    })
  },[])

  return (
    <div className="max-w-[1200px] mx-auto p-6 mt-10 pb-2">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center bg-green-100 rounded-full p-3 shadow">
          <FaUserTie className="text-red-500 text-2xl" />
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-red-500 mt-4">Boat Owner Management</h2>
        <p className="text-gray-600 mt-2 max-w-xl mx-auto">
          Register and track rescue boats with comprehensive documentation
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-10">
        <button
          onClick={() => setActiveTab('register')}
          className={`flex items-center gap-2 px-6 py-2 rounded-full font-semibold transition ${
            activeTab === 'register' ? 'bg-rose-500 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          <FaPlusCircle /> Add New Boat Owner
        </button>
        <button
          onClick={() => setActiveTab('directory')}
          className={` flex items-center gap-2 px-6 py-2 rounded-full font-medium transition ${
            activeTab === 'directory' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          <FaListAlt /> Boat Owner Directory
        </button>
      </div>

      {activeTab === 'register' ? (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-4">
          {/* Personal Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label htmlFor="name" className="block text-gray-700 font-medium mb-2">Name *</label>
              <input id="name" value={formData.name} onChange={handleTextInput} type="text" placeholder="Enter Full Name" required className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label htmlFor="mobile" className="block text-gray-700 font-medium mb-2">Mobile No *</label>
              <input id="mobile" value={formData.mobile} onChange={handleNumberInput} maxLength="10" type="tel" placeholder="Enter Mobile Number" required className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label htmlFor="email" className="block text-gray-700 font-medium mb-2">Email ID</label>
              <input id="email" value={formData.email} onChange={handleMixedInput} type="email" placeholder="Enter Email Address" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label htmlFor="aadhar" className="block text-gray-700 font-medium mb-2">Aadhar Card No *</label>
              <input id="aadhar" value={formData.aadhar} onChange={handleNumberInput} maxLength="12" type="text" placeholder="Enter Aadhar Card Number" required className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          {/* Boat Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label htmlFor="boatNo" className="block text-gray-700 font-medium mb-2">No of Boats Owned</label>
              <input id="boatNo" value={formData.boatNo} onChange={handleNumberInput} type="text" placeholder="Enter Number of Boats" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          {/* Address Info */}
          <div className="mb-8">
            <label htmlFor="address" className="block text-gray-700 font-medium mb-2">Permanent Address *</label>
            <textarea id="address" value={formData.address} onChange={handleMixedInput} rows="3" required className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" placeholder="Enter Complete Address"></textarea>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div>
                <label htmlFor="district" className="block text-gray-700 font-medium mb-2">District *</label>
         <select
  id="district"
  value={formData.district}
  onChange={handleMixedInput}
  required
  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
>
  <option value="">Select District</option>
  {districts.map((district) => (
    <option key={district.id} value={district.district_name}>
      {district.district_name}
    </option>
  ))}
</select>

              </div>
              <div>
                <label htmlFor="pincode" className="block text-gray-700 font-medium mb-2">Pincode *</label>
                <input id="pincode" value={formData.pincode} onChange={handleNumberInput} maxLength="6" type="text" placeholder="Enter Pincode" required className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          </div>

          {/* Family Info */}
          <div className="mb-8">
            <label className="block text-gray-700 font-medium mb-2">Family Members *</label>
            {formData.family.map((member, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <input type="text" placeholder="Name" value={member.name} onChange={(e) => handleFamilyChange(index, 'name', e.target.value)} className="px-4 py-2 border border-gray-300 rounded-md" required />
                <input type="number" placeholder="Age" value={member.age} onChange={(e) => handleFamilyChange(index, 'age', e.target.value)} className="px-4 py-2 border border-gray-300 rounded-md" required />
                <input type="text" placeholder="Relation" value={member.relation} onChange={(e) => handleFamilyChange(index, 'relation', e.target.value)} className="px-4 py-2 border border-gray-300 rounded-md" required />
                {index > 0 && (
                  <button type="button" onClick={() => removeFamilyMember(index)} className="text-red-600 hover:underline text-sm col-span-full">Remove</button>
                )}
              </div>
            ))}
            <button type="button" onClick={addFamilyMember} className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">+ Add Family Member</button>

            <div className="mt-4">
              <label htmlFor="relation" className="block text-gray-700 font-medium mb-2">Primary Relation to Boat Owner *</label>
              <select id="relation" value={formData.relation} onChange={handleMixedInput} required className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500">
                <option value="">Select Relation</option>
                <option value="self">Self</option>
                <option value="spouse">Spouse</option>
                <option value="child">Child</option>
                <option value="parent">Parent</option>
                <option value="sibling">Sibling</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="flex justify-center">
            <button type="submit" className="px-8 py-2 bg-rose-500 text-white rounded-full focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-bold">
              {Saving ? 'Saving...' : 'Submit'}
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-blue-700">Registered Boat Owners</h2>
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2">
              <FaDownload /> Export Report
            </button>
          </div>

          <table className="w-full border text-sm text-left text-gray-600">
            <thead className="bg-gray-100 text-gray-700 font-semibold">
              <tr>
                <th className="px-4 py-2">Sr.No</th>
                <th className="px-4 py-2">Reg. No.</th>
                <th className="px-4 py-2">Pilot</th>
                <th className="px-4 py-2">Type</th>
                <th className="px-4 py-2">District</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {[{ sr: 1, reg: '22222', pilot: 'lokesh mishra', type: 'Manual (Paddle/Oar)', district: 'Auraiya', status: 'Active' },
                { sr: 2, reg: '22229', pilot: 'abhi', type: 'Hybrid', district: 'Agra', status: 'Active' },
                { sr: 3, reg: 'UP32 8127', pilot: 'ABHISHEK', type: 'Engine Driven', district: 'Lucknow', status: 'Active' },
                { sr: 4, reg: 'UP32 8129', pilot: 'ABHISHEK', type: 'Hybrid', district: 'Agra', status: 'Active' },
                { sr: 5, reg: 'UP32 8188', pilot: 'ABHISHEK', type: 'Engine Driven', district: 'Amroha', status: 'Active' },].map((boat, i) => (
                <tr key={i} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{boat.sr}</td>
                  <td className="px-4 py-2 font-bold text-black">{boat.reg}</td>
                  <td className="px-4 py-2 capitalize">{boat.pilot}</td>
                  <td className="px-4 py-2">{boat.type}</td>
                  <td className="px-4 py-2">{boat.district}</td>
                  <td className="px-4 py-2">
                    <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">{boat.status}</span>
                  </td>
                  <td className="px-4 py-2 space-x-2">
                    <button className="text-blue-600 hover:text-blue-800"><i className="fas fa-eye"></i></button>
                    <button className="text-green-600 hover:text-green-800"><i className="fas fa-pen"></i></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BoatOwner;