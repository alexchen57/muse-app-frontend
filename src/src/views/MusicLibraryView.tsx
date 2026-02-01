import React, { useState, useEffect } from 'react';
import { Upload, Music, Loader, Trash2, Play } from 'lucide-react';
import { db } from '../utils/db';
import { MusicFormat, MusicMetadata } from '../types/music';
import { bpmDetectionService } from '../services/BPMDetectionService';
import { useAppStore } from '../stores/useAppStore';

const getMusicFormat = (file: File): MusicFormat => {
  const type = file.type.toLowerCase();
  if (type.includes('mpeg') || type.includes('mp3')) return MusicFormat.MP3;
  if (type.includes('wav')) return MusicFormat.WAV;
  if (type.includes('ogg')) return MusicFormat.OGG;
  if (type.includes('aac') || type.includes('m4a')) return MusicFormat.AAC;
  if (type.includes('flac')) return MusicFormat.FLAC;

  const ext = file.name.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'mp3':
      return MusicFormat.MP3;
    case 'wav':
      return MusicFormat.WAV;
    case 'ogg':
      return MusicFormat.OGG;
    case 'aac':
    case 'm4a':
      return MusicFormat.AAC;
    case 'flac':
      return MusicFormat.FLAC;
    default:
      return MusicFormat.MP3;
  }
};

export function MusicLibraryView() {
  const [musicLibrary, setMusicLibrary] = useState<MusicMetadata[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const { setCurrentMusic, setIsPlaying } = useAppStore();

  useEffect(() => {
    loadMusicLibrary();
  }, []);

  const loadMusicLibrary = async () => {
    try {
      const music = await db.music.toArray();
      setMusicLibrary(music);
    } catch (error) {
      console.error('Failed to load music library:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    for (const file of Array.from(files)) {
      try {
        if (!bpmDetectionService.validateAudioFile(file)) {
          setUploadProgress(`Unsupported format: ${file.name}`);
          continue;
        }

        setUploadProgress(`Processing: ${file.name}`);
        const audioBuffer = await bpmDetectionService.loadAudioFile(file);

        setUploadProgress(`Analyzing BPM: ${file.name}`);
        const bpmResult = await bpmDetectionService.detectBPMFromBuffer(audioBuffer);
        const bpm = bpmResult.success ? bpmResult.bpm : null;

        setUploadProgress(`Saving: ${file.name}`);

        const metadata: MusicMetadata = {
          id: `${Date.now()}-${Math.random()}`,
          fileName: file.name,
          title: file.name.replace(/\.[^/.]+$/, ''),
          bpm,
          duration: audioBuffer.duration,
          fileSize: file.size,
          format: getMusicFormat(file),
          uploadDate: Date.now(),
          audioBlob: file,
          playCount: 0,
        };

        await db.music.add(metadata);
      } catch (error) {
        console.error(`Failed to process ${file.name}:`, error);
      }
    }

    setUploading(false);
    setUploadProgress('');
    loadMusicLibrary();
    event.target.value = '';
  };

  const handleDelete = async (id: string) => {
    try {
      await db.music.delete(id);
      loadMusicLibrary();
    } catch (error) {
      console.error('Failed to delete music:', error);
    }
  };

  const handlePlay = (music: MusicMetadata) => {
    setCurrentMusic(music);
    setIsPlaying(true);
  };

  const cardStyle: React.CSSProperties = {
    background: 'var(--card)',
    borderRadius: '16px',
    padding: '24px',
    border: '1px solid var(--beige)',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
    transition: 'all 0.3s ease'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Upload Section */}
      <div style={cardStyle}>
        <h2 style={{ 
          fontSize: '20px', 
          fontWeight: '600', 
          color: 'var(--text-dark)', 
          marginBottom: '16px' 
        }}>
          Upload Music
        </h2>
        
        <label style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '180px',
          border: '2px dashed var(--beige)',
          borderRadius: '16px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          background: 'var(--beige-light)'
        }}>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            textAlign: 'center', 
            padding: '24px' 
          }}>
            {uploading ? (
              <>
                <Loader 
                  size={48} 
                  style={{ 
                    color: '#E07A5F', 
                    marginBottom: '16px',
                    animation: 'spin 1s linear infinite'
                  }} 
                />
                <p style={{ fontSize: '14px', color: 'var(--text-dark)' }}>{uploadProgress}</p>
              </>
            ) : (
              <>
                <Upload size={48} style={{ color: '#E07A5F', marginBottom: '16px' }} />
                <p style={{ fontSize: '14px', color: 'var(--text-dark)', marginBottom: '8px' }}>
                  Click to upload or drag and drop music files
                </p>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Supports MP3, WAV, OGG formats
                </p>
              </>
            )}
          </div>
          <input
            type="file"
            style={{ display: 'none' }}
            accept="audio/*"
            multiple
            onChange={handleFileUpload}
            disabled={uploading}
          />
        </label>
      </div>

      {/* Music Library */}
      <div style={cardStyle}>
        <h2 style={{ 
          fontSize: '20px', 
          fontWeight: '600', 
          color: 'var(--text-dark)', 
          marginBottom: '16px' 
        }}>
          Music Library ({musicLibrary.length})
        </h2>

        {musicLibrary.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            color: 'var(--text-muted)', 
            padding: '48px 24px' 
          }}>
            <Music size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
            <p>Music library is empty, please upload music files</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {musicLibrary.map((music) => (
              <div
                key={music.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '16px',
                  background: 'var(--beige-light)',
                  borderRadius: '12px',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'linear-gradient(135deg, #E07A5F 0%, #F4A261 100%)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Music size={24} style={{ color: 'white' }} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ 
                    fontWeight: '500', 
                    color: 'var(--text-dark)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {music.title}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {music.bpm ? `${music.bpm} BPM` : 'BPM not detected'}
                    {' • '}
                    {Math.round(music.duration)}s
                    {' • '}
                    {(music.fileSize / 1024 / 1024).toFixed(2)} MB
                  </div>
                </div>

                <button
                  onClick={() => handlePlay(music)}
                  style={{
                    padding: '10px',
                    background: '#E07A5F',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 6px rgba(224, 122, 95, 0.3)'
                  }}
                >
                  <Play size={20} style={{ color: 'white' }} />
                </button>

                <button
                  onClick={() => handleDelete(music.id)}
                  style={{
                    padding: '10px',
                    background: 'transparent',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Trash2 size={20} style={{ color: '#E07A5F' }} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
