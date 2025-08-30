import React, { useEffect, useRef, useState } from 'react';
import { TournamentStatus } from '../types';
import { useTournamentStore } from '../hooks/useTournamentStore';

interface HybridBackgroundMusicProps {
  tournamentStatus: TournamentStatus;
}

const HybridBackgroundMusic: React.FC<HybridBackgroundMusicProps> = ({ tournamentStatus }) => {
  const { youtubeVideoId, backgroundMusicUrl, isMusicEnabled, musicVolume } = useTournamentStore();
  const [youtubePlayer, setYoutubePlayer] = useState<any>(null);
  const [youtubeReady, setYoutubeReady] = useState(false);
  const [youtubeError, setYoutubeError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);
  
  const playerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Track user interaction for audio fallback
  useEffect(() => {
    const handleUserInteraction = () => {
      console.log('🎵 User interaction detected');
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

  // Load YouTube API
  useEffect(() => {
    if (!isMusicEnabled || !youtubeVideoId) return;

    if (window.YT && window.YT.Player) {
      setYoutubeReady(true);
      return;
    }

    const existingScript = document.querySelector('script[src*="youtube.com/iframe_api"]');
    if (existingScript) {
      const checkAPI = setInterval(() => {
        if (window.YT && window.YT.Player) {
          setYoutubeReady(true);
          clearInterval(checkAPI);
        }
      }, 100);
      
      setTimeout(() => {
        clearInterval(checkAPI);
        console.log('🎵 YouTube API timeout, using audio fallback');
        setYoutubeError(true);
      }, 5000);
      
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    script.async = true;
    
    script.onload = () => console.log('🎵 YouTube script loaded');
    script.onerror = () => {
      console.log('🎵 YouTube script failed, using audio fallback');
      setYoutubeError(true);
    };
    
    document.body.appendChild(script);

    window.onYouTubeIframeAPIReady = () => {
      console.log('🎵 YouTube API ready');
      setYoutubeReady(true);
    };

    // Fallback timeout
    setTimeout(() => {
      if (!youtubeReady) {
        console.log('🎵 YouTube API timeout, using audio fallback');
        setYoutubeError(true);
      }
    }, 8000);

  }, [isMusicEnabled, youtubeVideoId, youtubeReady]);

  // Initialize YouTube player
  useEffect(() => {
    if (!youtubeReady || !playerRef.current || !youtubeVideoId || !isMusicEnabled || youtubeError) return;

    console.log('🎵 Creating YouTube player');

    try {
      const player = new window.YT.Player(playerRef.current, {
        height: '1',
        width: '1',
        videoId: youtubeVideoId,
        playerVars: {
          autoplay: 1,
          loop: 1,
          playlist: youtubeVideoId,
          controls: 0,
          showinfo: 0,
          rel: 0,
          fs: 0,
          cc_load_policy: 0,
          iv_load_policy: 3,
          modestbranding: 1,
          mute: 0,
          playsinline: 1,
        },
        events: {
          onReady: (event: any) => {
            console.log('🎵 YouTube player ready');
            event.target.setVolume(musicVolume * 100);
            
            if (tournamentStatus !== TournamentStatus.ONLINE) {
              event.target.playVideo();
              setIsPlaying(true);
            }
          },
          onStateChange: (event: any) => {
            const state = event.data;
            if (state === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
              // Pause audio fallback if YouTube is playing
              if (audioRef.current && !audioRef.current.paused) {
                audioRef.current.pause();
              }
            } else if (state === window.YT.PlayerState.PAUSED) {
              setIsPlaying(false);
            }
          },
          onError: (event: any) => {
            console.error('🎵 YouTube error:', event.data);
            setYoutubeError(true);
          }
        }
      });

      setYoutubePlayer(player);

    } catch (error) {
      console.error('🎵 YouTube player creation failed:', error);
      setYoutubeError(true);
    }

  }, [youtubeReady, youtubeVideoId, isMusicEnabled, youtubeError]);

  // Audio fallback logic
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !isMusicEnabled || (!youtubeError && youtubePlayer)) return;

    console.log('🎵 Using audio fallback');

    if (tournamentStatus !== TournamentStatus.ONLINE && userInteracted && !isPlaying) {
      audio.play()
        .then(() => {
          setIsPlaying(true);
          console.log('🎵 Audio fallback playing');
        })
        .catch((error) => {
          console.log('🎵 Audio fallback failed:', error);
        });
    } else if (tournamentStatus === TournamentStatus.ONLINE && isPlaying) {
      audio.pause();
      setIsPlaying(false);
    }

  }, [tournamentStatus, isMusicEnabled, userInteracted, youtubeError, youtubePlayer, isPlaying]);

  // Handle tournament status changes
  useEffect(() => {
    if (tournamentStatus === TournamentStatus.ONLINE && isPlaying) {
      // Pause music during tournament
      if (youtubePlayer && !youtubeError) {
        youtubePlayer.pauseVideo();
      } else if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
    } else if (tournamentStatus !== TournamentStatus.ONLINE && !isPlaying && isMusicEnabled) {
      // Resume music
      if (youtubePlayer && !youtubeError) {
        youtubePlayer.playVideo();
      } else if (audioRef.current && userInteracted) {
        audioRef.current.play().catch(console.log);
      }
    }
  }, [tournamentStatus, youtubePlayer, youtubeError, isPlaying, isMusicEnabled, userInteracted]);

  // Handle volume changes
  useEffect(() => {
    if (youtubePlayer && !youtubeError) {
      youtubePlayer.setVolume(musicVolume * 100);
    }
    if (audioRef.current) {
      audioRef.current.volume = musicVolume;
    }
  }, [musicVolume, youtubePlayer, youtubeError]);

  if (!isMusicEnabled) return null;

  return (
    <div style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}>
      {/* YouTube Player */}
      {!youtubeError && <div ref={playerRef} />}
      
      {/* Audio Fallback */}
      <audio 
        ref={audioRef} 
        loop 
        preload="auto"
        style={{ display: 'none' }}
      >
        <source src={backgroundMusicUrl} type="audio/mpeg" />
        <source src={backgroundMusicUrl} type="audio/wav" />
        <source src={backgroundMusicUrl} type="audio/ogg" />
      </audio>
      
      {/* Debug info */}
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
          🎵 {youtubeError ? 'Audio' : 'YouTube'}: {isPlaying ? 'Playing' : 'Paused'} | 
          User: {userInteracted ? 'Yes' : 'No'}
        </div>
      )}
    </div>
  );
};

export default HybridBackgroundMusic;
