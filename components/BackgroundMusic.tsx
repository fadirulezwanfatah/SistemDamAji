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
      console.log('🎵 Loading music:', backgroundMusicUrl);
      const wasPlaying = !audio.paused;
      audio.src = backgroundMusicUrl;

      // Add load event listener
      const handleLoad = () => {
        console.log('🎵 Music loaded successfully');
        if (wasPlaying && isMusicEnabled && userInteracted) {
          audio.play().catch((error) => {
            console.error('🎵 Music play failed after URL change:', error);
          });
        }
      };

      const handleError = (e: any) => {
        console.error('🎵 Music load error:', e);
        console.error('🎵 Failed to load:', backgroundMusicUrl);
      };

      audio.addEventListener('loadeddata', handleLoad);
      audio.addEventListener('error', handleError);

      return () => {
        audio.removeEventListener('loadeddata', handleLoad);
        audio.removeEventListener('error', handleError);
      };
    }
  }, [backgroundMusicUrl, isMusicEnabled, userInteracted]);

  // Smart autoplay based on tournament status and admin settings
  useEffect(() => {
    const audio = backgroundMusicRef.current;

    console.log('🎵 Music state check:', {
      hasAudio: !!audio,
      isMusicEnabled,
      userInteracted,
      tournamentStatus,
      musicPlaying,
      audioSrc: audio?.src
    });

    if (!audio || !isMusicEnabled) {
      console.log('🎵 Music disabled or no audio element');
      return;
    }

    if (!userInteracted) {
      console.log('🎵 Waiting for user interaction...');
      return;
    }

    const shouldPlay = tournamentStatus !== TournamentStatus.ONLINE;
    console.log('🎵 Should play:', shouldPlay, 'Tournament status:', tournamentStatus);

    if (shouldPlay && !musicPlaying) {
      // Try to play music (tournament not started/finished)
      console.log('🎵 Attempting to play music...');
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setMusicPlaying(true);
            console.log('✅ Background music started successfully');
          })
          .catch((error) => {
            console.error('❌ Background music autoplay failed:', error);
          });
      }
    } else if (!shouldPlay && musicPlaying) {
      // Pause music (tournament started)
      audio.pause();
      setMusicPlaying(false);
      console.log('⏸️ Background music paused for tournament');
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
    console.log('🎵 Music disabled by admin');
    return null;
  }

  return (
    <>
      {/* Hidden audio element */}
      <audio
        ref={backgroundMusicRef}
        loop
        preload="auto"
        onPlay={() => {
          setMusicPlaying(true);
          console.log('🎵 Audio started playing');
        }}
        onPause={() => {
          setMusicPlaying(false);
          console.log('🎵 Audio paused');
        }}
        onError={(e) => {
          console.error('🎵 Audio error:', e);
          console.error('🎵 Failed URL:', backgroundMusicUrl);
        }}
        onLoadStart={() => console.log('🎵 Audio load started')}
        onCanPlay={() => console.log('🎵 Audio can play')}
        style={{ display: 'none' }} // Completely hidden
      >
        <source src={backgroundMusicUrl} type="audio/mpeg" />
        <source src={backgroundMusicUrl} type="audio/wav" />
        <source src={backgroundMusicUrl} type="audio/ogg" />
      </audio>

      {/* User interaction prompt (only if needed) */}
      {!userInteracted && (
        <div
          onClick={() => setUserInteracted(true)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: -1,
            pointerEvents: 'auto'
          }}
        />
      )}
    </>
  );
};

export default BackgroundMusic;
