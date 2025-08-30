


import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { produce } from 'immer';
import { TournamentStatus, TournamentFormat, TournamentMode, PairingStatus, Player, Match, ManualPairing } from '../types';
import { validatePlayerName, validateAssociation, validateICNumber, validatePhoneNumber, checkDuplicatePlayer } from '../utils/validation';
import { generatePlayerId, shuffleArray } from '../utils/helpers';

interface TournamentState {
  status: TournamentStatus;
  format: TournamentFormat;
  mode: TournamentMode;
  players: Player[];
  matches: Match[];
  manualPairings: ManualPairing[];
  pairingStatus: PairingStatus;
  currentRound: number;
  isRoundtable: boolean;
  welcomeMessage: string;
  footerText: string;
  eventDetails: string;
  lkimLogoUrl: string;
  madaniLogoUrl: string;
  backgroundImageUrl: string;
  isSystemLocked: boolean;
  // Music settings
  backgroundMusicUrl: string;
  youtubeVideoId: string;
  isMusicEnabled: boolean;
  musicVolume: number;
}

interface TournamentActions {
  addPlayer: (name: string, association: string, icNumber?: string, phoneNumber?: string) => { success: boolean; error?: string };
  removePlayer: (id: string) => { success: boolean; error?: string };
  updatePlayer: (id: string, name: string, association: string, icNumber?: string, phoneNumber?: string) => { success: boolean; error?: string };
  setWelcomeMessage: (message: string) => void;
  setFooterText: (text: string) => void;
  setEventDetails: (details: string) => void;
  setLkimLogoUrl: (url: string) => void;
  setMadaniLogoUrl: (url: string) => void;
  setBackgroundImageUrl: (url: string) => void;
  toggleSystemLock: () => void;
  setFormat: (format: TournamentFormat) => void;
  setStatus: (status: TournamentStatus) => void;
  setMode: (mode: TournamentMode) => void;
  generateNextRound: () => { success: boolean; error?: string };
  setMatchWinner: (matchId: string, winnerId: string) => { success: boolean; error?: string };
  setMatchDraw: (matchId: string) => { success: boolean; error?: string };
  resetTournament: () => void;
  exportTournamentData: () => void;
  // Music settings actions
  setBackgroundMusicUrl: (url: string) => void;
  setYoutubeVideoId: (videoId: string) => void;
  setMusicEnabled: (enabled: boolean) => void;
  setMusicVolume: (volume: number) => void;
  // Manual pairing actions
  addManualPairing: (round: number, table: number, playerAId: string, playerBId: string) => { success: boolean; error?: string };
  updateManualPairing: (pairingId: string, playerAId: string, playerBId: string) => { success: boolean; error?: string };
  removeManualPairing: (pairingId: string) => { success: boolean; error?: string };
  lockPairings: () => { success: boolean; error?: string };
  unlockPairings: () => void;
  confirmPairings: () => { success: boolean; error?: string };
  importPairings: (pairings: { table: number; playerAId: string; playerBId: string }[]) => { success: boolean; error?: string };
}

