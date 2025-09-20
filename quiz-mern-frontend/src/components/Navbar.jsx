import { NavLink, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
    navigate("/login");
  };

  const navLinkClasses = ({ isActive }) => 
    `px-3 py-2 rounded-lg transition-all duration-200 ${
      isActive 
        ? 'bg-indigo-700 text-white font-medium' 
        : 'text-indigo-100 hover:bg-indigo-700/50'
    }`;

  return (
    <nav className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo section */}
          <NavLink 
            to="/" 
            className="flex items-center space-x-3 text-xl font-bold"
            onClick={() => setIsOpen(false)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="hidden sm:block">SWAG & GDG Aptitude Test</span>
          </NavLink>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-2">
            <NavLink to="/" className={navLinkClasses}>Home</NavLink>
            {!user && (
              <>
                <NavLink to="/login" className={navLinkClasses}>Login</NavLink>
                <NavLink to="/register" className={navLinkClasses}>Register</NavLink>
              </>
            )}
            {user && user.role === "student" && (
              <NavLink to="/quizzes" className={navLinkClasses}>Quizzes</NavLink>
            )}
            {user && user.role === "admin" && (
              <>
                <NavLink to="/admin/quizzes" className={navLinkClasses}>Manage Quizzes</NavLink>
                <NavLink to="/admin/results" className={navLinkClasses}>Results</NavLink>
              </>
            )}
            {user && (
              <div className="flex items-center space-x-4 ml-4 border-l border-indigo-500 pl-4">
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-full bg-indigo-700 flex items-center justify-center">
                    <span className="text-sm font-medium">{user.username.charAt(0).toUpperCase()}</span>
                  </div>
                  <span className="text-sm font-medium">{user.username}</span>
                  <span className="text-xs px-2 py-1 bg-indigo-700 rounded-full">{user.role}</span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="px-3 py-1 text-sm bg-indigo-700 hover:bg-indigo-800 rounded-lg transition-colors duration-200"
                >
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button 
            className="md:hidden rounded-lg p-2 hover:bg-indigo-700 transition-colors duration-200"
            onClick={() => setIsOpen(!isOpen)}
          >
            <svg 
              className="h-6 w-6" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        <div className={`md:hidden ${isOpen ? 'block' : 'hidden'} pb-4`}>
          <div className="flex flex-col space-y-2">
            <NavLink 
              to="/" 
              className={navLinkClasses} 
              onClick={() => setIsOpen(false)}
            >
              Home
            </NavLink>
            {!user && (
              <>
                <NavLink 
                  to="/login" 
                  className={navLinkClasses}
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </NavLink>
                <NavLink 
                  to="/register" 
                  className={navLinkClasses}
                  onClick={() => setIsOpen(false)}
                >
                  Register
                </NavLink>
              </>
            )}
            {user && user.role === "student" && (
              <NavLink 
                to="/quizzes" 
                className={navLinkClasses}
                onClick={() => setIsOpen(false)}
              >
                Quizzes
              </NavLink>
            )}
            {user && user.role === "admin" && (
              <>
                <NavLink 
                  to="/admin/quizzes" 
                  className={navLinkClasses}
                  onClick={() => setIsOpen(false)}
                >
                  Manage Quizzes
                </NavLink>
                <NavLink 
                  to="/admin/results" 
                  className={navLinkClasses}
                  onClick={() => setIsOpen(false)}
                >
                  Results
                </NavLink>
              </>
            )}
            {user && (
              <div className="border-t border-indigo-500 pt-2 mt-2 space-y-2">
                <div className="flex items-center px-3 py-2">
                  <div className="h-8 w-8 rounded-full bg-indigo-700 flex items-center justify-center mr-3">
                    <span className="text-sm font-medium">{user.username.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{user.username}</span>
                    <span className="text-xs text-indigo-200">{user.role}</span>
                  </div>
                </div>
                <button 
                  onClick={handleLogout}
                  className="w-full px-3 py-2 text-sm bg-indigo-700 hover:bg-indigo-800 rounded-lg transition-colors duration-200 text-left"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
