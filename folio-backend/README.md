# Folio Backend

> Note-taking API for readers — SWE 4638 lab project

## Stack
Node.js · Express · MongoDB · Mongoose · JWT · bcryptjs

---

## Setup

### 1. Install dependencies
```bash
cd folio-backend
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env — set MONGO_URI and JWT_SECRET
```

| Variable    | Default                              | Description              |
|-------------|--------------------------------------|--------------------------|
| `PORT`      | `5000`                               | HTTP port                |
| `MONGO_URI` | `mongodb://localhost:27017/folio`    | MongoDB connection string |
| `JWT_SECRET`| *(set a strong secret)*             | JWT signing key           |
| `JWT_EXPIRE`| `30d`                                | Token lifetime            |

### 3. Seed demo data
```bash
npm run seed
# Creates demo user: ayesha@example.com / StrongPass123!
```

### 4. Start the dev server
```bash
npm run dev   # nodemon — auto-restarts on change
```

Server runs at: `http://localhost:5000/api/v1`

---

## API Endpoints

Base: `http://localhost:5000/api/v1`  
Auth header: `Authorization: Bearer <token>`

### Auth
| Method | Route           | Auth | Description           |
|--------|-----------------|------|-----------------------|
| POST   | `/auth/register`| ✗    | Register new user     |
| POST   | `/auth/login`   | ✗    | Login, receive JWT    |
| GET    | `/auth/me`      | ✓    | Get current user      |
| POST   | `/auth/logout`  | ✓    | Logout (client clears token) |

### Books
| Method | Route              | Auth | Description                     |
|--------|--------------------|------|---------------------------------|
| GET    | `/books`           | ✓    | List books (filter/sort/search) |
| POST   | `/books`           | ✓    | Add book                        |
| GET    | `/books/:bookId`   | ✓    | Get book detail + counts        |
| PUT    | `/books/:bookId`   | ✓    | Update book                     |
| DELETE | `/books/:bookId`   | ✓    | Delete book + cascade           |

**GET /books query params:** `?status=reading&genre=Fiction&sort=-createdAt&search=alchemist`

### Notes
| Method | Route                      | Auth | Description            |
|--------|----------------------------|------|------------------------|
| GET    | `/books/:bookId/notes`     | ✓    | List notes for a book  |
| POST   | `/books/:bookId/notes`     | ✓    | Create note            |
| GET    | `/notes/:noteId`           | ✓    | Get single note        |
| PUT    | `/notes/:noteId`           | ✓    | Update note            |
| DELETE | `/notes/:noteId`           | ✓    | Delete note            |

### Quotes
| Method | Route                      | Auth | Description            |
|--------|----------------------------|------|------------------------|
| GET    | `/books/:bookId/quotes`    | ✓    | List quotes for a book |
| POST   | `/books/:bookId/quotes`    | ✓    | Save a quote           |
| GET    | `/quotes/:quoteId`         | ✓    | Get single quote       |
| PUT    | `/quotes/:quoteId`         | ✓    | Update quote           |
| DELETE | `/quotes/:quoteId`         | ✓    | Delete quote           |

### Characters
| Method | Route                          | Auth | Description             |
|--------|--------------------------------|------|-------------------------|
| GET    | `/books/:bookId/characters`    | ✓    | List characters         |
| POST   | `/books/:bookId/characters`    | ✓    | Add character           |
| GET    | `/characters/:characterId`     | ✓    | Get single character    |
| PUT    | `/characters/:characterId`     | ✓    | Update character        |
| DELETE | `/characters/:characterId`     | ✓    | Delete character        |

### Tags
| Method | Route                  | Auth | Description                     |
|--------|------------------------|------|---------------------------------|
| GET    | `/tags`                | ✓    | Tag list with usage counts      |
| POST   | `/tags`                | ✓    | Create tag                      |
| GET    | `/tags/:tagId/items`   | ✓    | All notes/quotes with this tag  |
| DELETE | `/tags/:tagId`         | ✓    | Delete tag (removes from items) |

### Cross-book Links
| Method | Route                | Auth | Description               |
|--------|----------------------|------|---------------------------|
| POST   | `/links`             | ✓    | Create a link             |
| GET    | `/links?itemId=xxx`  | ✓    | Get links for an item     |
| DELETE | `/links/:linkId`     | ✓    | Remove a link             |

### Progress Tracker
| Method | Route                        | Auth | Description                       |
|--------|------------------------------|------|-----------------------------------|
| PUT    | `/books/:bookId/progress`    | ✓    | Log current page                  |
| GET    | `/books/:bookId/progress`    | ✓    | Get stats + estimated finish date |

### Text Search
| Method | Route                         | Auth | Description                       |
|--------|-------------------------------|------|-----------------------------------|
| GET    | `/search?q=keyword`           | ✓    | Search across entire library      |
| GET    | `/search?q=keyword&bookId=xx` | ✓    | Search within a single book       |

---

## Response Format

**Success**
```json
{ "success": true, ...data }
```

**Error**
```json
{ "success": false, "message": "Descriptive error message" }
```

---

## Error Codes
| Code | Meaning              |
|------|----------------------|
| 200  | OK                   |
| 201  | Created              |
| 400  | Bad request / validation error |
| 401  | Missing or invalid token |
| 403  | Forbidden — not your resource |
| 404  | Resource not found   |
| 500  | Server error         |
