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
      console.log('🎵 User interaction detected, enabling music');
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

    console.log('🎵 Frontend Music state check:', {
      hasAudio: !!audio,
      isMusicEnabled,
      userInteracted,
      tournamentStatus,
      musicPlaying,
      audioSrc: audio?.src,
      backgroundMusicUrl
    });

    if (!audio) {
      console.log('🎵 No audio element found');
      return;
    }

    if (!isMusicEnabled) {
      console.log('🎵 Music disabled by admin');
      if (musicPlaying) {
        audio.pause();
        setMusicPlaying(false);
      }
      return;
    }

    if (!userInteracted) {
      console.log('🎵 Waiting for user interaction... (click, scroll, or touch page)');
      return;
    }

    const shouldPlay = tournamentStatus !== TournamentStatus.ONLINE;
    console.log('🎵 Should play:', shouldPlay, 'Tournament status:', tournamentStatus);

    if (shouldPlay && !musicPlaying) {
      // Try to play music (tournament not started/finished)
      console.log('🎵 Attempting to play frontend music...');

      // Ensure audio is loaded
      if (audio.readyState >= 2) { // HAVE_CURRENT_DATA
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setMusicPlaying(true);
              console.log('✅ Frontend background music started successfully');
            })
            .catch((error) => {
              console.error('❌ Frontend background music autoplay failed:', error);
              console.error('Error details:', error.name, error.message);
            });
        }
      } else {
        console.log('🎵 Audio not ready, waiting for load...');
        audio.addEventListener('canplay', () => {
          console.log('🎵 Audio ready, attempting play...');
          audio.play().then(() => {
            setMusicPlaying(true);
            console.log('✅ Frontend music started after load');
          }).catch(console.error);
        }, { once: true });
      }
    } else if (!shouldPlay && musicPlaying) {
      // Pause music (tournament started)
      audio.pause();
      setMusicPlaying(false);
      console.log('⏸️ Frontend background music paused for tournament');
    }
  }, [tournamentStatus, isMusicEnabled, userInteracted, musicPlaying, backgroundMusicUrl]);

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

  // Listen for frontend music test events from admin panel
  useEffect(() => {
    const handleTestFrontendMusic = (event: any) => {
      console.log('🎵 Frontend music test triggered from admin panel');
      const audio = backgroundMusicRef.current;
      if (audio) {
        audio.volume = event.detail.volume || musicVolume;
        audio.play()
          .then(() => {
            console.log('✅ Frontend music test successful');
            setMusicPlaying(true);
          })
          .catch((error) => {
            console.error('❌ Frontend music test failed:', error);
          });
      }
    };

    window.addEventListener('testFrontendMusic', handleTestFrontendMusic);
    return () => {
      window.removeEventListener('testFrontendMusic', handleTestFrontendMusic);
    };
  }, [musicVolume]);

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
      {!userInteracted && isMusicEnabled && (
        <div
          onClick={() => {
            console.log('🎵 User clicked to enable music');
            setUserInteracted(true);
          }}
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

      {/* Debug info for frontend (only in development) */}
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
          🎵 Music: {isMusicEnabled ? (musicPlaying ? 'Playing' : 'Ready') : 'Disabled'} |
          User: {userInteracted ? 'Interacted' : 'Waiting'}
        </div>
      )}
    </>
  );
};

export default BackgroundMusic;
