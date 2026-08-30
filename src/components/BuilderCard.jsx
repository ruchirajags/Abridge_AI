import OutputCard from './OutputCard.jsx';
import { downloadZip } from '../utils/scaffold.js';

export default function BuilderCard({ builder, onToast }) {
  if (!builder) return null;

  const handleDownload = () => {
    downloadZip(builder.files, builder.folder + '.zip');
    onToast('Starter scaffold downloaded.');
  };

  return (
    <article className="card" data-agent="builder">
      <div className="card-head">
        <div className="card-title">
          <span className="card-index">06</span>
          <span>Builder Plan &amp; Starter Scaffold</span>
        </div>
        <div className="card-head-actions">
          <button type="button" className="card-copy" onClick={() => {
            navigator.clipboard?.writeText(builder.text).then(() => onToast('Copied to clipboard.')).catch(() => onToast('Could not copy.'));
          }}>
            Copy
          </button>
          <button type="button" className="card-download" onClick={handleDownload}>
            Download scaffold (.zip)
          </button>
        </div>
      </div>
      <div className="card-body">
        <pre>{builder.text}</pre>
      </div>
    </article>
  );
}
