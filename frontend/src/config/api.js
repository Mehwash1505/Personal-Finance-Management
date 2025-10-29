// File: frontend/src/config/api.js

// Use Render's URL if available, otherwise use localhost
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001'; 

export default API_BASE_URL;