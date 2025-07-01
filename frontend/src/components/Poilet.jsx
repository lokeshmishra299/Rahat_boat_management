import React, { useState } from 'react';
import { FaUserShield } from 'react-icons/fa';

const Pilot = () => {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    aadhar: '',
    dob: '',
    boatNo: '',
    registration: '',
    family: [
      {
        name: '',
        mobile: '',
        aadhar: '',
        relation: ''
      }
    ]
  });

  const handleNumberInput = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    setFormData({ ...formData, [e.target.id]: value });
  };

  const handleTextInput = (e) => {
    const value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
    setFormData({ ...formData, [e.target.id]: value });
  };

  const handleInputChange = (e) => {
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
      family: [...formData.family, { name: '', mobile: '', aadhar: '', relation: '' }]
    });
  };

  const removeFamilyMember = (index) => {
    const updatedFamily = formData.family.filter((_, i) => i !== index);
    setFormData({ ...formData, family: updatedFamily });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-6xl mx-auto p-6 mt-10">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center bg-green-100 rounded-full p-3 shadow">
          <FaUserShield className="text-[#008080] text-2xl" />
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-[#008080] mt-4">Pilot Registration</h2>
        <p className="text-gray-600 mt-2 max-w-xl mx-auto">
          Register and track rescue boats with comprehensive documentation
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <label htmlFor="name" className="block text-gray-700 font-medium mb-2">Name *</label>
          <input id="name" type="text" value={formData.name} onChange={handleTextInput} className="w-full px-4 py-2 border border-gray-300 rounded-md" placeholder="Enter Full Name" required />
        </div>
        <div>
          <label htmlFor="mobile" className="block text-gray-700 font-medium mb-2">Mobile No *</label>
          <input id="mobile" type="tel" value={formData.mobile} onChange={handleNumberInput} maxLength="10" className="w-full px-4 py-2 border border-gray-300 rounded-md" placeholder="Enter Mobile Number" required />
        </div>
        <div>
          <label htmlFor="email" className="block text-gray-700 font-medium mb-2">Email ID</label>
          <input id="email" type="email" value={formData.email} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-md" placeholder="Enter Email Address" />
        </div>
        <div>
          <label htmlFor="aadhar" className="block text-gray-700 font-medium mb-2">Aadhar No *</label>
          <input id="aadhar" type="text" value={formData.aadhar} onChange={handleNumberInput} maxLength="12" className="w-full px-4 py-2 border border-gray-300 rounded-md" placeholder="Enter Aadhar Number" required />
        </div>
        <div>
          <label htmlFor="dob" className="block text-gray-700 font-medium mb-2">DOB</label>
          <input id="dob" type="date" value={formData.dob} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-md" />
        </div>
        <div>
          <label htmlFor="boatNo" className="block text-gray-700 font-medium mb-2">No of Boats</label>
          <input id="boatNo" type="text" value={formData.boatNo} onChange={handleNumberInput} className="w-full px-4 py-2 border border-gray-300 rounded-md" placeholder="Enter Number of Boats" />
        </div>
        <div>
          <label htmlFor="registration" className="block text-gray-700 font-medium mb-2">Registration No</label>
          <input id="registration" type="text" value={formData.registration} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-md" placeholder="Enter Registration Number" />
        </div>
      </div>

      <div className="mb-8">
        <label className="block text-gray-700 font-medium mb-2">Family Members</label>
        {formData.family.map((member, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <input type="text" placeholder="Name" value={member.name} onChange={(e) => handleFamilyChange(index, 'name', e.target.value)} className="px-4 py-2 border border-gray-300 rounded-md" />
            <input type="text" placeholder="Mobile" value={member.mobile} onChange={(e) => handleFamilyChange(index, 'mobile', e.target.value.replace(/\D/g, ''))} className="px-4 py-2 border border-gray-300 rounded-md" />
            <input type="text" placeholder="Aadhar" value={member.aadhar} onChange={(e) => handleFamilyChange(index, 'aadhar', e.target.value.replace(/\D/g, ''))} className="px-4 py-2 border border-gray-300 rounded-md" />
            <input type="text" placeholder="Relation with Owner" value={member.relation} onChange={(e) => handleFamilyChange(index, 'relation', e.target.value)} className="px-4 py-2 border border-gray-300 rounded-md" />
            {index > 0 && (
              <button type="button" onClick={() => removeFamilyMember(index)} className="text-red-600 text-sm col-span-full">Remove</button>
            )}
          </div>
        ))}
        <button type="button" onClick={addFamilyMember} className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">+ Add Family Member</button>
      </div>

      <div className="flex justify-center">
        <button type="submit" className="px-8 py-2 bg-[#008080] text-white font-medium rounded-full hover:bg-[#3d78c4] focus:outline-none focus:ring-2 focus:ring-blue-500">Register Pilot</button>
      </div>
    </form>
  );
};

export default Pilot;