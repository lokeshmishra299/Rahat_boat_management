// src/components/PilotManagement.jsx
import React, { useEffect, useState } from 'react';
import { FaUserShield, FaListAlt, FaPlusCircle, FaDownload, FaEye, FaPen } from 'react-icons/fa';
import axios from 'axios';
import { Toaster, toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const BASE_URL = import.meta.env.VITE_API_BASE ?? "http://localhost:8000/api";
const token = localStorage.getItem("access_token");

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  },
});

const PilotManagement = () => {
  const [activeTab, setActiveTab] = useState('register');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [pilots, setPilots] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    number: '',
    email: '',
    adhar: '',
    dob: '',
    no_of_boat: '',
    registration_no: '',
    relation: 'Self',
    family: [
      { name: '', mobile: '', adhar: '', relation: '' }
    ],
  });

  const handleInput = (e) => {
    const { id, value } = e.target;

    if (id === 'name' || id === 'relation') {
      if (!/^[a-zA-Z\s]*$/.test(value)) return;
    }

    if (id === 'registration_no') {
      if (!/^\d*$/.test(value)) return;
    }

    setFormData({ ...formData, [id]: value });
  };

  const handleNumberInput = (e) => {
    const { id, value } = e.target;
    let cleanValue = value.replace(/\D/g, '');

    if (id === 'number' && cleanValue.length > 10) return;
    if (id === 'adhar' && cleanValue.length > 12) return;
    if (id === 'no_of_boat' && cleanValue.length > 2) return;

    setFormData({ ...formData, [id]: cleanValue });
  };

  const handleFamilyChange = (index, field, value) => {
    const updatedFamily = [...formData.family];

    if (field === 'name' || field === 'relation') {
      if (!/^[a-zA-Z\s]*$/.test(value)) return;
    }

    if (field === 'mobile' || field === 'adhar') {
      const clean = value.replace(/\D/g, '');
      if ((field === 'mobile' && clean.length > 10) || (field === 'adhar' && clean.length > 12)) return;
      value = clean;
    }

    updatedFamily[index][field] = value;
    setFormData({ ...formData, family: updatedFamily });
  };

  const addFamilyMember = () => {
    setFormData({ ...formData, family: [...formData.family, { name: '', mobile: '', adhar: '', relation: '' }] });
  };

  const removeFamilyMember = (index) => {
    const updated = formData.family.filter((_, i) => i !== index);
    setFormData({ ...formData, family: updated });
  };

  const fetchPilots = () => {
    setLoading(true);
    api.get('/pilot-list')
      .then((res) => {
        if (res.data.status === 'success') {
          setPilots(res.data.data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPilots();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});

    try {
      const payload = {
        ...formData,
        family: formData.family.map(member => ({
          name: member.name,
          mobile: member.mobile,
          adhar: member.adhar,
          relation: member.relation
        }))
      };

      const res = await api.post('/pilot-store', payload);

      if (res.data.status === 'success') {
        toast.success("Pilot data submitted successfully");
        setFormData({
          name: '', number: '', email: '', adhar: '', dob: '', no_of_boat: '',
          registration_no: '', relation: 'Self', family: [{ name: '', mobile: '', adhar: '', relation: '' }],
        });
        fetchPilots();
        setActiveTab('directory');
      }
    } catch (err) {
      const backendErrors = err.response?.data?.data || {};
      const formatted = {};
      Object.keys(backendErrors).forEach(key => {
        if (key.startsWith("family.")) {
          const [, index, field] = key.split(".");
          if (!formatted.family) formatted.family = [];
          if (!formatted.family[index]) formatted.family[index] = {};
          formatted.family[index][field] = backendErrors[key][0];
        } else {
          formatted[key] = backendErrors[key][0];
        }
      });
      setErrors(formatted);
    } finally {
      setSaving(false);
    }
  };

  // const navigate = useNavigate()

  return (
    <div className="max-w-[1200px] mx-auto p-6">
      <Toaster />
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center bg-green-100 rounded-full p-3 shadow">
          <FaUserShield className="text-[#008080] text-2xl" />
        </div>
        <h2 className="text-3xl font-bold text-[#008080] mt-4">Pilot Management</h2>
        <p className="text-gray-600 mt-2">Register and track pilots and family info</p>
      </div>

      <div className="flex justify-center gap-4 mb-10">
        <button onClick={() => setActiveTab('register')} className={`px-6 py-2 rounded-full flex items-center justify-center gap-2 font-semibold ${activeTab === 'register' ? 'bg-[#008080] text-white' : 'bg-gray-200 text-gray-700'}`}><FaPlusCircle /> Add New Pilot</button>
        <button onClick={() => setActiveTab('directory')} className={`px-6 py-2 rounded-full flex items-center justify-center gap-2 font-semibold ${activeTab === 'directory' ? 'bg-[#008080] text-white' : 'bg-gray-200 text-gray-700'}`}><FaListAlt /> Pilot Directory</button>
      </div>

      {activeTab === 'register' ? (
        <form onSubmit={handleSubmit} className="bg-white rounded shadow p-4">
          <div className="grid md:grid-cols-2 gap-6">
            {['name', 'number', 'email', 'adhar', 'dob', 'no_of_boat', 'registration_no'].map(field => (
              <div key={field}>
                <label className="block mb-1 font-medium capitalize">{field.replace('_', ' ')} *</label>
                <input
                  id={field}
                  type={field === 'dob' ? 'date' : 'text'}
                  value={formData[field]}
                  onChange={field === 'number' || field === 'adhar' || field === 'no_of_boat'
                    ? handleNumberInput
                    : handleInput}
                  className="w-full border px-4 py-2 rounded"
                />
                {errors[field] && <p className="text-red-500 text-sm">{errors[field]}</p>}
              </div>
            ))}
          </div>

          <div className="mt-6">
            <label className="font-medium">Family Members</label>
            {formData.family.map((member, index) => (
              <div key={index} className="grid md:grid-cols-4 gap-4 mt-2">
                {['name', 'mobile', 'adhar', 'relation'].map(field => (
                  <div key={field}>
                    <input
                      type="text"
                      placeholder={field}
                      value={member[field]}
                      onChange={e => handleFamilyChange(index, field, e.target.value)}
                      className="w-full border px-4 py-2 rounded"
                    />
                    {errors.family?.[index]?.[field] && (
                      <p className="text-red-500 text-sm">{errors.family[index][field]}</p>
                    )}
                  </div>
                ))}
                {index > 0 && (
                  <button type="button" onClick={() => removeFamilyMember(index)} className="text-red-600 text-sm">Remove</button>
                )}
              </div>
            ))}
            <button type="button" onClick={addFamilyMember} className="mt-2 px-4 py-2 bg-blue-600 text-white rounded">+ Add Family</button>
          </div>

          <div className="flex justify-center mt-6">
            <button type="submit" className="px-8 py-2 bg-[#008080] text-white rounded-full font-bold">
              {saving ? 'Saving...' : 'Submit'}
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-white rounded shadow p-4">
          <div className="flex justify-between mb-4">
            <h2 className="text-xl font-bold text-blue-700">Registered Pilots</h2>
            <button className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"><FaDownload /> Export</button>
          </div>
          <div className="overflow-x-auto">
            {loading ? <p className="text-center">Loading...</p> : (
              <table className="w-full border text-sm text-left">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2">#</th>
                    <th className="px-4 py-2">Name</th>
                    <th className="px-4 py-2">Mobile</th>
                    <th className="px-4 py-2">Aadhar</th>
                    <th className="px-4 py-2">Boats</th>
                    <th className="px-4 py-2">Reg. No</th>
                    <th className="px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pilots.map((pilot, idx) => (
                    <tr key={pilot.id} className="border-b">
                      <td className="px-4 py-2">{idx + 1}</td>
                      <td className="px-4 py-2">{pilot.name}</td>
                      <td className="px-4 py-2">{pilot.number}</td>
                      <td className="px-4 py-2">{pilot.adhar}</td>
                      <td className="px-4 py-2">{pilot.no_of_boat}</td>
                      <td className="px-4 py-2">{pilot.registration_no}</td>
                      <td className="px-4 py-2 space-x-2">

                        <button className="text-blue-600"><FaEye onClick={()=>{
                          navigate(`/dashboard/poilet/pioletview/${pilot.id}`);
                        }} />
                        </button>
                        <button className="text-green-600"><FaPen onClick={()=>{
                          navigate(`/dashboard/poilet/pioletedit/${pilot.id}`);
                        }} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PilotManagement;

// /dashboard/boats/boatdetails/${boat.id}`