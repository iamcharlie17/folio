// Shows one saved quote.
import ItemId from "./ItemId";

function QuoteCard({ quote, onDelete, onEdit }) {
  return (
    <div className="card">
      <div className="item-header">
        <div>
          <div className="item-meta">
            {quote.chapter ? quote.chapter + " · " : ""}
            {quote.page ? "page " + quote.page : ""}
          </div>
          <ItemId id={quote._id} />
        </div>
        <div className="item-actions">
          {onEdit && <button className="edit-link" onClick={() => onEdit(quote)}>Edit</button>}
          <button className="delete-link" onClick={() => onDelete(quote._id)}>Delete</button>
        </div>
      </div>

      <p className="quote-text">&ldquo;{quote.text}&rdquo;</p>

      {quote.reaction && <p style={{ color: "var(--ink-soft)" }}>{quote.reaction}</p>}
    </div>
  );
}

export default QuoteCard;
