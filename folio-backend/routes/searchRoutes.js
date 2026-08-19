import express from 'express';
import { search } from '../controllers/searchController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
router.use(protect);

// GET /search?q=...  or  GET /search?q=...&bookId=...
router.get('/', search);

export default router;
