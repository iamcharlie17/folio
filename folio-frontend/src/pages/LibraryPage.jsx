import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import BookCard from "../components/BookCard";
import { getBooks, createBook, deleteBook, getTags, createTag, deleteTag, getTagItems, searchLibrary } from "../api";

function LibraryPage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [genre, setGenre] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [totalPages, setTotalPages] = useState("");
  const [status, setStatus] = useState("to-read");
  const [submitting, setSubmitting] = useState(false);
  const [filters, setFilters] = useState({ status: "", genre: "", sort: "-createdAt" });
  const [librarySearch, setLibrarySearch] = useState("");
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState("");
  const [tagResults, setTagResults] = useState(null);
  const [searchResults, setSearchResults] = useState(null);

  useEffect(() => {
    loadBooks(filters);
    loadTags();
  }, [filters]);

  async function loadBooks() {
    try {
      setLoading(true);
      const data = await getBooks();
      setBooks(data.books);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadTags() {
    try { const data = await getTags(); setTags(data.tags); } catch (err) { setError(err.message); }
  }

  async function handleLibrarySearch(event) {
    event.preventDefault();
    if (!librarySearch.trim()) return setSearchResults(null);
    try { const data = await searchLibrary(librarySearch); setSearchResults(data.results); }
    catch (err) { setError(err.message); }
  }

  async function handleDeleteBook(bookId) {
    if (!window.confirm("Delete this book and its reading-room items?")) return;
    try { await deleteBook(bookId); loadBooks(filters); } catch (err) { setError(err.message); }
  }

  async function handleCreateTag(event) {
    event.preventDefault();
    if (!newTag.trim()) return;
    try { await createTag({ name: newTag.trim() }); setNewTag(""); loadTags(); } catch (err) { setError(err.message); }
  }

  async function handleTagClick(tag) {
    try { const data = await getTagItems(tag._id); setTagResults({ ...data, name: tag.name }); } catch (err) { setError(err.message); }
  }

  async function handleAddBook(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await createBook({
        title,
        author,
        genre,
        coverImage,
        totalPages: totalPages ? Number(totalPages) : undefined,
        status,
      });

      // Reset the form and refresh the list.
      setTitle("");
      setAuthor("");
      setGenre("");
      setCoverImage("");
      setTotalPages("");
      setStatus("to-read");
      setShowForm(false);
      loadBooks();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <Navbar />

      <div className="container section">
        <div
          className="section-header"
          style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}
        >
          <div>
            <div className="eyebrow">
              <span className="gradient-bar"></span>
              01 — LIBRARY
            </div>
            <h1 className="page-title">
              Your <span className="italic">books.</span>
            </h1>
          </div>

          <button className="btn btn-solid" onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : "+ Add book"}
          </button>
        </div>

        {error && <div className="error-box">{error}</div>}

        {showForm && (
          <div className="card" style={{ marginBottom: 32 }}>
            <form onSubmit={handleAddBook}>
              <div className="form-row">
                <div className="field">
                  <label htmlFor="title">Title</label>
                  <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="field">
                  <label htmlFor="author">Author</label>
                  <input
                    id="author"
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="field">
                  <label htmlFor="genre">Genre</label>
                  <input
                    id="genre"
                    type="text"
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label htmlFor="totalPages">Total pages</label>
                  <input
                    id="totalPages"
                    type="number"
                    min="1"
                    value={totalPages}
                    onChange={(e) => setTotalPages(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="field">
                  <label htmlFor="coverImage">Cover image URL</label>
                  <input
                    id="coverImage"
                    type="text"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label htmlFor="status">Status</label>
                  <select
                    id="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="to-read">To read</option>
                    <option value="reading">Reading</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="btn btn-solid" disabled={submitting}>
                {submitting ? "Adding..." : "Add book"}
              </button>
            </form>
          </div>
        )}

        {loading && <div className="loading-state">Loading your library...</div>}

        {!loading && books.length === 0 && (
          <div className="empty-state">No books yet. Add your first one above.</div>
        )}

        {!loading && books.length > 0 && (
          <div className="book-grid">
            {books.map((book) => (
              <div key={book._id} className="book-item">
                <BookCard book={book} />
                <button className="delete-link book-delete" onClick={() => handleDeleteBook(book._id)}>Delete book</button>
              </div>
            ))}
          </div>
        )}

        <div className="library-tools">
          <form className="filter-row" onSubmit={handleLibrarySearch}>
            <input aria-label="Search notes and quotes" placeholder="Search notes, quotes, characters" value={librarySearch} onChange={(e) => setLibrarySearch(e.target.value)} />
            <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
              <option value="">All statuses</option><option value="to-read">To read</option><option value="reading">Reading</option><option value="completed">Completed</option>
            </select>
            <input aria-label="Filter by genre" placeholder="Genre" value={filters.genre} onChange={(e) => setFilters({ ...filters, genre: e.target.value })} />
            <select value={filters.sort} onChange={(e) => setFilters({ ...filters, sort: e.target.value })}>
              <option value="-createdAt">Newest</option><option value="title">Title A-Z</option><option value="-title">Title Z-A</option>
            </select>
            <button className="btn btn-outline" type="submit">Search text</button>
          </form>
          <div className="tag-manager">
            <div><h2>Global tags</h2><p className="item-meta">Tags across your notes and quotes.</p></div>
            <form onSubmit={handleCreateTag}><input aria-label="New tag" placeholder="New tag" value={newTag} onChange={(e) => setNewTag(e.target.value)} /><button className="btn btn-solid" type="submit">Add tag</button></form>
            <div className="trait-list">{tags.map((tag) => <button className="tag-pill" key={tag._id} onClick={() => handleTagClick(tag)}>{tag.name} ({tag.usageCount})</button>)}</div>
          </div>
          {tagResults && <div className="card"><div className="item-header"><h2>Tag: {tagResults.name}</h2><button className="delete-link" onClick={() => setTagResults(null)}>Close</button></div>{tagResults.results.notes.map((note) => <p key={note._id}>Note: {note.topic} <span className="item-meta">({note.book})</span></p>)}{tagResults.results.quotes.map((quote) => <p key={quote._id}>Quote: {quote.text} <span className="item-meta">({quote.book})</span></p>)}</div>}
          {searchResults && <div className="card search-results"><div className="item-header"><h2>Search results</h2><button className="delete-link" onClick={() => setSearchResults(null)}>Close</button></div>{searchResults.notes.map((note) => <p key={note._id}><strong>Note:</strong> {note.topic} <span className="item-meta">({note.book?.title})</span></p>)}{searchResults.quotes.map((quote) => <p key={quote._id}><strong>Quote:</strong> {quote.text} <span className="item-meta">({quote.book?.title})</span></p>)}{searchResults.characters.map((character) => <p key={character._id}><strong>Character:</strong> {character.name} <span className="item-meta">({character.book?.title})</span></p>)}</div>}
        </div>
      </div>
    </div>
  );
}

export default LibraryPage;
