import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import Message from '../components/Message';
import AuthContext from '../context/AuthContext';

const RegisterPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const { name, email, password } = formData;
  const navigate = useNavigate();

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post('http://localhost:5001/api/users/register', { name, email, password });
      if (response.data) {
        login(response.data);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
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
        <h1 className="text-3xl font-bold text-center text-text-light">Create an Account</h1>
        {error && <Message>{error}</Message>}
        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <label className="block mb-2 text-sm font-medium text-text-muted">Name</label>
            <input
              type="text"
              name="name"
              value={name}
              onChange={onChange}
              className="w-full px-4 py-2 bg-background border border-border text-text-light rounded-lg focus:ring-primary focus:border-primary"
              required
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-text-muted">Email</label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={onChange}
              className="w-full px-4 py-2 bg-background border border-border text-text-light rounded-lg focus:ring-primary focus:border-primary"
              required
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-text-muted">Password</label>
            <input
              type="password"
              name="password"
              value={password}
              onChange={onChange}
              className="w-full px-4 py-2 bg-background border border-border text-text-light rounded-lg focus:ring-primary focus:border-primary"
              required
            />
          </div>
          <button type="submit" className="w-full py-3 px-4 bg-primary text-white font-bold rounded-lg hover:bg-primary-hover transition-colors shadow-lg shadow-blue-500/20">
            Register
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default RegisterPage;