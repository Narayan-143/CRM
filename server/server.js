const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const authRoutes = require('./routes/authRoutes');
const contactRoutes = require('./routes/contactRoutes');
const dealRoutes = require('./routes/dealRoutes');
const aiRoutes = require('./routes/aiRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// API Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Mini CRM API is running smoothly',
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/deals', dealRoutes);
app.use('/api/ai', aiRoutes);

// Error Middleware
app.use(notFound);
app.use(errorHandler);

// Database Connection & Server Startup
const PORT = process.env.PORT || 5000;

const connectDB = async () => {
  let uri = process.env.MONGODB_URI;

  try {
    if (!uri) {
      console.log('No MONGODB_URI found. Attempting to start in-memory MongoDB...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      uri = mongod.getUri();
      console.log('Started in-memory MongoDB at:', uri);
    }

    await mongoose.connect(uri, { serverSelectionTimeoutMS: 2500 });
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.warn('MongoDB connection attempt failed with provided URI:', err.message);
    try {
      console.log('Falling back to in-memory MongoDB for local evaluation...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const memUri = mongod.getUri();
      await mongoose.connect(memUri);
      console.log('Connected to fallback in-memory MongoDB at:', memUri);
    } catch (memErr) {
      console.error('Fatal: Could not connect to any MongoDB instance:', memErr.message);
      console.error('Please configure a valid MONGODB_URI in server/.env');
      process.exit(1);
    }
  }
};

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
