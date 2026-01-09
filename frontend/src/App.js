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
import { Toaster } from 'react-hot-toast';
import Verify2FAPage from './pages/Verify2FAPage';
import AskAiPage from './pages/AskAiPage'; 

function App() {
  return (
    <Router>
      <Navbar />
      <Toaster position="top-center" reverseOrder={false} />
      <main className="container mx-auto p-4">
        <Routes>
          {/* --- 2. Wrap Public Routes --- */}
          <Route path="/" element={<PublicRoute />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          <Route path="/verify-2fa" element={<Verify2FAPage />} />

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

          <Route path="/ask-ai" element={<ProtectedRoute />}>
            <Route index element={<AskAiPage />} />
          </Route>
          
        </Routes>
      </main>
    </Router>
  );
}

export default App;
