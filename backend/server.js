const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./db.js');
const transactionRoutes = require('./routes/transactionRoutes');
const goalRoutes = require('./routes/goalRoutes');
const billRoutes = require('./routes/billRoutes');

// Load environment variables FIRST
if (process.env.NODE_ENV !== 'production') {
 dotenv.config({ path: path.resolve(__dirname, '../.env') });
} else {
 dotenv.config(); // This loads from environment variables
}

// Require your routes AFTER loading the .env file
const userRoutes = require('./routes/userRoutes');
const plaidRoutes = require('./routes/plaidRoutes');
const budgetRoutes = require('./routes/budgetRoutes');

// Connect to database
connectDB();

const app = express();

// --- START OF CORS SECTION ---

// Define your allowed origins
const allowedOrigins = [
 'https://veritas-main-personal-finance-management.onrender.com',
 'http://localhost:3000', // For local development
];

// Create reusable CORS options
const corsOptions = {
 origin: function(origin, callback) {
  // Allow requests with no origin (like mobile apps or curl requests)
  if (!origin) return callback(null, true);
  
  if (allowedOrigins.indexOf(origin) === -1) {
   const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
   return callback(new Error(msg), false);
  }
  return callback(null, true);
 },
 credentials: true
};

// Use CORS for all requests. 
// This one line handles all requests, including preflight OPTIONS.
app.use(cors(corsOptions));

// --- END OF CORS SECTION ---

// Middleware
app.use(express.json());

// Root endpoint
app.get('/', (req, res) => {
res.status(200).json({ 
 status: 'OK', 
 message: 'PFM Backend API is running',
 endpoints: {
 health: '/health',
 users: '/api/users',
 plaid: '/api/plaid',
 budgets: '/api/budgets',
 transactions: '/api/transactions',
 goals: '/api/goals'
 }
});
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Define the port
const PORT = process.env.PORT || 5000;

// --- ROUTES ---
app.use('/api/users', userRoutes);
app.use('/api/plaid', plaidRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/bills', billRoutes);

// Start the server - IMPORTANT: Bind to 0.0.0.0 for Render
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = { app, server };