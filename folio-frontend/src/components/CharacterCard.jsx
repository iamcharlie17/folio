// Shows one character profile card.
function CharacterCard({ character, onDelete, onEdit }) {
  return (
    <div className="card">
      <div className="item-header">
        <div>
          <h3 style={{ fontSize: "1.2rem" }}>{character.name}</h3>
          {character.role && <div className="item-meta">{character.role}</div>}
        </div>
        <div className="item-actions">
          {onEdit && <button className="edit-link" onClick={() => onEdit(character)}>Edit</button>}
          <button className="delete-link" onClick={() => onDelete(character._id)}>Delete</button>
        </div>
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
      {character.relationships && character.relationships.length > 0 && (
        <div className="relationships">
          <strong>Relationships</strong>
          {character.relationships.map((relationship, index) => (
            <div key={index}>{relationship.character}: {relationship.description}</div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CharacterCard;
