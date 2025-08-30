// Helper utilities for the Dam Aji Tournament System

import { Player, Match, TournamentFormat, TournamentStatus } from '../types';

// Format player name for display (First Name + Last Initial)
export const formatPlayerName = (fullName: string, maxLength: number = 20): string => {
  if (!fullName) return '';
  
  const parts = fullName.trim().split(/\s+/);
  if (parts.length <= 1) return fullName.substring(0, maxLength);
  
  const firstName = parts[0];
  const lastName = parts[parts.length - 1];
  const formatted = `${firstName} ${lastName.charAt(0)}.`;
  
  return formatted.length > maxLength ? 
    `${firstName.substring(0, maxLength - 3)}...` : 
    formatted;
};

// Format IC number for display
export const formatICNumber = (icNumber: string): string => {
  if (!icNumber) return '';
  
  const cleaned = icNumber.replace(/[-\s]/g, '');
  if (cleaned.length === 12) {
    return `${cleaned.substring(0, 6)}-${cleaned.substring(6, 8)}-${cleaned.substring(8)}`;
  }
  
  return icNumber;
};

// Format phone number for display
export const formatPhoneNumber = (phoneNumber: string): string => {
  if (!phoneNumber) return '';
  
  const cleaned = phoneNumber.replace(/[-\s()]/g, '');
  
  // Malaysian mobile format: 01X-XXXXXXX
  if (cleaned.match(/^(\+?6?0)(1[0-9])\d{7,8}$/)) {
    const withoutCountryCode = cleaned.replace(/^\+?6?0/, '0');
    return `${withoutCountryCode.substring(0, 3)}-${withoutCountryCode.substring(3)}`;
  }
  
  // Malaysian landline format: 0X-XXXXXXXX
  if (cleaned.match(/^(\+?6?0)[3-9]\d{7,8}$/)) {
    const withoutCountryCode = cleaned.replace(/^\+?6?0/, '0');
    return `${withoutCountryCode.substring(0, 2)}-${withoutCountryCode.substring(2)}`;
  }
  
  return phoneNumber;
};

// Generate unique ID for players
export const generatePlayerId = (existingPlayers: Player[]): string => {
  const existingIds = existingPlayers.map(p => parseInt(p.id));
  const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 0;
  return (maxId + 1).toString().padStart(3, '0');
};

// Calculate tournament statistics
export const calculateTournamentStats = (players: Player[], matches: Match[]) => {
  const totalMatches = matches.length;
  const completedMatches = matches.filter(m => m.isFinished).length;
  const pendingMatches = totalMatches - completedMatches;
  
  const activePlayers = players.filter(p => p.active).length;
  const eliminatedPlayers = players.length - activePlayers;
  
  const totalWins = players.reduce((sum, p) => sum + p.wins, 0);
  const totalLosses = players.reduce((sum, p) => sum + p.losses, 0);
  const totalDraws = players.reduce((sum, p) => sum + p.draws, 0);
  
  return {
    totalPlayers: players.length,
    activePlayers,
    eliminatedPlayers,
    totalMatches,
    completedMatches,
    pendingMatches,
    totalWins,
    totalLosses,
    totalDraws,
    completionPercentage: totalMatches > 0 ? Math.round((completedMatches / totalMatches) * 100) : 0
  };
};

// Get player ranking based on format
export const getPlayerRanking = (players: Player[], format: TournamentFormat, matches?: Match[], status?: TournamentStatus): Player[] => {
  if (format === TournamentFormat.LEAGUE) {
    return [...players].sort((a, b) => {
      // Sort by points first, then by goal difference (wins - losses), then by wins
      if (b.points !== a.points) return b.points - a.points;
      if ((b.wins - b.losses) !== (a.wins - a.losses)) return (b.wins - b.losses) - (a.wins - a.losses);
      return b.wins - a.wins;
    });
  } else {
    // Knockout format
    if (status === TournamentStatus.FINISHED && matches) {
      return [...players].sort((a, b) => {
        // Get tournament positions for proper ranking
        const getPlayerRank = (player: Player): number => {
          const finalMatch = matches.find(m => m.stage === 'Final');
          if (finalMatch?.winnerId === player.id) return 1; // Juara

          const finalLoserId = finalMatch?.playerA.id === finalMatch?.winnerId ? finalMatch?.playerB?.id : finalMatch?.playerA.id;
          if (finalLoserId === player.id) return 2; // Naib Juara

          const thirdPlaceMatch = matches.find(m => m.stage === 'Penentuan Tempat Ke-3/4');
          if (thirdPlaceMatch?.winnerId === player.id) return 3; // Tempat Ke-3

          const thirdPlaceLoserId = thirdPlaceMatch?.playerA.id === thirdPlaceMatch?.winnerId ? thirdPlaceMatch?.playerB?.id : thirdPlaceMatch?.playerA.id;
          if (thirdPlaceLoserId === player.id) return 4; // Tempat Ke-4

          // For other players, rank by wins then losses
          return 100 - player.wins + player.losses;
        };

        return getPlayerRank(a) - getPlayerRank(b);
      });
    } else {
      // During tournament, sort by wins, then by losses
      return [...players].sort((a, b) => {
        if (b.wins !== a.wins) return b.wins - a.wins;
        return a.losses - b.losses;
      });
    }
  }
};

// Get match stage name in Malay
export const getMatchStageName = (playerCount: number): string => {
  if (playerCount === 2) return 'Final';
  if (playerCount === 4) return 'Separuh Akhir';
  if (playerCount <= 8) return 'Suku Akhir';
  if (playerCount <= 16) return 'Pusingan 16';
  if (playerCount <= 32) return 'Pusingan 32';
  return `Pusingan ${playerCount}`;
};

// Calculate next round players for knockout
export const getNextRoundPlayers = (matches: Match[], currentRound: number): Player[] => {
  return matches
    .filter(m => m.round === currentRound && m.winnerId)
    .map(m => {
      // Find the winner player object
      if (m.winnerId === m.playerA.id) return m.playerA;
      if (m.playerB && m.winnerId === m.playerB.id) return m.playerB;
      return null;
    })
    .filter((p): p is Player => p !== null);
};

// Shuffle array using Fisher-Yates algorithm
export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Format date for Malaysian locale
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('ms-MY', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Format time for Malaysian locale
export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('ms-MY', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

// Debounce function for search inputs
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Local storage helpers with error handling
export const storage = {
  get: <T>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading from localStorage key "${key}":`, error);
      return defaultValue;
    }
  },
  
  set: <T>(key: string, value: T): boolean => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error writing to localStorage key "${key}":`, error);
      return false;
    }
  },
  
  remove: (key: string): boolean => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
      return false;
    }
  }
};

// Export data as JSON
export const exportToJSON = (data: any, filename: string): void => {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

// Copy text to clipboard
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};
