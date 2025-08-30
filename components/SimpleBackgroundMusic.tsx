import React, { useEffect, useRef, useState } from 'react';
import { TournamentStatus } from '../types';
import { useTournamentStore } from '../hooks/useTournamentStore';

interface SimpleBackgroundMusicProps {
  tournamentStatus: TournamentStatus;
}

const SimpleBackgroundMusic: React.FC<SimpleBackgroundMusicProps> = ({ tournamentStatus }) => {
  const { backgroundMusicUrl, isMusicEnabled, musicVolume } = useTournamentStore();
  const [isPlaying, setIsPlaying] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);
  const [audioReady, setAudioReady] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Track user interaction
  useEffect(() => {
    const handleUserInteraction = () => {
      console.log('🎵 User interaction detected');
      setUserInteracted(true);
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('scroll', handleUserInteraction);
    };

    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('keydown', handleUserInteraction);
    document.addEventListener('touchstart', handleUserInteraction);
    document.addEventListener('scroll', handleUserInteraction);

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('scroll', handleUserInteraction);
    };
  }, []);

  // Handle audio loading
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !backgroundMusicUrl) return;

    const handleCanPlay = () => {
      console.log('🎵 Audio ready to play');
      setAudioReady(true);
    };

    const handleError = (e: any) => {
      console.error('🎵 Audio load error:', e);
      setAudioReady(false);
    };

    const handleLoadStart = () => {
      console.log('🎵 Audio loading started');
      setAudioReady(false);
    };

    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('error', handleError);
    audio.addEventListener('loadstart', handleLoadStart);

    // Set audio properties
    audio.volume = musicVolume;
    audio.loop = true;

    return () => {
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('loadstart', handleLoadStart);
    };
  }, [backgroundMusicUrl, musicVolume]);

  // Handle music playback
  useEffect(() => {
    const audio = audioRef.current;
    
    if (!audio || !isMusicEnabled || !audioReady) {
      console.log('🎵 Music conditions not met:', {
        hasAudio: !!audio,
        isMusicEnabled,
        audioReady,
        userInteracted
      });
      return;
    }

    const shouldPlay = tournamentStatus !== TournamentStatus.ONLINE;
    console.log('🎵 Should play music:', shouldPlay, 'Tournament status:', tournamentStatus);

    if (shouldPlay && !isPlaying && userInteracted) {
      console.log('🎵 Attempting to play music...');
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            console.log('✅ Music started successfully');
          })
          .catch((error) => {
            console.error('❌ Music play failed:', error);
            setIsPlaying(false);
          });
      }
    } else if (!shouldPlay && isPlaying) {
      console.log('🎵 Pausing music for tournament');
      audio.pause();
      setIsPlaying(false);
    }
  }, [tournamentStatus, isMusicEnabled, audioReady, userInteracted, isPlaying]);

  // Handle music enabled/disabled
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!isMusicEnabled && isPlaying) {
      console.log('🎵 Music disabled by admin');
      audio.pause();
      setIsPlaying(false);
    }
  }, [isMusicEnabled, isPlaying]);

  // Handle volume changes
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = musicVolume;
      console.log('🎵 Volume set to:', Math.round(musicVolume * 100) + '%');
    }
  }, [musicVolume]);

  // Handle audio events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => {
      setIsPlaying(true);
      console.log('🎵 Audio started playing');
    };

    const handlePause = () => {
      setIsPlaying(false);
      console.log('🎵 Audio paused');
    };

    const handleEnded = () => {
      setIsPlaying(false);
      console.log('🎵 Audio ended');
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  // Don't render if music is disabled
  if (!isMusicEnabled) {
    console.log('🎵 Music disabled by admin');
    return null;
  }

  return (
    <>
      {/* Hidden audio element */}
      <audio 
        ref={audioRef}
        preload="auto"
        style={{ display: 'none' }}
      >
        <source src={backgroundMusicUrl} type="audio/mpeg" />
        <source src={backgroundMusicUrl} type="audio/wav" />
        <source src={backgroundMusicUrl} type="audio/ogg" />
      </audio>

      {/* User interaction prompt (invisible) */}
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
            pointerEvents: 'auto',
            background: 'transparent'
          }}
        />
      )}

      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{ 
          position: 'fixed', 
          bottom: '10px', 
          right: '10px', 
          background: 'rgba(0,0,0,0.8)', 
          color: 'white', 
          padding: '5px 10px', 
          borderRadius: '5px',
          fontSize: '12px',
          zIndex: 1000
        }}>
          🎵 Audio: {isPlaying ? 'Playing' : 'Paused'} | 
          Ready: {audioReady ? 'Yes' : 'No'} | 
          User: {userInteracted ? 'Yes' : 'No'}
        </div>
      )}
    </>
  );
};

export default SimpleBackgroundMusic;