const testPlayers: Player[] = [
    { id: '001', name: 'Ahmad bin Abdullah', association: 'Persatuan Dam Negeri Sembilan', icNumber: '850101-05-1234', phoneNumber: '012-3456789', wins: 0, losses: 0, draws: 0, points: 0, active: true },
    { id: '002', name: 'Siti Nurhaliza binti Kamal', association: 'Kelab Sukan Komuniti Johor', wins: 0, losses: 0, draws: 0, points: 0, active: true },
    { id: '003', name: 'Lim Wei Chong', association: 'Majlis Sukan Pulau Pinang', icNumber: '920315-07-5566', phoneNumber: '019-8765432', wins: 0, losses: 0, draws: 0, points: 0, active: true },
    { id: '004', name: 'Muthu a/l Ramasamy', association: 'Komuniti India Perak', wins: 0, losses: 0, draws: 0, points: 0, active: true },
    { id: '005', name: 'Nurul Huda binti Hassan', association: 'Daerah Kuala Terengganu', wins: 0, losses: 0, draws: 0, points: 0, active: true },
    { id: '006', name: 'Jason Tan', association: 'Persatuan Belia Melaka', icNumber: '881122-04-1212', phoneNumber: '011-2233445', wins: 0, losses: 0, draws: 0, points: 0, active: true },
    { id: '007', name: 'Brenda anak Stephen', association: 'Majlis Sukan Sarawak', wins: 0, losses: 0, draws: 0, points: 0, active: true },
    { id: '008', name: 'Zulkifli bin Mohamad', association: 'Kelab Dam Kuantan', wins: 0, losses: 0, draws: 0, points: 0, active: true },
    { id: '009', name: 'Aisyah binti Razak', association: 'Daerah Kota Bharu', icNumber: '950701-03-3434', phoneNumber: '013-4567890', wins: 0, losses: 0, draws: 0, points: 0, active: true },
    { id: '010', name: 'David Lee', association: 'Komuniti Sukan Selangor', wins: 0, losses: 0, draws: 0, points: 0, active: true },
    { id: '011', name: 'Fatimah binti Ali', association: 'Persatuan Nelayan Kedah', wins: 0, losses: 0, draws: 0, points: 0, active: true },
    { id: '012', name: 'Goh Boon Siew', association: 'Daerah Alor Setar', icNumber: '790420-02-9876', phoneNumber: '016-5554321', wins: 0, losses: 0, draws: 0, points: 0, active: true },
    { id: '013', name: 'Harith Iskander bin Jamal', association: 'Kelab Komedi Dam', wins: 0, losses: 0, draws: 0, points: 0, active: true },
    { id: '014', name: 'Indrani a/p Subramaniam', association: 'Majlis Sukan Wilayah Persekutuan', wins: 0, losses: 0, draws: 0, points: 0, active: true },
    { id: '015', name: 'Jamaludin bin Osman', association: 'Daerah Perlis', icNumber: '830818-09-2468', phoneNumber: '017-7788990', wins: 0, losses: 0, draws: 0, points: 0, active: true },
    { id: '016', name: 'Karen Wong', association: 'Komuniti Cina Sabah', wins: 0, losses: 0, draws: 0, points: 0, active: true },
    { id: '017', name: 'Lokman bin Hakim', association: 'Persatuan Sukan Pahang', wins: 0, losses: 0, draws: 0, points: 0, active: true },
    { id: '018', name: 'Mei Ling', association: 'Kelab Dam Ipoh', wins: 0, losses: 0, draws: 0, points: 0, active: true },
    { id: '019', name: 'Noraini binti Ahmad', association: 'Daerah Shah Alam', icNumber: '900101-10-1122', phoneNumber: '014-1231234', wins: 0, losses: 0, draws: 0, points: 0, active: true },
    { id: '020', name: 'Omar bin Sharif', association: 'Persatuan Belia Seremban', wins: 0, losses: 0, draws: 0, points: 0, active: true },
    { id: '021', name: 'Priya a/p Kumar', association: 'Majlis Sukan Negeri Sembilan', wins: 0, losses: 0, draws: 0, points: 0, active: true },
    { id: '022', name: 'Qamarul bin Zaman', association: 'Daerah Johor Bahru', wins: 0, losses: 0, draws: 0, points: 0, active: true },
    { id: '023', name: 'Rosmah binti Mansor', association: 'Kelab Wanita Dam', icNumber: '860606-06-6543', phoneNumber: '018-9876543', wins: 0, losses: 0, draws: 0, points: 0, active: true },
    { id: '024', name: 'Steven Chong', association: 'Komuniti Sukan Kuching', wins: 0, losses: 0, draws: 0, points: 0, active: true },
    { id: '025', name: 'Tunku Abdul Rahman', association: 'Kelab Diraja Dam', wins: 0, losses: 0, draws: 0, points: 0, active: true },
    { id: '026', name: 'Usha a/p Govindasamy', association: 'Persatuan India Selangor', wins: 0, losses: 0, draws: 0, points: 0, active: true },
    { id: '027', name: 'Vincent Tan', association: 'Majlis Sukan Kuala Lumpur', icNumber: '750505-14-5050', phoneNumber: '012-2121212', wins: 0, losses: 0, draws: 0, points: 0, active: true },
    { id: '028', name: 'Wan Azizah binti Wan Ismail', association: 'Daerah Petaling Jaya', wins: 0, losses: 0, draws: 0, points: 0, active: true },
    { id: '029', name: 'Xavier Lee', association: 'Komuniti Belia Pulau Pinang', wins: 0, losses: 0, draws: 0, points: 0, active: true },
    { id: '030', name: 'Yasmin binti Ahmad', association: 'Kelab Filem Dam', wins: 0, losses: 0, draws: 0, points: 0, active: true },
    { id: '031', name: 'Zainal Abidin bin Hassan', association: 'Lagenda Bola Dam', icNumber: '680808-08-8888', phoneNumber: '019-9998888', wins: 0, losses: 0, draws: 0, points: 0, active: true },
    { id: '032', name: 'Amelia binti Rosli', association: 'Persatuan Sukan Air', wins: 0, losses: 0, draws: 0, points: 0, active: true },
    { id: '033', name: 'Benjamin Leong', association: 'Kelab Catur Dam', wins: 0, losses: 0, draws: 0, points: 0, active: true },
    { id: '034', name: 'Cynthia Fernandez', association: 'Komuniti Eurasia Melaka', wins: 0, losses: 0, draws: 0, points: 0, active: true },
    { id: '035', name: 'Daniel bin Abdullah', association: 'Majlis Sukan Sekolah', icNumber: '991231-10-5432', phoneNumber: '016-1110000', wins: 0, losses: 0, draws: 0, points: 0, active: true },
    { id: '036', name: 'Evelyn Teh', association: 'Daerah Georgetown', wins: 0, losses: 0, draws: 0, points: 0, active: true },
    { id: '037', name: 'Farid Kamil bin Zahari', association: 'Kelab Artis Dam', wins: 0, losses: 0, draws: 0, points: 0, active: true },
    { id: '038', name: 'Ganesh a/l Murthy', association: 'Persatuan Kuil Dam', wins: 0, losses: 0, draws: 0, points: 0, active: true },
    { id: '039', name: 'Hafiz bin Suip', association: 'Kelab Juara Lagu Dam', wins: 0, losses: 0, draws: 0, points: 0, active: true },
    { id: '040', name: 'Ibrahim bin Pendek', association: 'Lagenda Filem Klasik', icNumber: '300303-03-3030', phoneNumber: '010-3030303', wins: 0, losses: 0, draws: 0, points: 0, active: true },
];

