import { useState, useRef } from 'react'
import API from '../api'

export default function ImageUpload({ onUpload, currentImage }) {
  const [preview, setPreview] = useState(currentImage || null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef(null)

  const handleFile = async (file) => {
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      setError('Only JPG, PNG, WebP and GIF allowed')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('File too large. Max 5MB')
      return
    }

    setError('')
    setUploading(true)

    const localPreview = URL.createObjectURL(file)
    setPreview(localPreview)

    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await API.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      onUpload(res.data.url)
      setUploading(false)
    } catch (err) {
      setError(err.response?.data?.detail || 'Upload failed')
      setPreview(null)
      setUploading(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleDragOver = (e) => e.preventDefault()

  return (
    <div style={styles.container}>
      {preview ? (
        <div style={styles.previewWrapper}>
          <img src={preview} alt="Preview" style={styles.preview} />
          <div style={styles.previewOverlay}>
            <button
              style={styles.changeBtn}
              onClick={() => fileRef.current.click()}
              type="button"
            >
              Change image
            </button>
            <button
              style={styles.removeBtn}
              onClick={() => { setPreview(null); onUpload('') }}
              type="button"
            >
              Remove
            </button>
          </div>
          {uploading && (
            <div style={styles.uploadingOverlay}>
              Uploading...
            </div>
          )}
        </div>
      ) : (
        <div
          style={styles.dropzone}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileRef.current.click()}
        >
          <div style={styles.dropIcon}>📸</div>
          <div style={styles.dropText}>
            {uploading ? 'Uploading...' : 'Click or drag image here'}
          </div>
          <div style={styles.dropSubtext}>JPG, PNG, WebP — max 5MB</div>
        </div>
      )}

      {error && <div style={styles.error}>{error}</div>}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={e => handleFile(e.target.files[0])}
      />
    </div>
  )
}

const styles = {
  container: { marginBottom: '16px' },
  dropzone: { border: '2px dashed #2a2a2a', borderRadius: '12px', padding: '40px 20px', textAlign: 'center', cursor: 'pointer', background: '#111', transition: 'border-color 0.2s' },
  dropIcon: { fontSize: '36px', marginBottom: '12px' },
  dropText: { color: '#888', fontSize: '14px', marginBottom: '6px' },
  dropSubtext: { color: '#444', fontSize: '12px' },
  previewWrapper: { position: 'relative', borderRadius: '12px', overflow: 'hidden', height: '200px' },
  preview: { width: '100%', height: '100%', objectFit: 'cover' },
  previewOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px', background: 'linear-gradient(transparent, rgba(0,0,0,0.8))', display: 'flex', gap: '8px', justifyContent: 'center' },
  changeBtn: { padding: '6px 14px', background: '#f59e0b', color: '#000', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' },
  removeBtn: { padding: '6px 14px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' },
  uploadingOverlay: { position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b', fontWeight: 'bold', fontSize: '16px' },
  error: { color: '#ef4444', fontSize: '12px', marginTop: '8px' }
}