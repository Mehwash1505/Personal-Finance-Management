import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2, delayChildren: 0.3 } },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
};

const HomePage = () => {
  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <motion.div
        className="w-full max-w-4xl p-10 text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1 variants={itemVariants} className="text-4xl md:text-6xl font-extrabold text-text-light mb-4 tracking-light">
          Take Control of Your Finances
        </motion.h1>
        <motion.p variants={itemVariants} className="text-lg text-text-muted max-w-2xl mx-auto mb-8">
          The Personal Finance Management Dashboard helps you track your income, expenses, and investments in one place. Gain insights, create budgets, and achieve your financial goals with clarity.
        </motion.p>
        <motion.div variants={itemVariants} className="flex justify-center space-x-4">
          <Link  to="/register"  className="bg-primary hover:bg-primary-hover text-white font-bold py-3 px-8 rounded-lg text-lg transition duration-300 shadow-lg shadow-blue-500/20">
            Get Started
          </Link>
          <Link  to="/login"  className="bg-secondary hover:bg-gray-300 text-text-primary font-bold py-3 px-8 rounded-lg text-lg transition duration-300">
            Login
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default HomePage;