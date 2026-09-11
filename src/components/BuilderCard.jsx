import OutputCard from './OutputCard.jsx';
import { downloadZip } from '../utils/scaffold.js';

export default function BuilderCard({ builder, onToast }) {
  if (!builder) return null;

  const handleDownload = () => {
    downloadZip(builder.files, builder.folder + '.zip');
    onToast('Starter scaffold downloaded.');
  };

  return (
    <OutputCard
      index={6}
      title="Builder Plan &amp; Starter Scaffold"
      agent="builder"
      copyable={builder.text}
      body={builder.text}
      onToast={onToast}
    >
      <button type="button" className="card-download" onClick={handleDownload}>
        Download scaffold (.zip)
      </button>
    </OutputCard>
  );
}
