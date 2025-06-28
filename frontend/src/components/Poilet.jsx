import React, { useState } from 'react';
import { FaUserShield } from 'react-icons/fa';

const Pilot = () => {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    dob: '',
    boatNo: '',
    registration: '',
    family: '',
    relation: ''
  });

  // Handle number-only inputs (mobile, boatNo)
  const handleNumberInput = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Remove non-digit characters
    setFormData({
      ...formData,
      [e.target.id]: value
    });
  };

  // Handle text-only inputs (name)
  const handleTextInput = (e) => {
    const value = e.target.value.replace(/[^a-zA-Z\s]/g, ''); // Allow only letters and spaces
    setFormData({
      ...formData,
      [e.target.id]: value
    });
  };

  // Handle regular text inputs
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Form submission logic here
    console.log('Form submitted:', formData);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-6xl mx-auto p-6 mt-10 ">
      {/* <h1 className="text-2xl text-center font-bold text-gray-800 mb-6">Pilot Registration</h1> */}
      <div className="text-center mb-10">
                   <div className="inline-flex items-center justify-center bg-green-100 rounded-full p-3 shadow">
                     <FaUserShield className="text-[#008080] text-2xl" />
                   </div>
                   <h2 className="text-3xl sm:text-4xl font-bold text-[#008080] mt-4">
                    Pilot Registration
                   </h2>
                   <p className="text-gray-600 mt-2 max-w-xl mx-auto">
                     Register and track rescue boats with comprehensive documentation
                   </p>
                 </div>
      
      {/* Personal Information Section */}
      <div className="mb-8 ">
        {/* <h2 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Personal Information</h2> */}
        <div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ">
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="name">
              Name *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={handleTextInput}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter Full Name"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="mobile">
              Mobile No *
            </label>
            <input
              type="tel"
              id="mobile"
              value={formData.mobile}
              onChange={handleNumberInput}
              maxLength="10"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter 10-digit Mobile Number"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="email">
              Email ID
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter Email Address"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="dob">
              DOB
            </label>
            <input
              type="date"
              id="dob"
              value={formData.dob}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
      
      {/* Boat Information Section */}
      <div className="mb-8">
        {/* <h2 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Boat Information</h2> */}
        
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="boatNo">
              No of Boat
            </label>
            <input
              type="text"
              id="boatNo"
              value={formData.boatNo}
              onChange={handleNumberInput}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter Number of Boats"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="registration">
              Registration No
            </label>
            <input
              type="text"
              id="registration"
              value={formData.registration}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter Boat Registration Number"
            />
          </div>
        </div>
      </div>
      
      {/* Family Information Section */}
      <div className="mb-8">
        {/* <h2 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Family Information</h2> */}
        
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2" htmlFor="family">
            Add Family
          </label>
          <textarea
            id="family"
            value={formData.family}
            onChange={handleInputChange}
            rows="3"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter Family Members Details"
          ></textarea>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2" htmlFor="relation">
            Relation with Boat Owner
          </label>
          <select
            id="relation"
            value={formData.relation}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Relation</option>
            <option value="self">Self</option>
            {/* <option value="spouse">Spouse</option> */}
            <option value="child">Child</option>
            <option value="parent">Parent</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>
      
      {/* Submit Button */}
      <div className="flex justify-center items-center">
        <button
          type="submit"
          className="px-8 py-2 bg-[#008080] text-white font-medium rounded-full hover:bg-[#3d78c4] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
        >
          Register Pilot
        </button>
      </div>
        </div>
    </form>
  );
};

export default Pilot;