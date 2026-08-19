# Folio API Reference — Node.js / Express / Mongoose

Base URL: `http://localhost:5000/api/v1`
Auth: `Authorization: Bearer <jwt_token>` required on every route except register/login.
All IDs below are demo Mongo ObjectIds reused consistently across modules so the dataset reads as one coherent example.

**Demo actors used throughout:**
- User: `64f1a001a1b2c3d4e5f60001` — Ayesha Rahman
- Book: `64f1a002a1b2c3d4e5f60002` — *The Alchemist* by Paulo Coelho
- Second Book: `64f1a002a1b2c3d4e5f60003` — *Norwegian Wood* by Haruki Murakami

---

## 1. Auth Module

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Create a new account |
| POST | `/auth/login` | Log in, receive JWT |
| GET | `/auth/me` | Get current logged-in user |
| POST | `/auth/logout` | Invalidate session (client-side token clear, or blacklist) |

### POST /auth/register
**Request**
```json
{
  "name": "Ayesha Rahman",
  "email": "ayesha@example.com",
  "password": "StrongPass123!"
}
```
**Response `201`**
```json
{
  "success": true,
  "user": {
    "_id": "64f1a001a1b2c3d4e5f60001",
    "name": "Ayesha Rahman",
    "email": "ayesha@example.com",
    "createdAt": "2026-08-01T10:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### POST /auth/login
**Request**
```json
{
  "email": "ayesha@example.com",
  "password": "StrongPass123!"
}
```
**Response `200`**
```json
{
  "success": true,
  "user": {
    "_id": "64f1a001a1b2c3d4e5f60001",
    "name": "Ayesha Rahman",
    "email": "ayesha@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### GET /auth/me
**Response `200`**
```json
{
  "success": true,
  "user": {
    "_id": "64f1a001a1b2c3d4e5f60001",
    "name": "Ayesha Rahman",
    "email": "ayesha@example.com",
    "booksCount": 2,
    "createdAt": "2026-08-01T10:00:00.000Z"
  }
}
```

**Mongoose schema hint**
```js
const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
}, { timestamps: true });
```

---

## 2. Book Library Module

| Method | Endpoint | Description |
|---|---|---|
| GET | `/books` | List all books (supports filter/sort/search query params) |
| POST | `/books` | Add a new book |
| GET | `/books/:bookId` | Get single book detail |
| PUT | `/books/:bookId` | Update book |
| DELETE | `/books/:bookId` | Delete book (cascades notes/quotes/characters) |

**Query params for GET /books**: `?status=reading&genre=Fiction&sort=-createdAt&search=alchemist`

### POST /books
**Request**
```json
{
  "title": "The Alchemist",
  "author": "Paulo Coelho",
  "genre": "Fiction",
  "coverImage": "https://covers.example.com/alchemist.jpg",
  "totalPages": 197,
  "status": "reading"
}
```
**Response `201`**
```json
{
  "success": true,
  "book": {
    "_id": "64f1a002a1b2c3d4e5f60002",
    "user": "64f1a001a1b2c3d4e5f60001",
    "title": "The Alchemist",
    "author": "Paulo Coelho",
    "genre": "Fiction",
    "coverImage": "https://covers.example.com/alchemist.jpg",
    "totalPages": 197,
    "currentPage": 0,
    "status": "reading",
    "createdAt": "2026-08-01T10:05:00.000Z"
  }
}
```

### GET /books
**Response `200`**
```json
{
  "success": true,
  "count": 2,
  "books": [
    {
      "_id": "64f1a002a1b2c3d4e5f60002",
      "title": "The Alchemist",
      "author": "Paulo Coelho",
      "genre": "Fiction",
      "status": "reading",
      "totalPages": 197,
      "currentPage": 84,
      "completionPercent": 43
    },
    {
      "_id": "64f1a002a1b2c3d4e5f60003",
      "title": "Norwegian Wood",
      "author": "Haruki Murakami",
      "genre": "Fiction",
      "status": "to-read",
      "totalPages": 296,
      "currentPage": 0,
      "completionPercent": 0
    }
  ]
}
```

### GET /books/:bookId
**Response `200`**
```json
{
  "success": true,
  "book": {
    "_id": "64f1a002a1b2c3d4e5f60002",
    "title": "The Alchemist",
    "author": "Paulo Coelho",
    "genre": "Fiction",
    "coverImage": "https://covers.example.com/alchemist.jpg",
    "totalPages": 197,
    "currentPage": 84,
    "status": "reading",
    "notesCount": 5,
    "quotesCount": 8,
    "charactersCount": 3
  }
}
```

### PUT /books/:bookId
**Request**
```json
{ "status": "completed", "currentPage": 197 }
```
**Response `200`**
```json
{
  "success": true,
  "book": {
    "_id": "64f1a002a1b2c3d4e5f60002",
    "status": "completed",
    "currentPage": 197,
    "updatedAt": "2026-08-15T09:00:00.000Z"
  }
}
```

### DELETE /books/:bookId
**Response `200`**
```json
{ "success": true, "message": "Book and all related notes, quotes, and characters deleted." }
```

**Mongoose schema hint**
```js
const bookSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  author: String,
  genre: String,
  coverImage: String,
  totalPages: Number,
  currentPage: { type: Number, default: 0 },
  status: { type: String, enum: ["to-read", "reading", "completed"], default: "to-read" },
}, { timestamps: true });
```

---

## 3. Notes Module (Reading Room)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/books/:bookId/notes` | List all notes for a book |
| POST | `/books/:bookId/notes` | Create note under a book |
| GET | `/notes/:noteId` | Get single note |
| PUT | `/notes/:noteId` | Update note |
| DELETE | `/notes/:noteId` | Delete note |

### POST /books/:bookId/notes
**Request**
```json
{
  "topic": "Personal Legend",
  "content": "The book keeps circling back to the idea that everyone has a 'Personal Legend' — a purpose only they can fulfill.",
  "tags": ["theme", "destiny"]
}
```
**Response `201`**
```json
{
  "success": true,
  "note": {
    "_id": "64f1a003a1b2c3d4e5f60010",
    "book": "64f1a002a1b2c3d4e5f60002",
    "user": "64f1a001a1b2c3d4e5f60001",
    "topic": "Personal Legend",
    "content": "The book keeps circling back to the idea that everyone has a 'Personal Legend' — a purpose only they can fulfill.",
    "tags": ["theme", "destiny"],
    "createdAt": "2026-08-02T11:00:00.000Z"
  }
}
```

### GET /books/:bookId/notes
**Response `200`**
```json
{
  "success": true,
  "count": 1,
  "notes": [
    {
      "_id": "64f1a003a1b2c3d4e5f60010",
      "topic": "Personal Legend",
      "content": "The book keeps circling back to the idea that everyone has a 'Personal Legend'...",
      "tags": ["theme", "destiny"],
      "createdAt": "2026-08-02T11:00:00.000Z"
    }
  ]
}
```

### PUT /notes/:noteId
**Request**
```json
{ "content": "Updated reflection: the Personal Legend ties directly to the Soul of the World concept in ch. 4." }
```
**Response `200`**
```json
{
  "success": true,
  "note": {
    "_id": "64f1a003a1b2c3d4e5f60010",
    "content": "Updated reflection: the Personal Legend ties directly to the Soul of the World concept in ch. 4.",
    "updatedAt": "2026-08-03T09:00:00.000Z"
  }
}
```

### DELETE /notes/:noteId
**Response `200`**
```json
{ "success": true, "message": "Note deleted." }
```

**Mongoose schema hint**
```js
const noteSchema = new Schema({
  book: { type: Schema.Types.ObjectId, ref: "Book", required: true },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  topic: { type: String, required: true },
  content: { type: String, required: true },
  tags: [{ type: Schema.Types.ObjectId, ref: "Tag" }],
}, { timestamps: true });
```

---

## 4. Quotes Module

| Method | Endpoint | Description |
|---|---|---|
| GET | `/books/:bookId/quotes` | List quotes for a book |
| POST | `/books/:bookId/quotes` | Save a quote |
| GET | `/quotes/:quoteId` | Get single quote |
| PUT | `/quotes/:quoteId` | Update quote |
| DELETE | `/quotes/:quoteId` | Delete quote |

### POST /books/:bookId/quotes
**Request**
```json
{
  "text": "And, when you want something, all the universe conspires in helping you to achieve it.",
  "page": 24,
  "chapter": "Part One",
  "reaction": "This line reframed how I think about 'luck' — it's less mystical and more about staying alert to opportunity."
}
```
**Response `201`**
```json
{
  "success": true,
  "quote": {
    "_id": "64f1a004a1b2c3d4e5f60020",
    "book": "64f1a002a1b2c3d4e5f60002",
    "text": "And, when you want something, all the universe conspires in helping you to achieve it.",
    "page": 24,
    "chapter": "Part One",
    "reaction": "This line reframed how I think about 'luck'...",
    "createdAt": "2026-08-02T11:20:00.000Z"
  }
}
```

### GET /books/:bookId/quotes
**Response `200`**
```json
{
  "success": true,
  "count": 1,
  "quotes": [
    {
      "_id": "64f1a004a1b2c3d4e5f60020",
      "text": "And, when you want something, all the universe conspires in helping you to achieve it.",
      "page": 24,
      "chapter": "Part One"
    }
  ]
}
```

**Mongoose schema hint**
```js
const quoteSchema = new Schema({
  book: { type: Schema.Types.ObjectId, ref: "Book", required: true },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true },
  page: Number,
  chapter: String,
  reaction: String,
  tags: [{ type: Schema.Types.ObjectId, ref: "Tag" }],
}, { timestamps: true });
```

---

## 5. Characters Module

| Method | Endpoint | Description |
|---|---|---|
| GET | `/books/:bookId/characters` | List character profiles for a book |
| POST | `/books/:bookId/characters` | Add a character |
| GET | `/characters/:characterId` | Get single character |
| PUT | `/characters/:characterId` | Update character |
| DELETE | `/characters/:characterId` | Delete character |

### POST /books/:bookId/characters
**Request**
```json
{
  "name": "Santiago",
  "role": "Protagonist",
  "traits": ["curious", "persistent", "idealistic"],
  "relationships": [
    { "character": "The Alchemist", "description": "Mentor who guides him toward his Personal Legend" }
  ]
}
```
**Response `201`**
```json
{
  "success": true,
  "character": {
    "_id": "64f1a005a1b2c3d4e5f60030",
    "book": "64f1a002a1b2c3d4e5f60002",
    "name": "Santiago",
    "role": "Protagonist",
    "traits": ["curious", "persistent", "idealistic"],
    "relationships": [
      { "character": "The Alchemist", "description": "Mentor who guides him toward his Personal Legend" }
    ],
    "createdAt": "2026-08-02T11:30:00.000Z"
  }
}
```

### GET /books/:bookId/characters
**Response `200`**
```json
{
  "success": true,
  "count": 1,
  "characters": [
    {
      "_id": "64f1a005a1b2c3d4e5f60030",
      "name": "Santiago",
      "role": "Protagonist",
      "traits": ["curious", "persistent", "idealistic"]
    }
  ]
}
```

**Mongoose schema hint**
```js
const characterSchema = new Schema({
  book: { type: Schema.Types.ObjectId, ref: "Book", required: true },
  name: { type: String, required: true },
  role: String,
  traits: [String],
  relationships: [{
    character: String,
    description: String
  }],
}, { timestamps: true });
```

---

## 6. Tag System Module

| Method | Endpoint | Description |
|---|---|---|
| GET | `/tags` | Global tag list across entire library, with usage counts |
| POST | `/tags` | Create a custom tag |
| GET | `/tags/:tagId/items` | All notes/quotes across library using this tag |
| DELETE | `/tags/:tagId` | Delete a tag (removes it from all items) |

### POST /tags
**Request**
```json
{ "name": "theme", "color": "#8B5CF6" }
```
**Response `201`**
```json
{
  "success": true,
  "tag": {
    "_id": "64f1a006a1b2c3d4e5f60040",
    "user": "64f1a001a1b2c3d4e5f60001",
    "name": "theme",
    "color": "#8B5CF6"
  }
}
```

### GET /tags
**Response `200`**
```json
{
  "success": true,
  "tags": [
    { "_id": "64f1a006a1b2c3d4e5f60040", "name": "theme", "color": "#8B5CF6", "usageCount": 6 },
    { "_id": "64f1a006a1b2c3d4e5f60041", "name": "destiny", "color": "#F59E0B", "usageCount": 3 },
    { "_id": "64f1a006a1b2c3d4e5f60042", "name": "symbolism", "color": "#10B981", "usageCount": 2 }
  ]
}
```

### GET /tags/:tagId/items
**Response `200`**
```json
{
  "success": true,
  "tag": "theme",
  "results": {
    "notes": [
      { "_id": "64f1a003a1b2c3d4e5f60010", "topic": "Personal Legend", "book": "The Alchemist" }
    ],
    "quotes": [
      { "_id": "64f1a004a1b2c3d4e5f60020", "text": "And, when you want something...", "book": "The Alchemist" }
    ]
  }
}
```

**Mongoose schema hint**
```js
const tagSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  color: { type: String, default: "#6B7280" },
}, { timestamps: true });
```

---

## 7. Cross-book Links Module

| Method | Endpoint | Description |
|---|---|---|
| POST | `/links` | Connect two items (notes/quotes) possibly across different books |
| GET | `/links?itemId=xxx` | Get all links for a given note/quote |
| DELETE | `/links/:linkId` | Remove a link |

### POST /links
**Request**
```json
{
  "sourceType": "note",
  "sourceId": "64f1a003a1b2c3d4e5f60010",
  "targetType": "note",
  "targetId": "64f1a003a1b2c3d4e5f60099",
  "note": "Both books explore searching for meaning through a personal journey."
}
```
**Response `201`**
```json
{
  "success": true,
  "link": {
    "_id": "64f1a007a1b2c3d4e5f60050",
    "user": "64f1a001a1b2c3d4e5f60001",
    "source": { "type": "note", "id": "64f1a003a1b2c3d4e5f60010", "book": "The Alchemist" },
    "target": { "type": "note", "id": "64f1a003a1b2c3d4e5f60099", "book": "Norwegian Wood" },
    "note": "Both books explore searching for meaning through a personal journey.",
    "createdAt": "2026-08-05T12:00:00.000Z"
  }
}
```

### GET /links?itemId=64f1a003a1b2c3d4e5f60010
**Response `200`**
```json
{
  "success": true,
  "count": 1,
  "links": [
    {
      "_id": "64f1a007a1b2c3d4e5f60050",
      "target": { "type": "note", "id": "64f1a003a1b2c3d4e5f60099", "book": "Norwegian Wood", "topic": "Loss and memory" },
      "note": "Both books explore searching for meaning through a personal journey."
    }
  ]
}
```

**Mongoose schema hint**
```js
const linkSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  sourceType: { type: String, enum: ["note", "quote"], required: true },
  sourceId: { type: Schema.Types.ObjectId, required: true },
  targetType: { type: String, enum: ["note", "quote"], required: true },
  targetId: { type: Schema.Types.ObjectId, required: true },
  note: String,
}, { timestamps: true });
```

---

## 8. Progress Tracker Module

| Method | Endpoint | Description |
|---|---|---|
| PUT | `/books/:bookId/progress` | Log current page |
| GET | `/books/:bookId/progress` | Get progress stats (completion %, estimated finish date) |

### PUT /books/:bookId/progress
**Request**
```json
{ "currentPage": 84 }
```
**Response `200`**
```json
{
  "success": true,
  "progress": {
    "book": "64f1a002a1b2c3d4e5f60002",
    "currentPage": 84,
    "totalPages": 197,
    "completionPercent": 43,
    "updatedAt": "2026-08-10T08:00:00.000Z"
  }
}
```

### GET /books/:bookId/progress
**Response `200`**
```json
{
  "success": true,
  "progress": {
    "currentPage": 84,
    "totalPages": 197,
    "completionPercent": 43,
    "avgPagesPerDay": 12,
    "estimatedFinishDate": "2026-08-19T00:00:00.000Z"
  }
}
```

> `estimatedFinishDate` logic: track a rolling log of `{ page, date }` snapshots server-side, compute average pages/day over the last N updates, then project remaining pages forward.

**Mongoose schema hint** (progress can live on the Book doc, or as its own log collection if you want history)
```js
const progressLogSchema = new Schema({
  book: { type: Schema.Types.ObjectId, ref: "Book", required: true },
  page: Number,
  loggedAt: { type: Date, default: Date.now },
});
```

---

## 9. Text Search Module

| Method | Endpoint | Description |
|---|---|---|
| GET | `/search?q=keyword` | Search notes, quotes, characters across entire library |
| GET | `/search?q=keyword&bookId=xxx` | Search within a single book |

### GET /search?q=universe
**Response `200`**
```json
{
  "success": true,
  "query": "universe",
  "results": {
    "notes": [],
    "quotes": [
      {
        "_id": "64f1a004a1b2c3d4e5f60020",
        "text": "And, when you want something, all the universe conspires in helping you to achieve it.",
        "book": { "_id": "64f1a002a1b2c3d4e5f60002", "title": "The Alchemist" }
      }
    ],
    "characters": []
  }
}
```

**Implementation hint**: add a text index in Mongoose for fast search —
```js
noteSchema.index({ topic: "text", content: "text" });
quoteSchema.index({ text: "text", reaction: "text" });
characterSchema.index({ name: "text", traits: "text" });
```
Then query with `Model.find({ $text: { $search: q } })`, optionally filtered by `book: bookId`.

---

## Suggested Project Folder Structure

```
folio-backend/
├── models/
│   ├── User.js
│   ├── Book.js
│   ├── Note.js
│   ├── Quote.js
│   ├── Character.js
│   ├── Tag.js
│   └── Link.js
├── controllers/
│   ├── authController.js
│   ├── bookController.js
│   ├── noteController.js
│   ├── quoteController.js
│   ├── characterController.js
│   ├── tagController.js
│   ├── linkController.js
│   └── searchController.js
├── routes/
│   ├── authRoutes.js
│   ├── bookRoutes.js
│   ├── noteRoutes.js
│   ├── quoteRoutes.js
│   ├── characterRoutes.js
│   ├── tagRoutes.js
│   ├── linkRoutes.js
│   └── searchRoutes.js
├── middleware/
│   ├── auth.js
│   └── errorHandler.js
├── config/
│   └── db.js
├── app.js
└── server.js
```

All error responses should follow one consistent shape, e.g.:
```json
{ "success": false, "message": "Book not found" }
```
