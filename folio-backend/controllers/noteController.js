import Note from '../models/Note.js';
import Book from '../models/Book.js';

/** Verify book ownership, return book or send error. */
const checkBookOwnership = async (bookId, userId, res) => {
  const book = await Book.findById(bookId);
  if (!book) {
    res.status(404).json({ success: false, message: 'Book not found' });
    return null;
  }
  if (book.user.toString() !== userId.toString()) {
    res.status(403).json({ success: false, message: 'Access denied' });
    return null;
  }
  return book;
};

/** Verify note exists, belongs to user, return note or send error. */
const findOwnedNote = async (noteId, userId, res) => {
  const note = await Note.findById(noteId);
  if (!note) {
    res.status(404).json({ success: false, message: 'Note not found' });
    return null;
  }
  if (note.user.toString() !== userId.toString()) {
    res.status(403).json({ success: false, message: 'Access denied' });
    return null;
  }
  return note;
};

// GET /books/:bookId/notes
const getNotes = async (req, res, next) => {
  try {
    const { bookId } = req.params;
    const book = await checkBookOwnership(bookId, req.user._id, res);
    if (!book) return;

    const notes = await Note.find({ book: bookId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: notes.length,
      notes: notes.map((n) => ({
        _id:       n._id,
        topic:     n.topic,
        content:   n.content,
        tags:      n.tags,
        createdAt: n.createdAt,
      })),
    });
  } catch (err) {
    next(err);
  }
};

// POST /books/:bookId/notes
const createNote = async (req, res, next) => {
  try {
    const { bookId } = req.params;
    const book = await checkBookOwnership(bookId, req.user._id, res);
    if (!book) return;

    const { topic, content, tags } = req.body;
    if (!topic || !content) {
      return res.status(400).json({ success: false, message: 'topic and content are required' });
    }

    const note = await Note.create({
      book:    bookId,
      user:    req.user._id,
      topic,
      content,
      tags:    tags || [],
    });

    res.status(201).json({
      success: true,
      note: {
        _id:       note._id,
        book:      note.book,
        user:      note.user,
        topic:     note.topic,
        content:   note.content,
        tags:      note.tags,
        createdAt: note.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /notes/:noteId
const getNote = async (req, res, next) => {
  try {
    const note = await findOwnedNote(req.params.noteId, req.user._id, res);
    if (!note) return;

    res.status(200).json({ success: true, note });
  } catch (err) {
    next(err);
  }
};

// PUT /notes/:noteId
const updateNote = async (req, res, next) => {
  try {
    const note = await findOwnedNote(req.params.noteId, req.user._id, res);
    if (!note) return;

    const allowed = ['topic', 'content', 'tags'];
    allowed.forEach((f) => { if (req.body[f] !== undefined) note[f] = req.body[f]; });
    await note.save();

    res.status(200).json({
      success: true,
      note: {
        _id:       note._id,
        content:   note.content,
        updatedAt: note.updatedAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /notes/:noteId
const deleteNote = async (req, res, next) => {
  try {
    const note = await findOwnedNote(req.params.noteId, req.user._id, res);
    if (!note) return;

    await note.deleteOne();
    res.status(200).json({ success: true, message: 'Note deleted.' });
  } catch (err) {
    next(err);
  }
};

export { getNotes, createNote, getNote, updateNote, deleteNote };
