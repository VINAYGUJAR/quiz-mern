import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();

  // 🚀 If already logged in, redirect away from login page
  useEffect(() => {
    if (user) {
      navigate("/"); // go to homepage (or dashboard)
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(form.email, form.password);
      setError(""); // clear error if success
      navigate("/");
    } catch (err) {
      setError("Invalid email or password. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-gray-100">
        <h2 className="text-2xl font-extrabold text-center text-gray-800 mb-6">
          Welcome Back 👋
        </h2>
        <p className="text-center text-gray-500 mb-6">
          Login to continue to your Quiz Club
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 transition"
            type="email"
            placeholder="Enter your email"
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 transition"
            type="password"
            placeholder="Enter your password"
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          {/* 🚨 Error message */}
          {error && (
            <p className="text-red-600 text-sm font-medium text-center bg-red-50 py-2 rounded-lg">
              {error}
            </p>
          )}

          <button className="w-full bg-gradient-to-r from-indigo-400 to-purple-400 hover:from-indigo-500 hover:to-purple-500 text-white py-3 rounded-lg font-semibold shadow-md transition">
            Login
          </button>
        </form>

        <div className="mt-6 text-center text-gray-500 text-sm">
          Don’t have an account?{" "}
          <span 
           onClick={() => navigate("/register")}
          className="text-indigo-500 font-semibold cursor-pointer hover:underline">
            Register
          </span>
        </div>
      </div>
    </div>
  );
}

export default Login;
