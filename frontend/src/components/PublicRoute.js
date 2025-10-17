// File: src/components/PublicRoute.js
import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const PublicRoute = () => {
  const { user } = useContext(AuthContext);

  if (user) {
    // If the user IS logged in, redirect them to the dashboard
    return <Navigate to="/dashboard" />;
  }

  // If the user is NOT logged in, show the child component (e.g., HomePage)
  return <Outlet />;
};

export default PublicRoute;