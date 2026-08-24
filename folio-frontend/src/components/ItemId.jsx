import { useState } from "react";

function ItemId({ id }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard
      .writeText(id)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      })
      .catch(() => {});
  }

  return (
    <span className="item-id">
      <code>{id}</code>
      <button
        type="button"
        className={"copy-btn" + (copied ? " copied" : "")}
        onClick={handleCopy}
      >
        {copied ? "Copied!" : "Copy"}
      </button>
    </span>
  );
}

export default ItemId;
