import express from 'express';
import { getCharacters, createCharacter, getCharacter, updateCharacter, deleteCharacter } from '../controllers/characterController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router({ mergeParams: true });

router.use(protect);

// Nested: /books/:bookId/characters
router.route('/').get(getCharacters).post(createCharacter);

// Flat: /characters/:characterId
router.route('/:characterId').get(getCharacter).put(updateCharacter).delete(deleteCharacter);

export default router;
