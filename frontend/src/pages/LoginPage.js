import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import Message from '../components/Message';
import AuthContext from '../context/AuthContext';
import API_BASE_URL from '../config/api';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false); // <-- 1. ADDED THIS
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const { email, password } = formData;
  const navigate = useNavigate();

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true); // <-- 2. SET LOADING TRUE
    try {
      const response = await axios.post(`${API_BASE_URL}/api/users/login`, { email, password });
      if (response.data) {
        login(response.data);
        toast.success('Logged in Successfully!');
        navigate('/dashboard');
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Something went wrong';
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false); // <-- 3. SET LOADING FALSE
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <motion.div 
        className="w-full max-w-md p-8 space-y-6 bg-surface/80 backdrop-blur-xl border border-border rounded-xl shadow-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-center text-text-light">Welcome Back</h1>
        {error && <Message>{error}</Message>} 
        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <label className="block mb-2 text-sm font-medium text-text-muted">Email</label>
            <input
              type="email" name="email" value={email} onChange={onChange}
              className="w-full px-4 py-2 bg-background border border-border text-text-light rounded-lg focus:ring-primary focus:border-primary"
              required
              disabled={isSubmitting} // <-- 4. OPTIONAL: Disable inputs
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-text-muted">Password</label>
            <input
              type="password" name="password" value={password} onChange={onChange}
              className="w-full px-4 py-2 bg-background border border-border text-text-light rounded-lg focus:ring-primary focus:border-primary"
              required
              disabled={isSubmitting} // <-- 5. OPTIONAL: Disable inputs
            />
          </div>
          {/* 6. UPDATED BUTTON */}
          <button 
            type="submit" 
            disabled={isSubmitting} 
            className="w-full py-3 px-4 bg-primary text-white font-bold rounded-lg hover:bg-primary-hover transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Logging in...' : 'Login'} 
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default LoginPage;