import { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { UploadCloud } from 'lucide-react';

const allowedFormats = '.mp4,.mov,.png,.jpg,.jpeg,.pdf,.pptx,.docx';

export const AssetUploader = ({ onUpload }) => {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileSelect = async (fileList) => {
    const file = fileList?.[0];

    if (!file) {
      return;
    }

    setProgress(12);
    const interval = window.setInterval(() => {
      setProgress((current) => (current < 88 ? current + 8 : current));
    }, 120);

    try {
      await onUpload(file);
      setProgress(100);
    } finally {
      window.clearInterval(interval);
      window.setTimeout(() => setProgress(0), 600);
    }
  };

  return (
    <div className="panel animate-fade-in p-5">
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          handleFileSelect(event.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-card border border-dashed px-6 py-10 text-center transition ${dragging ? 'border-brand bg-brand/10' : 'border-border bg-panelAlt hover:border-brand/40 hover:bg-brand/5'}`}
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-card bg-surface text-brand">
          <UploadCloud className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-[16px] font-semibold text-copy">Drag files here or click to browse</h3>
        <p className="mt-2 text-copyMuted">
          Upload MP4, MOV, PNG, JPG, PDF, PPTX, and DOCX files into the shared media library.
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={allowedFormats}
          className="hidden"
          onChange={(event) => handleFileSelect(event.target.files)}
        />
      </div>
      {progress > 0 ? (
        <div className="mt-4">
          <div className="h-2 w-full rounded-full bg-panelAlt">
            <div className="h-full rounded-full bg-brand transition-all duration-150" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-2 text-[12px] text-copyMuted">Uploading asset... {progress}%</p>
        </div>
      ) : null}
    </div>
  );
};

AssetUploader.propTypes = {
  onUpload: PropTypes.func.isRequired
};

