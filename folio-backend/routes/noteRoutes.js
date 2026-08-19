import express from 'express';
import { getNotes, createNote, getNote, updateNote, deleteNote } from '../controllers/noteController.js';
import { protect } from '../middleware/auth.js';

// mergeParams: true — gives access to :bookId from the parent bookRoutes
const router = express.Router({ mergeParams: true });

router.use(protect);

// Nested: /books/:bookId/notes
router.route('/').get(getNotes).post(createNote);

// Flat: /notes/:noteId
router.route('/:noteId').get(getNote).put(updateNote).delete(deleteNote);

export default router;
