import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sun, Moon, LogOut, Menu, X, Landmark, BarChart3, Clock, LayoutDashboard, Send } from 'lucide-react';
import Button from '../ui/Button';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (!saved) return 'dark';
    if (saved === 'light') {
      localStorage.setItem('theme', 'dark');
      return 'dark';
    }
    return saved;
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const root = window.document.documentElement;
    const body = window.document.body;
    if (theme === 'dark') {
      root.classList.add('dark');
      body.classList.add('dark');
    } else {
      root.classList.remove('dark');
      body.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/');
  };

  const activeClass = (path) => {
    return location.pathname === path
      ? 'text-hdfc-blue dark:text-hdfc-blue-glow font-semibold'
      : 'text-hdfc-gray-800 dark:text-slate-300 hover:text-hdfc-blue dark:hover:text-hdfc-blue-glow font-medium';
  };

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-hdfc-gray-100 dark:border-slate-800 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2.5 active:scale-95 transition-transform">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-hdfc-blue to-hdfc-blue-light text-white shadow-md">
                <Landmark size={22} className="animate-pulse-subtle" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-black tracking-tight text-hdfc-blue dark:text-hdfc-blue-glow leading-none flex items-center gap-0.5">
                  Loan<span className="text-hdfc-red">IQ</span>
                </span>
                <span className="text-[9px] text-hdfc-gray-300 dark:text-slate-400 font-semibold mt-0.5 uppercase tracking-widest">
                  AI Decision Engine
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            {isAuthenticated && (
              <>
                <Link to="/predict" className={`flex items-center gap-1.5 text-sm ${activeClass('/predict')}`}>
                  <Send size={15} /> Apply Loan
                </Link>
                <Link to="/history" className={`flex items-center gap-1.5 text-sm ${activeClass('/history')}`}>
                  <Clock size={15} /> History
                </Link>
                <Link to="/analytics" className={`flex items-center gap-1.5 text-sm ${activeClass('/analytics')}`}>
                  <BarChart3 size={15} /> Analytics
                </Link>
                {isAdmin && (
                  <Link to="/admin" className={`flex items-center gap-1.5 text-sm ${activeClass('/admin')}`}>
                    <LayoutDashboard size={15} /> Model Health
                  </Link>
                )}
              </>
            )}
          </div>

          {/* User Profile / Theme / Actions */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-hdfc-gray-100 hover:bg-hdfc-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-hdfc-gray-800 dark:text-slate-300 transition-colors"
              aria-label="Toggle Theme"
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <div className="flex flex-col text-right">
                  <span className="text-sm font-semibold text-hdfc-gray-800 dark:text-slate-100">
                    {user?.full_name || user?.email}
                  </span>
                  <span className="text-[10px] font-bold text-hdfc-red uppercase tracking-wider leading-none mt-0.5">
                    {user?.role}
                  </span>
                </div>
                <Button variant="outline" size="sm" onClick={handleLogout} className="flex items-center gap-1.5">
                  <LogOut size={14} /> Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">Register</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-hdfc-gray-100 dark:bg-slate-800 text-hdfc-gray-800 dark:text-slate-300"
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-hdfc-gray-100 dark:bg-slate-800 text-hdfc-gray-800 dark:text-slate-300"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-t border-hdfc-gray-100 dark:border-slate-800 px-4 pt-2 pb-4 flex flex-col gap-2">
          {isAuthenticated ? (
            <>
              <Link
                to="/predict"
                onClick={() => setMobileMenuOpen(false)}
                className={`py-2 px-3 rounded-lg block text-sm ${activeClass('/predict')}`}
              >
                Apply Loan
              </Link>
              <Link
                to="/history"
                onClick={() => setMobileMenuOpen(false)}
                className={`py-2 px-3 rounded-lg block text-sm ${activeClass('/history')}`}
              >
                History
              </Link>
              <Link
                to="/analytics"
                onClick={() => setMobileMenuOpen(false)}
                className={`py-2 px-3 rounded-lg block text-sm ${activeClass('/analytics')}`}
              >
                Analytics
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`py-2 px-3 rounded-lg block text-sm ${activeClass('/admin')}`}
                >
                  Model Health
                </Link>
              )}
              <div className="h-[1px] bg-hdfc-gray-200 dark:bg-slate-800 my-2" />
              <div className="px-3 pb-2 flex flex-col">
                <span className="text-sm font-semibold text-hdfc-gray-800 dark:text-slate-100">
                  {user?.full_name || user?.email}
                </span>
                <span className="text-xs font-bold text-hdfc-red uppercase tracking-wider mt-0.5">
                  {user?.role}
                </span>
              </div>
              <Button variant="danger" size="sm" onClick={handleLogout} className="w-full flex items-center justify-center gap-1.5">
                <LogOut size={14} /> Logout
              </Button>
            </>
          ) : (
            <div className="flex flex-col gap-2 mt-2">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="w-full">
                <Button variant="outline" size="md" className="w-full">Sign In</Button>
              </Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="w-full">
                <Button variant="primary" size="md" className="w-full">Register</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
