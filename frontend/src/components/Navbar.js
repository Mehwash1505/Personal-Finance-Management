import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const onLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-surface-dark bg-blue-600 border-b border-border-dark sticky top-0 z-10">
      <nav className="container mx-auto flex justify-between items-center p-4">
        <Link to={user ? "/dashboard" : "/"} className="text-2xl font-bold text-primary">
          Veritas
        </Link>
        <ul className="flex items-center space-x-6">
          {user ? (
            <>
              <li>
                <span className="text-text-muted">Welcome, <span className="font-semibold text-text-light">{user.name}</span></span>
              </li>

              <li>
                <Link to="/dashboard" className="text-text-muted hover:text-primary font-medium transition-colors">Dashboard</Link>
              </li>
              <li>
                <Link to="/dashboard/goals" className="text-text-muted hover:text-primary font-medium transition-colors">Goals</Link>
              </li>
              <li>
                <Link to="/investments" className="text-text-muted hover:text-primary font-medium transition-colors">Investments</Link>
              </li>

              <li>
                <Link to="/bills" className="text-text-muted hover:text-primary font-medium transition-colors">Bills</Link>
              </li>


              <Link to="/profile" className="text-text-muted hover:text-primary font-medium transition-colors">
                {/* Welcome, <span className="font-semibold text-text-light">{user.name}</span> */}
                Update Profile
              </Link>
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
      </nav>
    </header>
  );
};

export default Navbar;