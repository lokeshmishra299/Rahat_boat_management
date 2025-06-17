import React from 'react';

const Header = () => {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 px-4 py-4 bg-white shadow-sm">
      {/* Logo + Title */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="bg-gradient-to-br from-purple-600 to-purple-800 text-white px-5 py-3 rounded-2xl font-extrabold text-2xl shadow-md">
          UP
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-purple-700">
            Relief Commissioner Portal
          </h1>
          <p className="text-sm text-gray-500 font-medium">
            Advanced Boat Management System · Uttar Pradesh
          </p>
        </div>
      </div>

      {/* Status + Settings */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full shadow-sm">
          🟢 75 Districts Online
        </span>
        <button className="border px-4 py-1 rounded-md hover:bg-gray-100 transition text-sm font-medium">
          Settings
        </button>
      </div>
    </header>
  );
};

export default Header;
