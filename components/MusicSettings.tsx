import React, { useState } from 'react';
import { useTournamentStore } from '../hooks/useTournamentStore';

interface MusicSettingsProps {
  className?: string;
}

const MusicSettings: React.FC<MusicSettingsProps> = ({ className = '' }) => {
  const {
    backgroundMusicUrl,
    youtubeVideoId,
    isMusicEnabled,
    musicVolume,
    setBackgroundMusicUrl,
    setYoutubeVideoId,
    setMusicEnabled,
    setMusicVolume
  } = useTournamentStore();

  const [localMusicUrl, setLocalMusicUrl] = useState(backgroundMusicUrl);
  const [localYoutubeUrl, setLocalYoutubeUrl] = useState(`https://www.youtube.com/watch?v=${youtubeVideoId}`);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string>('');
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
      setUploadedFile(file);
      setUploadedFileUrl(objectUrl);
      setLocalMusicUrl(objectUrl);
      alert('Fail audio telah dimuat naik! Klik "Simpan Fail Audio" untuk apply.');
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Ralat semasa memuat naik fail');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveUploadedFile = () => {
    if (uploadedFileUrl) {
      setBackgroundMusicUrl(uploadedFileUrl);
      alert('Fail audio telah disimpan dan diaktifkan!');
      setUploadedFile(null); // Clear the pending file
    }
  };

  const extractYouTubeVideoId = (url: string): string => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : '';
  };

  const handleSaveYouTubeUrl = () => {
    const videoId = extractYouTubeVideoId(localYoutubeUrl);
    if (videoId) {
      setYoutubeVideoId(videoId);
      alert('YouTube video telah dikemaskini! Video ID: ' + videoId);
    } else {
      alert('URL YouTube tidak sah. Sila gunakan format: https://www.youtube.com/watch?v=VIDEO_ID');
    }
  };

  const presetYouTubeVideos = [
    { name: 'Default - Relaxing Music', videoId: 'OYaFysVh_qU' },
    { name: 'Peaceful Piano', videoId: 'jfKfPfyJRdk' },
    { name: 'Nature Sounds', videoId: 'eKFTSSKCzWA' },
    { name: 'Instrumental Background', videoId: 'lTRiuFIWV54' },
  ];

  const presetSongs = [
    { name: 'Test Bell Sound', url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav' },
    { name: 'Peaceful Piano', url: 'https://www.soundjay.com/misc/sounds/clock-chimes-daniel_simon.wav' },
    { name: 'Nature Sounds', url: 'https://www.soundjay.com/nature/sounds/rain-03.wav' },
    { name: 'Soft Chime', url: 'https://www.soundjay.com/misc/sounds/wind-chime-daniel_simon.wav' },
  ];

  const hasUnsavedChanges = localMusicUrl !== backgroundMusicUrl;
  const hasUploadedFile = uploadedFile !== null;

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

        {/* YouTube URL Input - Primary Method */}
        <div className="mb-6 p-4 bg-navy rounded border border-lightest-navy border-2 border-gold/50">
          <h3 className="text-lg font-semibold text-gold mb-3">🎵 YouTube Background Music (RECOMMENDED)</h3>
          <div className="space-y-3">
            <input
              type="url"
              value={localYoutubeUrl}
              onChange={(e) => setLocalYoutubeUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=OYaFysVh_qU"
              className="w-full bg-lightest-navy p-3 rounded border border-light-slate text-lightest-slate"
            />
            <button
              onClick={handleSaveYouTubeUrl}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors"
            >
              🎵 Simpan YouTube Video
            </button>
            <p className="text-xs text-light-slate">
              ✅ <strong>Kelebihan YouTube:</strong> Autoplay berfungsi, tiada masalah browser, muzik berkualiti tinggi
            </p>
          </div>
        </div>

        {/* Music URL Input - Alternative Method */}
        <div className="mb-6 p-4 bg-navy rounded border border-lightest-navy">
          <h3 className="text-lg font-semibold text-gold mb-3">🔊 Direct Audio URL (Alternative)</h3>
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
            <p className="text-xs text-light-slate">
              ⚠️ <strong>Nota:</strong> Direct audio mungkin tidak autoplay dalam sesetengah browser
            </p>
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

            {/* Show uploaded file info */}
            {uploadedFile && (
              <div className="p-3 bg-green-900/30 rounded border border-green-500/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-200">
                      📁 <strong>{uploadedFile.name}</strong>
                    </p>
                    <p className="text-xs text-green-300">
                      Size: {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    onClick={handleSaveUploadedFile}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors"
                  >
                    💾 Simpan Fail Audio
                  </button>
                </div>
              </div>
            )}

            <p className="text-xs text-light-slate">
              Format disokong: MP3, WAV, OGG. Maksimum 5MB. Disyorkan: 3 minit, 128kbps.
            </p>
            {isUploading && (
              <div className="text-sm text-gold">📤 Memuat naik fail...</div>
            )}
          </div>
        </div>

        {/* YouTube Preset Videos */}
        <div className="mb-6 p-4 bg-navy rounded border border-lightest-navy">
          <h3 className="text-lg font-semibold text-gold mb-3">🎵 YouTube Preset Videos</h3>
          <div className="grid grid-cols-2 gap-2">
            {presetYouTubeVideos.map((video, index) => (
              <button
                key={index}
                onClick={() => {
                  setYoutubeVideoId(video.videoId);
                  setLocalYoutubeUrl(`https://www.youtube.com/watch?v=${video.videoId}`);
                  alert(`YouTube video "${video.name}" telah diaktifkan!`);
                }}
                className={`p-2 rounded text-sm font-semibold transition-colors ${
                  youtubeVideoId === video.videoId
                    ? 'bg-red-600 text-white'
                    : 'bg-lightest-navy hover:bg-light-slate text-lightest-slate'
                }`}
              >
                {video.name}
              </button>
            ))}
          </div>
        </div>

        {/* Audio Preset Songs */}
        <div className="mb-6 p-4 bg-navy rounded border border-lightest-navy">
          <h3 className="text-lg font-semibold text-gold mb-3">🔊 Audio Preset Files</h3>
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
              <span className="text-light-slate">YouTube Video:</span>
              <span className="text-red-400 font-mono text-xs">
                {youtubeVideoId}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-light-slate">Audio URL:</span>
              <span className="text-lightest-slate font-mono text-xs truncate max-w-xs">
                {backgroundMusicUrl}
              </span>
            </div>
          </div>
        </div>

        {/* Debug Panel */}
        <div className="mt-4 p-3 bg-yellow-900/30 rounded border border-yellow-500/30">
          <h3 className="text-sm font-semibold text-yellow-200 mb-2">🔧 Debug & Test</h3>
          <div className="text-xs text-yellow-100 space-y-1 mb-3">
            <div>Music URL: <span className="font-mono">{backgroundMusicUrl}</span></div>
            <div>Enabled: <span className={isMusicEnabled ? 'text-green-300' : 'text-red-300'}>{isMusicEnabled ? 'YES' : 'NO'}</span></div>
            <div>Volume: <span className="text-blue-300">{Math.round(musicVolume * 100)}%</span></div>
          </div>

          {/* Test Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                const audio = new Audio(backgroundMusicUrl);
                audio.volume = musicVolume;
                audio.play()
                  .then(() => {
                    console.log('✅ Admin panel audio test successful');
                    alert('✅ Admin audio test successful!');
                  })
                  .catch((error) => {
                    console.error('❌ Admin panel audio test failed:', error);
                    alert('❌ Admin audio test failed: ' + error.message);
                  });
              }}
              className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded transition-colors"
            >
              🔊 Test Admin Audio
            </button>

            <button
              onClick={() => {
                // Test frontend music by triggering a custom event
                window.dispatchEvent(new CustomEvent('testFrontendMusic', {
                  detail: { url: backgroundMusicUrl, volume: musicVolume }
                }));
                alert('🎵 Frontend music test triggered! Check frontend tab and console.');
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
            >
              🌐 Test Frontend Music
            </button>
          </div>

          <p className="text-xs text-yellow-200 mt-2">
            💡 Check browser console (F12) untuk detailed music logs
          </p>
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
