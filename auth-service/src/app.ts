import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import connectDB from './config/dbConfig.js';
import authRoutes from './routes/authRoutes.js';
import passport from './services/passportConfig.js';

const app = express();

app.use(express.json());

connectDB();

app.use(passport.initialize());

app.use('/api/v1/auth', authRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
