import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaShip, FaPlusCircle, FaEye, FaFilter, FaDownload } from "react-icons/fa";
import axios from "axios";
import * as XLSX from "xlsx-js-style";
import { saveAs } from "file-saver";

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
  const [filters, setFilters] = useState({
    tehsil: "",
    incharge: "",
  });
  const [incharges, setIncharges] = useState([]);
  const [tehsils, setTehsils] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOwners = owners.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(owners.length / itemsPerPage);

  const fetchTehsils = async () => {
    try {
      const res = await api.get("/tehsil-list");
      if (res.data.status === "success") {
        setTehsils(res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch tehsils:", error);
    }
  };

  const fetchIncharges = async () => {
    try {
      const res = await api.get("/ghat-incharge-name");
      if (res.data.status === "success") {
        setIncharges(res.data.data.map((item) => item.name));
      }
    } catch (error) {
      console.error("Failed to fetch incharge names:", error);
    }
  };

  const fetchOwners = async () => {
    setLoading(true);
    try {
      const requestBody = {
        tehsil_code: filters.tehsil
          ? tehsils.find((t) => t.tehsil_name === filters.tehsil)?.tehsil_code
          : undefined,
        name: filters.incharge || undefined,
      };

      const res = await api.post("/boat-owner-list", requestBody);
      if (res.data.status === "success") {
        setOwners(res.data.data);
        setCurrentPage(1);
      }
    } catch (error) {
      console.error("Failed to fetch boat owners:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOwners();
    fetchTehsils();
    fetchIncharges();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const exportToExcel = () => {
    if (currentOwners.length === 0) {
      alert("No data available to export");
      return;
    }

    const wsData = [
      ['Sr.No', 'Name', 'Contact No', 'Aadhar No', 'Boats Owned', 'Pincode', 'Tehsil', 'Ghat In-charge'],
      ...currentOwners.map((owner, i) => [
        (currentPage - 1) * itemsPerPage + i + 1,
        owner.name || "—",
        owner.number || "NA",
        owner.adhar_no || "NA",
        owner.boats_count ?? "NA",
        owner.pincode ?? "NA",
        owner.tehsil_name || "NA",
        owner.user?.name || "NA",
      ]),
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    const headerStyle = {
      font: { bold: true, color: { rgb: "000000" } },
      alignment: { horizontal: "center" }
    };

    const range = XLSX.utils.decode_range(ws['!ref']);
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
      if (!ws[cellAddress]) continue;
      ws[cellAddress].s = headerStyle;
    }

    ws['!cols'] = [
      { wch: 8 }, { wch: 20 }, { wch: 15 }, { wch: 16 },
      { wch: 12 }, { wch: 10 }, { wch: 18 }, { wch: 20 }
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Boat Owners');

    const excelBuffer = XLSX.write(wb, {
      bookType: 'xlsx',
      type: 'array',
      cellStyles: true
    });

    saveAs(new Blob([excelBuffer], { type: 'application/octet-stream' }), 'boat_owners.xlsx');
  };

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
        <div className="flex flex-col sm:flex-row sm:justify-between items-stretch sm:items-center gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 sm:w-auto">
            <select
              name="tehsil"
              value={filters.tehsil}
              onChange={handleFilterChange}
              className="w-full sm:w-auto border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Tehsils</option>
              {tehsils.map((tehsil) => (
                <option key={tehsil.tehsil_code} value={tehsil.tehsil_name}>
                  {tehsil.tehsil_name}
                </option>
              ))}
            </select>

            <select
              name="incharge"
              value={filters.incharge}
              onChange={handleFilterChange}
              className="w-full sm:w-auto border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Incharges</option>
              {incharges.map((incharge) => (
                <option key={incharge} value={incharge}>
                  {incharge}
                </option>
              ))}
            </select>
          </div>

          <div className="flex sm:flex-row flex-col gap-2 w-full sm:w-auto ">
            <button
              onClick={exportToExcel}
              className=" text-white px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 flex items-center gap-2 w-full sm:w-auto"
            >
    <div className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md">
  <FaDownload className="text-base" />
  <span className="">Export Report</span>
</div>

            </button>
            {user?.role_id !== 1 && user?.role_id !== 3 && (
            <button
              onClick={() => navigate("/dashboard/addboatowner/boat-owners")}
              className="bg-green-600 text-white px-4 py-2 flex items-center justify-center gap-2 rounded-md hover:bg-green-700 transition w-full sm:w-auto"
            >
              <FaPlusCircle className="text-xl" />
              Add Boat Owners
            </button>
            )}
          </div>
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
                <th className="px-4 py-3">Ghat In-charge</th>
                 {user?.role_id !== 1 && user?.role_id !== 3 && (
                <th className="px-4 py-3">Add</th>
                 )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="9" className="text-center py-6">Loading...</td>
                </tr>
              ) : currentOwners.length > 0 ? (
                currentOwners.map((owner, idx) => (
                  <tr key={owner.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                    <td className="px-4 py-2 font-semibold">{owner.name || "—"}</td>
                    <td className="px-4 py-2">{owner.number || "NA"}</td>
                    <td className="px-4 py-2">{owner.adhar_no || "NA"}</td>
                    <td className="x-4 py-2 flex items-center gap-1 sm:ml-10 md:ml-10 ">
                      {owner.boats_count ?? "NA"}
                      <FaEye
                        onClick={() =>
                          navigate(`/dashboard/addboatowner/${owner.id}/boats?tab=directory`)
                        }
                        className="text-green-500 cursor-pointer hover:text-green-700"
                      />
                    </td>
                    <td className="px-4 py-2">{owner.pincode ?? "NA"}</td>
                    <td className="px-4 py-2">{owner.tehsil_name || "NA"}</td>
                    <td className="px-4 py-2">{owner.user?.name || "NA"}</td>
                    <td className="px-4 py-2">
                       {user?.role_id !== 1 && user?.role_id !== 3 && (
                      <button
                        onClick={() => navigate(`/dashboard/addboatowner/${owner.id}/boats`)}
                        className="text-sky-600 hover:text-sky-800 hover:underline"
                      >
                        + Add Boats
                      </button>
                       )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="text-center py-6 text-gray-500">
                    No boat owners found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {owners.length > itemsPerPage && (
            <div className="flex items-center justify-end mt-4 gap-2 p-4">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-md border ${
                  currentPage === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-green-700 hover:bg-green-50"
                } transition-colors`}
              >
                Previous
              </button>
              {Array.from({ length: totalPages }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentPage(idx + 1)}
                  className={`w-10 h-10 rounded-md flex items-center justify-center ${
                    currentPage === idx + 1
                      ? "bg-green-600 text-white font-medium"
                      : "bg-white text-green-700 hover:bg-green-50"
                  } transition-colors`}
                >
                  {idx + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-md border ${
                  currentPage === totalPages
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-green-700 hover:bg-green-50"
                } transition-colors`}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddBoatOwner;