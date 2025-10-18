import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import AuthContext from '../context/AuthContext';
import toast from 'react-hot-toast'; // For success notifications

const ProfilePage = () => {
  const { user, login } = useContext(AuthContext);
  const [name, setName] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name);
    }
  }, [user]);

  const onSubmit = async (e) => {
    e.preventDefault();
    const config = { headers: { Authorization: `Bearer ${user.token}` } };
    try {
      const res = await axios.put('http://localhost:5001/api/users/profile', { name }, config);
      login(res.data); // Update the global context and localStorage
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile.');
      console.error(error);
    }
  };

  if (!user) {
    return null; // Or a loading spinner
  }

  return (
    <motion.div
      className="container mx-auto p-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-4xl font-bold text-text-light my-6">My Profile</h1>
      <div className="max-w-lg mx-auto bg-surface/80 backdrop-blur-xl border border-border p-8 rounded-xl shadow-2xl">
        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-text-muted mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 bg-background border border-border text-text-light rounded-lg focus:ring-primary focus:border-primary"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-muted mb-1">Email</label>
            <input
              type="email"
              value={user.email}
              className="w-full p-2 bg-border border-border text-text-muted rounded-lg"
              disabled // Email is not editable
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-hover shadow-lg"
          >
            Update Profile
          </button>
        </form>
      </div>
    </motion.div>
  );
};

export default ProfilePage;