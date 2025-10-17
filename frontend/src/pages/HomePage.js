// File: src/pages/HomePage.js
import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center mt-20">
      <h1 className="text-5xl font-extrabold text-gray-800 mb-4">
        Take Control of Your Finances
      </h1>
      <p className="text-lg text-gray-600 max-w-2xl mb-8">
        The Personal Finance Management Dashboard helps you track your income, expenses, and investments in one place. Gain insights, create budgets, and achieve your financial goals with clarity.
      </p>
      <div className="flex space-x-4">
        <Link 
          to="/register" 
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg text-lg transition duration-300"
        >
          Get Started
        </Link>
        <Link 
          to="/login" 
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-lg text-lg transition duration-300"
        >
          Login
        </Link>
      </div>
    </div>
  );
};

export default HomePage;