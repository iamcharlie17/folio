import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import QuoteCard from "../components/QuoteCard";
import CharacterCard from "../components/CharacterCard";
import {
  getBook,
  getQuotes,
  createQuote,
  deleteQuote,
  getCharacters,
  createCharacter,
  deleteCharacter,
} from "../api";

function BookPage() {
  const { bookId } = useParams();

  const [book, setBook] = useState(null);
  const [activeTab, setActiveTab] = useState("quotes");
  const [error, setError] = useState("");

  const [quotes, setQuotes] = useState([]);
  const [characters, setCharacters] = useState([]);

  // Quote form fields
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [quoteText, setQuoteText] = useState("");
  const [quotePage, setQuotePage] = useState("");
  const [quoteChapter, setQuoteChapter] = useState("");
  const [quoteReaction, setQuoteReaction] = useState("");

  // Character form fields
  const [showCharacterForm, setShowCharacterForm] = useState(false);
  const [charName, setCharName] = useState("");
  const [charRole, setCharRole] = useState("");
  const [charTraits, setCharTraits] = useState("");

  useEffect(() => {
    loadBook();
    loadQuotes();
    loadCharacters();
  }, [bookId]);

  async function loadBook() {
    try {
      const data = await getBook(bookId);
      setBook(data.book);
    } catch (err) {
      setError(err.message);
    }
  }

  async function loadQuotes() {
    try {
      const data = await getQuotes(bookId);
      setQuotes(data.quotes);
    } catch (err) {
      setError(err.message);
    }
  }

  async function loadCharacters() {
    try {
      const data = await getCharacters(bookId);
      setCharacters(data.characters);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleAddQuote(event) {
    event.preventDefault();
    try {
      await createQuote(bookId, {
        text: quoteText,
        page: quotePage ? Number(quotePage) : undefined,
        chapter: quoteChapter,
        reaction: quoteReaction,
      });
      setQuoteText("");
      setQuotePage("");
      setQuoteChapter("");
      setQuoteReaction("");
      setShowQuoteForm(false);
      loadQuotes();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeleteQuote(quoteId) {
    try {
      await deleteQuote(quoteId);
      loadQuotes();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleAddCharacter(event) {
    event.preventDefault();
    try {
      // Turn "curious, persistent, idealistic" into ["curious", "persistent", "idealistic"]
      const traitsArray = charTraits
        .split(",")
        .map((trait) => trait.trim())
        .filter((trait) => trait.length > 0);

      await createCharacter(bookId, {
        name: charName,
        role: charRole,
        traits: traitsArray,
      });
      setCharName("");
      setCharRole("");
      setCharTraits("");
      setShowCharacterForm(false);
      loadCharacters();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeleteCharacter(characterId) {
    try {
      await deleteCharacter(characterId);
      loadCharacters();
    } catch (err) {
      setError(err.message);
    }
  }

  if (!book) {
    return (
      <div>
        <Navbar />
        <div className="container section">
          {error ? <div className="error-box">{error}</div> : <div className="loading-state">Loading...</div>}
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />

      <div className="container section">
        <Link to="/library" style={{ color: "var(--ink-soft)", fontSize: "0.9rem" }}>
          ← Back to library
        </Link>

        <div className="book-header" style={{ marginTop: 16 }}>
          {book.coverImage && (
            <img className="book-header-cover" src={book.coverImage} alt={book.title} />
          )}
          <div>
            <div className="eyebrow">
              <span className="gradient-bar"></span>
              READING ROOM
            </div>
            <h1 className="page-title">
              {book.title.split(" ").slice(0, -1).join(" ")}{" "}
              <span className="italic">{book.title.split(" ").slice(-1)}</span>
            </h1>
            <p className="book-meta">
              {book.author} {book.genre ? "· " + book.genre : ""}
            </p>
            <span className={"status-pill status-" + book.status}>{book.status}</span>

            {book.totalPages > 0 && (
              <>
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{ width: book.completionPercent + "%" }}
                  ></div>
                </div>
                <p style={{ fontSize: "0.85rem", color: "var(--ink-soft)", marginTop: 6 }}>
                  Page {book.currentPage} of {book.totalPages} ({book.completionPercent}%)
                </p>
              </>
            )}
          </div>
        </div>

        {error && <div className="error-box">{error}</div>}

        <div className="tabs">
          <button
            className={"tab-btn " + (activeTab === "quotes" ? "active" : "")}
            onClick={() => setActiveTab("quotes")}
          >
            Quotes ({quotes.length})
          </button>
          <button
            className={"tab-btn " + (activeTab === "characters" ? "active" : "")}
            onClick={() => setActiveTab("characters")}
          >
            Characters ({characters.length})
          </button>
        </div>

        {activeTab === "quotes" && (
          <div>
            <button
              className="btn btn-outline"
              style={{ marginBottom: 20 }}
              onClick={() => setShowQuoteForm(!showQuoteForm)}
            >
              {showQuoteForm ? "Cancel" : "+ Save a quote"}
            </button>

            {showQuoteForm && (
              <div className="card" style={{ marginBottom: 24 }}>
                <form onSubmit={handleAddQuote}>
                  <div className="field">
                    <label htmlFor="quoteText">Quote text</label>
                    <textarea
                      id="quoteText"
                      value={quoteText}
                      onChange={(e) => setQuoteText(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="field">
                      <label htmlFor="quotePage">Page</label>
                      <input
                        id="quotePage"
                        type="number"
                        min="1"
                        value={quotePage}
                        onChange={(e) => setQuotePage(e.target.value)}
                      />
                    </div>
                    <div className="field">
                      <label htmlFor="quoteChapter">Chapter</label>
                      <input
                        id="quoteChapter"
                        type="text"
                        value={quoteChapter}
                        onChange={(e) => setQuoteChapter(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="field">
                    <label htmlFor="quoteReaction">Your reaction</label>
                    <textarea
                      id="quoteReaction"
                      value={quoteReaction}
                      onChange={(e) => setQuoteReaction(e.target.value)}
                    />
                  </div>

                  <button type="submit" className="btn btn-solid">
                    Save quote
                  </button>
                </form>
              </div>
            )}

            {quotes.length === 0 && <div className="empty-state">No quotes saved yet.</div>}

            {quotes.map((quote) => (
              <QuoteCard key={quote._id} quote={quote} onDelete={handleDeleteQuote} />
            ))}
          </div>
        )}

        {activeTab === "characters" && (
          <div>
            <button
              className="btn btn-outline"
              style={{ marginBottom: 20 }}
              onClick={() => setShowCharacterForm(!showCharacterForm)}
            >
              {showCharacterForm ? "Cancel" : "+ Add character"}
            </button>

            {showCharacterForm && (
              <div className="card" style={{ marginBottom: 24 }}>
                <form onSubmit={handleAddCharacter}>
                  <div className="form-row">
                    <div className="field">
                      <label htmlFor="charName">Name</label>
                      <input
                        id="charName"
                        type="text"
                        value={charName}
                        onChange={(e) => setCharName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="field">
                      <label htmlFor="charRole">Role</label>
                      <input
                        id="charRole"
                        type="text"
                        placeholder="Protagonist, mentor..."
                        value={charRole}
                        onChange={(e) => setCharRole(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="field">
                    <label htmlFor="charTraits">Traits (comma separated)</label>
                    <input
                      id="charTraits"
                      type="text"
                      placeholder="curious, persistent, idealistic"
                      value={charTraits}
                      onChange={(e) => setCharTraits(e.target.value)}
                    />
                  </div>

                  <button type="submit" className="btn btn-solid">
                    Add character
                  </button>
                </form>
              </div>
            )}

            {characters.length === 0 && (
              <div className="empty-state">No characters added yet.</div>
            )}

            {characters.map((character) => (
              <CharacterCard
                key={character._id}
                character={character}
                onDelete={handleDeleteCharacter}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default BookPage;
