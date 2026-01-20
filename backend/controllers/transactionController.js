const Transaction = require('../models/Transaction.js');
const { Parser } = require('json2csv'); // <-- Import Parser

// @desc    Get manually added transactions for a user
// @route   GET /api/transactions 
// @access  Private
const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id });
    res.status(200).json(transactions);
  } catch (error) {
     res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Add a manual transaction
// @route   POST /api/transactions
// @access  Private
const addTransaction = async (req, res) => {
  try {
    const { name, amount, category, type } = req.body;
    if (!name || !amount || !category || !type) {
        return res.status(400).json({ message: 'Please provide all fields' });
    }
    const transaction = await Transaction.create({
      user: req.user.id, name, amount, category, type,
    });
    res.status(201).json(transaction);
  } catch (error) {
     res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Export manually added transactions as CSV
// @route   GET /api/transactions/export
// @access  Private
const exportTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id }).lean(); 

    if (transactions.length === 0) {
      // Send a 200 OK but with a message, or just an empty file
      return res.status(200).send("No manual transactions found to export."); 
    }

    const fields = ['createdAt', 'name', 'amount', 'category', 'type']; // Adjust fields as needed
    const json2csvParser = new Parser({ fields });
    // Format date and potentially other fields before parsing
    const formattedTransactions = transactions.map(t => ({
        ...t,
        createdAt: new Date(t.createdAt).toLocaleDateString() 
    }));
    const csv = json2csvParser.parse(formattedTransactions);

    res.header('Content-Type', 'text/csv');
    res.attachment('manual_transactions.csv'); // Filename for download
    res.send(csv);

  } catch (error) {
    console.error('Error exporting transactions:', error);
    res.status(500).json({ message: 'Failed to export transactions.' });
  }
};

module.exports = { getTransactions, addTransaction, exportTransactions };
