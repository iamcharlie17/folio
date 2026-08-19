import 'dotenv/config';
import express from 'express';

import errorHandler from './middleware/errorHandler.js';
import authRoutes      from './routes/authRoutes.js';
import bookRoutes      from './routes/bookRoutes.js';
import noteRoutes      from './routes/noteRoutes.js';
import quoteRoutes     from './routes/quoteRoutes.js';
import characterRoutes from './routes/characterRoutes.js';
import tagRoutes       from './routes/tagRoutes.js';
import linkRoutes      from './routes/linkRoutes.js';
import searchRoutes    from './routes/searchRoutes.js';

const app = express();

// Body parser
app.use(express.json());

// Health-check
app.get('/', (req, res) => {
  res.json({ success: true, message: 'Folio API v1 is running' });
});

// Mount routes
const base = '/api/v1';
app.use(`${base}/auth`,       authRoutes);
app.use(`${base}/books`,      bookRoutes);
app.use(`${base}/notes`,      noteRoutes);
app.use(`${base}/quotes`,     quoteRoutes);
app.use(`${base}/characters`, characterRoutes);
app.use(`${base}/tags`,       tagRoutes);
app.use(`${base}/links`,      linkRoutes);
app.use(`${base}/search`,     searchRoutes);

// 404 for unknown routes
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler (must be last)
app.use(errorHandler);

export default app;
