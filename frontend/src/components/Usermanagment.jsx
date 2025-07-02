import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";


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
  `flex items-center gap-2 px-6 py-2 rounded-full font-semibold transition ${active
    ? "bg-yellow-500 text-white"  // ← changed only this line
    : "bg-white text-green-700 hover:bg-green-50 shadow"
  }`;
const IconWrap = ({ children }) => (
  <span className="p-2 rounded-full bg-green-100 text-green-700">{children}</span>
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
  const [view, setView] = useState("role");           // default tab

  /* ---------- role state ---------- */
  const [form, setForm] = useState({ roleName: "" });
  const [roles, setRoles] = useState([]);
  const [showPerms, setShowPerms] = useState(true);   // 👁 toggle for perms

  const [districts, setDistricts] = useState([]);
  const [designation, setDesignation] = useState([]);

  const [editModal, setEditModal] = useState(false);
  const [editData, setEditData] = useState({ id: null, name: "" });

  const [deleteModal, setDeleteModal] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState(null);


  /* ---------- user state ---------- */
  const [userForm, setUserForm] = useState({
    fullName: "", email: "", district: "",
    designation: "", role: "",
    password: "", confirmPassword: ""
  });
  const [users, setUsers] = useState([]);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const { data } = await axios.get("http://localhost:8000/api/district-list", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (data?.data) setDistricts(data.data);
      } catch (err) {
        console.error("Failed to fetch districts:", err);
      }
    };

    fetchDistricts();
  }, []);


  useEffect(() => {
    const fetchDesignation = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const { data } = await axios.get("http://localhost:8000/api/designation", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (data?.data) setDesignation(data.data);
      } catch (err) {
        console.error("Failed to fetch designation :", err);
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
      const { data } = await api.put(`/roles/${editData.id}`, { name: editData.name });
      const updatedRoles = roles.map(r => r.id === editData.id ? data.role : r);
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
      setRoles(roles.filter(r => r.id !== roleToDelete.id));
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
      fullName: "", email: "", district: "", designation: "",
      role: "", password: "", confirmPassword: ""
    });
    setView("manage");
  };

  /* ====================================== JSX ====================================== */
  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="text-xl font-semibold text-center mb-6">User Management</h1>
      <Toaster position="top-right" reverseOrder={false} />


      {/* ---------- top nav ---------- */}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <button onClick={() => setView("role")} className={pill(view === "role")}>
          <IconWrap><FaUserTag /></IconWrap> Role
        </button>
        <button onClick={() => setView("create")} className={pill(view === "create")}>
          <IconWrap><FaUserPlus /></IconWrap> Create User
        </button>
        <button onClick={() => setView("manage")} className={pill(view === "manage")}>
          <IconWrap><FaUsers /></IconWrap> User List
        </button>
      </div>

      {/* ================= ROLE TAB ================= */}
      {view === "role" && (
        <div className="border rounded p-4">
          <button onClick={() => setView(null)} className="flex items-center gap-1 text-sm mb-4">
            <IconWrap><FaArrowLeft /></IconWrap> Back
          </button>

          {/* add role */}
        {/*  <div className="flex flex-col sm:flex-row items-center justify-between">
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
          </div>  */}

          {/* role table */}
          <table className="min-w-full text-sm border mt-6 border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <Th>Sr.No</Th>
                <Th>Role</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {roles.length === 0 ? (
                <tr>
                  <Td colSpan={3} className="text-center py-3">No roles</Td>
                </tr>
              ) : roles.map((r, i) => (
                <tr key={i} className="border-t">
                  <Td className="text-center">{i + 1}</Td>
                  <Td className="text-center">{r.name}</Td>
                  <Td className="flex gap-3 justify-center">
                    <button onClick={() => openEditModal(r)} className="text-blue-600"><FaEdit /></button>

                    <button onClick={() => {
                      setRoleToDelete(r);
                      setDeleteModal(true);
                    }} className="text-red-600">
                      <FaTrash />
                    </button>


                  </Td>
                </tr>
              ))}
            </tbody>
          </table>

        </div>
      )}

      {editModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded shadow p-6 w-80">
            <h2 className="text-lg font-semibold mb-4">Edit Role</h2>
            <input
              value={editData.name}
              onChange={(e) => setEditData({ ...editData, name: e.target.value })}
              className="w-full border p-2 rounded mb-4"
              placeholder="Role Name"
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setEditModal(false)} className="px-4 py-1 border rounded">
                Cancel
              </button>
              <button onClick={updateRole} className="px-4 py-1 bg-green-600 text-white rounded">
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
            <p className="mb-4">Are you sure you want to delete <strong>{roleToDelete?.name}</strong>?</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteModal(false)} className="px-4 py-1 border rounded">
                Cancel
              </button>
              <button onClick={confirmDeleteRole} className="px-4 py-1 bg-red-600 text-white rounded">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =============== CREATE USER TAB =============== */}
      {view === "create" && (
        <div className="border rounded p-4">
          <button onClick={() => setView(null)} className="flex items-center gap-1 text-sm mb-4">
            <IconWrap><FaArrowLeft /></IconWrap> Back
          </button>

          <div className="grid md:grid-cols-2 gap-4">
            {[
              ["fullName", "Full Name *"],
              ["email", "Email *"],
              // ["designation", "Designation *"],
            ].map(([name, label]) => (
              <div key={name}>
                <label className="text-sm font-semibold block mb-1">{label}</label>
                <input name={name} value={userForm[name]} onChange={onUserChange} className={input} />
              </div>
            ))}


            {/* Move district select OUTSIDE of map */}
            <div>
              <label className="text-sm font-semibold block mb-1">District *</label>
              <select
                name="district"
                value={userForm.district}
                onChange={onUserChange}
                className={input}
              >
                <option value="">Select district</option>
                {districts.map((d) => (
                  <option key={d.id} value={d.district_name}>{d.district_name}</option>
                ))}
              </select>
            </div>



            <div>
              <label className="text-sm font-semibold block mb-1">Designation *</label>
              <select
                name="designation"
                value={userForm.designation}
                onChange={onUserChange}
                className={input}
              >
                <option value="">Select designation</option>
                {designation.map((d) => (
                  <option key={d.id} value={d.name}>{d.name}</option>
                ))}
              </select>
            </div>



            {/* role select */}
            <div>
              <label className="text-sm font-semibold block mb-1">Assign Role *</label>
              <select name="role" value={userForm.role} onChange={onUserChange} className={input}>
                <option value="">Select role</option>
                {roles.filter(r => r && r.name).map((r, i) => (
                  <option key={i}>{r.name}</option>
                ))}

              </select>
            </div>

            {/* Contact No — placed next to confirmPassword to align */}
            <div>
              <label className="text-sm font-semibold block mb-1">Contact No *</label>
              <input
                type="number"
                name="contact"
                value={userForm.contact}
                onChange={onUserChange}
                className={input}
                placeholder="Enter contact number"
                maxLength={10}
              />
            </div>

            {/* passwords */}
            <div>
              <label className="text-sm font-semibold block mb-1">New Password *</label>
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
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-sm font-semibold block mb-1">Confirm Password *</label>
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
            </div>


          </div>


          <div className="flex justify-center">
            <button onClick={addUser} className="mt-6 px-8 py-2 bg-green-600 text-white rounded">
              Create User
            </button>
          </div>
        </div>
      )}

      {/* =============== MANAGE USERS TAB =============== */}
      {view === "manage" && (
        <div className="border rounded p-4">
          <button onClick={() => setView(null)} className="flex items-center gap-1 text-sm mb-4">
            <IconWrap><FaArrowLeft /></IconWrap> Back
          </button>

          <table className="min-w-full text-sm border">
            <thead className="bg-gray-100">
              <tr>{["#", "Full Name", "Email", "District", "Designation", "Role", "Actions"].map(h => <Th key={h}>{h}</Th>)}</tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr><Td colSpan={7} className="text-center py-3">No users</Td></tr>
              ) : users.map((u, i) => (
                <tr key={i} className="border-t">
                  <Td>{i + 1}</Td><Td>{u.fullName}</Td><Td>{u.email}</Td>
                  <Td>{u.district}</Td><Td>{u.designation}</Td><Td>{u.role}</Td>
                  {/* --------- EDIT / DELETE ICONS --------- */}
                  <Td className="flex justify-center gap-3">
                    <button className="p-1 text-blue-600 hover:text-blue-800" title="Edit">
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => setUsers(users.filter((_, idx) => idx !== i))}
                      className="p-1 text-red-600 hover:text-red-800" title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
