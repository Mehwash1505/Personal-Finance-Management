import React, { useState, useEffect, useCallback } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import { motion } from 'framer-motion';
import BudgetForm from '../components/BudgetForm';
import BudgetStatus from '../components/BudgetStatus';
import MonthlySummaryChart from '../components/MonthlySummaryChart';
import Spinner from '../components/Spinner';
import ManualTransactionForm from '../components/ManualTransactionForm';
import NetWorth from '../components/NetWorth';
import { useContext } from 'react'; 
import AuthContext from '../context/AuthContext';
import API_BASE_URL from '../config/api';
import toast from 'react-hot-toast';

const DashboardPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [monthlySummary, setMonthlySummary] = useState([]);
  const [linkToken, setLinkToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useContext(AuthContext);

  // data fetching functions: getAuthConfig, fetchData, useEffect, usePlaidLink
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
        axios.get(`${API_BASE_URL}/api/plaid/transactions`, config),
        axios.get(`${API_BASE_URL}/api/plaid/summary`, config),
        axios.get(`${API_BASE_URL}/api/budgets`, config),
        axios.get(`${API_BASE_URL}/api/plaid/monthly-summary`, config),
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
        const response = await axios.post(`${API_BASE_URL}/api/plaid/create_link_token`, {}, config);
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
          await axios.post(`${API_BASE_URL}/api/plaid/exchange_public_token`, { public_token }, config);
          fetchData(); 
        } catch (error) {
          console.error('Failed to exchange public token', error);
        }
      };
      exchangeToken();
    },
  });
  
  const handleDownload = async () => {
    // 1. Loading toast dikhao
    const toastId = toast.loading('Preparing your download...');

    const config = {
      headers: {
        Authorization: `Bearer ${user.token}`, // Token ko header mein daalo
      },
      responseType: 'blob', // Yeh important hai - file download kar rahe hain
    };

    try {
      // 2. API call karo
      const response = await axios.get(`${API_BASE_URL}/api/transactions/export`, config);
      
      // 3. File ko browser mein create aur download karo
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'manual_transactions.csv'); // File ka naam
      
      document.body.appendChild(link);
      link.click();
      
      // 4. Safai karo
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.dismiss(toastId); // Loading toast hatao
      toast.success('Download started!');
      
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.dismiss(toastId);
      toast.error('Could not download file.');
    }
  };
  
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  if (isLoading) { return <Spinner />; }
  
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="container mx-auto">
      <div className="flex justify-between items-center my-6">
        <h1 className="text-4xl font-bold text-text-light">Dashboard</h1>
        <button onClick={() => open()} disabled={!ready} className="bg-primary text-white font-bold py-2 px-4 rounded-lg shadow-lg shadow-blue-500/20 hover:bg-primary-hover transition-all disabled:bg-gray-500 disabled:shadow-none">
          Link a Bank Account
        </button>
      </div>

      <motion.div
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="lg:col-span-1 space-y-6">
          <motion.div variants={itemVariants} className="bg-surface/80 backdrop-blur-xl border border-border p-6 rounded-xl shadow-2xl">
            <NetWorth />
          </motion.div>
          <motion.div variants={itemVariants} className="bg-surface/80 backdrop-blur-xl border border-border p-6 rounded-xl shadow-2xl">
            <ManualTransactionForm onTransactionAdded={fetchData} />
          </motion.div>
          <motion.div variants={itemVariants} className="bg-surface/80 backdrop-blur-xl border border-border p-6 rounded-xl shadow-2xl">
            <BudgetForm onBudgetSet={fetchData} />
          </motion.div>
          <motion.div variants={itemVariants} className="bg-surface/80 backdrop-blur-xl border border-border p-6 rounded-xl shadow-2xl">
            <BudgetStatus budgets={budgets} summary={summary} />
          </motion.div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <motion.div variants={itemVariants}>
            <MonthlySummaryChart data={monthlySummary} />
          </motion.div>
          <motion.div variants={itemVariants} className="bg-surface/80 backdrop-blur-xl border border-border p-6 rounded-xl shadow-2xl">
            <h2 className="text-xl font-semibold mb-4 text-text-light">Recent Transactions</h2>
            <ul className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
             {transactions.length > 0 ? (
               transactions.map((t) => (
                 <li key={t.transaction_id} className="flex justify-between items-center border-b border-gray-200 pb-2">
                   <div>
                     <p className="font-medium text-text-primary">{t.name}</p>
                     <p className="text-sm text-text-secondary">{t.personal_finance_category?.primary || 'Uncategorized'}</p>
                   </div>
                   <p className={`font-semibold ${t.amount < 0 ? 'text-secondary' : 'text-danger'}`}>
                     {t.amount < 0 ? `+$${Math.abs(t.amount).toFixed(2)}` : `-$${t.amount.toFixed(2)}`}
                   </p>
                 </li>
               ))
             ) : <p className="text-text-secondary">No transactions to display.</p>}
           </ul>
          </motion.div>
          <motion.div variants={itemVariants} className="bg-surface/80 backdrop-blur-xl border border-border p-6 rounded-xl shadow-2xl">
            <h2 className="text-xl font-semibold mb-4 text-text-light">Spending by Category</h2>
            {summary.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={summary} dataKey="value" nameKey="name" cx="50%" cy="45%" outerRadius={90}>
                    {summary.map((entry, index) => ( <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} /> ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#161B22', border: '1px solid #30363d' }} />
                  <Legend wrapperStyle={{ color: '#E6EDF3' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-text-muted">No spending data to display.</p>}
          </motion.div>

          <motion.div variants={itemVariants} className="bg-surface/80 backdrop-blur-xl border border-border p-6 rounded-xl shadow-2xl">
            <h3 className="text-lg font-semibold text-text-light mb-4">Export Data</h3>
            <a 
              // Use template literal for the URL and include the token
              href={`${API_BASE_URL}/api/transactions/export?token=${user?.token}`} 
              download="manual_transactions.csv" // Suggests filename to browser
              className="inline-block bg-secondary text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-90 transition-colors shadow-lg shadow-green-500/20"
            >
              Download Manual Transactions (CSV)
            </a>
            <p className="text-xs text-text-muted mt-2">(Note: Includes manually added transactions only for now)</p>
          </motion.div>
          
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DashboardPage;