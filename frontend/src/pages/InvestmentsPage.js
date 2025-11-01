import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import AuthContext from '../context/AuthContext';
import Spinner from '../components/Spinner';
import API_BASE_URL from '../config/api';

const InvestmentsPage = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchInvestments = async () => {
      if (!user) return;
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      try {
        const res = await axios.get(`${API_BASE_URL}/api/plaid/investments`, config);
        setData(res.data);
      } catch (error) {
        console.error("Failed to fetch investments", error);
        setData(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInvestments();
  }, [user]);

  if (isLoading) return <Spinner />;

  return (
    <motion.div className="container mx-auto p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1 className="text-4xl font-bold text-text-light my-6">Investment Portfolio</h1>

      {data && data.holdings.length > 0 ? (
        <div className="bg-surface/80 backdrop-blur-xl border border-border rounded-xl shadow-2xl overflow-x-auto">
          <table className="w-full min-w-[600px] text-left">
            <thead>
              <tr className="border-b border-border">
                <th className="p-4 text-sm font-semibold text-text-muted">NAME</th>
                <th className="p-4 text-sm font-semibold text-text-muted text-right">QUANTITY</th>
                <th className="p-4 text-sm font-semibold text-text-muted text-right">CURRENT VALUE</th>
              </tr>
            </thead>
            <tbody>
              {data.holdings.map(holding => {
                const security = data.securities.find(s => s.security_id === holding.security_id);
                return (
                  <tr key={holding.account_id + holding.security_id} className="border-b border-border hover:bg-background">
                    <td className="p-4">
                      <div className="font-semibold text-text-light">{security.name}</div>
                      <div className="text-sm text-text-muted">{security.ticker_symbol}</div>
                    </td>
                    <td className="p-4 text-right font-mono text-text-light">{holding.quantity}</td>
                    <td className="p-4 text-right font-mono text-secondary">${holding.institution_value.toLocaleString()}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-text-muted">No investment data found. Link a brokerage account to see your portfolio.</p>
        </div>
      )}
    </motion.div>
  );
};

export default InvestmentsPage;