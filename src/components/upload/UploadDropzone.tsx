import { useState, useRef, useCallback } from 'react';

interface UploadDropzoneProps {
  onFile: (file: File) => void;
}

const ACCEPTED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
];

const ACCEPTED_EXT = '.pdf, .docx, .txt';

export function UploadDropzone({ onFile }: UploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function validateFile(file: File): string | null {
    if (!ACCEPTED_TYPES.includes(file.type) && !file.name.match(/\.(pdf|docx|txt)$/i)) {
      return 'Only PDF, DOCX, and TXT files are supported.';
    }
    if (file.size > 20 * 1024 * 1024) {
      return 'File must be smaller than 20 MB.';
    }
    return null;
  }

  const handleFile = useCallback((file: File) => {
    const err = validateFile(file);
    if (err) { setError(err); return; }
    setError(null);
    onFile(file);
  }, [onFile]);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  return (
    <div
      className={`dropzone ${isDragging ? 'dropzone--active' : ''}`}
      onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click(); }}
      aria-label="Upload file"
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_EXT}
        onChange={handleInputChange}
        style={{ display: 'none' }}
      />
      <div className="dropzone__icon">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12 13v5m0-5-2 2m2-2 2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <p className="dropzone__title">
        {isDragging ? 'Drop file here' : 'Drag & drop a file, or click to browse'}
      </p>
      <p className="dropzone__hint">Supports PDF, DOCX, and TXT — up to 20 MB</p>
      {error && <p className="dropzone__error">{error}</p>}
    </div>
  );
}
