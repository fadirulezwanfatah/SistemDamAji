import React, { useState, useRef, useEffect } from 'react';
import { TournamentStatus } from '../types';
import { useTournamentStore } from '../hooks/useTournamentStore';

interface AudioManagerProps {
  className?: string;
  tournamentStatus: TournamentStatus;
}

const AudioManager: React.FC<AudioManagerProps> = ({ className = '', tournamentStatus }) => {
  const {
    backgroundMusicUrl,
    isMusicEnabled,
    musicVolume,
    setMusicEnabled,
    setMusicVolume
  } = useTournamentStore();

  const [musicPlaying, setMusicPlaying] = useState(false);
  const [userPaused, setUserPaused] = useState(false); // Track manual pause
  const backgroundMusicRef = useRef<HTMLAudioElement>(null);

  // Update volume when store changes
  useEffect(() => {
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.volume = musicVolume;
    }
  }, [musicVolume]);

  // Update audio source when URL changes
  useEffect(() => {
    const audio = backgroundMusicRef.current;
    if (audio && backgroundMusicUrl) {
      const wasPlaying = !audio.paused;
      audio.src = backgroundMusicUrl;
      if (wasPlaying && isMusicEnabled) {
        audio.play().catch(() => {});
      }
    }
  }, [backgroundMusicUrl]);

  // Smart autoplay based on tournament status
  useEffect(() => {
    const audio = backgroundMusicRef.current;
    if (!audio || !isMusicEnabled) return;

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
  }, [tournamentStatus, isMusicEnabled, userPaused, musicPlaying]);

  const playSuccessSound = () => {
    if (!isMusicEnabled) return;
    const audio = new Audio('/audio/success.mp3');
    audio.volume = musicVolume;
    audio.play().catch(() => {});
  };

  const playStartSound = () => {
    if (!isMusicEnabled) return;
    const audio = new Audio('/audio/tournament-start.mp3');
    audio.volume = musicVolume;
    audio.play().catch(() => {});
  };

  const toggleBackgroundMusic = () => {
    if (!isMusicEnabled) return;

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
    if (!isMusicEnabled) return '🔇 Music disabled by admin';
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
        <source src={backgroundMusicUrl} type="audio/mpeg" />
      </audio>

      {/* Audio Controls */}
      <div className="flex items-center gap-3 p-3 bg-navy rounded border border-lightest-navy">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setMusicEnabled(!isMusicEnabled);
              if (isMusicEnabled && musicPlaying) {
                backgroundMusicRef.current?.pause();
                setMusicPlaying(false);
              }
            }}
            className={`px-3 py-1 rounded text-sm font-semibold transition-colors ${
              isMusicEnabled
                ? 'bg-green-600 text-white'
                : 'bg-gray-600 text-gray-300'
            }`}
          >
            {isMusicEnabled ? '🔊 Music ON' : '🔇 Music OFF'}
          </button>
        </div>

        {isMusicEnabled && (
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
                value={musicVolume}
                onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
                className="w-16"
              />
              <span className="text-xs text-light-slate">{Math.round(musicVolume * 100)}%</span>
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
