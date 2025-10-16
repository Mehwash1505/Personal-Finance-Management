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
    <form onSubmit={onSubmit} className="space-y-3">
      <h3 className="text-lg font-semibold">Set a Budget</h3>
      <div>
        <label className="block text-sm font-medium">Category</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full mt-1 p-2 border border-gray-300 rounded-md">
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
        <label className="block text-sm font-medium">Limit ($)</label>
        <input type="number" value={limit} onChange={(e) => setLimit(e.target.value)} placeholder="e.g., 500" className="w-full mt-1 p-2 border border-gray-300 rounded-md" required />
      </div>
      <button type="submit" className="w-full py-2 bg-green-500 text-white font-semibold rounded-md hover:bg-green-600">Set Budget</button>
    </form>
  );
};

export default BudgetForm;