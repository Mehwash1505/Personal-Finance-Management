import React, { useState } from 'react';
import axios from 'axios';

const BudgetForm = ({ onBudgetSet }) => {
  const [category, setCategory] = useState('FOOD_AND_DRINK');
  const [limit, setLimit] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    const config = {
      headers: {
        Authorization: `Bearer ${JSON.parse(localStorage.getItem('user')).token}`,
      },
    };
    try {
      await axios.post('http://localhost:5001/api/budgets', { category, limit }, config);
      onBudgetSet(); // Notify parent to refetch data
      setLimit('');
    } catch (error) {
      console.error('Failed to set budget', error);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <h3 className="text-lg font-semibold text-text-light">Set a Budget</h3>
      <div>
        <label className="block text-sm font-medium text-text-muted mb-1">Category</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-2 bg-background border border-border text-text-light rounded-lg focus:ring-primary focus:border-primary">
          <option value="FOOD_AND_DRINK">Food & Drink</option>
          <option value="TRAVEL">Travel</option>
          <option value="TRANSPORTATION">Transportation</option>
          <option value="GENERAL_MERCHANDISE">Merchandise</option>
          <option value="ENTERTAINMENT">Entertainment</option>
          <option value="GENERAL_SERVICES">Services</option>
          <option value="PERSONAL_CARE">Personal Care</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-text-muted mb-1">Limit ($)</label>
        <input type="number" value={limit} onChange={(e) => setLimit(e.target.value)} placeholder="e.g., 500" className="w-full p-2 bg-background border border-border text-text-light rounded-lg focus:ring-primary focus:border-primary" required />
      </div>
      <button type="submit" className="w-full py-2 bg-secondary text-white font-semibold rounded-lg hover:bg-opacity-90 transition-colors shadow-lg shadow-green-500/20">Set Budget</button>
    </form>
  );
};

export default BudgetForm;