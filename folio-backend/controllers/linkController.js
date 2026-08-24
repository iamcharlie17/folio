import Link      from '../models/Link.js';
import Note      from '../models/Note.js';
import Quote     from '../models/Quote.js';
import Book      from '../models/Book.js';
import mongoose  from 'mongoose';

/**
 * Fetch an item (note or quote) and its associated book title/author.
 * Returns { item, bookTitle, bookAuthor } or null if not found.
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
  return {
    item,
    bookTitle:  book?.title || null,
    bookAuthor: book?.author || null,
  };
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

// GET /links?itemId=xxx  → links touching one specific item
// GET /links?bookId=xxx  → links touching any note/quote of a book
const getLinks = async (req, res, next) => {
  try {
    const { itemId, bookId } = req.query;
    if (!itemId && !bookId) {
      return res.status(400).json({ success: false, message: 'itemId or bookId query param is required' });
    }

    const filter = { user: req.user._id };
    let anchoredId = null;

    if (itemId) {
      anchoredId = new mongoose.Types.ObjectId(itemId);
      filter.$or = [{ sourceId: anchoredId }, { targetId: anchoredId }];
    } else {
      const ownedBook = await Book.findOne({
        _id: new mongoose.Types.ObjectId(bookId),
        user: req.user._id,
      });
      if (!ownedBook) return res.status(404).json({ success: false, message: 'Book not found' });

      const [noteIds, quoteIds] = await Promise.all([
        Note.find({ book: ownedBook._id, user: req.user._id }).distinct('_id'),
        Quote.find({ book: ownedBook._id, user: req.user._id }).distinct('_id'),
      ]);

      const conditions = [];
      if (noteIds.length) {
        conditions.push({ sourceType: 'note', sourceId: { $in: noteIds } });
        conditions.push({ targetType: 'note', targetId: { $in: noteIds } });
      }
      if (quoteIds.length) {
        conditions.push({ sourceType: 'quote', sourceId: { $in: quoteIds } });
        conditions.push({ targetType: 'quote', targetId: { $in: quoteIds } });
      }
      if (!conditions.length) {
        return res.status(200).json({ success: true, count: 0, links: [] });
      }
      filter.$or = conditions;
    }

    const links = await Link.find(filter);

    // For each link, resolve both sides with full metadata
    const describe = (type, id, resolved) => ({
      type,
      id,
      ...(type === 'note'
        ? { topic: resolved?.item?.topic ?? null }
        : { text: resolved?.item?.text ?? null, page: resolved?.item?.page ?? null }),
      book:   resolved?.bookTitle || null,
      author: resolved?.bookAuthor || null,
    });

    const enriched = await Promise.all(
      links.map(async (link) => {
        const [sourceResolved, targetResolved] = await Promise.all([
          resolveItem(link.sourceType, link.sourceId),
          resolveItem(link.targetType, link.targetId),
        ]);

        return {
          _id:       link._id,
          ...(anchoredId
            ? { direction: link.sourceId.toString() === anchoredId.toString() ? 'outgoing' : 'incoming' }
            : {}),
          source:    describe(link.sourceType, link.sourceId, sourceResolved),
          target:    describe(link.targetType, link.targetId, targetResolved),
          note:      link.note,
          createdAt: link.createdAt,
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
