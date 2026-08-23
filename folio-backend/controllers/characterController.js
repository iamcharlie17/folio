import Character from '../models/Character.js';
import Book      from '../models/Book.js';

const checkBookOwnership = async (bookId, userId, res) => {
  const book = await Book.findById(bookId);
  if (!book) { res.status(404).json({ success: false, message: 'Book not found' }); return null; }
  if (book.user.toString() !== userId.toString()) { res.status(403).json({ success: false, message: 'Access denied' }); return null; }
  return book;
};

const findOwnedCharacter = async (characterId, userId, res) => {
  const character = await Character.findById(characterId);
  if (!character) { res.status(404).json({ success: false, message: 'Character not found' }); return null; }
  if (character.user.toString() !== userId.toString()) { res.status(403).json({ success: false, message: 'Access denied' }); return null; }
  return character;
};

// GET /books/:bookId/characters
const getCharacters = async (req, res, next) => {
  try {
    const book = await checkBookOwnership(req.params.bookId, req.user._id, res);
    if (!book) return;

    const characters = await Character.find({ book: req.params.bookId });
    res.status(200).json({
      success: true,
      count: characters.length,
      characters: characters.map((c) => ({
        _id:    c._id,
        name:   c.name,
        role:   c.role,
        traits: c.traits,
        relationships: c.relationships,
      })),
    });
  } catch (err) { next(err); }
};

// POST /books/:bookId/characters
const createCharacter = async (req, res, next) => {
  try {
    const book = await checkBookOwnership(req.params.bookId, req.user._id, res);
    if (!book) return;

    const { name, role, traits, relationships } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'name is required' });

    const character = await Character.create({
      book:          req.params.bookId,
      user:          req.user._id,
      name, role,
      traits:        traits || [],
      relationships: relationships || [],
    });

    res.status(201).json({
      success: true,
      character: {
        _id:           character._id,
        book:          character.book,
        name:          character.name,
        role:          character.role,
        traits:        character.traits,
        relationships: character.relationships,
        createdAt:     character.createdAt,
      },
    });
  } catch (err) { next(err); }
};

// GET /characters/:characterId
const getCharacter = async (req, res, next) => {
  try {
    const character = await findOwnedCharacter(req.params.characterId, req.user._id, res);
    if (!character) return;
    res.status(200).json({ success: true, character });
  } catch (err) { next(err); }
};

// PUT /characters/:characterId
const updateCharacter = async (req, res, next) => {
  try {
    const character = await findOwnedCharacter(req.params.characterId, req.user._id, res);
    if (!character) return;

    ['name', 'role', 'traits', 'relationships'].forEach((f) => {
      if (req.body[f] !== undefined) character[f] = req.body[f];
    });
    await character.save();

    res.status(200).json({
      success: true,
      character: { _id: character._id, name: character.name, updatedAt: character.updatedAt },
    });
  } catch (err) { next(err); }
};

// DELETE /characters/:characterId
const deleteCharacter = async (req, res, next) => {
  try {
    const character = await findOwnedCharacter(req.params.characterId, req.user._id, res);
    if (!character) return;
    await character.deleteOne();
    res.status(200).json({ success: true, message: 'Character deleted.' });
  } catch (err) { next(err); }
};

export { getCharacters, createCharacter, getCharacter, updateCharacter, deleteCharacter };
