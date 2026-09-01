// P2.2 — Raster Upload
// Stub: presigned URL endpoint not yet built on backend.
// When backend adds POST /presign, replace the stub with real upload.
import { useState } from 'react';

export default function RasterUpload({ onRasterKey }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [rasterKey, setRasterKey] = useState(null);

  const handleFileSelect = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;
    if (!selected.name.match(/\.tiff?$/i)) {
      setError('Only .tif/.tiff files accepted');
      return;
    }
    setFile(selected);
    setError(null);
    setRasterKey(null);
    onRasterKey(null);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    setProgress(0);

    // STUB: Simulate upload until backend presigned URL endpoint exists
    // Real implementation:
    // 1. POST /presign { filename, content_type } -> { upload_url, s3_key }
    // 2. PUT upload_url with file body
    // 3. Return s3_key to parent
    try {
      // Simulate progress
      for (let p = 0; p <= 100; p += 20) {
        await new Promise(r => setTimeout(r, 200));
        setProgress(p);
      }
      const stubKey = `rasters/${crypto.randomUUID()}.tif`;
      setRasterKey(stubKey);
      onRasterKey(stubKey);
      setProgress(100);
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="raster-upload">
      <h4>Flood Depth Raster</h4>
      <div className="raster-file-row">
        <label className="raster-file-btn">
          {file ? file.name : 'Choose .tif file'}
          <input type="file" accept=".tif,.tiff" onChange={handleFileSelect} hidden />
        </label>
        {file && !rasterKey && (
          <button className="btn-primary" onClick={handleUpload} disabled={uploading}>
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        )}
      </div>
      {uploading && (
        <div className="upload-progress">
          <div className="upload-bar">
            <div className="upload-fill" style={{ width: `${progress}%` }} />
          </div>
          <span>{progress}%</span>
        </div>
      )}
      {rasterKey && (
        <div className="raster-ready">
          <span className="verdict pass">READY</span>
          <code>{rasterKey}</code>
        </div>
      )}
      {error && <div className="bbox-error">{error}</div>}
      <div className="raster-stub-note">
        Upload is simulated. Backend presigned URL endpoint pending.
      </div>
    </div>
  );
}