const getInitialState = (): TournamentState => ({
  status: TournamentStatus.OFFLINE,
  format: TournamentFormat.NOT_SELECTED,
  mode: TournamentMode.AUTO,
  players: JSON.parse(JSON.stringify(testPlayers)),
  matches: [],
  manualPairings: [],
  pairingStatus: PairingStatus.DRAFT,
  currentRound: 0,
  isRoundtable: false,
  welcomeMessage: "Selamat Datang\nPertandingan Dam Aji\nLKIM 2025",
  footerText: '© 2025 Persatuan Nelayan Kawasan Semerak. Semua hak cipta terpelihara.',
  eventDetails: "GELOMBANG SAMUDERA MADANI",
  lkimLogoUrl: "https://upload.wikimedia.org/wikipedia/ms/b/b5/Logo_LKIM.png",
  madaniLogoUrl: "https://ecentral.my/wp-content/uploads/2023/05/LOGO-MALAYSIA-MADANI-DENGAN-PERKATAAN-1024x428.png",
  backgroundImageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQvtQ4-QytSLFUJSXDdtpTHkYx5d4-f630rLQ&s",
  isSystemLocked: false,
  // Music settings - YouTube default
  backgroundMusicUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
  youtubeVideoId: "OYaFysVh_qU", // Default YouTube video ID
  isMusicEnabled: true,
  musicVolume: 0.4,
});

