/**
 * seed.js — populates the Folio database with the demo dataset from the spec.
 * Run: node seed.js
 *
 * Demo ObjectIds match folio-api-endpoints.md so cross-references are consistent.
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Models
import User        from './models/User.js';
import Book        from './models/Book.js';
import Note        from './models/Note.js';
import Quote       from './models/Quote.js';
import Character   from './models/Character.js';
import Tag         from './models/Tag.js';
import Link        from './models/Link.js';
import ProgressLog from './models/ProgressLog.js';

// ─── Demo ObjectIds (must match spec) ───────────────────────────────────────
const IDs = {
  user:   new mongoose.Types.ObjectId('64f1a001a1b2c3d4e5f60001'),
  book1:  new mongoose.Types.ObjectId('64f1a002a1b2c3d4e5f60002'), // The Alchemist
  book2:  new mongoose.Types.ObjectId('64f1a002a1b2c3d4e5f60003'), // Norwegian Wood
  note1:  new mongoose.Types.ObjectId('64f1a003a1b2c3d4e5f60010'),
  note2:  new mongoose.Types.ObjectId('64f1a003a1b2c3d4e5f60099'), // NW note
  quote1: new mongoose.Types.ObjectId('64f1a004a1b2c3d4e5f60020'),
  char1:  new mongoose.Types.ObjectId('64f1a005a1b2c3d4e5f60030'),
  tag1:   new mongoose.Types.ObjectId('64f1a006a1b2c3d4e5f60040'), // theme
  tag2:   new mongoose.Types.ObjectId('64f1a006a1b2c3d4e5f60041'), // destiny
  tag3:   new mongoose.Types.ObjectId('64f1a006a1b2c3d4e5f60042'), // symbolism
  link1:  new mongoose.Types.ObjectId('64f1a007a1b2c3d4e5f60050'),
};

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // ── Wipe existing demo data ──────────────────────────────────────────────
    await Promise.all([
      User.deleteMany({}),
      Book.deleteMany({}),
      Note.deleteMany({}),
      Quote.deleteMany({}),
      Character.deleteMany({}),
      Tag.deleteMany({}),
      Link.deleteMany({}),
      ProgressLog.deleteMany({}),
    ]);
    console.log('Cleared existing data');

    // ── User ─────────────────────────────────────────────────────────────────
    // Use insertOne with a pre-hashed password so we can control the _id

    const hashed = await bcrypt.hash('StrongPass123!', 10);

    await User.collection.insertOne({
      _id:       IDs.user,
      name:      'Ayesha Rahman',
      email:     'ayesha@example.com',
      password:  hashed,
      createdAt: new Date('2026-08-01T10:00:00.000Z'),
      updatedAt: new Date('2026-08-01T10:00:00.000Z'),
    });
    console.log('User created');

    // ── Books ─────────────────────────────────────────────────────────────────
    await Book.collection.insertMany([
      {
        _id:         IDs.book1,
        user:        IDs.user,
        title:       'The Alchemist',
        author:      'Paulo Coelho',
        genre:       'Fiction',
        coverImage:  'https://covers.example.com/alchemist.jpg',
        totalPages:  197,
        currentPage: 84,
        status:      'reading',
        createdAt:   new Date('2026-08-01T10:05:00.000Z'),
        updatedAt:   new Date('2026-08-10T08:00:00.000Z'),
      },
      {
        _id:         IDs.book2,
        user:        IDs.user,
        title:       'Norwegian Wood',
        author:      'Haruki Murakami',
        genre:       'Fiction',
        coverImage:  'https://covers.example.com/norwegian-wood.jpg',
        totalPages:  296,
        currentPage: 0,
        status:      'to-read',
        createdAt:   new Date('2026-08-01T10:10:00.000Z'),
        updatedAt:   new Date('2026-08-01T10:10:00.000Z'),
      },
    ]);
    console.log('Books created');

    // ── Tags ──────────────────────────────────────────────────────────────────
    await Tag.collection.insertMany([
      { _id: IDs.tag1, user: IDs.user, name: 'theme',    color: '#8B5CF6', createdAt: new Date(), updatedAt: new Date() },
      { _id: IDs.tag2, user: IDs.user, name: 'destiny',  color: '#F59E0B', createdAt: new Date(), updatedAt: new Date() },
      { _id: IDs.tag3, user: IDs.user, name: 'symbolism',color: '#10B981', createdAt: new Date(), updatedAt: new Date() },
    ]);
    console.log('Tags created');

    // ── Notes ─────────────────────────────────────────────────────────────────
    await Note.collection.insertMany([
      {
        _id:       IDs.note1,
        book:      IDs.book1,
        user:      IDs.user,
        topic:     'Personal Legend',
        content:   "The book keeps circling back to the idea that everyone has a 'Personal Legend' — a purpose only they can fulfill.",
        tags:      [IDs.tag1, IDs.tag2],
        createdAt: new Date('2026-08-02T11:00:00.000Z'),
        updatedAt: new Date('2026-08-02T11:00:00.000Z'),
      },
      {
        _id:       IDs.note2,
        book:      IDs.book2,
        user:      IDs.user,
        topic:     'Loss and memory',
        content:   "Murakami weaves loss and memory together — Toru's grief is central to understanding the novel's emotional core.",
        tags:      [IDs.tag1],
        createdAt: new Date('2026-08-03T09:00:00.000Z'),
        updatedAt: new Date('2026-08-03T09:00:00.000Z'),
      },
    ]);
    console.log('Notes created');

    // ── Quotes ────────────────────────────────────────────────────────────────
    await Quote.collection.insertMany([
      {
        _id:       IDs.quote1,
        book:      IDs.book1,
        user:      IDs.user,
        text:      "And, when you want something, all the universe conspires in helping you to achieve it.",
        page:      24,
        chapter:   'Part One',
        reaction:  "This line reframed how I think about 'luck' — it's less mystical and more about staying alert to opportunity.",
        tags:      [IDs.tag1, IDs.tag2],
        createdAt: new Date('2026-08-02T11:20:00.000Z'),
        updatedAt: new Date('2026-08-02T11:20:00.000Z'),
      },
    ]);
    console.log('Quotes created');

    // ── Characters ────────────────────────────────────────────────────────────
    await Character.collection.insertMany([
      {
        _id:       IDs.char1,
        book:      IDs.book1,
        user:      IDs.user,
        name:      'Santiago',
        role:      'Protagonist',
        traits:    ['curious', 'persistent', 'idealistic'],
        relationships: [
          { character: 'The Alchemist', description: 'Mentor who guides him toward his Personal Legend' },
        ],
        createdAt: new Date('2026-08-02T11:30:00.000Z'),
        updatedAt: new Date('2026-08-02T11:30:00.000Z'),
      },
    ]);
    console.log('Characters created');

    // ── Cross-book Link ───────────────────────────────────────────────────────
    await Link.collection.insertOne({
      _id:        IDs.link1,
      user:       IDs.user,
      sourceType: 'note',
      sourceId:   IDs.note1,
      targetType: 'note',
      targetId:   IDs.note2,
      note:       'Both books explore searching for meaning through a personal journey.',
      createdAt:  new Date('2026-08-05T12:00:00.000Z'),
      updatedAt:  new Date('2026-08-05T12:00:00.000Z'),
    });
    console.log('Link created');

    // ── Progress Log ──────────────────────────────────────────────────────────
    // Simulate a reading history so estimatedFinishDate can be computed
    await ProgressLog.collection.insertMany([
      { book: IDs.book1, page: 20,  loggedAt: new Date('2026-08-05T08:00:00.000Z') },
      { book: IDs.book1, page: 40,  loggedAt: new Date('2026-08-07T08:00:00.000Z') },
      { book: IDs.book1, page: 60,  loggedAt: new Date('2026-08-09T08:00:00.000Z') },
      { book: IDs.book1, page: 84,  loggedAt: new Date('2026-08-10T08:00:00.000Z') },
    ]);
    console.log('Progress logs created');

    console.log('\n✅ Seed complete!');
    console.log('   Login: ayesha@example.com / StrongPass123!');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
};

seed();
