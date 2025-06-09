require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const errorHandler = require('./middleware/error');

// Initialize express app
const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000', // Frontend URL
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/auth-app', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);

// Basic route for testing
app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'Server is running' });
});

// Test route for CORS and connection checking
app.get('/api/test-cors', (req, res) => {
  res.status(200).json({ 
    success: true,
    message: 'CORS est correctement configuré',
    timestamp: new Date().toISOString()
  });
});

// Debug route to log request details
app.use('/api/debug', (req, res) => {
  console.log('Debug endpoint hit:');
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  console.log('Query:', req.query);
  console.log('Params:', req.params);
  
  res.status(200).json({
    success: true,
    message: 'Debug information logged',
    request: {
      method: req.method,
      path: req.path,
      headers: req.headers,
      body: req.body,
      query: req.query
    }
  });
});

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 