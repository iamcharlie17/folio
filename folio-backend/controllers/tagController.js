import Tag       from '../models/Tag.js';
import Note      from '../models/Note.js';
import Quote     from '../models/Quote.js';
import mongoose  from 'mongoose';

// GET /tags — global tag list with usage counts across entire library
const getTags = async (req, res, next) => {
  try {
    const tags = await Tag.find({ user: req.user._id }).sort({ name: 1 });

    // For each tag, count how many notes + quotes reference it
    const tagIds = tags.map((t) => t._id);

    // Aggregate usage counts in a single query per collection
    const [noteAgg, quoteAgg] = await Promise.all([
      Note.aggregate([
        { $match: { user: req.user._id, tags: { $in: tagIds } } },
        { $unwind: '$tags' },
        { $match: { tags: { $in: tagIds } } },
        { $group: { _id: '$tags', count: { $sum: 1 } } },
      ]),
      Quote.aggregate([
        { $match: { user: req.user._id, tags: { $in: tagIds } } },
        { $unwind: '$tags' },
        { $match: { tags: { $in: tagIds } } },
        { $group: { _id: '$tags', count: { $sum: 1 } } },
      ]),
    ]);

    // Build a lookup map: tagId → total usageCount
    const countMap = {};
    noteAgg.forEach(({ _id, count }) => {
      countMap[_id.toString()] = (countMap[_id.toString()] || 0) + count;
    });
    quoteAgg.forEach(({ _id, count }) => {
      countMap[_id.toString()] = (countMap[_id.toString()] || 0) + count;
    });

    res.status(200).json({
      success: true,
      tags: tags.map((t) => ({
        _id:        t._id,
        name:       t.name,
        color:      t.color,
        usageCount: countMap[t._id.toString()] || 0,
      })),
    });
  } catch (err) {
    next(err);
  }
};

// POST /tags
const createTag = async (req, res, next) => {
  try {
    const { name, color } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'name is required' });

    const tag = await Tag.create({ user: req.user._id, name, color });

    res.status(201).json({
      success: true,
      tag: {
        _id:   tag._id,
        user:  tag.user,
        name:  tag.name,
        color: tag.color,
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /tags/:tagId/items — all notes/quotes across the library using this tag
const getTagItems = async (req, res, next) => {
  try {
    const tag = await Tag.findOne({ _id: req.params.tagId, user: req.user._id });
    if (!tag) return res.status(404).json({ success: false, message: 'Tag not found' });

    const [notes, quotes] = await Promise.all([
      Note.find({ user: req.user._id, tags: tag._id }).populate('book', 'title'),
      Quote.find({ user: req.user._id, tags: tag._id }).populate('book', 'title'),
    ]);

    res.status(200).json({
      success: true,
      tag: tag.name,
      results: {
        notes: notes.map((n) => ({
          _id:   n._id,
          topic: n.topic,
          book:  n.book ? n.book.title : null,
        })),
        quotes: quotes.map((q) => ({
          _id:  q._id,
          text: q.text,
          book: q.book ? q.book.title : null,
        })),
      },
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /tags/:tagId — remove tag and pull from all items
const deleteTag = async (req, res, next) => {
  try {
    const tag = await Tag.findOne({ _id: req.params.tagId, user: req.user._id });
    if (!tag) return res.status(404).json({ success: false, message: 'Tag not found' });

    // Remove the tag reference from all notes and quotes
    await Promise.all([
      Note.updateMany({ tags: tag._id }, { $pull: { tags: tag._id } }),
      Quote.updateMany({ tags: tag._id }, { $pull: { tags: tag._id } }),
      tag.deleteOne(),
    ]);

    res.status(200).json({ success: true, message: 'Tag deleted and removed from all items.' });
  } catch (err) {
    next(err);
  }
};

export { getTags, createTag, getTagItems, deleteTag };
