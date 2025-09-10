import { NavLink, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav className="bg-blue-600 text-white p-4 mb-4 shadow">
      <div className="container mx-auto flex justify-between items-center">
        <NavLink to="/" className="font-bold text-lg">Quiz App</NavLink>
        <div className="flex items-center space-x-4">
          <NavLink to="/" className={({isActive}) => isActive ? "underline" : undefined}>Home</NavLink>
          {!user && <NavLink to="/login" className={({isActive}) => isActive ? "underline" : undefined}>Login</NavLink>}
          {!user && <NavLink to="/register" className={({isActive}) => isActive ? "underline" : undefined}>Register</NavLink>}
          {user && user.role === "student" && <NavLink to="/quizzes" className={({isActive}) => isActive ? "underline" : undefined}>Quizzes</NavLink>}
          {user && user.role === "admin" && <NavLink to="/admin" className={({isActive}) => isActive ? "underline" : undefined}>Dashboard</NavLink>}
          {user && user.role === "admin" && <NavLink to="/admin/quizzes" className={({isActive}) => isActive ? "underline" : undefined}>Manage Quizzes</NavLink>}
          {user && user.role === "admin" && <NavLink to="/admin/results" className={({isActive}) => isActive ? "underline" : undefined}>Results</NavLink>}
          {user && <span className="ml-2 text-sm">{user.username} ({user.role})</span>}
          {user && <button onClick={handleLogout} className="ml-2 underline">Logout</button>}
        </div>
      </div>
    </nav>
  );
}
