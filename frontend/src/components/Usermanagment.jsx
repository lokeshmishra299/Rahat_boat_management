import React, { useState } from "react";
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

/* ---------- shared styles ---------- */
const input = "w-full p-2 border rounded";
const pill = (active) =>
  `flex items-center gap-2 px-6 py-2 rounded-full font-semibold transition ${
    active
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

  /* ---------- user state ---------- */
  const [userForm, setUserForm] = useState({
    fullName: "", email: "", district: "",
    designation: "", role: "",
    password: "", confirmPassword: ""
  });
  const [users, setUsers] = useState([]);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  /* ---------- role helpers ---------- */
  const onRoleChange = (e) => setForm({ roleName: e.target.value });
  const addRole = () => {
    const name = form.roleName.trim();
    if (!name) return alert("Enter role name");
    if (roles.some(r => r.name === name)) return alert("Role exists");
    setRoles([...roles, { name, perms: Math.floor(Math.random() * 10) }]); // dummy perms
    setForm({ roleName: "" });
  };
  const editRole = (idx) => {
    const newName = prompt("Edit role name:", roles[idx].name);
    if (!newName?.trim()) return;
    setRoles(roles.map((r, i) => (i === idx ? { ...r, name: newName.trim() } : r)));
  };
  const deleteRole = (idx) =>
    window.confirm("Delete this role?") && setRoles(roles.filter((_, i) => i !== idx));

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

      {/* ---------- top nav ---------- */}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <button onClick={() => setView("role")}   className={pill(view === "role")}>
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

          {/* role table */}
          <table className="min-w-full text-sm border mt-6">
            <thead className="bg-gray-100">
              <tr>
                <Th>#</Th><Th>Role</Th><Th>Actions</Th>
                <Th>
                  <div className="flex items-center justify-center gap-2">
                    Perms
                    <button
                      onClick={() => setShowPerms(!showPerms)}
                      className="text-lg text-gray-600 hover:text-indigo-600"
                    >
                      {showPerms ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </Th>
              </tr>
            </thead>
            <tbody>
              {roles.length === 0 ? (
                <tr><Td colSpan={4} className="text-center py-3">No roles</Td></tr>
              ) : roles.map((r, i) => (
                <tr key={i} className="border-t">
                  <Td>{i + 1}</Td><Td>{r.name}</Td>
                  <Td className="flex gap-3 justify-center">
                    <button onClick={() => editRole(i)}   className="text-blue-600"><FaEdit /></button>
                    <button onClick={() => deleteRole(i)} className="text-red-600"><FaTrash /></button>
                  </Td>
                  <Td className="text-center">{showPerms ? r.perms : "•••"}</Td>
                </tr>
              ))}
            </tbody>
          </table>
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
              ["email",    "Email *"],
              ["district", "District *"],
              ["designation","Designation *"],
            ].map(([name,label])=>(
              <div key={name}>
                <label className="text-sm font-semibold block mb-1">{label}</label>
                <input name={name} value={userForm[name]} onChange={onUserChange} className={input}/>
              </div>
            ))}

            {/* role select */}
            <div>
              <label className="text-sm font-semibold block mb-1">Assign Role *</label>
              <select name="role" value={userForm.role} onChange={onUserChange} className={input}>
                <option value="">Select role</option>
                {roles.map((r,i)=><option key={i}>{r.name}</option>)}
              </select>
            </div>

            {/* passwords with icon toggles */}
            {["password","confirmPassword"].map((nm,idx)=>(
              <div key={nm}>
                <label className="text-sm font-semibold block mb-1">
                  {idx===0?"New Password *":"Confirm Password *"}
                </label>
                <div className="relative">
                  <input
                    type={(idx===0?showPass:showConfirm)?"text":"password"}
                    name={nm}
                    value={userForm[nm]}
                    onChange={onUserChange}
                    className={input}
                  />
                  <button
                    type="button"
                    onClick={()=> idx===0 ? setShowPass(!showPass) : setShowConfirm(!showConfirm)}
                    className="absolute top-2 right-3 text-lg text-gray-600 hover:text-indigo-600"
                  >
                    { (idx===0?showPass:showConfirm) ? <FaEyeSlash/> : <FaEye/> }
                  </button>
                </div>
              </div>
            ))}
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
              <tr>{["#","Full Name","Email","District","Designation","Role","Actions"].map(h=><Th key={h}>{h}</Th>)}</tr>
            </thead>
            <tbody>
              {users.length===0 ? (
                <tr><Td colSpan={7} className="text-center py-3">No users</Td></tr>
              ) : users.map((u,i)=>(
                <tr key={i} className="border-t">
                  <Td>{i+1}</Td><Td>{u.fullName}</Td><Td>{u.email}</Td>
                  <Td>{u.district}</Td><Td>{u.designation}</Td><Td>{u.role}</Td>
                  {/* --------- EDIT / DELETE ICONS --------- */}
                  <Td className="flex justify-center gap-3">
                    <button className="p-1 text-blue-600 hover:text-blue-800" title="Edit">
                      <FaEdit/>
                    </button>
                    <button
                      onClick={()=>setUsers(users.filter((_,idx)=>idx!==i))}
                      className="p-1 text-red-600 hover:text-red-800" title="Delete"
                    >
                      <FaTrash/>
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
