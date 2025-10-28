const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path'); // It's good practice to keep this
const connectDB = require('./db.js');
const transactionRoutes = require('./routes/transactionRoutes');
const goalRoutes = require('./routes/goalRoutes');
const billRoutes = require('./routes/billRoutes');
const cors = require('cors');

// Load environment variables FIRST
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Require your routes AFTER loading the .env file
const userRoutes = require('./routes/userRoutes');
const plaidRoutes = require('./routes/plaidRoutes');
const budgetRoutes = require('./routes/budgetRoutes');

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// --- ROUTES ---
// When a request comes to /api/users, it will be handled by userRoutes
app.use('/api/users', userRoutes);
app.use('/api/plaid', plaidRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/bills', billRoutes);
// Define the port
const PORT = process.env.PORT || 5000;

// Start the server
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.use(cors({
  origin: ['https://veritas-main-personal-finance-management.onrender.com', 'http://localhost:3000'],
  credentials: true
}));

module.exports = { app, server };