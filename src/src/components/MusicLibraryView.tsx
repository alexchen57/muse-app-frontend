interface MusicLibraryViewProps {}

export function MusicLibraryView({}: MusicLibraryViewProps) {
  return (
    <div style={{
      background: 'rgba(30, 41, 59, 0.5)',
      borderRadius: '16px',
      padding: '32px',
      border: '1px solid rgba(71, 85, 105, 0.5)',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎵</div>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Music Library</h2>
      <p style={{ color: '#94a3b8', marginBottom: '24px' }}>Upload your music files, the system will automatically detect BPM</p>
      <div style={{
        border: '2px dashed #475569',
        borderRadius: '12px',
        padding: '48px',
        cursor: 'pointer',
        transition: 'border-color 0.2s'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📁</div>
        <p style={{ color: '#cbd5e1' }}>Click or drag files to upload</p>
        <p style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>Supports MP3, WAV, OGG formats</p>
      </div>
    </div>
  );
}
