
//   const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1919', '#8884d8'];
//   const containerVariants = {
//     hidden: { opacity: 0 },
//     visible: {
//       opacity: 1,
//       transition: {
//         staggerChildren: 0.1, // This makes children animate one by one
//       },
//     },
//   };

//   const itemVariants = {
//     hidden: { y: 20, opacity: 0 },
//     visible: { y: 0, opacity: 1 },
//   };

//   if (isLoading) {
//     return <Spinner />; 
//   }
  
//   return (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//       className="p-4"
//     >
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-3xl font-bold">Dashboard</h1>
//         <button onClick={() => open()} disabled={!ready} className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400">
//           Link a Bank Account
//         </button>
//       </div>

//       <motion.div
//         className="grid grid-cols-1 md:grid-cols-3 gap-6"
//         variants={containerVariants}
//         initial="hidden"
//         animate="visible"
//       >

//         {/* --- Left Column --- */}
//         <div className="md:col-span-1 space-y-6">
//           <motion.div variants={itemVariants} className="bg-surface p-6 rounded-xl shadow-md">
//             <ManualTransactionForm onTransactionAdded={fetchData} />
//           </motion.div>
//           <motion.div variants={itemVariants} className="bg-surface p-6 rounded-xl shadow-md">
//             <BudgetForm onBudgetSet={fetchData} />
//           </motion.div>
//           <motion.div variants={itemVariants} className="bg-surface p-6 rounded-xl shadow-md">
//             <BudgetStatus budgets={budgets} summary={summary} />
//           </motion.div>
//           <motion.div variants={itemVariants} className="bg-surface p-6 rounded-xl shadow-md">
//             <h2 className="text-xl font-semibold mb-4">Spending by Category</h2>
//             {summary.length > 0 ? (
//               <ResponsiveContainer width="100%" height={300}>
//                 {/* --- THIS IS THE CORRECTED PIE CHART --- */}
//                 <PieChart>
//                   <Pie 
//                     data={summary} 
//                     dataKey="value" 
//                     nameKey="name" 
//                     cx="50%" 
//                     cy="50%" // Vertically centered the pie
//                     outerRadius={85} // A size that fits well
//                   >
//                     {summary.map((entry, index) => (
//                       <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                     ))}
//                   </Pie>
//                   <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
//                   <Legend verticalAlign="bottom" height={36}/> 
//                 </PieChart>
//                 {/* --- END OF CORRECTION --- */}
//               </ResponsiveContainer>
//             ) : <p className='text-text-secondary'>No spending data to display.</p>}
//           </motion.div>
//         </div>

//         {/* --- Right Column --- */}
//         <div className="md:col-span-2 space-y-6">
//           <motion.div variants={itemVariants}>
//             <MonthlySummaryChart data={monthlySummary} />
//           </motion.div>
//           <motion.div variants={itemVariants} className="bg-surface p-6 rounded-xl shadow-md">
//             <h2 className="text-xl font-semibold mb-4 text-text-primary">Recent Transactions</h2>
//             <ul className="space-y-3 h-[400px] overflow-y-auto">
//              {transactions.length > 0 ? (
//                transactions.map((t) => (
//                  <li key={t.transaction_id} className="flex justify-between items-center border-b border-gray-200 pb-2">
//                    <div>
//                      <p className="font-medium text-text-primary">{t.name}</p>
//                      <p className="text-sm text-text-secondary">{t.personal_finance_category?.primary || 'Uncategorized'}</p>
//                    </div>
//                    <p className={`font-semibold ${t.amount < 0 ? 'text-secondary' : 'text-danger'}`}>
//                      {t.amount < 0 ? `+$${Math.abs(t.amount).toFixed(2)}` : `-$${t.amount.toFixed(2)}`}
//                    </p>
//                  </li>
//                ))
//              ) : <p className="text-text-secondary">No transactions to display.</p>}
//            </ul>
//           </motion.div>
//         </div>
//       </motion.div>
//     </motion.div>
//   );
// };

// export default DashboardPage;



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

const DashboardPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [monthlySummary, setMonthlySummary] = useState([]);
  const [linkToken, setLinkToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  

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
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DashboardPage;