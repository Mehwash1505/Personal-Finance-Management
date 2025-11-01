import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);

  const onLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/login');
  };
  
  const closeMenu = () => setIsOpen(false);

  return (
    <header className="bg-surface-dark border-b border-border-dark sticky top-0 z-50">
      <nav className="container mx-auto flex justify-between items-center p-4">
        <Link to={user ? "/dashboard" : "/"} className="text-2xl font-bold text-primary z-50">
          Veritas
        </Link>

        <ul className="hidden lg:flex items-center space-x-6">
          {user ? (
            <>
              <li>
                <span className="text-text-muted">Welcome, <span className="font-semibold text-text-light">{user.name}</span></span>
              </li>

              <li><Link to="/dashboard" className="text-text-muted hover:text-primary font-medium transition-colors">Dashboard</Link></li>
              <li><Link to="/dashboard/goals" className="text-text-muted hover:text-primary font-medium transition-colors">Goals</Link></li>
              <li><Link to="/investments" className="text-text-muted hover:text-primary font-medium transition-colors">Investments</Link></li>
              <li><Link to="/bills" className="text-text-muted hover:text-primary font-medium transition-colors">Bills</Link></li>

              <li>
                <Link to="/profile" className="text-text-muted hover:text-primary font-medium transition-colors">
                  {/* Welcome, <span className="font-semibold text-text-light">{user.name}</span> */}
                  Update Profile
                </Link>
              </li>

              <li>
                <button onClick={onLogout} className="bg-danger hover:bg-opacity-90 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/login" className="text-text-muted hover:text-primary font-medium transition-colors">Login</Link>
              </li>
              <li>
                <Link to="/register" className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-hover transition-colors">
                  Register
                </Link>
              </li>
            </>
          )}
        </ul>

        <div className="lg:hidden z-50">
          <button onClick={() => setIsOpen(!isOpen)} className="text-text-light">
            {isOpen ? (
              <XMarkIcon className="w-8 h-8" />
            ) : (
              <Bars3Icon className="w-8 h-8" />
            )}
          </button>
        </div>

        {isOpen && (
          <motion.ul 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="lg:hidden absolute top-0 left-0 w-full min-h-screen bg-background flex flex-col items-center justify-center space-y-8 p-8"
          >
            {user ? (
              <>
                <li><Link to="/dashboard" onClick={closeMenu} className="text-2xl text-text-light hover:text-primary">Dashboard</Link></li>
                <li><Link to="/goals" onClick={closeMenu} className="text-2xl text-text-light hover:text-primary">Goals</Link></li>
                <li><Link to="/investments" onClick={closeMenu} className="text-2xl text-text-light hover:text-primary">Investments</Link></li>
                <li><Link to="/bills" onClick={closeMenu} className="text-2xl text-text-light hover:text-primary">Bills</Link></li>
                <li><Link to="/profile" onClick={closeMenu} className="text-2xl text-text-light hover:text-primary">Profile</Link></li>
                <li>
                  <button onClick={onLogout} className="bg-danger hover:bg-opacity-90 text-white font-bold py-3 px-6 rounded-lg text-lg">
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li><Link to="/login" onClick={closeMenu} className="text-2xl text-text-light hover:text-primary">Login</Link></li>
                <li><Link to="/register" onClick={closeMenu} className="bg-primary text-white font-bold py-3 px-6 rounded-lg text-lg">Register</Link></li>
              </>
            )}
          </motion.ul>
        )}

      </nav>
    </header>
  );
};

export default Navbar;