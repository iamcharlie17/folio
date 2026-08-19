import express from 'express';
import { getQuotes, createQuote, getQuote, updateQuote, deleteQuote } from '../controllers/quoteController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router({ mergeParams: true });

router.use(protect);

// Nested: /books/:bookId/quotes
router.route('/').get(getQuotes).post(createQuote);

// Flat: /quotes/:quoteId
router.route('/:quoteId').get(getQuote).put(updateQuote).delete(deleteQuote);

export default router;
