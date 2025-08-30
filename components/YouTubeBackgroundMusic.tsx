import React, { useEffect, useRef, useState } from 'react';
import { TournamentStatus } from '../types';
import { useTournamentStore } from '../hooks/useTournamentStore';

interface YouTubeBackgroundMusicProps {
  tournamentStatus: TournamentStatus;
}

// YouTube IFrame API types
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

const YouTubeBackgroundMusic: React.FC<YouTubeBackgroundMusicProps> = ({ tournamentStatus }) => {
  const { youtubeVideoId, isMusicEnabled, musicVolume } = useTournamentStore();
  const [player, setPlayer] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [apiReady, setApiReady] = useState(false);
  const playerRef = useRef<HTMLDivElement>(null);

  // Load YouTube IFrame API with error handling
  useEffect(() => {
    if (window.YT && window.YT.Player) {
      console.log('🎵 YouTube API already loaded');
      setApiReady(true);
      return;
    }

    // Check if script already exists
    const existingScript = document.querySelector('script[src*="youtube.com/iframe_api"]');
    if (existingScript) {
      console.log('🎵 YouTube API script already exists, waiting...');
      // Wait for API to be ready
      const checkAPI = setInterval(() => {
        if (window.YT && window.YT.Player) {
          console.log('🎵 YouTube API ready (existing script)');
          setApiReady(true);
          clearInterval(checkAPI);
        }
      }, 100);

      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkAPI);
        console.error('🎵 YouTube API timeout');
      }, 10000);

      return;
    }

    console.log('🎵 Loading YouTube API script...');

    // Load YouTube API script
    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    script.async = true;

    script.onload = () => {
      console.log('🎵 YouTube API script loaded');
    };

    script.onerror = () => {
      console.error('🎵 Failed to load YouTube API script');
    };

    document.body.appendChild(script);

    // Set up API ready callback
    window.onYouTubeIframeAPIReady = () => {
      console.log('🎵 YouTube API ready callback triggered');
      setApiReady(true);
    };

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  // Initialize YouTube player when API is ready
  useEffect(() => {
    if (!apiReady || !playerRef.current || !youtubeVideoId || !isMusicEnabled) {
      console.log('🎵 Player init conditions not met:', {
        apiReady,
        hasPlayerRef: !!playerRef.current,
        youtubeVideoId,
        isMusicEnabled
      });
      return;
    }

    console.log('🎵 Initializing YouTube player with video ID:', youtubeVideoId);

    try {
      const newPlayer = new window.YT.Player(playerRef.current, {
        height: '1',
        width: '1',
        videoId: youtubeVideoId,
        playerVars: {
          autoplay: 1,
          loop: 1,
          playlist: youtubeVideoId, // Required for loop to work
          controls: 0,
          showinfo: 0,
          rel: 0,
          fs: 0,
          cc_load_policy: 0,
          iv_load_policy: 3,
          modestbranding: 1,
          mute: 0,
          start: 0,
          playsinline: 1,
        },
        events: {
          onReady: (event: any) => {
            console.log('🎵 YouTube player ready');
            try {
              event.target.setVolume(musicVolume * 100);

              // Auto-play if tournament is not online
              if (tournamentStatus !== TournamentStatus.ONLINE) {
                event.target.playVideo();
                setIsPlaying(true);
                console.log('🎵 YouTube music started');
              }
            } catch (error) {
              console.error('🎵 Error in onReady:', error);
            }
          },
          onStateChange: (event: any) => {
            try {
              const state = event.data;
              console.log('🎵 YouTube player state changed:', state);

              if (state === window.YT.PlayerState.PLAYING) {
                setIsPlaying(true);
                console.log('🎵 YouTube music playing');
              } else if (state === window.YT.PlayerState.PAUSED) {
                setIsPlaying(false);
                console.log('🎵 YouTube music paused');
              } else if (state === window.YT.PlayerState.ENDED) {
                // Loop the video
                event.target.playVideo();
              }
            } catch (error) {
              console.error('🎵 Error in onStateChange:', error);
            }
          },
          onError: (event: any) => {
            console.error('🎵 YouTube player error:', event.data);
            // Error codes: 2=invalid video ID, 5=HTML5 player error, 100=video not found, 101/150=private/restricted
            const errorMessages = {
              2: 'Invalid video ID',
              5: 'HTML5 player error',
              100: 'Video not found',
              101: 'Video is private',
              150: 'Video is restricted'
            };
            console.error('🎵 Error meaning:', errorMessages[event.data as keyof typeof errorMessages] || 'Unknown error');
          }
        }
      });

      setPlayer(newPlayer);
      console.log('🎵 YouTube player created successfully');

    } catch (error) {
      console.error('🎵 Failed to create YouTube player:', error);
    }

    return () => {
      try {
        if (player && player.destroy) {
          player.destroy();
          console.log('🎵 YouTube player destroyed');
        }
      } catch (error) {
        console.error('🎵 Error destroying player:', error);
      }
    };
  }, [apiReady, youtubeVideoId, isMusicEnabled]);

  // Handle tournament status changes
  useEffect(() => {
    if (!player) return;

    console.log('🎵 Tournament status changed:', tournamentStatus);

    if (tournamentStatus === TournamentStatus.ONLINE && isPlaying) {
      // Pause music during tournament
      player.pauseVideo();
      console.log('🎵 YouTube music paused for tournament');
    } else if (tournamentStatus !== TournamentStatus.ONLINE && !isPlaying && isMusicEnabled) {
      // Resume music when tournament is not active
      player.playVideo();
      console.log('🎵 YouTube music resumed after tournament');
    }
  }, [tournamentStatus, player, isPlaying, isMusicEnabled]);

  // Handle volume changes
  useEffect(() => {
    if (player && player.setVolume) {
      player.setVolume(musicVolume * 100);
      console.log('🎵 YouTube volume set to:', Math.round(musicVolume * 100) + '%');
    }
  }, [musicVolume, player]);

  // Handle music enabled/disabled
  useEffect(() => {
    if (!player) return;

    if (!isMusicEnabled && isPlaying) {
      player.pauseVideo();
      console.log('🎵 YouTube music disabled by admin');
    } else if (isMusicEnabled && !isPlaying && tournamentStatus !== TournamentStatus.ONLINE) {
      player.playVideo();
      console.log('🎵 YouTube music enabled by admin');
    }
  }, [isMusicEnabled, player, isPlaying, tournamentStatus]);

  // Handle video ID changes
  useEffect(() => {
    if (player && player.loadVideoById && youtubeVideoId) {
      console.log('🎵 Loading new YouTube video:', youtubeVideoId);
      player.loadVideoById({
        videoId: youtubeVideoId,
        startSeconds: 0
      });
    }
  }, [youtubeVideoId, player]);

  // Don't render if music is disabled
  if (!isMusicEnabled) {
    console.log('🎵 YouTube music disabled by admin');
    return null;
  }

  return (
    <div style={{ 
      position: 'absolute', 
      top: '-9999px', 
      left: '-9999px',
      width: '1px',
      height: '1px',
      overflow: 'hidden'
    }}>
      <div ref={playerRef} />
      
      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{ 
          position: 'fixed', 
          bottom: '50px', 
          right: '10px', 
          background: 'rgba(0,0,0,0.8)', 
          color: 'white', 
          padding: '5px 10px', 
          borderRadius: '5px',
          fontSize: '12px',
          zIndex: 1000
        }}>
          🎵 YouTube: {isPlaying ? 'Playing' : 'Paused'} | 
          Video: {youtubeVideoId} | 
          Vol: {Math.round(musicVolume * 100)}%
        </div>
      )}
    </div>
  );
};

export default YouTubeBackgroundMusic;
