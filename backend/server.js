const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path'); // It's good practice to keep this
const connectDB = require('./db.js');
const transactionRoutes = require('./routes/transactionRoutes');

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


// --- ADD THIS LOGGING MIDDLEWARE --- 
// This will print every incoming request to your backend terminal.
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});
// --- END OF LOGGING MIDDLEWARE ---


// --- ROUTES ---
// When a request comes to /api/users, it will be handled by userRoutes
app.use('/api/users', userRoutes);
app.use('/api/plaid', plaidRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/transactions', transactionRoutes);

// Define the port
const PORT = process.env.PORT || 5000;

// Start the server
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = { app, server };