// File: backend/controllers/transactionController.js
const Transaction = require('../models/Transaction.js');

const getTransactions = async (req, res) => {
  const transactions = await Transaction.find({ user: req.user.id });
  res.status(200).json(transactions);
};

const addTransaction = async (req, res) => {
  const { name, amount, category, type } = req.body;
  const transaction = await Transaction.create({
    user: req.user.id,
    name,
    amount,
    category,
    type,
  });
  res.status(201).json(transaction);
};

module.exports = { getTransactions, addTransaction };