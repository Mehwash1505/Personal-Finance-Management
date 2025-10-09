const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./db.js');
const userRoutes = require('./routes/userRoutes');

// Load environment variables from the root .env file
dotenv.config({ path: '../.env' });

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// --- ROUTES ---
// When a request comes to /api/users, it will be handled by userRoutes
app.use('/api/users', userRoutes);

// Define the port
const PORT = process.env.PORT || 5000;

// Start the server
app.listen(PORT, () => {
  console.log(` Server is running on port ${PORT}`);
});