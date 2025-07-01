// src/components/BoatOwner.jsx
import React, { useEffect, useState } from 'react';
import { FaUserTie, FaListAlt, FaPlusCircle, FaDownload } from 'react-icons/fa';
import axios from 'axios';
import {Toaster, toast} from 'react-hot-toast';

const BASE_URL = import.meta.env.VITE_API_BASE ?? "http://localhost:8000/api";

const token = localStorage.getItem("access_token");

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  },
});


const BoatOwner = () => {
  const [activeTab, setActiveTab] = useState('register');
  const [Saving, setSaving] = useState(false);
  const [districts, setDistricts] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    number: '',
    email: '',
    aadhar: '',
    dob: '',
    boatNo: '',
    registration: '',
    address: '',
    district: '',
    pincode: '',
    family: [{ name: '', mobile: '', aadhar: '', relation: '' }],
    relation: ''
  });

  const [errors, setErrors] = useState({});

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
      family: [...formData.family, { name: '', mobile: '', aadhar: '', relation: '' }],
    });
  };

  const removeFamilyMember = (index) => {
    const updatedFamily = formData.family.filter((_, i) => i !== index);
    setFormData({ ...formData, family: updatedFamily });
  };

  useEffect(() => {
    api.get('/district-list')
      .then((res) => {
        if (res.data.status === "success") {
          setDistricts(res.data.data);
        }
      })
      .catch((error) => {
        console.error("Error fetching districts:", error);
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});

    try {
      const selectedDistrict = districts.find(d => d.district_name === formData.district);

      const payload = {
        name: formData.name,
        number: formData.number,
        email: formData.email,
        adhar_no: formData.aadhar,
        dob: formData.dob,
        boat_owned: formData.boatNo,
        address: formData.address,
        pincode: formData.pincode,
        district_id: selectedDistrict?.id || null,
        family: formData.family.map(member => ({
          name: member.name,
          mobile: member.mobile,
          adhar: member.aadhar,
          relation: member.relation
        }))
      };

      const response = await api.post('/boat-owner', payload);
      console.log("Requesting:", api.defaults.baseURL + '/boat-owner');
      console.log("Payload:", payload);


      if (response.data.status === 'success') {
        toast.success('Boat owner and family details saved successfully!');
        setFormData({
          name: '',
          number: '',
          email: '',
          aadhar: '',
          dob: '',
          boatNo: '',
          registration: '',
          address: '',
          district: '',
          pincode: '',
          family: [{ name: '', mobile: '', aadhar: '', relation: '' }],
          relation: ''
        });
      } else {
        alert('Something went wrong. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      if (error.response && error.response.data?.data) {
        const backendErrors = error.response.data.data;
        const formattedErrors = {};

        // Handle top-level fields
        Object.keys(backendErrors).forEach(key => {
          if (key.startsWith("family.")) {
            // Parse keys like "family.0.mobile"
            const parts = key.split('.');
            const index = parts[1];
            const field = parts[2];

            if (!formattedErrors.family) formattedErrors.family = [];
            if (!formattedErrors.family[index]) formattedErrors.family[index] = {};
            formattedErrors.family[index][field] = backendErrors[key][0];
          } else {
            // Simple field errors
            formattedErrors[key] = backendErrors[key][0];
          }
        });

        setErrors(prev => ({
          ...prev,
          ...formattedErrors,
        }));
      }
      else {
        alert('Failed to submit. Please check your connection or data.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto p-6 mt-10 pb-2">
            <Toaster position="top-right" reverseOrder={false} />

      {/* Header & Tabs */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center bg-green-100 rounded-full p-3 shadow">
          <FaUserTie className="text-red-500 text-2xl" />
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-red-500 mt-4">Boat Owner Management</h2>
        <p className="text-gray-600 mt-2 max-w-xl mx-auto">
          Register and track rescue boats with comprehensive documentation
        </p>
      </div>

      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-10">
        <button
          onClick={() => setActiveTab('register')}
          className={`flex items-center gap-2 px-6 py-2 rounded-full font-semibold transition ${activeTab === 'register' ? 'bg-rose-500 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          <FaPlusCircle /> Add New Boat Owner
        </button>
        <button
          onClick={() => setActiveTab('directory')}
          className={`flex items-center gap-2 px-6 py-2 rounded-full font-medium transition ${activeTab === 'directory' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          <FaListAlt /> Boat Owner Directory
        </button>
      </div>

      {/* Register Form */}
      {activeTab === 'register' ? (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Name *</label>
              <input id="name" value={formData.name} onChange={handleTextInput} type="text" placeholder="Enter Full Name" className="w-full px-4 py-2 border border-gray-300 rounded-md" />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Mobile No *</label>
              <input id="number" value={formData.number} onChange={handleNumberInput} maxLength="10" type="tel" placeholder="Enter Mobile Number" className="w-full px-4 py-2 border border-gray-300 rounded-md" />
              {errors.number && <p className="text-red-500 text-sm mt-1">{errors.number}</p>}
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Email ID</label>
              <input id="email" value={formData.email} onChange={handleMixedInput} type="email" placeholder="Enter Email Address" className="w-full px-4 py-2 border border-gray-300 rounded-md" />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Aadhar Card No *</label>
              <input id="aadhar" value={formData.aadhar} onChange={handleNumberInput} maxLength="12" type="text" placeholder="Enter Aadhar Card Number" className="w-full px-4 py-2 border border-gray-300 rounded-md" />
              {errors.adhar_no && <p className="text-red-500 text-sm mt-1">{errors.adhar_no}</p>}

            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Date of Birth *</label>
              <input id="dob" value={formData.dob} onChange={handleMixedInput} type="date" className="w-full px-4 py-2 border border-gray-300 rounded-md" />
              {errors.dob && <p className="text-red-500 text-sm mt-1">{errors.dob}</p>}

            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">No of Boats Owned</label>
              <input id="boatNo" value={formData.boatNo} onChange={handleNumberInput} type="text" placeholder="Enter Number of Boats" className="w-full px-4 py-2 border border-gray-300 rounded-md" />
            </div>
          </div>

          {/* District and Pincode */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-gray-700 font-medium mb-2">District *</label>
              <select id="district" value={formData.district} onChange={handleMixedInput} className="w-full px-4 py-2 border border-gray-300 rounded-md">
                <option value="">Select District</option>
                {districts.map(d => (
                  <option key={d.id} value={d.district_name}>{d.district_name}</option>
                ))}
              </select>
              {errors.district_id && <p className="text-red-500 text-sm mt-1">{errors.district_id}</p>}
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Pincode *</label>
              <input id="pincode" value={formData.pincode} onChange={handleNumberInput} maxLength="6" type="text" placeholder="Enter Pincode" className="w-full px-4 py-2 border border-gray-300 rounded-md" />
              {errors.pincode && <p className="text-red-500 text-sm mt-1">{errors.pincode}</p>}
            </div>
          </div>

          {/* Family Info */}
          <div className="mb-8">
            <label className="block text-gray-700 font-medium mb-2">Family Members </label>
            {formData.family.map((member, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                {/* Name */}
                <div>
                  <input
                    type="text"
                    placeholder="Name"
                    value={member.name}
                    onChange={(e) => handleFamilyChange(index, 'name', e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-md w-full"
                  />
                  {errors.family?.[index]?.name && (
                    <p className="text-red-500 text-sm">{errors.family[index].name}</p>
                  )}
                </div>

                {/* Mobile */}
                <div>
                  <input
                    type="text"
                    placeholder="Mobile Number"
                    value={member.mobile}
                    onChange={(e) =>
                      handleFamilyChange(index, 'mobile', e.target.value.replace(/\D/g, ''))
                    }
                    className="px-4 py-2 border border-gray-300 rounded-md w-full"
                  />
                  {errors.family?.[index]?.mobile && (
                    <p className="text-red-500 text-sm">{errors.family[index].mobile}</p>
                  )}
                </div>

                {/* Aadhar */}
                <div>
                  <input
                    type="text"
                    placeholder="Aadhar Number"
                    value={member.aadhar}
                    onChange={(e) =>
                      handleFamilyChange(index, 'aadhar', e.target.value.replace(/\D/g, ''))
                    }
                    className="px-4 py-2 border border-gray-300 rounded-md w-full"
                  />
                  {errors.family?.[index]?.adhar && (
                    <p className="text-red-500 text-sm">{errors.family[index].adhar}</p>
                  )}
                </div>

                {/* Relation */}
                <div>
                  <input
                    type="text"
                    placeholder="Relation with Owner"
                    value={member.relation}
                    onChange={(e) => handleFamilyChange(index, 'relation', e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-md w-full"
                  />
                  {errors.family?.[index]?.relation && (
                    <p className="text-red-500 text-sm">{errors.family[index].relation}</p>
                  )}
                </div>

                {/* Remove Button */}
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => removeFamilyMember(index)}
                    className="text-red-600 hover:underline text-sm col-span-full"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={addFamilyMember}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              + Add Family Member
            </button>
          </div>


          <div className="flex justify-center">
            <button type="submit" className="px-8 py-2 bg-rose-500 text-white rounded-full font-bold">
              {Saving ? 'Saving...' : 'Submit'}
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="bg-white shadow-md rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-blue-700">Registered Boat Owners</h2>
              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2">
                <FaDownload /> Export Report
              </button>
            </div>
            {/* Static sample table */}
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
                {[
                  { sr: 1, reg: '22222', pilot: 'lokesh mishra', type: 'Manual (Paddle/Oar)', district: 'Auraiya', status: 'Active' },
                  { sr: 2, reg: '22229', pilot: 'abhi', type: 'Hybrid', district: 'Agra', status: 'Active' },
                  { sr: 3, reg: 'UP32 8127', pilot: 'ABHISHEK', type: 'Engine Driven', district: 'Lucknow', status: 'Active' },
                  { sr: 4, reg: 'UP32 8129', pilot: 'ABHISHEK', type: 'Hybrid', district: 'Agra', status: 'Active' },
                  { sr: 5, reg: 'UP32 8188', pilot: 'ABHISHEK', type: 'Engine Driven', district: 'Amroha', status: 'Active' },
                ].map((boat, i) => (
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

          {/* ... */}
        </div>
      )}
    </div>
  );
};

export default BoatOwner;