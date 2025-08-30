import React, { useRef, useEffect, useState } from 'react';
import { TournamentStatus } from '../types';
import { useTournamentStore } from '../hooks/useTournamentStore';

interface BackgroundMusicProps {
  tournamentStatus: TournamentStatus;
}

const BackgroundMusic: React.FC<BackgroundMusicProps> = ({ tournamentStatus }) => {
  const { 
    backgroundMusicUrl, 
    isMusicEnabled, 
    musicVolume
  } = useTournamentStore();
  
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);
  const backgroundMusicRef = useRef<HTMLAudioElement>(null);

  // Track user interaction for autoplay policy
  useEffect(() => {
    const handleUserInteraction = () => {
      setUserInteracted(true);
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };

    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('keydown', handleUserInteraction);
    document.addEventListener('touchstart', handleUserInteraction);

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };
  }, []);

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
      if (wasPlaying && isMusicEnabled && userInteracted) {
        audio.play().catch(() => {
          console.log('Music play failed after URL change');
        });
      }
    }
  }, [backgroundMusicUrl, isMusicEnabled, userInteracted]);

  // Smart autoplay based on tournament status and admin settings
  useEffect(() => {
    const audio = backgroundMusicRef.current;
    if (!audio || !isMusicEnabled || !userInteracted) return;

    const shouldPlay = tournamentStatus !== TournamentStatus.ONLINE;

    if (shouldPlay && !musicPlaying) {
      // Try to play music (tournament not started/finished)
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setMusicPlaying(true);
            console.log('Background music started');
          })
          .catch((error) => {
            console.log('Background music autoplay prevented:', error);
          });
      }
    } else if (!shouldPlay && musicPlaying) {
      // Pause music (tournament started)
      audio.pause();
      setMusicPlaying(false);
      console.log('Background music paused for tournament');
    }
  }, [tournamentStatus, isMusicEnabled, userInteracted, musicPlaying]);

  // Handle music enabled/disabled by admin
  useEffect(() => {
    const audio = backgroundMusicRef.current;
    if (!audio) return;

    if (!isMusicEnabled && musicPlaying) {
      audio.pause();
      setMusicPlaying(false);
      console.log('Background music disabled by admin');
    }
  }, [isMusicEnabled, musicPlaying]);

  // Only render if music is enabled by admin
  if (!isMusicEnabled) {
    return null;
  }

  return (
    <audio 
      ref={backgroundMusicRef} 
      loop 
      preload="auto"
      onPlay={() => setMusicPlaying(true)}
      onPause={() => setMusicPlaying(false)}
      onError={(e) => console.log('Background music error:', e)}
      style={{ display: 'none' }} // Completely hidden
    >
      <source src={backgroundMusicUrl} type="audio/mpeg" />
      <source src={backgroundMusicUrl} type="audio/wav" />
      <source src={backgroundMusicUrl} type="audio/ogg" />
    </audio>
  );
};

export default BackgroundMusic;
