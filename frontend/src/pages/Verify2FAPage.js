import React, { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import AuthContext from '../context/AuthContext';
import API_BASE_URL from '../config/api';
import toast from 'react-hot-toast';

const Verify2FAPage = () => {
  const [token, setToken] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  // LoginPage se tempToken ko extract karo
  const tempToken = location.state?.tempToken;
  if (!tempToken) {
    navigate('/login'); // Agar tempToken nahi hai, toh wapas login pe bhejo
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/users/login/verify-2fa`, {
        tempToken: tempToken,
        token: token,
      });

      if (response.data) {
        login(response.data); // Yeh aapka final login hai
        toast.success('Login Successful!');
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid 2FA Token');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <motion.div 
        className="w-full max-w-md p-8 space-y-6 bg-surface/80 backdrop-blur-xl border border-border rounded-xl shadow-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-center text-text-light">Verify Your Identity</h1>
        <p className="text-center text-text-muted">Enter the 6-digit code from your authenticator app.</p>
        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <label className="block mb-2 text-sm font-medium text-text-muted">6-Digit Token</label>
            <input
              type="text"
              name="token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full px-4 py-2 bg-background border border-border text-text-light rounded-lg focus:ring-primary focus:border-primary"
              required
              disabled={isSubmitting}
            />
          </div>
          <button 
            type="submit" 
            className="w-full py-3 px-4 bg-primary text-white font-bold rounded-lg hover:bg-primary-hover disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Verifying...' : 'Verify'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default Verify2FAPage;