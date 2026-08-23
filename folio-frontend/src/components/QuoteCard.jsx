// Shows one saved quote.
function QuoteCard({ quote, onDelete }) {
  return (
    <div className="card">
      <div className="item-header">
        <div className="item-meta">
          {quote.chapter ? quote.chapter + " · " : ""}
          {quote.page ? "page " + quote.page : ""}
        </div>
        <button className="delete-link" onClick={() => onDelete(quote._id)}>
          Delete
        </button>
      </div>

      <p className="quote-text">&ldquo;{quote.text}&rdquo;</p>

      {quote.reaction && <p style={{ color: "var(--ink-soft)" }}>{quote.reaction}</p>}
    </div>
  );
}

export default QuoteCard;
