// File: src/components/ManualTransactionForm.js
import React, { useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config/api';

const ManualTransactionForm = ({ onTransactionAdded }) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('FOOD_AND_DRINK');
  const [type, setType] = useState('expense');

  const onSubmit = async (e) => {
    e.preventDefault();
    const config = {
      headers: {
        Authorization: `Bearer ${JSON.parse(localStorage.getItem('user')).token}`,
      },
    };
    try {
      await axios.post(`${API_BASE_URL}/api/transactions`, { name, amount, category, type }, config);
      onTransactionAdded(); // Notify dashboard to refetch data
      setName('');
      setAmount('');
    } catch (error) {
      console.error('Failed to add transaction', error);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <h3 className="text-lg font-semibold">Add Transaction</h3>
      <div>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Transaction Name" className="w-full p-2 border rounded" required />
      </div>
      <div>
        <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount" className="w-full p-2 border rounded" required />
      </div>
      <div className="flex space-x-2">
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-1/2 p-2 border rounded">
          <option value="FOOD_AND_DRINK">Food & Drink</option>
          <option value="TRAVEL">Travel</option>
          <option value="TRANSPORTATION">Transportation</option>
        </select>
        <select value={type} onChange={(e) => setType(e.target.value)} className="w-1/2 p-2 border rounded">
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
      </div>
      <button type="submit" className="w-full py-2 bg-indigo-500 text-white rounded">Add</button>
    </form>
  );
};

export default ManualTransactionForm;