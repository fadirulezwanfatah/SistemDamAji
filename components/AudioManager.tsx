import React, { useState, useRef, useEffect } from 'react';
import { TournamentStatus } from '../types';

interface AudioManagerProps {
  className?: string;
  tournamentStatus: TournamentStatus;
}

const AudioManager: React.FC<AudioManagerProps> = ({ className = '', tournamentStatus }) => {
  const [audioEnabled, setAudioEnabled] = useState(true); // Default enabled
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [userPaused, setUserPaused] = useState(false); // Track manual pause
  const [volume, setVolume] = useState(0.4);
  const backgroundMusicRef = useRef<HTMLAudioElement>(null);

  // Load user preferences
  useEffect(() => {
    const savedPrefs = localStorage.getItem('audio-preferences');
    if (savedPrefs) {
      const prefs = JSON.parse(savedPrefs);
      setAudioEnabled(prefs.enabled !== false); // Default true
      setVolume(prefs.volume || 0.4);
    }
  }, []);

  // Save preferences
  useEffect(() => {
    localStorage.setItem('audio-preferences', JSON.stringify({
      enabled: audioEnabled,
      volume: volume
    }));
  }, [audioEnabled, volume]);

  // Update volume
  useEffect(() => {
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.volume = volume;
    }
  }, [volume]);

  // Smart autoplay based on tournament status
  useEffect(() => {
    const audio = backgroundMusicRef.current;
    if (!audio || !audioEnabled) return;

    const shouldPlay = tournamentStatus !== TournamentStatus.ONLINE && !userPaused;

    if (shouldPlay && !musicPlaying) {
      // Try to play music (tournament not started)
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setMusicPlaying(true);
          })
          .catch((error) => {
            console.log('Autoplay prevented:', error);
            // Show user control to enable music
          });
      }
    } else if (!shouldPlay && musicPlaying) {
      // Pause music (tournament started)
      audio.pause();
      setMusicPlaying(false);
    }
  }, [tournamentStatus, audioEnabled, userPaused, musicPlaying]);

  const playSuccessSound = () => {
    if (!audioEnabled) return;
    const audio = new Audio('/audio/success.mp3');
    audio.volume = volume;
    audio.play().catch(() => {});
  };

  const playStartSound = () => {
    if (!audioEnabled) return;
    const audio = new Audio('/audio/tournament-start.mp3');
    audio.volume = volume;
    audio.play().catch(() => {});
  };

  const toggleBackgroundMusic = () => {
    if (!audioEnabled) return;

    if (backgroundMusicRef.current) {
      if (musicPlaying) {
        backgroundMusicRef.current.pause();
        setUserPaused(true); // User manually paused
      } else {
        backgroundMusicRef.current.play().catch(() => {});
        setUserPaused(false); // User manually resumed
      }
      setMusicPlaying(!musicPlaying);
    }
  };

  // Get music status message
  const getMusicStatusMessage = () => {
    if (!audioEnabled) return '🔇 Audio disabled';
    if (tournamentStatus === TournamentStatus.ONLINE) return '⏸️ Paused (Tournament active)';
    if (userPaused) return '⏸️ Paused by user';
    if (musicPlaying) return '🎵 Playing background music';
    return '▶️ Ready to play';
  };

  return (
    <div className={`audio-manager ${className}`}>
      {/* Background Music */}
      <audio 
        ref={backgroundMusicRef} 
        loop 
        onPlay={() => setMusicPlaying(true)}
        onPause={() => setMusicPlaying(false)}
      >
        <source src="/audio/background.mp3" type="audio/mpeg" />
      </audio>

      {/* Audio Controls */}
      <div className="flex items-center gap-3 p-3 bg-navy rounded border border-lightest-navy">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setAudioEnabled(!audioEnabled);
              if (audioEnabled && musicPlaying) {
                backgroundMusicRef.current?.pause();
                setMusicPlaying(false);
              }
            }}
            className={`px-3 py-1 rounded text-sm font-semibold transition-colors ${
              audioEnabled
                ? 'bg-green-600 text-white'
                : 'bg-gray-600 text-gray-300'
            }`}
          >
            {audioEnabled ? '🔊 Audio ON' : '🔇 Audio OFF'}
          </button>
        </div>

        {audioEnabled && (
          <>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleBackgroundMusic}
                disabled={tournamentStatus === TournamentStatus.ONLINE}
                className={`px-3 py-1 rounded text-sm font-semibold transition-colors ${
                  tournamentStatus === TournamentStatus.ONLINE
                    ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                    : musicPlaying
                      ? 'bg-gold text-navy'
                      : 'bg-slate text-white'
                }`}
              >
                {tournamentStatus === TournamentStatus.ONLINE
                  ? '⏸️ Auto-paused'
                  : musicPlaying
                    ? '⏸️ Pause Music'
                    : '🎵 Play Music'
                }
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-light-slate">Volume:</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-16"
              />
              <span className="text-xs text-light-slate">{Math.round(volume * 100)}%</span>
            </div>

            <div className="text-xs text-light-slate">
              {getMusicStatusMessage()}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Export functions for use in other components
export const useAudioManager = () => {
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [volume, setVolume] = useState(0.3);

  useEffect(() => {
    const savedPrefs = localStorage.getItem('audio-preferences');
    if (savedPrefs) {
      const prefs = JSON.parse(savedPrefs);
      setAudioEnabled(prefs.enabled || false);
      setVolume(prefs.volume || 0.3);
    }
  }, []);

  const playSound = (soundFile: string) => {
    if (!audioEnabled) return;
    const audio = new Audio(soundFile);
    audio.volume = volume;
    audio.play().catch(() => {});
  };

  return {
    audioEnabled,
    volume,
    playSuccessSound: () => playSound('/audio/success.mp3'),
    playStartSound: () => playSound('/audio/tournament-start.mp3'),
    playMatchSound: () => playSound('/audio/match-complete.mp3'),
  };
};

export default AudioManager;
