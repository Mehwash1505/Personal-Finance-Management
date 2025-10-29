import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute'; // <-- 1. Import PublicRoute
import GoalsPage from './pages/GoalsPage';
import ProfilePage from './pages/ProfilePage';
import InvestmentsPage from './pages/InvestmentsPage';
import BillsPage from './pages/BillsPage';

function App() {
  return (
    <Router>
      <Navbar />
      <main className="container mx-auto p-4">
        <Routes>
          {/* --- 2. Wrap Public Routes --- */}
          <Route path="/" element={<PublicRoute />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* --- Protected Route --- */}
          <Route path="/dashboard" element={<ProtectedRoute />}>
            <Route index element={<DashboardPage />} />
            <Route path='goals' element= {<GoalsPage />}/>
          </Route>

          <Route path="/bills" element={<ProtectedRoute />}>
          <Route index element={<BillsPage />} />
          </Route>

          <Route path="/investments" element={<ProtectedRoute />}>
          <Route index element={<InvestmentsPage />} />
          </Route>

          <Route path="/profile" element={<ProtectedRoute />}>
            <Route index element={<ProfilePage />} />
          </Route>
          
        </Routes>
      </main>
    </Router>
  );
}

export default App;