export const useTournamentStore = create<TournamentState & TournamentActions>()(
  persist(
    (set, get) => ({
      ...getInitialState(),

      addPlayer: (name, association, icNumber, phoneNumber) => {
        try {
          // Validate inputs
          const nameValidation = validatePlayerName(name);
          if (!nameValidation.isValid) {
            return { success: false, error: nameValidation.error };
          }

          const associationValidation = validateAssociation(association);
          if (!associationValidation.isValid) {
            return { success: false, error: associationValidation.error };
          }

          const icValidation = validateICNumber(icNumber || '');
          if (!icValidation.isValid) {
            return { success: false, error: icValidation.error };
          }

          const phoneValidation = validatePhoneNumber(phoneNumber || '');
          if (!phoneValidation.isValid) {
            return { success: false, error: phoneValidation.error };
          }

          // Check for duplicate names
          const duplicateCheck = checkDuplicatePlayer(name, get().players);
          if (!duplicateCheck.isValid) {
            return { success: false, error: duplicateCheck.error };
          }

          const newId = generatePlayerId(get().players);
          const newPlayer: Player = {
            id: newId,
            name: name.trim(),
            association: association.trim(),
            icNumber: icNumber?.trim() || undefined,
            phoneNumber: phoneNumber?.trim() || undefined,
            wins: 0,
            losses: 0,
            draws: 0,
            points: 0,
            active: true
          };

          set(produce((state: TournamentState) => {
            state.players.push(newPlayer);
          }));

          return { success: true };
        } catch (error) {
          console.error('Error adding player:', error);
          return { success: false, error: 'Ralat tidak dijangka semasa menambah pemain' };
        }
      },
      
      removePlayer: (id) => {
        try {
          const state = get();
          const playerExists = state.players.some(p => p.id === id);

          if (!playerExists) {
            return { success: false, error: 'Pemain tidak dijumpai' };
          }

          if (state.status !== TournamentStatus.OFFLINE) {
            return { success: false, error: 'Pemain hanya boleh dipadamkan semasa status OFFLINE' };
          }

          set(produce((state: TournamentState) => {
            state.players = state.players.filter(p => p.id !== id);
          }));

          return { success: true };
        } catch (error) {
          console.error('Error removing player:', error);
          return { success: false, error: 'Ralat tidak dijangka semasa memadam pemain' };
        }
      },
      
      updatePlayer: (id, name, association, icNumber, phoneNumber) => {
        try {
          // Validate inputs
          const nameValidation = validatePlayerName(name);
          if (!nameValidation.isValid) {
            return { success: false, error: nameValidation.error };
          }

          const associationValidation = validateAssociation(association);
          if (!associationValidation.isValid) {
            return { success: false, error: associationValidation.error };
          }

          const icValidation = validateICNumber(icNumber || '');
          if (!icValidation.isValid) {
            return { success: false, error: icValidation.error };
          }

          const phoneValidation = validatePhoneNumber(phoneNumber || '');
          if (!phoneValidation.isValid) {
            return { success: false, error: phoneValidation.error };
          }

          // Check for duplicate names (excluding current player)
          const duplicateCheck = checkDuplicatePlayer(name, get().players, id);
          if (!duplicateCheck.isValid) {
            return { success: false, error: duplicateCheck.error };
          }

          set(produce((state: TournamentState) => {
            const player = state.players.find(p => p.id === id);
            if (player) {
              player.name = name.trim();
              player.association = association.trim();
              player.icNumber = icNumber?.trim() || undefined;
              player.phoneNumber = phoneNumber?.trim() || undefined;
            }
          }));

          return { success: true };
        } catch (error) {
          console.error('Error updating player:', error);
          return { success: false, error: 'Ralat tidak dijangka semasa mengemaskini pemain' };
        }
      },

      setWelcomeMessage: (message) => set({ welcomeMessage: message }),
      setFooterText: (text) => set({ footerText: text }),
      setEventDetails: (details) => set({ eventDetails: details }),
      setLkimLogoUrl: (url) => set({ lkimLogoUrl: url }),
      setMadaniLogoUrl: (url) => set({ madaniLogoUrl: url }),
      setBackgroundImageUrl: (url) => set({ backgroundImageUrl: url }),
      toggleSystemLock: () => set((state) => ({ isSystemLocked: !state.isSystemLocked })),
      setFormat: (format) => set({ format }),
      setStatus: (status) => set({ status }),
      setMode: (mode) => set({ mode }),

      generateNextRound: () => {
        try {
          const state = get();
          const { format, mode, players, currentRound, matches, manualPairings, pairingStatus } = state;

          if (format === TournamentFormat.NOT_SELECTED) {
            return { success: false, error: 'Sila pilih format pertandingan terlebih dahulu' };
          }

          if (players.length < 2) {
            return { success: false, error: 'Sekurang-kurangnya 2 pemain diperlukan untuk memulakan pertandingan' };
          }

          // Liga requires even number of players to avoid BYE
          if (format === TournamentFormat.LEAGUE && players.filter(p => p.active).length % 2 !== 0) {
            return { success: false, error: 'Liga memerlukan bilangan pemain genap untuk mengelakkan BYE. Sila tambah atau buang seorang pemain.' };
          }

          // Manual mode validation
          if (mode === TournamentMode.MANUAL) {
            if (manualPairings.length === 0) {
              return { success: false, error: 'Tiada pasangan manual dijumpai. Sila tambah pasangan terlebih dahulu.' };
            }

            if (pairingStatus !== PairingStatus.CONFIRMED) {
              return { success: false, error: 'Pasangan manual belum disahkan. Sila sahkan pasangan terlebih dahulu.' };
            }
          }

          set(produce((state: TournamentState) => {

              const nextRound = currentRound + 1;

              // Manual mode - use manual pairings
              if (mode === TournamentMode.MANUAL && manualPairings.length > 0) {
                const newMatches: Match[] = [];

                for (const pairing of manualPairings) {
                  const playerA = players.find(p => p.id === pairing.playerAId);
                  const playerB = players.find(p => p.id === pairing.playerBId);

                  // Both players must exist (no BYE allowed)
                  if (playerA && playerB) {
                    newMatches.push({
                      id: `${nextRound}-${pairing.table}`,
                      round: nextRound,
                      table: pairing.table,
                      // No stage for regular matches - will show "Meja X"
                      playerA,
                      playerB,
                      winnerId: null,
                      isDraw: false,
                      isFinished: false,
                      isManualPairing: true
                    });
                  }
                }

                state.matches.push(...newMatches);
                state.currentRound = nextRound;

                // Clear manual pairings after use
                state.manualPairings = [];
                state.pairingStatus = PairingStatus.DRAFT;

                return;
              }

              if (format === TournamentFormat.LEAGUE) {
                  // Liga format - no BYE matches, all players must play
                  const activePlayers = players.filter(p => p.active);
                  const playerCount = activePlayers.length;
                  const totalRounds = playerCount - 1;

                  if (nextRound > totalRounds) {
                      alert("Semua pusingan liga telah selesai.");
                      state.status = TournamentStatus.FINISHED;
                      return;
                  }

                  // Round-robin algorithm without BYE
                  let playerIndices = activePlayers.map((_, i) => i);
                  for (let r = 0; r < nextRound - 1; r++) {
                      const last = playerIndices.pop();
                      if (last !== undefined) playerIndices.splice(1, 0, last);
                  }

                  const newMatches: Match[] = [];
                  const matchesPerRound = playerCount / 2;
                  for (let i = 0; i < matchesPerRound; i++) {
                      const playerA = activePlayers[playerIndices[i]];
                      const playerB = activePlayers[playerIndices[playerCount - 1 - i]];

                      newMatches.push({
                          id: `${nextRound}-${i + 1}`, round: nextRound, table: i + 1,
                          // No stage for Liga matches - will show "Meja X"
                          playerA, playerB,
                          winnerId: null, isDraw: false, isFinished: false,
                      });
                  }
                  state.matches.push(...newMatches);
                  state.currentRound = nextRound;
                  return;
              }


              
              // KNOCKOUT LOGIC - New Dam Aji Format
              let playersForNextRound: Player[];

              if (nextRound === 1) {
                  playersForNextRound = [...players].filter(p => p.active);
              } else {
                  // Get winners from previous round
                  if (state.isRoundtable) {
                      // From roundtable, get top players based on points
                      const roundtableMatches = matches.filter(m => m.round === currentRound);
                      const playerStats: Record<string, number> = {};

                      // Initialize all players with 0 points
                      playersForNextRound = matches
                          .filter(m => m.round === currentRound)
                          .flatMap(m => [m.playerA, m.playerB])
                          .filter((p, index, arr) => p && arr.findIndex(player => player?.id === p.id) === index) as Player[];

                      playersForNextRound.forEach(p => playerStats[p.id] = 0);

                      // Calculate points from roundtable matches
                      roundtableMatches.forEach(match => {
                          if (match.isFinished && match.winnerId) {
                              playerStats[match.winnerId] = (playerStats[match.winnerId] || 0) + 1;
                          }
                      });

                      // Sort by points and take top players (eliminate bottom player)
                      playersForNextRound = playersForNextRound
                          .sort((a, b) => (playerStats[b.id] || 0) - (playerStats[a.id] || 0))
                          .slice(0, -1); // Remove last player (lowest points)

                      state.isRoundtable = false; // Reset roundtable flag
                  } else {
                      // Standard knockout - get winners
                      playersForNextRound = matches
                          .filter(m => m.round === currentRound && m.winnerId)
                          .map(m => players.find(p => p.id === m.winnerId!))
                          .filter((p): p is Player => !!p);
                  }
              }

              const numPlayers = playersForNextRound.length;

              if (numPlayers <= 1) {
                   const finalMatch = matches.find(m => m.stage === 'Final');
                  if (finalMatch && finalMatch.isFinished) {
                      alert(`Pertandingan telah tamat.`);
                      state.status = TournamentStatus.FINISHED;
                  } else if (numPlayers === 1) {
                       alert(`Pertandingan tamat! Pemenang ialah ${playersForNextRound[0].name}.`);
                      state.status = TournamentStatus.FINISHED;
                  } else {
                      alert("Tidak cukup pemain aktif untuk menjana pusingan seterusnya.");
                  }
                  return;
              }

              const newMatches: Match[] = [];

              // NEW DAM AJI FORMAT LOGIC
              if (numPlayers % 2 !== 0) {
                  // ODD PLAYERS: ROUNDTABLE FORMAT (all vs all)
                  state.isRoundtable = true;
                  let tableCounter = 1;

                  for (let i = 0; i < playersForNextRound.length; i++) {
                      for (let j = i + 1; j < playersForNextRound.length; j++) {
                          const playerA = playersForNextRound[i];
                          const playerB = playersForNextRound[j];

                          newMatches.push({
                              id: `${nextRound}-${tableCounter}`, round: nextRound, table: tableCounter,
                              // No stage for Roundtable matches - will show "Meja X"
                              playerA, playerB,
                              winnerId: null, isDraw: false, isFinished: false,
                          });
                          tableCounter++;
                      }
                  }
              } else {
                  // EVEN PLAYERS: STANDARD PAIRING
                  state.isRoundtable = false;

                  // Shuffle players for random pairing
                  for (let i = playersForNextRound.length - 1; i > 0; i--) {
                      const j = Math.floor(Math.random() * (i + 1));
                      [playersForNextRound[i], playersForNextRound[j]] = [playersForNextRound[j], playersForNextRound[i]];
                  }

                  let stageName: string | undefined = undefined;

                  if (numPlayers === 2) {
                      stageName = 'Final';
                      const semiFinalMatches = matches.filter(m => m.stage === 'Separuh Akhir');
                      const lastRoundNumber = Math.max(...semiFinalMatches.map(m => m.round), 0);
                      const lastRoundMatches = semiFinalMatches.filter(m => m.round === lastRoundNumber);

                      const semiFinalLosers = lastRoundMatches
                        .filter(m => m.playerB !== null) // only consider actual matches
                        .map(m => {
                            const loserId = m.playerA.id === m.winnerId ? m.playerB?.id : m.playerA.id;
                            return players.find(p => p.id === loserId);
                        })
                        .filter(Boolean) as Player[];

                      // Add 3rd/4th place playoff FIRST (table 1)
                      if (semiFinalLosers.length === 2) {
                          newMatches.push({
                              id: `${nextRound}-1`, round: nextRound, table: 1, stage: 'Penentuan Tempat Ke-3/4',
                              playerA: semiFinalLosers[0], playerB: semiFinalLosers[1], winnerId: null, isDraw: false, isFinished: false,
                          });
                      }
                  } else if (numPlayers === 4) {
                      stageName = 'Separuh Akhir';
                  } else if (numPlayers <= 8) {
                      stageName = 'Suku Akhir';
                  }

                  // For final round, start table counter at 2 (since 3rd place playoff is table 1)
                  let tableCounter = (numPlayers === 2) ? 2 : 1;
                  let pairedPlayers = [...playersForNextRound];

                  while(pairedPlayers.length >= 2) {
                      const playerA = pairedPlayers.shift()!;
                      const playerB = pairedPlayers.shift()!;

                      newMatches.push({
                          id: `${nextRound}-${tableCounter}`, round: nextRound, table: tableCounter,
                          stage: stageName, playerA, playerB,
                          winnerId: null, isDraw: false, isFinished: false,
                      });
                      tableCounter++;
                  }
              }

              // Sort matches: 3rd place playoff first, then final
              newMatches.sort((a, b) => {
                  if (a.stage === 'Penentuan Tempat Ke-3/4') return -1;
                  if (b.stage === 'Penentuan Tempat Ke-3/4') return 1;
                  if (a.stage === 'Final') return 1;
                  if (b.stage === 'Final') return -1;
                  return a.table - b.table;
              });

              state.matches.push(...newMatches);
              state.currentRound = nextRound;
          }));

          return { success: true };
        } catch (error) {
          console.error('Error generating next round:', error);
          return { success: false, error: 'Ralat tidak dijangka semasa menjana pusingan seterusnya' };
        }
      },

      setMatchWinner: (matchId, winnerId) => {
        try {
          const state = get();
          const match = state.matches.find(m => m.id === matchId);

          if (!match) {
            return { success: false, error: 'Perlawanan tidak dijumpai' };
          }

          if (match.isFinished) {
            return { success: false, error: 'Perlawanan sudah selesai' };
          }

          const winner = state.players.find(p => p.id === winnerId);
          if (!winner) {
            return { success: false, error: 'Pemain pemenang tidak dijumpai' };
          }

          set(produce((state: TournamentState) => {
            const match = state.matches.find(m => m.id === matchId);
            if (!match || match.isFinished) return;

            match.winnerId = winnerId;
            match.isFinished = true;

            const winner = state.players.find(p => p.id === winnerId);
            const loserId = match.playerA.id === winnerId ? match.playerB?.id : match.playerA.id;
            const loser = state.players.find(p => p.id === loserId);

            if (winner) {
                winner.wins++;
                if (state.format === TournamentFormat.LEAGUE) winner.points += 3;
            }
            if (loser) {
                loser.losses++;
                if (state.format === TournamentFormat.KNOCKOUT) loser.active = false;
            }



            const finalMatch = state.matches.find(m => m.stage === 'Final');
            const thirdPlaceMatch = state.matches.find(m => m.stage === 'Penentuan Tempat Ke-3/4');

            if (finalMatch?.isFinished) {
                if (!thirdPlaceMatch || thirdPlaceMatch.isFinished) {
                    state.status = TournamentStatus.FINISHED;
                }
            }
          }));

          return { success: true };
        } catch (error) {
          console.error('Error setting match winner:', error);
          return { success: false, error: 'Ralat tidak dijangka semasa menetapkan pemenang' };
        }
      },

      setMatchDraw: (matchId) => {
        try {
          const state = get();
          const match = state.matches.find(m => m.id === matchId);

          if (!match) {
            return { success: false, error: 'Perlawanan tidak dijumpai' };
          }

          if (match.isFinished) {
            return { success: false, error: 'Perlawanan sudah selesai' };
          }

          if (state.format !== TournamentFormat.LEAGUE) {
            return { success: false, error: 'Seri hanya dibenarkan dalam format Liga' };
          }

          set(produce((state: TournamentState) => {
            const match = state.matches.find(m => m.id === matchId);
            if (!match || match.isFinished || state.format !== TournamentFormat.LEAGUE) return;

            match.isFinished = true;
            match.isDraw = true;

            const playerA = state.players.find(p => p.id === match.playerA.id);
            const playerB = state.players.find(p => p.id === match.playerB?.id);

            if (playerA) {
                playerA.draws++;
                if (state.format === TournamentFormat.LEAGUE) playerA.points += 1;
            }
            if (playerB) {
                playerB.draws++;
                if (state.format === TournamentFormat.LEAGUE) playerB.points += 1;
            }


          }));

          return { success: true };
        } catch (error) {
          console.error('Error setting match draw:', error);
          return { success: false, error: 'Ralat tidak dijangka semasa menetapkan seri' };
        }
      },

      // Manual pairing actions
      addManualPairing: (round, table, playerAId, playerBId) => {
        try {
          const state = get();
          const { players, manualPairings } = state;

          // Validate players exist
          const playerA = players.find(p => p.id === playerAId);
          if (!playerA) {
            return { success: false, error: 'Pemain A tidak dijumpai' };
          }

          // BYE tidak dibenarkan dalam Dam Aji
          if (!playerBId) {
            return { success: false, error: 'Pemain B diperlukan. Tiada BYE dibenarkan dalam pertandingan Dam Aji.' };
          }

          const playerB = players.find(p => p.id === playerBId);
          if (!playerB) {
            return { success: false, error: 'Pemain B tidak dijumpai' };
          }

          // Check for duplicate table in same round
          const existingPairing = manualPairings.find(p => p.round === round && p.table === table);
          if (existingPairing) {
            return { success: false, error: `Meja ${table} sudah digunakan untuk pusingan ${round}` };
          }

          // Check if players are already paired in this round
          const playerAlreadyPaired = manualPairings.find(p =>
            p.round === round && (p.playerAId === playerAId || p.playerBId === playerAId ||
            (playerBId && (p.playerAId === playerBId || p.playerBId === playerBId)))
          );
          if (playerAlreadyPaired) {
            return { success: false, error: 'Pemain sudah dipasangkan dalam pusingan ini' };
          }

          const newPairing: ManualPairing = {
            id: `pairing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            round,
            table,
            playerAId,
            playerBId,
            status: PairingStatus.DRAFT,
            createdAt: new Date(),
            modifiedAt: new Date()
          };

          set(produce((state: TournamentState) => {
            state.manualPairings.push(newPairing);
          }));

          return { success: true };
        } catch (error) {
          console.error('Error adding manual pairing:', error);
          return { success: false, error: 'Ralat tidak dijangka semasa menambah pasangan' };
        }
      },

      updateManualPairing: (pairingId, playerAId, playerBId) => {
        try {
          const state = get();
          const { players, manualPairings } = state;

          const pairing = manualPairings.find(p => p.id === pairingId);
          if (!pairing) {
            return { success: false, error: 'Pasangan tidak dijumpai' };
          }

          if (pairing.status === PairingStatus.LOCKED || pairing.status === PairingStatus.CONFIRMED) {
            return { success: false, error: 'Pasangan sudah dikunci dan tidak boleh diubah' };
          }

          // Validate players exist
          const playerA = players.find(p => p.id === playerAId);
          if (!playerA) {
            return { success: false, error: 'Pemain A tidak dijumpai' };
          }

          if (!playerBId) {
            return { success: false, error: 'Pemain B diperlukan. Tiada BYE dibenarkan dalam pertandingan Dam Aji.' };
          }

          const playerB = players.find(p => p.id === playerBId);
          if (!playerB) {
            return { success: false, error: 'Pemain B tidak dijumpai' };
          }

          set(produce((state: TournamentState) => {
            const pairingIndex = state.manualPairings.findIndex(p => p.id === pairingId);
            if (pairingIndex !== -1) {
              state.manualPairings[pairingIndex].playerAId = playerAId;
              state.manualPairings[pairingIndex].playerBId = playerBId;
              state.manualPairings[pairingIndex].modifiedAt = new Date();
            }
          }));

          return { success: true };
        } catch (error) {
          console.error('Error updating manual pairing:', error);
          return { success: false, error: 'Ralat tidak dijangka semasa mengemas kini pasangan' };
        }
      },

      removeManualPairing: (pairingId) => {
        try {
          const state = get();
          const pairing = state.manualPairings.find(p => p.id === pairingId);

          if (!pairing) {
            return { success: false, error: 'Pasangan tidak dijumpai' };
          }

          if (pairing.status === PairingStatus.LOCKED || pairing.status === PairingStatus.CONFIRMED) {
            return { success: false, error: 'Pasangan sudah dikunci dan tidak boleh dipadam' };
          }

          set(produce((state: TournamentState) => {
            state.manualPairings = state.manualPairings.filter(p => p.id !== pairingId);
          }));

          return { success: true };
        } catch (error) {
          console.error('Error removing manual pairing:', error);
          return { success: false, error: 'Ralat tidak dijangka semasa membuang pasangan' };
        }
      },

      lockPairings: () => {
        try {
          const state = get();
          const { manualPairings, players } = state;

          if (manualPairings.length === 0) {
            return { success: false, error: 'Tiada pasangan untuk dikunci' };
          }

          // Validate all pairings are complete
          const activePlayers = players.filter(p => p.active);
          const pairedPlayerIds = new Set<string>();

          for (const pairing of manualPairings) {
            pairedPlayerIds.add(pairing.playerAId);
            pairedPlayerIds.add(pairing.playerBId);
          }

          // Check if all active players are paired (no BYE allowed in Dam Aji)
          const unpairedPlayers = activePlayers.filter(p => !pairedPlayerIds.has(p.id));
          if (unpairedPlayers.length > 0) {
            return { success: false, error: `${unpairedPlayers.length} pemain belum dipasangkan: ${unpairedPlayers.map(p => p.name).join(', ')}. Tiada BYE dibenarkan dalam Dam Aji.` };
          }

          // Ensure even number of active players
          if (activePlayers.length % 2 !== 0) {
            return { success: false, error: 'Bilangan pemain aktif mestilah genap untuk mengelakkan BYE. Sila tambah atau buang seorang pemain.' };
          }

          set(produce((state: TournamentState) => {
            state.manualPairings.forEach(pairing => {
              pairing.status = PairingStatus.LOCKED;
              pairing.modifiedAt = new Date();
            });
            state.pairingStatus = PairingStatus.LOCKED;
          }));

          return { success: true };
        } catch (error) {
          console.error('Error locking pairings:', error);
          return { success: false, error: 'Ralat tidak dijangka semasa mengunci pasangan' };
        }
      },

      unlockPairings: () => {
        set(produce((state: TournamentState) => {
          state.manualPairings.forEach(pairing => {
            pairing.status = PairingStatus.DRAFT;
            pairing.modifiedAt = new Date();
          });
          state.pairingStatus = PairingStatus.DRAFT;
        }));
      },

      confirmPairings: () => {
        try {
          const state = get();

          if (state.pairingStatus !== PairingStatus.LOCKED) {
            return { success: false, error: 'Pasangan mesti dikunci dahulu sebelum disahkan' };
          }

          set(produce((state: TournamentState) => {
            state.manualPairings.forEach(pairing => {
              pairing.status = PairingStatus.CONFIRMED;
              pairing.modifiedAt = new Date();
            });
            state.pairingStatus = PairingStatus.CONFIRMED;
          }));

          return { success: true };
        } catch (error) {
          console.error('Error confirming pairings:', error);
          return { success: false, error: 'Ralat tidak dijangka semasa mengesahkan pasangan' };
        }
      },

      importPairings: (pairings) => {
        try {
          const state = get();
          const { players } = state;

          // Validate all players exist and no BYE allowed
          for (const pairing of pairings) {
            const playerA = players.find(p => p.id === pairing.playerAId);
            if (!playerA) {
              return { success: false, error: `Pemain dengan ID ${pairing.playerAId} tidak dijumpai` };
            }

            if (!pairing.playerBId) {
              return { success: false, error: `Pemain B diperlukan untuk meja ${pairing.table}. Tiada BYE dibenarkan dalam Dam Aji.` };
            }

            const playerB = players.find(p => p.id === pairing.playerBId);
            if (!playerB) {
              return { success: false, error: `Pemain dengan ID ${pairing.playerBId} tidak dijumpai` };
            }
          }

          // Clear existing pairings and add new ones
          const newPairings: ManualPairing[] = pairings.map((pairing, index) => ({
            id: `imported_${Date.now()}_${index}`,
            round: 1, // Default to round 1 for imports
            table: pairing.table,
            playerAId: pairing.playerAId,
            playerBId: pairing.playerBId,
            status: PairingStatus.DRAFT,
            createdAt: new Date(),
            modifiedAt: new Date()
          }));

          set(produce((state: TournamentState) => {
            state.manualPairings = newPairings;
            state.pairingStatus = PairingStatus.DRAFT;
          }));

          return { success: true };
        } catch (error) {
          console.error('Error importing pairings:', error);
          return { success: false, error: 'Ralat tidak dijangka semasa mengimport pasangan' };
        }
      },

      resetTournament: () => {
        set(produce((state: TournamentState) => {
            const initialState = getInitialState();
            state.status = initialState.status;
            state.format = initialState.format;
            state.mode = initialState.mode;
            state.players = initialState.players;
            state.matches = initialState.matches;
            state.manualPairings = initialState.manualPairings;
            state.pairingStatus = initialState.pairingStatus;
            state.currentRound = initialState.currentRound;
            state.isRoundtable = initialState.isRoundtable;
            state.welcomeMessage = initialState.welcomeMessage;
            state.footerText = initialState.footerText;
            state.eventDetails = initialState.eventDetails;
            state.lkimLogoUrl = initialState.lkimLogoUrl;
            state.madaniLogoUrl = initialState.madaniLogoUrl;
            state.backgroundImageUrl = initialState.backgroundImageUrl;
            state.isSystemLocked = initialState.isSystemLocked;
            state.backgroundMusicUrl = initialState.backgroundMusicUrl;
            state.isMusicEnabled = initialState.isMusicEnabled;
            state.musicVolume = initialState.musicVolume;
        }));
      },

      exportTournamentData: () => {
        try {
          const state = get();
          const exportData = {
            exportDate: new Date().toISOString(),
            tournamentInfo: {
              status: state.status,
              format: state.format,
              currentRound: state.currentRound,
              welcomeMessage: state.welcomeMessage,
              footerText: state.footerText
            },
            players: state.players,
            matches: state.matches,
            statistics: {
              totalPlayers: state.players.length,
              totalMatches: state.matches.length,
              completedMatches: state.matches.filter(m => m.isFinished).length
            }
          };

          const jsonString = JSON.stringify(exportData, null, 2);
          const blob = new Blob([jsonString], { type: 'application/json' });
          const url = URL.createObjectURL(blob);

          const link = document.createElement('a');
          link.href = url;
          link.download = `dam-aji-tournament-${new Date().toISOString().split('T')[0]}.json`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          URL.revokeObjectURL(url);
        } catch (error) {
          console.error('Error exporting tournament data:', error);
        }
      },

      // Music settings actions
      setBackgroundMusicUrl: (url: string) => {
        set(produce((state: TournamentState) => {
          state.backgroundMusicUrl = url;
        }));
      },

      setMusicEnabled: (enabled: boolean) => {
        set(produce((state: TournamentState) => {
          state.isMusicEnabled = enabled;
        }));
      },

      setMusicVolume: (volume: number) => {
        set(produce((state: TournamentState) => {
          state.musicVolume = Math.max(0, Math.min(1, volume)); // Clamp between 0-1
        }));
      },

      setYoutubeVideoId: (videoId: string) => {
        set(produce((state: TournamentState) => {
          state.youtubeVideoId = videoId;
        }));
      },
    }),
    {
      name: 'dam-aji-tournament-storage',
    }
  )
);