import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="bg-gray-100 p-4">
      <nav className="container mx-auto flex justify-between">
        <Link to="/" className="text-xl font-bold">PFM</Link>
        <ul className="flex space-x-4">
          <li>
            <Link to="/login" className="hover:text-blue-500">Login</Link>
          </li>
          <li>
            <Link to="/register" className="hover:text-blue-500">Register</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;