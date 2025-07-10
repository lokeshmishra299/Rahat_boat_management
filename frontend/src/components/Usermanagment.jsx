import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import { useLocation } from "react-router-dom";
import { FaDownload } from "react-icons/fa";

import {
  FaUserTag,
  FaUserPlus,
  FaUsers,
  FaArrowLeft,
  FaTrash,
  FaEdit,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_API_BASE ?? "http://localhost:8000/api";

const token = localStorage.getItem("access_token");

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  },
});

/* ---------- shared styles ---------- */
const input = "w-full p-2 border rounded";
const pill = (active) =>
  `flex items-center gap-2 px-6 py-2 rounded-full font-semibold transition ${
    active
      ? "bg-yellow-500 text-white" // ← changed only this line
      : "bg-white text-green-700 hover:bg-green-50 shadow"
  }`;
const IconWrap = ({ children }) => (
  <span className="p-2 rounded-full bg-green-100 text-green-700">
    {children}
  </span>
);

/* ---------- small helpers for tables ---------- */
const Th = ({ children, ...rest }) => (
  <th className="px-3 py-2 border" {...rest}>
    {children}
  </th>
);
const Td = ({ children, ...rest }) => (
  <td className="px-3 py-2" {...rest}>
    {children}
  </td>
);

export default function Usermanagment() {
  const location = useLocation();

  useEffect(() => {
    if (location.state?.tab === "manage") {
      setView("manage");
    }
  }, [location]);

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [view, setView] = useState("create"); // default tab
  const [errors, setErrors] = useState({});

  /* ---------- role state ---------- */
  const [form, setForm] = useState({ roleName: "" });
  const [roles, setRoles] = useState([]);
  const [showPerms, setShowPerms] = useState(true); // 👁 toggle for perms

  const [districts, setDistricts] = useState([]);
  const [designation, setDesignation] = useState([]);

  const [editModal, setEditModal] = useState(false);
  const [editData, setEditData] = useState({ id: null, name: "" });

  const [deleteModal, setDeleteModal] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState(null);

  /* ---------- user state ---------- */
  const [userForm, setUserForm] = useState({
    fullName: "",
    email: "",
    district: "",
    designation: "",
    role: "",
    password: "",
    confirmPassword: "",
  });
  const [users, setUsers] = useState([]);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [authUser, setAuthUser] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user")); // assume login pe yeh save hota h
    setAuthUser(user);
  }, []);

  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        const isAdmin = authUser?.role_id === null;

        const { data } = await api.get("/district-list", {
          params: isAdmin ? { excludeAssigned: true } : {},
        });

        if (data?.data) setDistricts(data.data);
      } catch (err) {
        console.error("Failed to fetch districts:", err);
      }
    };

    if (authUser) fetchDistricts();
  }, [authUser]);

  useEffect(() => {
    const fetchDesignation = async () => {
      try {
        const { data } = await api.get("/designation");
        if (data?.data) setDesignation(data.data);
      } catch (err) {
        console.error("Failed to fetch designation:", err);
      }
    };

    fetchDesignation();
  }, []);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const { data } = await api.get("/roles");
        if (data?.data) setRoles(data.data);
      } catch (err) {
        console.error("Failed to load roles:", err);
      }
    };

    fetchRoles();
  }, []);

  /* ---------- role helpers ---------- */
  const onRoleChange = (e) => setForm({ roleName: e.target.value });

  // const [authUser, setAuthUser] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user")); // assume login pe yeh save hota h
    setAuthUser(user);
  }, []);

  const addRole = async () => {
    const name = form.roleName.trim();
    if (!name) return alert("Enter role name");

    try {
      const { data } = await api.post("/roles", { name });

      // Add newly created role to list
      setRoles([...roles, data.data]);
      setForm({ roleName: "" });
      toast.success("Role added successfully!");
    } catch (err) {
      if (err.response?.data?.errors?.name) {
        toast.error(err.response.data.errors.name[0]);
      } else {
        toast.error("Failed to add role");
      }
    }
  };

  const openEditModal = (role) => {
    setEditData({ id: role.id, name: role.name });
    setEditModal(true);
  };

  const updateRole = async () => {
    try {
      const { data } = await api.put(`/roles/${editData.id}`, {
        name: editData.name,
      });
      const updatedRoles = roles.map((r) =>
        r.id === editData.id ? data.role : r
      );
      setRoles(updatedRoles);
      setEditModal(false);
      toast.success("Role updated successfully!");
    } catch (err) {
      toast.error("Failed to update role");
    }
  };

  const confirmDeleteRole = async () => {
    try {
      await api.delete(`/roles/${roleToDelete.id}`);
      setRoles(roles.filter((r) => r.id !== roleToDelete.id));
      toast.success("Role deleted successfully!");
    } catch (err) {
      toast.error("Failed to delete role");
    } finally {
      setDeleteModal(false);
      setRoleToDelete(null);
    }
  };

  /* ---------- user helpers ---------- */
  const onUserChange = (e) =>
    setUserForm({ ...userForm, [e.target.name]: e.target.value });

  const addUser = () => {
    const vals = Object.values(userForm).map((v) => v.trim());
    if (vals.some((v) => !v)) return alert("Fill all fields");
    if (userForm.password !== userForm.confirmPassword)
      return alert("Passwords do not match");
    setUsers([...users, userForm]);
    setUserForm({
      fullName: "",
      email: "",
      district: "",
      designation: "",
      role: "",
      password: "",
      confirmPassword: "",
    });
    setView("manage");
  };

  const [userLoading, setUserLoading] = useState(false);
  const [userList, setUserList] = useState([]);

  useEffect(() => {
    if (view === "manage") {
      setUserLoading(true);
      api
        .get("/user-list")
        .then((res) => {
          setUserList(res.data?.data || []);
        })
        .catch((err) => {
          console.error("Failed to fetch users", err);
        })
        .finally(() => {
          setUserLoading(false);
        });
    }
  }, [view]);

  // Pagenation
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = userList.slice(indexOfFirstItem, indexOfLastItem);

  /* ====================================== JSX ====================================== */
  return (
    <div className="p-4 min-h-screen max-w-5xl mx-auto">
      <h1 className="text-xl font-semibold text-center mb-6">
        User Management
      </h1>
      <Toaster position="top-right" reverseOrder={false} />

      {/* ---------- top nav ---------- */}
      <div className="grid sm:grid-cols-2 md:grid-cols-2 items-center text-center gap-4 mb-8">
        {/* <button onClick={() => setView("role")} className={pill(view === "role")}>
          <IconWrap><FaUserTag /></IconWrap> Role
        </button> */}
        <button
          onClick={() => setView("create")}
          className={pill(view === "create")}
        >
          <IconWrap>
            <FaUserPlus />
          </IconWrap>
          {authUser?.role_id === 1 ? "Create Ghat Incharge" : "Create User"}
        </button>

        <button
          onClick={() => setView("manage")}
          className={pill(view === "manage")}
        >
          <IconWrap>
            <FaUsers />
          </IconWrap>
          {authUser?.role_id === 1 ? "Ghat Incharge List" : "User List"}
        </button>
      </div>

      {/* ================= ROLE TAB ================= */}
      {/* {view === "role" && (
       <div className="border rounded p-6 shadow-md bg-white mt-28">
  <button onClick={() => setView(null)} className="flex items-center gap-1 text-sm mb-4 text-green-700 hover:text-green-900">
    <IconWrap><FaArrowLeft /></IconWrap> Back
  </button>


   <div className="flex flex-col sm:flex-row items-center justify-between">
        <div className="w-full sm:w-1/2">
          <label className="text-sm font-semibold block mb-1">Role Name</label>
          <input
            value={form.roleName}
            onChange={onRoleChange}
            placeholder="Enter role name"
            className={input}
          />
        </div>
        <button onClick={addRole} className="px-6 py-2 bg-green-600 text-white rounded mt-2 sm:mt-6">
          Register Role
        </button>
      </div> 
=
 <div className="overflow-x-auto mt-6">
  <table className="min-w-full text-sm border border-gray-200 shadow-sm rounded overflow-hidden">
    <thead className="bg-green-100 text-green-800 font-semibold">
      <tr>
        <Th className="text-center py-3">Sr.No</Th>
        <Th className="text-center py-3">Role</Th>
      </tr>
    </thead>
    <tbody>
      {roles.length === 0 ? (
        <tr>
          <Td colSpan={2} className="text-center py-4 text-gray-500">
            No roles available
          </Td>
        </tr>
      ) : (
        roles.map((r, i) => (
          <tr key={i} className="border-b hover:bg-gray-50 transition">
            <Td className="text-center py-3">{i + 1}</Td>
            <Td className="text-center py-3">
              {r.name === "district_nodal"
                ? "District Nodal"
                : r.name === "ghaat_nodal"
                ? "Ghaat Nodal"
                : r.name?.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()) || "N/A"}
            </Td>
          </tr>
        ))
      )}
    </tbody>
  </table>
</div>

</div>

      )} */}

      {editModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded shadow p-6 w-80">
            <h2 className="text-lg font-semibold mb-4">Edit Role</h2>
            <input
              value={editData.name}
              onChange={(e) =>
                setEditData({ ...editData, name: e.target.value })
              }
              className="w-full border p-2 rounded mb-4"
              placeholder="Role Name"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setEditModal(false)}
                className="px-4 py-1 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={updateRole}
                className="px-4 py-1 bg-green-600 text-white rounded"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded shadow p-6 w-80">
            <h2 className="text-lg font-semibold mb-4">Delete Role</h2>
            <p className="mb-4">
              Are you sure you want to delete{" "}
              <strong>{roleToDelete?.name}</strong>?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteModal(false)}
                className="px-4 py-1 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteRole}
                className="px-4 py-1 bg-red-600 text-white rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =============== CREATE USER TAB =============== */}

      {/* <ToastContainer /> */}
      <div>
        {view === "create" && (
          <div className="border rounded p-4">
            <button
              onClick={() => setView(null)}
              className="flex items-center gap-1 text-sm mb-4"
            >
              {/* <IconWrap><FaArrowLeft /></IconWrap> Back */}
            </button>

            <div className="grid md:grid-cols-2 gap-4">
              {[
                ["fullName", "Full Name *"],
                ["email", "Email *"],
              ].map(([name, label]) => (
                <div key={name}>
                  <label className="text-sm font-semibold block mb-1">
                    {label}
                  </label>
                  <input
                    name={name}
                    value={userForm[name]}
                    placeholder={`Enter ${label.replace(" *", "")}`}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (name === "fullName") {
                        // Only letters and space for fullName
                        if (/^[a-zA-Z\s.]*$/.test(value)) {
                          onUserChange(e);
                        }
                      } else {
                        // Allow full input for email and others
                        onUserChange(e);
                      }
                    }}
                    className={input}
                  />
                  {name === "fullName" && errors.name && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.name[0]}
                    </p>
                  )}
                  {name === "email" && errors.email && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.email[0]}
                    </p>
                  )}
                </div>
              ))}

              {authUser?.role_id !== 1 && (
                <div>
                  <label className="text-sm font-semibold block mb-1">
                    District *
                  </label>
                  <select
                    name="district"
                    value={userForm.district}
                    onChange={onUserChange}
                    className={input}
                  >
                    <option value="">Select district</option>
                    {districts.map((d) => (
                      <option key={d.district_code} value={d.district_name}>
                        {d.district_name}
                      </option>
                    ))}
                  </select>
                  {errors.district_id && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.district_id[0]}
                    </p>
                  )}
                </div>
              )}

              {authUser?.role_id !== 1 && (
                <div>
                  <label className="text-sm font-semibold block mb-1">
                    Designation *
                  </label>
                  <select
                    name="designation"
                    value={userForm.designation}
                    onChange={onUserChange}
                    className={input}
                  >
                    <option value="">Select designation</option>
                   {designation
  .filter((d) => {
    // If District Nodal, only allow Ghaat Nodal (id = 2)
    if (authUser?.role_id === 1) return d.id === 2;
    return true; // For others, show all
  })
  .map((d) => (
    <option key={d.id} value={d.name}>
      {d.name}
    </option>
))}

                  </select>
                  {errors.designation_id && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.designation_id[0]}
                    </p>
                  )}
                </div>
              )}

              {authUser?.role_id !== 1 && (
                <div>
                  <label className="text-sm font-semibold block mb-1">
                    Assign Role *
                  </label>
                  <select
                    name="role"
                    value={userForm.role}
                    onChange={onUserChange}
                    className={input}
                  >
                    <option value="">Select role</option>
                    {roles
                      .filter((r) => r && r.name)
                      .map((r, i) => (
                        <option key={i} value={r.name}>
                          {r.name
                            .split("_")
                            .map(
                              (word) =>
                                word.charAt(0).toUpperCase() + word.slice(1)
                            )
                            .join(" ")}
                        </option>
                      ))}
                  </select>
                  {errors.role_id && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.role_id[0]}
                    </p>
                  )}
                </div>
              )}

              <div>
                <label className="text-sm font-semibold block mb-1">
                  Contact No *
                </label>
                <input
                  type="text"
                  name="contact"
                  value={userForm.contact}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d*$/.test(value) && value.length <= 10) {
                      onUserChange(e);
                    }
                  }}
                  className={input}
                  placeholder="Enter contact number"
                />
                {errors.number && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.number[0]}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-semibold block mb-1">
                  New Password *
                </label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    name="password"
                    value={userForm.password}
                    onChange={onUserChange}
                    className={input}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute top-2 right-3 text-lg text-gray-600 hover:text-indigo-600"
                  >
                    {showPass ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.password[0]}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-semibold block mb-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    name="confirmPassword"
                    value={userForm.confirmPassword}
                    onChange={onUserChange}
                    className={input}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute top-2 right-3 text-lg text-gray-600 hover:text-indigo-600"
                  >
                    {showConfirm ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.password_confirmation && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.password_confirmation[0]}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-center">
              <button
                disabled={loading}
                onClick={async () => {
                  setLoading(true);
                  try {
                    const isDistrictNodal = authUser?.role_id === 1;

const roleId = isDistrictNodal
  ? roles.find((r) => r.name === "ghaat_nodal")?.id
  : roles.find((r) => r.name === userForm.role)?.id;

const districtId = isDistrictNodal
  ? authUser?.district_id
  : districts.find((d) => d.district_name === userForm.district)?.id;

const designationId = isDistrictNodal
  ? 2 // ✅ Force designation ID to 2 for ghat nodal
  : designation.find((d) => d.name === userForm.designation)?.id;

const payload = {
  name: userForm.fullName,
  email: userForm.email,
  password: userForm.password,
  password_confirmation: userForm.confirmPassword,
  role_id: roleId,
  district_id: districtId,
  designation_id: designationId,
  number: userForm.contact,
};


                    console.log("PAYLOAD", payload);

                    await api.post("/users", payload);

                    toast.success("User created successfully ✅");

                    setUserForm({
                      fullName: "",
                      email: "",
                      password: "",
                      confirmPassword: "",
                      role: "",
                      district: "",
                      designation: "",
                      contact: "",
                    });

                    setErrors({});
                    setView("manage");
                  } catch (error) {
                    const apiErrors = error.response?.data?.errors || {};
                    setErrors(apiErrors);
                  } finally {
                    setLoading(false);
                  }
                }}
                className={`mt-6 px-8 py-2 font-semibold text-white rounded ${
                  loading ? "bg-gray-400" : "bg-yellow-400"
                }`}
              >
                {loading ? "Creating..." : "Create User"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* =============== MANAGE USERS TAB =============== */}
      {view === "manage" && (
        <div className="border rounded p-4">
          <button
            onClick={() => setView(null)}
            className="flex items-center gap-1 text-sm mb-4"
          >
            {/* <IconWrap><FaArrowLeft /></IconWrap> Back */}
          </button>

          <div className="flex flex-col sm:flex-row justify-between items-center  mb-6 gap-4">
            <h3 className="text-xl sm:text-2xl font-bold text-blue-800 text-center sm:text-left">
              Registered User Lists
            </h3>
            <button
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 sm:px-4 sm:py-2 rounded-md transition-colors w-full sm:w-auto justify-center sm:justify-end"
              onClick={() => {
                if (!userList || userList.length === 0) {
                  alert("No users to export.");
                  return;
                }

                // CSV Headers
                const headers = [
                  "Sr.No",
                  "Full Name",
                  "Email",
                  "District",
                  "Designation",
                  "Role",
                ];

                // CSV Rows
                const rows = userList.map((u, idx) => [
                  idx + 1,
                  `"${u.name}"`,
                  `"${u.email}"`,
                  `"${u.district?.district_name || "N/A"}"`,
                  `"${u.designation?.name || "N/A"}"`,
                  `"${
                    u.role?.name === "ghaat_nodal"
                      ? "Ghaat Incharge"
                      : u.role?.name === "district_nodal"
                      ? "Ghat Incharge"
                      : u.role?.name || "N/A"
                  }"`,
                ]);

                // Combine headers + rows
                const csvContent = [
                  headers.join(","),
                  ...rows.map((row) => row.join(",")),
                ].join("\n");

                // Trigger download
                const blob = new Blob([csvContent], {
                  type: "text/csv;charset=utf-8;",
                });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.setAttribute("href", url);
                link.setAttribute(
                  "download",
                  `user_report_${new Date().toISOString().slice(0, 10)}.csv`
                );
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
            >
              <FaDownload className="text-sm sm:text-base" />
              <span className="text-sm sm:text-base">Export Report</span>
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border border-gray-200">
              <thead className="bg-gray-100 text-center">
                <tr>
                  {[
                    "S.No",
                    "Full Name",
                    "Email",
                    "District",
                    "Designation",
                    "Role",
                    "Actions",
                  ].map((h) => (
                    <Th
                      key={h}
                      className="px-4 py-2 text-sm font-semibold text-gray-700 border"
                    >
                      {h}
                    </Th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-center">
                {userLoading ? (
                  <tr>
                    <Td colSpan={7} className="py-3 text-slate-500">
                      Loading users...
                    </Td>
                  </tr>
                ) : userList.length === 0 ? (
                  <tr>
                    <Td colSpan={7} className="py-3">
                      No users
                    </Td>
                  </tr>
                ) : (
                  currentUsers.map((u, i) => {
                    let roleLabel = "N/A";
                    if (u.role?.name === "ghaat_nodal")
                      roleLabel = "Ghat Incharge";
                    else if (u.role?.name === "district_nodal")
                      roleLabel = "Ghat Incharge";
                    else if (u.role?.name) roleLabel = u.role.name;

                    return (
                      <tr key={u.id || i} className="border-t hover:bg-gray-50">
                        <Td className="px-4 py-2">
                          {indexOfFirstItem + i + 1}
                        </Td>
                        <Td className="px-4 py-2">{u.name}</Td>
                        <Td className="px-4 py-2">{u.email}</Td>
                        <Td className="px-4 py-2">
                          {u.district?.district_name || "N/A"}
                        </Td>
                        <Td className="px-4 py-2">
                          {u.designation?.name || "N/A"}
                        </Td>
                        <Td className="px-4 py-2">{roleLabel}</Td>
                        <Td className="px-4 py-2">
                          <div className="flex justify-center gap-3">
                            <button
                              onClick={() => {
                                navigate(
                                  `/dashboard/usermanagment/userlistview/${u.id}`
                                );
                              }}
                              className="text-blue-600 hover:text-blue-800"
                              title="View"
                            >
                              <FaEye />
                            </button>
                            <button
                              onClick={() => {
                                navigate(
                                  `/dashboard/usermanagment/userlistedit/${u.id}`
                                );
                              }}
                              className="text-green-600 hover:text-green-800"
                              title="Edit"
                            >
                              <FaEdit />
                            </button>
                          </div>
                        </Td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
             <div className="flex mt-4 gap-2 justify-end">
  {/* Previous Button */}
  <button
    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
    disabled={currentPage === 1}
    className={`px-3 py-1 rounded border ${
      currentPage === 1
        ? "bg-gray-300 text-gray-600 cursor-not-allowed"
        : "bg-white text-green-700"
    }`}
  >
    Prev
  </button>

  {/* Page Numbers */}
  {Array.from({ length: Math.ceil(userList.length / itemsPerPage) }).map((_, idx) => (
    <button
      key={idx}
      onClick={() => setCurrentPage(idx + 1)}
      className={`px-3 py-1 rounded border ${
        currentPage === idx + 1
          ? "bg-green-600 text-white"
          : "bg-white text-green-700"
      }`}
    >
      {idx + 1}
    </button>
  ))}

  {/* Next Button */}
  <button
    onClick={() =>
      setCurrentPage(prev =>
        Math.min(prev + 1, Math.ceil(userList.length / itemsPerPage))
      )
    }
    disabled={currentPage === Math.ceil(userList.length / itemsPerPage)}
    className={`px-3 py-1 rounded border ${
      currentPage === Math.ceil(userList.length / itemsPerPage)
        ? "bg-gray-300 text-gray-600 cursor-not-allowed"
        : "bg-white text-green-700"
    }`}
  >
    Next
  </button>
</div>

          </div>
        </div>
      )}
    </div>
  );
}