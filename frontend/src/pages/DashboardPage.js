import React, { useState, useEffect, useCallback } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import BudgetForm from '../components/BudgetForm';
import BudgetStatus from '../components/BudgetStatus';
import MonthlySummaryChart from '../components/MonthlySummaryChart';
import Spinner from '../components/Spinner';
import ManualTransactionForm from '../components/ManualTransactionForm';

const DashboardPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [monthlySummary, setMonthlySummary] = useState([]);
  const [linkToken, setLinkToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);


  
  const getAuthConfig = useCallback(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.token) return null;
    return {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    };
  }, []);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    const config = getAuthConfig();
    if (!config) {
      setIsLoading(false);
      return;
    } 

    try {
      const [transRes, sumRes, budRes, monthRes] = await Promise.all([
        axios.get('http://localhost:5001/api/plaid/transactions', config),
        axios.get('http://localhost:5001/api/plaid/summary', config),
        axios.get('http://localhost:5001/api/budgets', config),
        axios.get('http://localhost:5001/api/plaid/monthly-summary', config),
      ]);
      setTransactions(transRes.data.added);
      setSummary(sumRes.data);
      setBudgets(budRes.data);
      setMonthlySummary(monthRes.data);
    } catch (error) {
      if (error.response && error.response.status === 400) {
        // Expected if no account is linked
      } else {
        console.error("Failed to fetch data", error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [getAuthConfig]);

  useEffect(() => {
    const generateToken = async () => {
      const config = getAuthConfig();
      if (!config) return;
      try {
        const response = await axios.post('http://localhost:5001/api/plaid/create_link_token', {}, config);
        setLinkToken(response.data.link_token);
      } catch (error) {
        console.error('Failed to create link token', error);
      }
    };
    generateToken();
    fetchData();
  }, [fetchData, getAuthConfig]);

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: (public_token, metadata) => {
      const exchangeToken = async () => {
        const config = getAuthConfig();
        if (!config) return;
        try {
          await axios.post('http://localhost:5001/api/plaid/exchange_public_token', { public_token }, config);
          fetchData(); 
        } catch (error) {
          console.error('Failed to exchange public token', error);
        }
      };
      exchangeToken();
    },
  });
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1919', '#8884d8'];

  if (isLoading) {
    return <Spinner />; 
  }
  
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <button onClick={() => open()} disabled={!ready} className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400">
          Link a Bank Account
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* --- Left Column --- */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <ManualTransactionForm onTransactionAdded={fetchData} />
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <BudgetForm onBudgetSet={fetchData} />
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <BudgetStatus budgets={budgets} summary={summary} />
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Spending by Category</h2>
            {summary.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                {/* --- THIS IS THE CORRECTED PIE CHART --- */}
                <PieChart>
                  <Pie 
                    data={summary} 
                    dataKey="value" 
                    nameKey="name" 
                    cx="50%" 
                    cy="50%" // Vertically centered the pie
                    outerRadius={85} // A size that fits well
                  >
                    {summary.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                  <Legend verticalAlign="bottom" /> 
                </PieChart>
                {/* --- END OF CORRECTION --- */}
              </ResponsiveContainer>
            ) : <p>No spending data to display.</p>}
          </div>
        </div>

        {/* --- Right Column --- */}
        <div className="md:col-span-2 space-y-6">
          <MonthlySummaryChart data={monthlySummary} />
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
            <ul className="space-y-3 h-[400px] overflow-y-auto">
             {transactions.length > 0 ? (
               transactions.map((t) => (
                 <li key={t.transaction_id} className="flex justify-between items-center border-b pb-2">
                   <div>
                     <p className="font-medium">{t.name}</p>
                     <p className="text-sm text-gray-500">{t.personal_finance_category?.primary || 'Uncategorized'}</p>
                   </div>
                   <p className={`font-semibold ${t.amount < 0 ? 'text-green-600' : 'text-red-600'}`}>
                     {t.amount < 0 ? `+$${Math.abs(t.amount).toFixed(2)}` : `-$${t.amount.toFixed(2)}`}
                   </p>
                 </li>
               ))
             ) : <p>No transactions to display.</p>}
           </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;