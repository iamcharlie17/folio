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
  updateQuote,
  getNotes,
  createNote,
  deleteNote,
  updateNote,
  getCharacters,
  createCharacter,
  deleteCharacter,
  updateCharacter,
  updateProgress,
  getProgress,
  createLink,
  getLinks,
  deleteLink,
} from "../api";

function BookPage() {
  const { bookId } = useParams();

  const [book, setBook] = useState(null);
  const [activeTab, setActiveTab] = useState("notes");
  const [error, setError] = useState("");

  const [quotes, setQuotes] = useState([]);
  const [notes, setNotes] = useState([]);
  const [characters, setCharacters] = useState([]);
  const [progress, setProgress] = useState(null);
  const [currentPage, setCurrentPage] = useState("");
  const [links, setLinks] = useState([]);
  const [linkSourceType, setLinkSourceType] = useState("note");
  const [linkSourceId, setLinkSourceId] = useState("");
  const [linkTargetType, setLinkTargetType] = useState("quote");
  const [linkTargetId, setLinkTargetId] = useState("");
  const [linkNote, setLinkNote] = useState("");

  // Quote form fields
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [quoteText, setQuoteText] = useState("");
  const [quotePage, setQuotePage] = useState("");
  const [quoteChapter, setQuoteChapter] = useState("");
  const [quoteReaction, setQuoteReaction] = useState("");
  const [editingQuote, setEditingQuote] = useState(null);

  // Note form fields
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [noteTopic, setNoteTopic] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [editingNote, setEditingNote] = useState(null);

  // Character form fields
  const [showCharacterForm, setShowCharacterForm] = useState(false);
  const [charName, setCharName] = useState("");
  const [charRole, setCharRole] = useState("");
  const [charTraits, setCharTraits] = useState("");
  const [charRelationships, setCharRelationships] = useState("");
  const [editingCharacter, setEditingCharacter] = useState(null);

  useEffect(() => {
    loadBook();
    loadQuotes();
    loadNotes();
    loadCharacters();
    loadProgress();
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

  async function loadNotes() {
    try {
      const data = await getNotes(bookId);
      setNotes(data.notes);
    } catch (err) {
      setError(err.message);
    }
  }

  async function loadProgress() {
    try {
      const data = await getProgress(bookId);
      setProgress(data.progress);
      setCurrentPage(data.progress.currentPage || "");
    } catch (err) {
      setError(err.message);
    }
  }

  async function loadLinks() {
    if (!linkSourceId) return setLinks([]);
    try { const data = await getLinks(linkSourceId); setLinks(data.links); } catch (err) { setError(err.message); }
  }

  async function handleCreateLink(event) {
    event.preventDefault();
    try {
      await createLink({ sourceType: linkSourceType, sourceId: linkSourceId, targetType: linkTargetType, targetId: linkTargetId, note: linkNote });
      setLinkNote("");
      loadLinks();
    } catch (err) { setError(err.message); }
  }

  async function handleDeleteLink(linkId) {
    try { await deleteLink(linkId); loadLinks(); } catch (err) { setError(err.message); }
  }

  async function handleAddQuote(event) {
    event.preventDefault();
    try {
      const quoteData = {
        text: quoteText,
        page: quotePage ? Number(quotePage) : undefined,
        chapter: quoteChapter,
        reaction: quoteReaction,
      };
      if (editingQuote) await updateQuote(editingQuote._id, quoteData);
      else await createQuote(bookId, quoteData);
      setQuoteText("");
      setQuotePage("");
      setQuoteChapter("");
      setQuoteReaction("");
      setShowQuoteForm(false);
      setEditingQuote(null);
      loadQuotes();
    } catch (err) {
      setError(err.message);
    }
  }

  function startQuoteEdit(quote) {
    setEditingQuote(quote);
    setQuoteText(quote.text);
    setQuotePage(quote.page || "");
    setQuoteChapter(quote.chapter || "");
    setQuoteReaction(quote.reaction || "");
    setShowQuoteForm(true);
  }

  async function handleAddNote(event) {
    event.preventDefault();
    try {
      const noteData = { topic: noteTopic, content: noteContent };
      if (editingNote) await updateNote(editingNote._id, noteData);
      else await createNote(bookId, noteData);
      setNoteTopic("");
      setNoteContent("");
      setEditingNote(null);
      setShowNoteForm(false);
      loadNotes();
    } catch (err) {
      setError(err.message);
    }
  }

  function startNoteEdit(note) {
    setEditingNote(note);
    setNoteTopic(note.topic);
    setNoteContent(note.content);
    setShowNoteForm(true);
  }

  async function handleDeleteNote(noteId) {
    try {
      await deleteNote(noteId);
      loadNotes();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleProgress(event) {
    event.preventDefault();
    try {
      await updateProgress(bookId, Number(currentPage));
      await Promise.all([loadBook(), loadProgress()]);
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

      const relationshipArray = charRelationships
        .split(";")
        .map((relationship) => {
          const [character, description] = relationship.split(":");
          return { character: character.trim(), description: (description || "").trim() };
        })
        .filter((relationship) => relationship.character);
      const characterData = {
        name: charName,
        role: charRole,
        traits: traitsArray,
        relationships: relationshipArray,
      };
      if (editingCharacter) await updateCharacter(editingCharacter._id, characterData);
      else await createCharacter(bookId, characterData);
      setCharName("");
      setCharRole("");
      setCharTraits("");
      setCharRelationships("");
      setEditingCharacter(null);
      setShowCharacterForm(false);
      loadCharacters();
    } catch (err) {
      setError(err.message);
    }
  }

  function startCharacterEdit(character) {
    setEditingCharacter(character);
    setCharName(character.name);
    setCharRole(character.role || "");
    setCharTraits((character.traits || []).join(", "));
    setCharRelationships((character.relationships || [])
      .map((relationship) => relationship.character + ": " + relationship.description)
      .join("; "));
    setShowCharacterForm(true);
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
            className={"tab-btn " + (activeTab === "notes" ? "active" : "")}
            onClick={() => setActiveTab("notes")}
          >
            Notes ({notes.length})
          </button>
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

        <div className="progress-panel card">
          <div className="item-header">
            <div>
              <h2>Progress tracker</h2>
              <p className="item-meta">Log your latest page and keep your finish estimate current.</p>
            </div>
            {progress?.estimatedFinishDate && (
              <span className="status-pill status-reading">
                Finish {new Date(progress.estimatedFinishDate).toLocaleDateString()}
              </span>
            )}
          </div>
          <form onSubmit={handleProgress} className="progress-form">
            <div className="field">
              <label htmlFor="currentPage">Current page</label>
              <input id="currentPage" type="number" min="0" max={book.totalPages || undefined}
                value={currentPage} onChange={(e) => setCurrentPage(e.target.value)} required />
            </div>
            <button className="btn btn-solid" type="submit">Log progress</button>
          </form>
          {progress?.avgPagesPerDay && <p className="item-meta">Average: {progress.avgPagesPerDay} pages per day</p>}
        </div>

        <div className="card link-panel">
          <h2>Cross-book links</h2>
          <p className="item-meta">Connect a note or quote to another idea using its item ID.</p>
          <form onSubmit={handleCreateLink} className="link-form">
            <select value={linkSourceType} onChange={(e) => setLinkSourceType(e.target.value)}><option value="note">Source note</option><option value="quote">Source quote</option></select>
            <input placeholder="Source item ID" value={linkSourceId} onChange={(e) => setLinkSourceId(e.target.value)} required />
            <select value={linkTargetType} onChange={(e) => setLinkTargetType(e.target.value)}><option value="note">Target note</option><option value="quote">Target quote</option></select>
            <input placeholder="Target item ID" value={linkTargetId} onChange={(e) => setLinkTargetId(e.target.value)} required />
            <input placeholder="Why are they connected?" value={linkNote} onChange={(e) => setLinkNote(e.target.value)} />
            <button className="btn btn-solid" type="submit">Link ideas</button>
          </form>
          <button className="btn btn-outline" onClick={loadLinks} disabled={!linkSourceId}>Show source links</button>
          {links.map((link) => <div className="link-row" key={link._id}><span>{link.target.type}: {link.target.topic || link.target.text} {link.target.book ? "(" + link.target.book + ")" : ""}</span><button className="delete-link" onClick={() => handleDeleteLink(link._id)}>Remove</button></div>)}
        </div>

        {activeTab === "notes" && (
          <div>
            <button className="btn btn-outline" style={{ marginBottom: 20 }} onClick={() => setShowNoteForm(!showNoteForm)}>
              {showNoteForm ? "Cancel" : "+ Add note"}
            </button>
            {showNoteForm && <div className="card" style={{ marginBottom: 24 }}>
              <form onSubmit={handleAddNote}>
                <div className="field"><label htmlFor="noteTopic">Topic</label><input id="noteTopic" value={noteTopic} onChange={(e) => setNoteTopic(e.target.value)} required /></div>
                <div className="field"><label htmlFor="noteContent">Reflection</label><textarea id="noteContent" value={noteContent} onChange={(e) => setNoteContent(e.target.value)} required /></div>
                <button className="btn btn-solid" type="submit">{editingNote ? "Update note" : "Save note"}</button>
              </form>
            </div>}
            {notes.length === 0 && <div className="empty-state">No notes added yet.</div>}
            {notes.map((note) => <div className="card" key={note._id}>
              <div className="item-header"><div><h3>{note.topic}</h3><div className="item-meta">{new Date(note.createdAt).toLocaleDateString()}</div></div>
                <div className="item-actions"><button className="edit-link" onClick={() => startNoteEdit(note)}>Edit</button><button className="delete-link" onClick={() => handleDeleteNote(note._id)}>Delete</button></div></div>
              <p>{note.content}</p>
            </div>)}
          </div>
        )}

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
                    {editingQuote ? "Update quote" : "Save quote"}
                  </button>
                </form>
              </div>
            )}

            {quotes.length === 0 && <div className="empty-state">No quotes saved yet.</div>}

            {quotes.map((quote) => (
              <QuoteCard key={quote._id} quote={quote} onDelete={handleDeleteQuote} onEdit={startQuoteEdit} />
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

                  <div className="field">
                    <label htmlFor="charRelationships">Relationships</label>
                    <input id="charRelationships" type="text" placeholder="Santiago: friend; Melchizedek: mentor"
                      value={charRelationships} onChange={(e) => setCharRelationships(e.target.value)} />
                  </div>

                  <button type="submit" className="btn btn-solid">
                    {editingCharacter ? "Update character" : "Add character"}
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
                onEdit={startCharacterEdit}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default BookPage;
