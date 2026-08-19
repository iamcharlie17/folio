import Link      from '../models/Link.js';
import Note      from '../models/Note.js';
import Quote     from '../models/Quote.js';
import Book      from '../models/Book.js';
import mongoose  from 'mongoose';

/**
 * Fetch an item (note or quote) and its associated book title.
 * Returns { item, bookTitle } or null if not found.
 */
const resolveItem = async (type, id) => {
  let item, bookId;
  if (type === 'note') {
    item = await Note.findById(id);
    bookId = item?.book;
  } else {
    item = await Quote.findById(id);
    bookId = item?.book;
  }
  if (!item) return null;
  const book = await Book.findById(bookId);
  return { item, bookTitle: book?.title || null };
};

// POST /links
const createLink = async (req, res, next) => {
  try {
    const { sourceType, sourceId, targetType, targetId, note } = req.body;

    if (!sourceType || !sourceId || !targetType || !targetId) {
      return res.status(400).json({
        success: false,
        message: 'sourceType, sourceId, targetType and targetId are required',
      });
    }
    if (!['note', 'quote'].includes(sourceType) || !['note', 'quote'].includes(targetType)) {
      return res.status(400).json({ success: false, message: 'sourceType/targetType must be "note" or "quote"' });
    }

    // Resolve source and target to get book context
    const [sourceResolved, targetResolved] = await Promise.all([
      resolveItem(sourceType, sourceId),
      resolveItem(targetType, targetId),
    ]);

    if (!sourceResolved) return res.status(404).json({ success: false, message: 'Source item not found' });
    if (!targetResolved) return res.status(404).json({ success: false, message: 'Target item not found' });

    // Ownership: source item must belong to req.user
    if (sourceResolved.item.user?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied: you do not own the source item' });
    }

    const link = await Link.create({
      user:       req.user._id,
      sourceType,
      sourceId,
      targetType,
      targetId,
      note,
    });

    res.status(201).json({
      success: true,
      link: {
        _id:  link._id,
        user: link.user,
        source: {
          type: link.sourceType,
          id:   link.sourceId,
          book: sourceResolved.bookTitle,
        },
        target: {
          type: link.targetType,
          id:   link.targetId,
          book: targetResolved.bookTitle,
        },
        note:      link.note,
        createdAt: link.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /links?itemId=xxx
const getLinks = async (req, res, next) => {
  try {
    const { itemId } = req.query;
    if (!itemId) return res.status(400).json({ success: false, message: 'itemId query param is required' });

    const objectId = new mongoose.Types.ObjectId(itemId);

    // Find links where itemId is either source or target
    const links = await Link.find({
      user: req.user._id,
      $or: [{ sourceId: objectId }, { targetId: objectId }],
    });

    // For each link, resolve the "other side" relative to the queried item
    const enriched = await Promise.all(
      links.map(async (link) => {
        const isSource = link.sourceId.toString() === itemId;
        const otherType = isSource ? link.targetType : link.sourceType;
        const otherId   = isSource ? link.targetId   : link.sourceId;
        const resolved  = await resolveItem(otherType, otherId);

        const otherInfo = {
          type: otherType,
          id:   otherId,
          book: resolved?.bookTitle || null,
          // include topic (note) or text (quote) if available
          ...(otherType === 'note'
            ? { topic: resolved?.item?.topic }
            : { text:  resolved?.item?.text }),
        };

        return {
          _id:    link._id,
          target: otherInfo,
          note:   link.note,
        };
      })
    );

    res.status(200).json({ success: true, count: enriched.length, links: enriched });
  } catch (err) {
    next(err);
  }
};

// DELETE /links/:linkId
const deleteLink = async (req, res, next) => {
  try {
    const link = await Link.findOne({ _id: req.params.linkId, user: req.user._id });
    if (!link) return res.status(404).json({ success: false, message: 'Link not found' });

    await link.deleteOne();
    res.status(200).json({ success: true, message: 'Link removed.' });
  } catch (err) {
    next(err);
  }
};

export { createLink, getLinks, deleteLink };
