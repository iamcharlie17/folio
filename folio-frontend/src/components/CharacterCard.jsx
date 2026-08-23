// Shows one character profile card.
function CharacterCard({ character, onDelete }) {
  return (
    <div className="card">
      <div className="item-header">
        <div>
          <h3 style={{ fontSize: "1.2rem" }}>{character.name}</h3>
          {character.role && <div className="item-meta">{character.role}</div>}
        </div>
        <button className="delete-link" onClick={() => onDelete(character._id)}>
          Delete
        </button>
      </div>

      {character.traits && character.traits.length > 0 && (
        <div className="trait-list">
          {character.traits.map((trait, index) => (
            <span key={index} className="tag-pill">
              <span className="tag-dot dot-purple"></span>
              {trait}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default CharacterCard;
