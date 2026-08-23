import { Link } from "react-router-dom";

// Shows one book as a card in the library grid.
function BookCard({ book }) {
  const statusClass = "status-" + book.status;

  return (
    <Link to={"/books/" + book._id} className="book-card">
      {book.coverImage ? (
        <img className="book-cover" src={book.coverImage} alt={book.title} />
      ) : (
        <div className="book-cover"></div>
      )}

      <div className="book-title">{book.title}</div>
      <div className="book-author">{book.author}</div>

      <span className={"status-pill " + statusClass}>{book.status}</span>
    </Link>
  );
}

export default BookCard;
