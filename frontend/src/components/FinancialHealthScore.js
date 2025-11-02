import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import API_BASE_URL from '../config/api';
import { motion } from 'framer-motion';

const FinancialHealthScore = () => {
  const [score, setScore] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchScore = async () => {
      if (!user) return;
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      try {
        const res = await axios.get(`${API_BASE_URL}/api/plaid/health-score`, config);
        setScore(res.data.score);
      } catch (error) {
        setScore(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchScore();
  }, [user]);

  const getScoreColor = () => {
    if (score > 80) return 'text-secondary'; // Green
    if (score > 50) return 'text-yellow-400'; // Yellow
    return 'text-danger'; // Red
  };

  const getScoreMessage = () => {
    if (score > 80) return 'Excellent!';
    if (score > 50) return 'Good, but room to improve.';
    return 'Needs attention.';
  };

  if (isLoading) return <div className="text-center text-text-muted">Calculating score...</div>;
  if (!score) return <div className="text-center text-text-muted">Link an account to see your score.</div>;

  return (
    <div className="text-center">
      <h3 className="text-lg font-semibold text-text-light mb-4">Financial Health Score</h3>
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      >
        <div className={`text-6xl font-extrabold ${getScoreColor()}`}>{score}</div>
        <p className="text-text-muted font-medium mt-2">{getScoreMessage()}</p>
      </motion.div>
    </div>
  );
};

export default FinancialHealthScore;