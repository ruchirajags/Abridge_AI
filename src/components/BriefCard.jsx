import { useState } from 'react';

export default function BriefCard({ briefText, onToast }) {
  const [copied, setCopied] = useState(false);
  if (!briefText) return null;

  const handleCopy = () => {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(briefText)
        .then(() => { onToast('Implementation plan copied.'); setCopied(true); setTimeout(() => setCopied(false), 1400); })
        .catch(() => onToast('Could not copy.'));
    }
  };

  return (
    <article className="card" data-agent="brief">
      <div className="card-head">
        <div className="card-title">
          <span className="card-index">07</span>
          <span>Implementation Plan</span>
        </div>
        <div className="card-head-actions">
          <button
            type="button"
            className={`card-copy${copied ? ' is-copied' : ''}`}
            onClick={handleCopy}
            aria-label="Copy implementation plan"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>
      <div className="card-body">
        <div className="prompt-wrap">
          <textarea
            id="impl-plan"
            readOnly
            value={briefText}
            aria-label="Implementation plan text"
          />
          <button type="button" className="copy-btn" onClick={handleCopy}>
            Copy plan
          </button>
        </div>
      </div>
    </article>
  );
}
