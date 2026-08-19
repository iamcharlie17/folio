import Book        from '../models/Book.js';
import Note        from '../models/Note.js';
import Quote       from '../models/Quote.js';
import Character   from '../models/Character.js';
import ProgressLog from '../models/ProgressLog.js';

// ─── Helpers ────────────────────────────────────────────────────────────────

const findOwnedBook = async (req, res) => {
  const book = await Book.findById(req.params.bookId);
  if (!book) {
    res.status(404).json({ success: false, message: 'Book not found' });
    return null;
  }
  if (book.user.toString() !== req.user._id.toString()) {
    res.status(403).json({ success: false, message: 'Access denied' });
    return null;
  }
  return book;
};

// ─── Book CRUD ───────────────────────────────────────────────────────────────

export const getBooks = async (req, res, next) => {
  try {
    const { status, genre, sort, search } = req.query;

    const filter = { user: req.user._id };
    if (status) filter.status = status;
    if (genre)  filter.genre  = genre;
    if (search) filter.title  = { $regex: search, $options: 'i' };

    const sortOption = sort
      ? { [sort.replace(/^-/, '')]: sort.startsWith('-') ? -1 : 1 }
      : { createdAt: -1 };

    const books = await Book.find(filter).sort(sortOption);

    res.status(200).json({
      success: true,
      count: books.length,
      books: books.map((b) => ({
        _id:               b._id,
        title:             b.title,
        author:            b.author,
        genre:             b.genre,
        status:            b.status,
        totalPages:        b.totalPages,
        currentPage:       b.currentPage,
        completionPercent: b.completionPercent,
      })),
    });
  } catch (err) {
    next(err);
  }
};

export const createBook = async (req, res, next) => {
  try {
    const { title, author, genre, coverImage, totalPages, status } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'title is required' });
    }

    const book = await Book.create({
      user: req.user._id,
      title, author, genre, coverImage, totalPages, status,
    });

    res.status(201).json({
      success: true,
      book: {
        _id:         book._id,
        user:        book.user,
        title:       book.title,
        author:      book.author,
        genre:       book.genre,
        coverImage:  book.coverImage,
        totalPages:  book.totalPages,
        currentPage: book.currentPage,
        status:      book.status,
        createdAt:   book.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getBook = async (req, res, next) => {
  try {
    const book = await findOwnedBook(req, res);
    if (!book) return;

    const [notesCount, quotesCount, charactersCount] = await Promise.all([
      Note.countDocuments({ book: book._id }),
      Quote.countDocuments({ book: book._id }),
      Character.countDocuments({ book: book._id }),
    ]);

    res.status(200).json({
      success: true,
      book: {
        _id:             book._id,
        title:           book.title,
        author:          book.author,
        genre:           book.genre,
        coverImage:      book.coverImage,
        totalPages:      book.totalPages,
        currentPage:     book.currentPage,
        status:          book.status,
        notesCount,
        quotesCount,
        charactersCount,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const updateBook = async (req, res, next) => {
  try {
    const book = await findOwnedBook(req, res);
    if (!book) return;

    const allowed = ['title', 'author', 'genre', 'coverImage', 'totalPages', 'currentPage', 'status'];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) book[field] = req.body[field];
    });

    await book.save();

    res.status(200).json({
      success: true,
      book: {
        _id:         book._id,
        status:      book.status,
        currentPage: book.currentPage,
        updatedAt:   book.updatedAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const deleteBook = async (req, res, next) => {
  try {
    const book = await findOwnedBook(req, res);
    if (!book) return;

    const bookId = book._id;

    await Promise.all([
      Note.deleteMany({ book: bookId }),
      Quote.deleteMany({ book: bookId }),
      Character.deleteMany({ book: bookId }),
      ProgressLog.deleteMany({ book: bookId }),
      book.deleteOne(),
    ]);

    res.status(200).json({
      success: true,
      message: 'Book and all related notes, quotes, and characters deleted.',
    });
  } catch (err) {
    next(err);
  }
};

// ─── Progress Tracker ────────────────────────────────────────────────────────

export const updateProgress = async (req, res, next) => {
  try {
    const book = await findOwnedBook(req, res);
    if (!book) return;

    const { currentPage } = req.body;
    if (currentPage === undefined || typeof currentPage !== 'number') {
      return res.status(400).json({ success: false, message: 'currentPage (number) is required' });
    }
    if (currentPage < 0) {
      return res.status(400).json({ success: false, message: 'currentPage cannot be negative' });
    }
    if (book.totalPages && currentPage > book.totalPages) {
      return res.status(400).json({ success: false, message: `currentPage exceeds totalPages (${book.totalPages})` });
    }

    book.currentPage = currentPage;
    if (book.totalPages && currentPage >= book.totalPages) {
      book.status = 'completed';
    } else if (currentPage > 0 && book.status === 'to-read') {
      book.status = 'reading';
    }
    await book.save();

    await ProgressLog.create({ book: book._id, page: currentPage });

    res.status(200).json({
      success: true,
      progress: {
        book:              book._id,
        currentPage:       book.currentPage,
        totalPages:        book.totalPages,
        completionPercent: book.completionPercent,
        updatedAt:         book.updatedAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getProgress = async (req, res, next) => {
  try {
    const book = await findOwnedBook(req, res);
    if (!book) return;

    const N = 10;
    const logs = await ProgressLog.find({ book: book._id })
      .sort({ loggedAt: -1 })
      .limit(N);

    let avgPagesPerDay = null;
    let estimatedFinishDate = null;

    if (logs.length >= 2) {
      let totalPages = 0;
      let totalDays  = 0;

      for (let i = 0; i < logs.length - 1; i++) {
        const pageDiff = logs[i].page - logs[i + 1].page;
        const dayDiff  = (new Date(logs[i].loggedAt) - new Date(logs[i + 1].loggedAt)) / (1000 * 60 * 60 * 24);
        if (dayDiff > 0 && pageDiff > 0) {
          totalPages += pageDiff;
          totalDays  += dayDiff;
        }
      }

      if (totalDays > 0) {
        avgPagesPerDay = Math.round(totalPages / totalDays);

        const pagesLeft = (book.totalPages || 0) - book.currentPage;
        if (pagesLeft > 0 && avgPagesPerDay > 0) {
          const daysLeft = pagesLeft / avgPagesPerDay;
          const finishDate = new Date();
          finishDate.setDate(finishDate.getDate() + daysLeft);
          estimatedFinishDate = finishDate.toISOString();
        }
      }
    }

    res.status(200).json({
      success: true,
      progress: {
        currentPage:        book.currentPage,
        totalPages:         book.totalPages,
        completionPercent:  book.completionPercent,
        avgPagesPerDay,
        estimatedFinishDate,
      },
    });
  } catch (err) {
    next(err);
  }
};
