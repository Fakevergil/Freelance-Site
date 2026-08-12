import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Check auth state whenever location changes
  useEffect(() => {
    const token =
      localStorage.getItem("token") || localStorage.getItem("authToken");
    setIsAuthenticated(!!token);
    setIsOpen(false); // Close mobile drawer on route change
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("authToken");
    setIsAuthenticated(false);
    navigate("/login");
  };

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Dashboard", path: "/dashboard" },
    { name: "Projects", path: "/projects" },
    { name: "Clients", path: "/clients" },
    { name: "Invoices", path: "/invoices" },
  ];

  const getLinkClass = ({ isActive }) =>
    `px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
      isActive
        ? "bg-indigo-50 text-indigo-600"
        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
    }`;

  const getMobileLinkClass = ({ isActive }) =>
    `px-4 py-3 rounded-xl text-sm font-semibold transition flex items-center justify-between ${
      isActive
        ? "bg-indigo-50 text-indigo-600 font-bold"
        : "text-slate-700 hover:bg-slate-100"
    }`;

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 focus:outline-none">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-sm">
              F
            </div>
            <span className="font-extrabold text-slate-900 tracking-tight text-base sm:text-lg">
              My Freelance Site
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink key={item.path} to={item.path} className={getLinkClass}>
                {item.name}
              </NavLink>
            ))}
          </div>

          {/* Desktop Right Action Area */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="bg-slate-100 hover:bg-slate-200 active:scale-[0.98] text-slate-700 font-semibold text-xs sm:text-sm px-4 py-2 rounded-xl transition"
              >
                Sign Out
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-slate-600 hover:text-slate-900 font-semibold text-xs sm:text-sm px-3.5 py-2 rounded-xl hover:bg-slate-100 transition"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-semibold text-xs sm:text-sm px-4 py-2 rounded-xl shadow-sm transition"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle menu"
            >
              {isOpen ? (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top-2 duration-200">
          <div className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={getMobileLinkClass}
                onClick={() => setIsOpen(false)}
              >
                <span>{item.name}</span>
                <span className="text-slate-400">→</span>
              </NavLink>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-2">
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="w-full text-center bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm py-2.5 rounded-xl transition"
              >
                Sign Out
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  className="text-center text-slate-700 bg-slate-100 hover:bg-slate-200 font-semibold text-sm py-2.5 rounded-xl transition"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="text-center text-white bg-indigo-600 hover:bg-indigo-700 font-semibold text-sm py-2.5 rounded-xl transition"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
