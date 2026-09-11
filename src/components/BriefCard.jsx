import OutputCard from './OutputCard.jsx';

export default function BriefCard({ brief, briefText, onToast }) {
  // Accept either the new structured object (brief) or the legacy string prop (briefText).
  // briefText kept for any call sites that haven't been updated yet.
  const resolved = brief ?? briefText;
  if (!resolved) return null;

  // Structured object from briefAgent; legacy history records pass a plain string.
  const text = (typeof resolved === 'object' && resolved !== null)
    ? resolved.text
    : resolved;

  return (
    <OutputCard
      index={7}
      title="Implementation Plan"
      agent="brief"
      copyable={text}
      onToast={onToast}
    >
      <div className="prompt-wrap">
        <textarea
          id="impl-plan"
          readOnly
          value={text}
          aria-label="Implementation plan text"
        />
      </div>
    </OutputCard>
  );
}
