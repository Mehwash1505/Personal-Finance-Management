import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import API_BASE_URL from '../config/api';

const NetWorth = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchNetWorth = async () => {
      if (!user) return;
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      try {
        const res = await axios.get(`${API_BASE_URL}/api/plaid/net-worth`, config);
        setData(res.data);
      } catch (error) {
        // Fails gracefully if no Plaid token is found
        setData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNetWorth();
  }, [user]);

  const formatCurrency = (value) => {
    if (value === null || value === undefined) return '$0.00';
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  };

  if (isLoading) {
    return <div className="text-text-muted">Loading Net Worth...</div>;
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-text-light mb-4">Net Worth</h3>
      {data ? (
        <div className="space-y-4">
          <p className="text-4xl font-bold text-text-light">{formatCurrency(data.netWorth)}</p>
          <div className="flex justify-between text-sm">
            <div className="text-text-muted">
              Assets
              <p className="font-semibold text-secondary">{formatCurrency(data.assets)}</p>
            </div>
            <div className="text-text-muted text-right">
              Liabilities
              <p className="font-semibold text-danger">{formatCurrency(data.liabilities)}</p>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-sm text-text-muted">Link a bank account to calculate your net worth.</p>
      )}
    </div>
  );
};

export default NetWorth;