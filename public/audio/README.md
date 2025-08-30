# Audio Files untuk Sistem Dam Aji

## Background Music
- **background.mp3** - Lagu background 3 minit (autoplay sebelum tournament start)
  - Format: MP3, 128kbps
  - Duration: ~3 minit
  - Size: ~1MB (compressed)

## Sound Effects
- **success.mp3** - Login success sound (~50KB)
- **tournament-start.mp3** - Tournament start sound (~100KB)
- **match-complete.mp3** - Match completion sound (~75KB)

## Audio Requirements
1. **Background Music**: 
   - 3 minit duration
   - Instrumental/ambient music
   - Loop-friendly (smooth transition)
   - Compressed untuk web (128kbps MP3)

2. **Sound Effects**:
   - Short duration (1-3 saat)
   - Clear, professional sounds
   - Small file sizes

## Implementation
- Music autoplay bila user masuk frontend
- Auto-pause bila tournament status = ONLINE
- Resume bila tournament balik OFFLINE
- User control untuk manual pause/resume
- Volume control
- Audio enable/disable toggle

## Browser Compatibility
- Modern browsers support HTML5 audio
- Autoplay policies handled dengan graceful fallback
- User interaction required untuk autoplay dalam sesetengah browser
