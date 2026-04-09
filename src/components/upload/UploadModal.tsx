import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadDropzone } from './UploadDropzone';
import { useUpload } from '../../hooks/useUpload';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UploadModal({ isOpen, onClose }: UploadModalProps) {
  const { state, upload, reset } = useUpload();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen) reset();
  }, [isOpen, reset]);

  useEffect(() => {
    if (state.stage === 'done') {
      const timer = setTimeout(() => {
        onClose();
        navigate(`/articles/${state.slug}`);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [state, navigate, onClose]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && state.stage === 'idle') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [state.stage, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={state.stage === 'idle' ? onClose : undefined}>
      <div className="modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Upload document">
        <div className="modal__header">
          <h2 className="modal__title">Upload Document</h2>
          {state.stage === 'idle' && (
            <button className="modal__close" onClick={onClose} aria-label="Close">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="m18 6-12 12M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>

        <div className="modal__body">
          {state.stage === 'idle' && (
            <UploadDropzone onFile={upload} />
          )}

          {(state.stage === 'uploading' || state.stage === 'processing') && (
            <div className="upload-status">
              <div className="upload-status__spinner" aria-hidden="true" />
              <p className="upload-status__title">
                {state.stage === 'uploading' ? 'Uploading file...' : 'Generating wiki article...'}
              </p>
              <p className="upload-status__hint">
                {state.stage === 'uploading'
                  ? 'Your file is being transferred securely.'
                  : 'AI is reading and structuring your document. This may take a minute.'}
              </p>
            </div>
          )}

          {state.stage === 'done' && (
            <div className="upload-status upload-status--success">
              <div className="upload-status__check" aria-hidden="true">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" fill="var(--color-success-500)" />
                  <path d="m8 12 3 3 5-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="upload-status__title">Article created!</p>
              <p className="upload-status__hint">Redirecting you now...</p>
            </div>
          )}

          {state.stage === 'error' && (
            <div className="upload-status upload-status--error">
              <div className="upload-status__icon" aria-hidden="true">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="var(--color-error-500)" strokeWidth="1.5" />
                  <path d="M12 8v5m0 3v.5" stroke="var(--color-error-500)" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <p className="upload-status__title">Something went wrong</p>
              <p className="upload-status__hint">{state.message}</p>
              <button className="btn btn--secondary" onClick={reset} style={{ marginTop: '1rem' }}>
                Try again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
