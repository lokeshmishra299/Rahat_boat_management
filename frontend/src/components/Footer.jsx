// src/components/Footer.jsx

import React from 'react';

const Footer = () => {
  return (
    <footer className="w-screen bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 text-center text-slate-700 py-4 text-sm sm:text-base shadow-inner mt-10">
      <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-x-1 gap-y-2 px-4">
        <span 
          onClick={() => window.open("https://rahat.up.nic.in/")} 
          className="font-bold cursor-pointer text-black">
          Office of the Relief Commissioner
        </span>, Govt. of Uttar Pradesh © 2025 | Developed by&nbsp;
        <span 
          onClick={() => window.open("https://techsseract.com/")} 
          className="font-semibold cursor-pointer text-emerald-600">
          CMP Techsseract LLP
        </span> | Powered by&nbsp;
        <span 
          onClick={() => window.open("https://upite.gov.in/Pages/Updesco")} 
          className="font-semibold cursor-pointer text-fuchsia-600">
          UPDESCO
        </span>
      </div>
    </footer>
  );
};

export default Footer;
