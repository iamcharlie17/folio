import express from 'express';
import {
  getBooks,
  createBook,
  getBook,
  updateBook,
  deleteBook,
  updateProgress,
  getProgress,
} from '../controllers/bookController.js';

import { protect } from '../middleware/auth.js';

// Nested sub-routers (mergeParams lets them access :bookId)
import noteRouter      from './noteRoutes.js';
import quoteRouter     from './quoteRoutes.js';
import characterRouter from './characterRoutes.js';

const router = express.Router();

// All book routes require auth
router.use(protect);

router.route('/')
  .get(getBooks)
  .post(createBook);

router.route('/:bookId')
  .get(getBook)
  .put(updateBook)
  .delete(deleteBook);

// Progress Tracker
router.route('/:bookId/progress')
  .get(getProgress)
  .put(updateProgress);

// Nested resources — delegate to sub-routers
router.use('/:bookId/notes',      noteRouter);
router.use('/:bookId/quotes',     quoteRouter);
router.use('/:bookId/characters', characterRouter);

export default router;
