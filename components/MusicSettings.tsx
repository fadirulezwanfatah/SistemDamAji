import React, { useState } from 'react';
import { useTournamentStore } from '../hooks/useTournamentStore';

interface MusicSettingsProps {
  className?: string;
}

const MusicSettings: React.FC<MusicSettingsProps> = ({ className = '' }) => {
  const { 
    backgroundMusicUrl, 
    isMusicEnabled, 
    musicVolume,
    setBackgroundMusicUrl,
    setMusicEnabled,
    setMusicVolume 
  } = useTournamentStore();

  const [localMusicUrl, setLocalMusicUrl] = useState(backgroundMusicUrl);
  const [isUploading, setIsUploading] = useState(false);

  const handleSaveMusicUrl = () => {
    setBackgroundMusicUrl(localMusicUrl);
    alert('URL lagu background telah dikemaskini!');
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('audio/')) {
      alert('Sila pilih fail audio yang sah (MP3, WAV, OGG)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Saiz fail terlalu besar. Maksimum 5MB.');
      return;
    }

    setIsUploading(true);

    try {
      // Create object URL for local file
      const objectUrl = URL.createObjectURL(file);
      setLocalMusicUrl(objectUrl);
      setBackgroundMusicUrl(objectUrl);
      alert('Fail audio telah dimuat naik!');
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Ralat semasa memuat naik fail');
    } finally {
      setIsUploading(false);
    }
  };

  const presetSongs = [
    { name: 'Default Background', url: '/audio/background.mp3' },
    { name: 'Instrumental 1', url: '/audio/instrumental1.mp3' },
    { name: 'Ambient Music', url: '/audio/ambient.mp3' },
    { name: 'Classical', url: '/audio/classical.mp3' },
  ];

  const hasUnsavedChanges = localMusicUrl !== backgroundMusicUrl;

  return (
    <div className={`music-settings ${className}`}>
      <div className="p-6 bg-light-navy rounded-lg shadow-lg border-2 border-gold/30">
        <h2 className="text-2xl font-bold text-gold mb-4">🎵 Tetapan Muzik Background</h2>
        
        {/* Global Music Toggle */}
        <div className="mb-6 p-4 bg-navy rounded border border-lightest-navy">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gold">Kawalan Muzik Global</h3>
              <p className="text-sm text-light-slate">Enable/disable muzik background untuk semua pengguna</p>
            </div>
            <button
              onClick={() => setMusicEnabled(!isMusicEnabled)}
              className={`px-4 py-2 rounded font-semibold transition-colors ${
                isMusicEnabled 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              {isMusicEnabled ? '🔊 Muzik AKTIF' : '🔇 Muzik TIDAK AKTIF'}
            </button>
          </div>
        </div>

        {/* Volume Control */}
        <div className="mb-6 p-4 bg-navy rounded border border-lightest-navy">
          <h3 className="text-lg font-semibold text-gold mb-3">Volume Default</h3>
          <div className="flex items-center gap-4">
            <span className="text-sm text-light-slate">Senyap</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={musicVolume}
              onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
              className="flex-grow"
            />
            <span className="text-sm text-light-slate">Kuat</span>
            <span className="text-sm text-lightest-slate font-bold w-12">
              {Math.round(musicVolume * 100)}%
            </span>
          </div>
        </div>

        {/* Music URL Input */}
        <div className="mb-6 p-4 bg-navy rounded border border-lightest-navy">
          <h3 className="text-lg font-semibold text-gold mb-3">URL Lagu Background</h3>
          <div className="space-y-3">
            <input
              type="url"
              value={localMusicUrl}
              onChange={(e) => setLocalMusicUrl(e.target.value)}
              placeholder="https://example.com/music.mp3"
              className="w-full bg-lightest-navy p-3 rounded border border-light-slate text-lightest-slate"
            />
            {hasUnsavedChanges && (
              <button
                onClick={handleSaveMusicUrl}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
              >
                💾 Simpan URL Lagu
              </button>
            )}
          </div>
        </div>

        {/* File Upload */}
        <div className="mb-6 p-4 bg-navy rounded border border-lightest-navy">
          <h3 className="text-lg font-semibold text-gold mb-3">Upload Fail Audio</h3>
          <div className="space-y-3">
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="w-full bg-lightest-navy p-3 rounded border border-light-slate text-lightest-slate file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-gold file:text-navy file:font-semibold hover:file:bg-gold/90"
            />
            <p className="text-xs text-light-slate">
              Format disokong: MP3, WAV, OGG. Maksimum 5MB. Disyorkan: 3 minit, 128kbps.
            </p>
            {isUploading && (
              <div className="text-sm text-gold">📤 Memuat naik fail...</div>
            )}
          </div>
        </div>

        {/* Preset Songs */}
        <div className="mb-6 p-4 bg-navy rounded border border-lightest-navy">
          <h3 className="text-lg font-semibold text-gold mb-3">Lagu Preset</h3>
          <div className="grid grid-cols-2 gap-2">
            {presetSongs.map((song, index) => (
              <button
                key={index}
                onClick={() => {
                  setLocalMusicUrl(song.url);
                  setBackgroundMusicUrl(song.url);
                }}
                className={`p-2 rounded text-sm font-semibold transition-colors ${
                  backgroundMusicUrl === song.url
                    ? 'bg-gold text-navy'
                    : 'bg-lightest-navy hover:bg-light-slate text-lightest-slate'
                }`}
              >
                {song.name}
              </button>
            ))}
          </div>
        </div>

        {/* Current Status */}
        <div className="p-4 bg-navy rounded border border-lightest-navy">
          <h3 className="text-lg font-semibold text-gold mb-3">Status Semasa</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-light-slate">Muzik Global:</span>
              <span className={`font-bold ${isMusicEnabled ? 'text-green-400' : 'text-red-400'}`}>
                {isMusicEnabled ? 'AKTIF' : 'TIDAK AKTIF'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-light-slate">Volume:</span>
              <span className="text-lightest-slate font-bold">{Math.round(musicVolume * 100)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-light-slate">URL Semasa:</span>
              <span className="text-lightest-slate font-mono text-xs truncate max-w-xs">
                {backgroundMusicUrl}
              </span>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="mt-4 p-3 bg-blue-900/30 rounded border border-blue-500/30">
          <p className="text-sm text-blue-200">
            ℹ️ <strong>Nota:</strong> Muzik akan auto-play bila pengguna masuk frontend dan auto-pause bila tournament aktif. 
            Pengguna boleh control sendiri tetapi tetapan admin akan override.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MusicSettings;
