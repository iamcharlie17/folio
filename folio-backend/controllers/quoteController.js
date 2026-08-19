import Quote from '../models/Quote.js';
import Book  from '../models/Book.js';

const checkBookOwnership = async (bookId, userId, res) => {
  const book = await Book.findById(bookId);
  if (!book) { res.status(404).json({ success: false, message: 'Book not found' }); return null; }
  if (book.user.toString() !== userId.toString()) { res.status(403).json({ success: false, message: 'Access denied' }); return null; }
  return book;
};

const findOwnedQuote = async (quoteId, userId, res) => {
  const quote = await Quote.findById(quoteId);
  if (!quote) { res.status(404).json({ success: false, message: 'Quote not found' }); return null; }
  if (quote.user.toString() !== userId.toString()) { res.status(403).json({ success: false, message: 'Access denied' }); return null; }
  return quote;
};

// GET /books/:bookId/quotes
const getQuotes = async (req, res, next) => {
  try {
    const book = await checkBookOwnership(req.params.bookId, req.user._id, res);
    if (!book) return;

    const quotes = await Quote.find({ book: req.params.bookId }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: quotes.length,
      quotes: quotes.map((q) => ({
        _id:     q._id,
        text:    q.text,
        page:    q.page,
        chapter: q.chapter,
      })),
    });
  } catch (err) { next(err); }
};

// POST /books/:bookId/quotes
const createQuote = async (req, res, next) => {
  try {
    const book = await checkBookOwnership(req.params.bookId, req.user._id, res);
    if (!book) return;

    const { text, page, chapter, reaction, tags } = req.body;
    if (!text) return res.status(400).json({ success: false, message: 'text is required' });

    const quote = await Quote.create({
      book:    req.params.bookId,
      user:    req.user._id,
      text, page, chapter, reaction,
      tags:    tags || [],
    });

    res.status(201).json({
      success: true,
      quote: {
        _id:       quote._id,
        book:      quote.book,
        text:      quote.text,
        page:      quote.page,
        chapter:   quote.chapter,
        reaction:  quote.reaction,
        createdAt: quote.createdAt,
      },
    });
  } catch (err) { next(err); }
};

// GET /quotes/:quoteId
const getQuote = async (req, res, next) => {
  try {
    const quote = await findOwnedQuote(req.params.quoteId, req.user._id, res);
    if (!quote) return;
    res.status(200).json({ success: true, quote });
  } catch (err) { next(err); }
};

// PUT /quotes/:quoteId
const updateQuote = async (req, res, next) => {
  try {
    const quote = await findOwnedQuote(req.params.quoteId, req.user._id, res);
    if (!quote) return;

    ['text', 'page', 'chapter', 'reaction', 'tags'].forEach((f) => {
      if (req.body[f] !== undefined) quote[f] = req.body[f];
    });
    await quote.save();

    res.status(200).json({
      success: true,
      quote: { _id: quote._id, text: quote.text, updatedAt: quote.updatedAt },
    });
  } catch (err) { next(err); }
};

// DELETE /quotes/:quoteId
const deleteQuote = async (req, res, next) => {
  try {
    const quote = await findOwnedQuote(req.params.quoteId, req.user._id, res);
    if (!quote) return;
    await quote.deleteOne();
    res.status(200).json({ success: true, message: 'Quote deleted.' });
  } catch (err) { next(err); }
};

export { getQuotes, createQuote, getQuote, updateQuote, deleteQuote };
