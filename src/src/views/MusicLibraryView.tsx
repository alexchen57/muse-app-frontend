import React, { useState, useEffect } from 'react';
import { Upload, Music, Loader, Trash2, Play } from 'lucide-react';
import { db } from '../utils/db';
import { MusicMetadata } from '../types/music';
import { bpmDetectionService } from '../services/BPMDetectionService';
import { useAppStore } from '../stores/useAppStore';

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
        setUploadProgress(`Processing: ${file.name}`);

        // Load audio file
        const audioBuffer = await bpmDetectionService.loadAudioFile(file);

        setUploadProgress(`Analyzing BPM: ${file.name}`);

        // Detect BPM
        const bpm = await bpmDetectionService.detectBPM(audioBuffer);

        setUploadProgress(`Saving: ${file.name}`);

        // Create metadata
        const metadata: MusicMetadata = {
          id: `${Date.now()}-${Math.random()}`,
          fileName: file.name,
          title: file.name.replace(/\.[^/.]+$/, ''),
          bpm,
          duration: audioBuffer.duration,
          fileSize: file.size,
          uploadDate: new Date(),
          audioBlob: file,
        };

        // Save to IndexedDB
        await db.music.add(metadata);
      } catch (error) {
        console.error(`Failed to process ${file.name}:`, error);
      }
    }

    setUploading(false);
    setUploadProgress('');
    loadMusicLibrary();

    // Reset input
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

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
        <h2 className="text-xl font-bold text-white mb-4">Upload Music</h2>
        
        <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-600 rounded-xl cursor-pointer hover:border-slate-500 transition-colors">
          <div className="flex flex-col items-center justify-center text-center p-6">
            {uploading ? (
              <>
                <Loader className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                <p className="text-sm text-slate-300">{uploadProgress}</p>
              </>
            ) : (
              <>
                <Upload className="w-12 h-12 text-slate-400 mb-4" />
                <p className="text-sm text-slate-300 mb-2">
                  Click to upload or drag and drop music files
                </p>
                <p className="text-xs text-slate-500">
                  Supports MP3, WAV, OGG formats
                </p>
              </>
            )}
          </div>
          <input
            type="file"
            className="hidden"
            accept="audio/*"
            multiple
            onChange={handleFileUpload}
            disabled={uploading}
          />
        </label>
      </div>

      {/* Music Library */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
        <h2 className="text-xl font-bold text-white mb-4">
          Music Library ({musicLibrary.length})
        </h2>

        {musicLibrary.length === 0 ? (
          <div className="text-center text-slate-400 py-12">
            <Music className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Music library is empty, please upload music files</p>
          </div>
        ) : (
          <div className="space-y-2">
            {musicLibrary.map((music) => (
              <div
                key={music.id}
                className="flex items-center gap-4 p-4 bg-slate-900/50 rounded-lg hover:bg-slate-900/70 transition-colors"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Music className="w-6 h-6 text-white" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="font-medium text-white truncate">
                    {music.title}
                  </div>
                  <div className="text-sm text-slate-400">
                    {music.bpm ? `${music.bpm} BPM` : 'BPM not detected'}
                    {' • '}
                    {Math.round(music.duration)}s
                    {' • '}
                    {(music.fileSize / 1024 / 1024).toFixed(2)} MB
                  </div>
                </div>

                <button
                  onClick={() => handlePlay(music)}
                  className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  <Play className="w-5 h-5 text-white" />
                </button>

                <button
                  onClick={() => handleDelete(music.id)}
                  className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5 text-red-400" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
