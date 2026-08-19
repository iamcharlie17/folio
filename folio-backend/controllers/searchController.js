import Note      from '../models/Note.js';
import Quote     from '../models/Quote.js';
import Character from '../models/Character.js';

// GET /search?q=keyword[&bookId=xxx]
const search = async (req, res, next) => {
  try {
    const { q, bookId } = req.query;

    if (!q || q.trim() === '') {
      return res.status(400).json({ success: false, message: 'q (search query) is required' });
    }

    // Base filter — always scoped to the logged-in user
    const baseFilter = { user: req.user._id };
    if (bookId) baseFilter.book = bookId;

    const textFilter = { ...baseFilter, $text: { $search: q } };

    const [notes, quotes, characters] = await Promise.all([
      Note.find(textFilter)
        .populate('book', 'title')
        .select('topic content book'),
      Quote.find(textFilter)
        .populate('book', 'title')
        .select('text book'),
      Character.find(textFilter)
        .populate('book', 'title')
        .select('name role book'),
    ]);

    res.status(200).json({
      success: true,
      query: q,
      results: {
        notes: notes.map((n) => ({
          _id:   n._id,
          topic: n.topic,
          book:  n.book,
        })),
        quotes: quotes.map((q) => ({
          _id:  q._id,
          text: q.text,
          book: q.book,
        })),
        characters: characters.map((c) => ({
          _id:  c._id,
          name: c.name,
          role: c.role,
          book: c.book,
        })),
      },
    });
  } catch (err) {
    next(err);
  }
};

export { search };
