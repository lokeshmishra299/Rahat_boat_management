import React, { useEffect, useState } from 'react';
import { FaDownload } from "react-icons/fa";
import * as XLSX from "xlsx-js-style";
import { saveAs } from 'file-saver';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE ?? "http://localhost:8000/api";
const token = localStorage.getItem("access_token");

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  },
});

const ExportData = () => {
  const [ghaats, setGhaats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function getApi() {
    try {
      setLoading(true);
      const res = await api.get("/district-summary");
      setGhaats(res.data?.[0]?.ghaats || []);
      console.log(res.data) // Use optional chaining and provide fallback
      setError(null);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load data. Please try again.");
      setGhaats([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getApi();
  }, []);

 const exportToExcel = () => {
  if (ghaats.length === 0) {
    alert("No data available to export");
    return;
  }

  const wsData = [
    ['S.No', 'Name of Ghat', 'Number of Boat Owners', 'Number of Boats'],
    ...ghaats.map((ghaat, i) => [
      i + 1,
      ghaat.ghaat_name || "NA",
      ghaat.total_boat_owners,
      ghaat.total_boats,
    ]),
  ];

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Define header style (dark background + bold white text)
 const headerStyle = {
  font: {
    bold: true,
    color: { rgb: "000000" } // Dark black text
  },
  alignment: { horizontal: "center" }
};

  // Apply style to the first row (headers)
  const range = XLSX.utils.decode_range(ws['!ref']);
for (let C = range.s.c; C <= range.e.c; ++C) {
  const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
  if (!ws[cellAddress]) continue;
  ws[cellAddress].s = headerStyle;
}

  // Set column widths
  ws['!cols'] = [
    { wch: 8 },   // S.No
    { wch: 25 },  // Name of Ghat
    { wch: 25 },  // Boat Owners
    { wch: 15 }   // Boats
  ];

  // Create workbook and export
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Boat Summary');

  // Generate Excel file with styling
  const excelBuffer = XLSX.write(wb, {
  bookType: 'xlsx',
  type: 'array',
  cellStyles: true // required in xlsx-style
});

  saveAs(
    new Blob([excelBuffer], { type: 'application/octet-stream' }),
    'boat_summary.xlsx'
  );
};

  if (loading) {
    return <div className="p-4">Loading data...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center sm:flex-row flex-col mb-4">
        <h2 className="text-xl font-semibold">Boat Management Summary </h2>
        <button
          onClick={exportToExcel}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 sm:px-4 sm:py-2 rounded-md transition-colors w-full sm:w-auto justify-center sm:justify-end"
        >
          <FaDownload className="text-sm sm:text-base" />
          <span className="text-sm sm:text-base">Export Report</span>
        </button>
      </div>
      {ghaats.length > 0 ? (
        <table className="min-w-full border border-gray-300 text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="border p-2">S.No</th>
              <th className="border p-2">Name of Ghat</th>
              <th className="border p-2">Number of Boat Owners</th>
              <th className="border p-2">Number of Boats</th>
            </tr>
          </thead>
          <tbody>
            {ghaats.map((ghaat, i) => (
              <tr key={i} className="text-center">
                <td className="border p-2">{i + 1}</td>
                <td className="border p-2">{ghaat.ghaat_name || "NA"}</td>
                <td className="border p-2">{ghaat.total_boat_owners}</td>
                <td className="border p-2">{ghaat.total_boats}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="text-center py-4 text-gray-500">No data available</div>
      )}
    </div>
  );
};

export default ExportData;