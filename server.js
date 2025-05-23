//environment variables
const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const dailyFraudScan = require('./cron/dailyFraudScan');

// Initialize app
const app = express();
app.use(express.json());
app.use(cors());

// Database connection
connectDB();

// Scheduled Jobs
dailyFraudScan(); 

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/wallet', require('./routes/wallet.routes'));
app.use('/api/user', require('./routes/profile.routes'));
app.use('/api/admin', require('./routes/admin.routes'));

// Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
