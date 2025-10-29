import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import AuthContext from '../context/AuthContext';
import Spinner from '../components/Spinner';

const BillsPage = () => {
  const [bills, setBills] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({ name: '', amount: '', dueDate: '' });
  const { user } = useContext(AuthContext);

  const fetchBills = useCallback(async () => {
    if (!user) return;
    const config = { headers: { Authorization: `Bearer ${user.token}` } };
    try {
      const res = await axios.get('http://localhost:5001/api/bills', config);
      setBills(res.data);
    } catch (error) {
      console.error("Failed to fetch bills");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const addBill = async (e) => {
    e.preventDefault();
    const config = { headers: { Authorization: `Bearer ${user.token}` } };
    try {
      await axios.post('http://localhost:5001/api/bills', formData, config);
      fetchBills();
      setFormData({ name: '', amount: '', dueDate: '' });
    } catch (error) {
      console.error("Failed to add bill");
    }
  };

  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

  if (isLoading) return <Spinner />;

  return (
    <motion.div className="container mx-auto p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1 className="text-4xl font-bold text-text-light my-6">Bills & Subscriptions</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className="bg-surface/80 backdrop-blur-xl border border-border p-6 rounded-xl shadow-2xl">
            <form onSubmit={addBill} className="space-y-4">
              <h3 className="text-lg font-semibold text-text-light">Add New Bill</h3>
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1">Name</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g., Netflix" className="w-full p-2 bg-background border border-border text-text-light rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1">Amount</label>
                <input type="number" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} placeholder="$15.99" className="w-full p-2 bg-background border border-border text-text-light rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1">Due Date</label>
                <input type="date" value={formData.dueDate} onChange={(e) => setFormData({...formData, dueDate: e.target.value})} className="w-full p-2 bg-background border border-border text-text-light rounded-lg" required />
              </div>
              <button type="submit" className="w-full py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary-hover shadow-lg">Add Bill</button>
            </form>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="bg-surface/80 backdrop-blur-xl border border-border p-6 rounded-xl shadow-2xl">
            <h3 className="text-lg font-semibold text-text-light mb-4">Upcoming Payments</h3>
            <ul className="space-y-3">
              {bills.map(bill => (
                <li key={bill._id} className="flex justify-between items-center bg-background p-3 rounded-lg">
                  <div>
                    <p className="font-semibold text-text-light">{bill.name}</p>
                    <p className="text-sm text-text-muted">Due: {new Date(bill.dueDate).toLocaleDateString()}</p>
                  </div>
                  <p className="text-lg font-bold text-danger">${bill.amount.toFixed(2)}</p>
                </li>
              ))}
              {bills.length === 0 && <p className="text-text-muted">No upcoming bills found.</p>}
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default BillsPage;