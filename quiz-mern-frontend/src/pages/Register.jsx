import { useState, useContext } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";

function Register() {
  const [form, setForm] = useState({ username: "", email: "", password: "", role: "student" });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post("/auth/register", form);
    navigate("/login");
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Register</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input className="w-full border p-2 rounded" placeholder="Username" onChange={e => setForm({...form, username: e.target.value})}/>
        <input className="w-full border p-2 rounded" type="email" placeholder="Email" onChange={e => setForm({...form, email: e.target.value})}/>
        <input className="w-full border p-2 rounded" type="password" placeholder="Password" onChange={e => setForm({...form, password: e.target.value})}/>
        <select className="w-full border p-2 rounded" onChange={e => setForm({...form, role: e.target.value})}>
          <option value="student">Student</option>
          <option value="admin">Admin</option>
        </select>
        <button className="w-full bg-blue-600 text-white py-2 rounded">Register</button>
      </form>
    </div>
  );
}

export default Register;
