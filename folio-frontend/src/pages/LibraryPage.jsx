import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import BookCard from "../components/BookCard";
import { getBooks, createBook } from "../api";

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

  useEffect(() => {
    loadBooks();
  }, []);

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
              <BookCard key={book._id} book={book} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default LibraryPage;
