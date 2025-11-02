import React, { useState, useEffect, useCallback, useContext } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import AuthContext from '../context/AuthContext';
import Spinner from '../components/Spinner';
import API_BASE_URL from '../config/api';

const GoalItem = ({ goal, onUpdate }) => {
  const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
  const [amountToAdd, setAmountToAdd] = useState('');

  const handleAddSavings = () => {
    if (!amountToAdd || Number(amountToAdd) <= 0) return;
    const newAmount = goal.currentAmount + Number(amountToAdd);
    onUpdate(goal._id, { currentAmount: newAmount });
    setAmountToAdd('');
  };

  return (
    <div className="bg-surface/80 backdrop-blur-xl border border-border p-6 rounded-xl shadow-2xl flex flex-col">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold text-text-light">{goal.name}</h3>
        {goal.deadline && (
          <span className="text-text-muted text-sm">
            Due: {new Date(goal.deadline).toLocaleDateString()}
          </span>
        )}
      </div>
      <div className="flex justify-between mb-1 text-sm text-text-muted">
        <span>${goal.currentAmount.toLocaleString()}</span>
        <span>${goal.targetAmount.toLocaleString()}</span>
      </div>
      <div className="w-full bg-border rounded-full h-2.5 mb-4">
        <div className="bg-primary h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
      </div>
      <div className="mt-auto flex space-x-2">
        <input 
          type="number" 
          value={amountToAdd} 
          onChange={(e) => setAmountToAdd(e.target.value)}
          placeholder="Add funds"
          className="w-full px-3 py-1 bg-background border border-border text-text-light rounded-lg focus:ring-primary focus:border-primary"
        />
        <button onClick={handleAddSavings} className="px-4 py-1 bg-secondary text-white rounded-lg hover:bg-opacity-90 transition-colors">Add</button>
      </div>
    </div>
  );
};

const GoalsPage = () => {
  const [goals, setGoals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({ name: '', targetAmount: '', deadline: '' });
  const { user } = useContext(AuthContext);

  const fetchGoals = useCallback(async () => {
    if (!user) return;
    const config = { headers: { Authorization: `Bearer ${user.token}` } };
    try {
      const res = await axios.get(`${API_BASE_URL}/api/goals`, config);
      setGoals(res.data);
    } catch (error) {
      console.error("Failed to fetch goals", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const createGoal = async (e) => {
    e.preventDefault();
    const config = { headers: { Authorization: `Bearer ${user.token}` } };
    try {
      await axios.post(`${API_BASE_URL}/api/goals`, formData, config);
      fetchGoals();
      setFormData({ name: '', targetAmount: '', deadline: '' });
    } catch (error) {
      console.error("Failed to create goal", error);
    }
  };

  const updateGoal = async (id, updatedData) => {
    const config = { headers: { Authorization: `Bearer ${user.token}` } };
    try {
      await axios.put(`${API_BASE_URL}/api/goals/${id}`, updatedData, config);
      fetchGoals();
    } catch (error) {
      console.error("Failed to update goal", error);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  if (isLoading) return <Spinner />;

  return (
    <motion.div className="container mx-auto p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1 className="text-4xl font-bold text-text-light my-6">Savings Goals</h1>
      
      <motion.div className="bg-surface/80 backdrop-blur-xl border border-border p-6 rounded-xl shadow-2xl mb-8">
        <form onSubmit={createGoal} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-text-muted mb-1">Goal Name</label>
            <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g., New Laptop" className="w-full p-2 bg-background border border-border text-text-light rounded-lg" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-muted mb-1">Target Amount</label>
            <input type="number" value={formData.targetAmount} onChange={(e) => setFormData({...formData, targetAmount: e.target.value})} placeholder="$2,000" className="w-full p-2 bg-background border border-border text-text-light rounded-lg" required />
          </div>
          <button type="submit" className="w-full py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary-hover shadow-lg">Create Goal</button>
        </form>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map(goal => (
          <GoalItem key={goal._id} goal={goal} onUpdate={updateGoal} />
        ))}
      </div>
      {goals.length === 0 && <p className="text-text-muted">You haven't set any goals yet. Use the form above to create one!</p>}
    </motion.div>
  );
};

export default GoalsPage;