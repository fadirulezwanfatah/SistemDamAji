import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTournamentStore } from '../hooks/useTournamentStore';
import { TournamentStatus, Match, Player, TournamentFormat } from '../types';
import Header from '../components/Header';
import AudioManager from '../components/AudioManager';
import { TrophyIcon, UsersIcon, ListIcon } from '../components/icons';
import { ORGANIZER, DAM_AJI_BOARD_BG } from '../constants';

const GlassPanel: React.FC<{children: React.ReactNode, className?: string}> = ({ children, className }) => (
    <div className={`bg-navy/60 backdrop-blur-md border border-lightest-slate/20 rounded-lg shadow-2xl ${className}`}>
        {children}
    </div>
);

const useCurrentTime = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timerId = setInterval(() => { setTime(new Date()); }, 1000);
        return () => clearInterval(timerId);
    }, []);

    const timeString = time.toLocaleTimeString('en-GB');
    const dateString = time.toLocaleDateString('ms-MY', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    return { timeString, dateString };
};

const OfflineScreen: React.FC = () => {
    const { welcomeMessage } = useTournamentStore();
    const { timeString, dateString } = useCurrentTime();
    const messageLines = welcomeMessage.split('\n').filter(line => line.trim() !== '');

    const getLineClassName = (index: number) => {
        switch (index) {
            case 0: return 'text-7xl md:text-8xl';
            case 1: return 'text-5xl md:text-6xl mt-4';
            default: return 'text-4xl md:text-5xl mt-2';
        }
    };

    return (
        <div className="flex flex-col h-full animate-fadeIn p-4 md:p-8">
            <div className="flex-grow flex flex-col items-center justify-center text-center">
                <div className="mb-4">
                    {messageLines.map((line, index) => (
                        <h2 key={index} className={`leading-tight font-black text-white tracking-wide animate-glow ${getLineClassName(index)}`}>{line}</h2>
                    ))}
                </div>
                <div className="my-4"><p className="text-xl text-light-slate animate-pulse">Menunggu urusetia untuk memulakan perlawanan...</p></div>
            </div>
            <div className="flex-shrink-0 text-center font-mono">
                <p className="text-3xl md:text-4xl font-bold text-gold tracking-widest">{timeString}</p>
                <p className="text-base text-light-slate mt-1">{dateString}</p>
                <p className="text-sm md:text-base mt-1 mb-1 text-slate font-semibold">Lembaga Kemajuan Ikan Malaysia</p>
            </div>
        </div>
    );
};

const FinishedScreen: React.FC = () => {
    const { players, format, matches } = useTournamentStore();

    const getKnockoutLeaderboard = () => {
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
    };

    const leaderboard = format === TournamentFormat.LEAGUE
        ? [...players].sort((a, b) => b.points - a.points || b.wins - a.wins || a.losses - b.losses)
        : getKnockoutLeaderboard();
    const podiumOrder = leaderboard.slice(0, 3);

    return (
        <div className="relative h-full w-full overflow-hidden">
            {/* Background with gradient and particles effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-navy via-dark-navy to-black">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,215,0,0.1),transparent_50%)]"></div>
                {/* Floating particles */}
                <div className="absolute top-10 left-10 w-2 h-2 bg-gold/30 rounded-full animate-pulse"></div>
                <div className="absolute top-20 right-20 w-1 h-1 bg-gold/40 rounded-full animate-ping"></div>
                <div className="absolute bottom-20 left-20 w-1.5 h-1.5 bg-gold/20 rounded-full animate-pulse"></div>
                <div className="absolute bottom-10 right-10 w-1 h-1 bg-gold/30 rounded-full animate-ping"></div>
            </div>

            <div className="relative z-10 flex flex-col items-center justify-center h-full p-4 animate-fadeIn">
                {/* Main Title with enhanced styling */}
                <div className="text-center mb-8 md:mb-12">
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gold via-yellow-300 to-gold mb-2 animate-pulse">
                        KEPUTUSAN AKHIR
                    </h1>
                    <div className="w-32 md:w-48 h-1 bg-gradient-to-r from-transparent via-gold to-transparent mx-auto"></div>
                </div>

                {/* Winners Display */}
                <div className="w-full max-w-6xl">
                    {/* Mobile Layout */}
                    <div className="block lg:hidden space-y-6">
                        {/* Champion */}
                        {podiumOrder[0] && (
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-gold via-yellow-300 to-gold rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000"></div>
                                <div className="relative bg-gradient-to-br from-navy to-dark-navy rounded-2xl p-6 text-center border border-gold/50">
                                    <div className="text-3xl mb-3">👑</div>
                                    <h2 className="text-2xl font-bold text-gold mb-1">JUARA</h2>
                                    <h3 className="text-xl font-bold text-white mb-2">{podiumOrder[0].name}</h3>
                                    <p className="text-light-slate">{podiumOrder[0].association}</p>
                                </div>
                            </div>
                        )}

                        {/* Runner-up */}
                        {podiumOrder[1] && (
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-slate via-gray-300 to-slate rounded-2xl blur opacity-50 group-hover:opacity-75 transition duration-1000"></div>
                                <div className="relative bg-gradient-to-br from-navy to-dark-navy rounded-2xl p-5 text-center border border-slate/50">
                                    <div className="text-2xl mb-2">🥈</div>
                                    <h2 className="text-xl font-bold text-slate mb-1">NAIB JUARA</h2>
                                    <h3 className="text-lg font-bold text-white mb-2">{podiumOrder[1].name}</h3>
                                    <p className="text-light-slate text-sm">{podiumOrder[1].association}</p>
                                </div>
                            </div>
                        )}

                        {/* Third place */}
                        {podiumOrder[2] && (
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-bronze via-orange-400 to-bronze rounded-2xl blur opacity-50 group-hover:opacity-75 transition duration-1000"></div>
                                <div className="relative bg-gradient-to-br from-navy to-dark-navy rounded-2xl p-5 text-center border border-bronze/50">
                                    <div className="text-2xl mb-2">🥉</div>
                                    <h2 className="text-xl font-bold text-bronze mb-1">TEMPAT KETIGA</h2>
                                    <h3 className="text-lg font-bold text-white mb-2">{podiumOrder[2].name}</h3>
                                    <p className="text-light-slate text-sm">{podiumOrder[2].association}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Desktop Layout - Podium Style */}
                    <div className="hidden lg:flex justify-center items-end gap-8 perspective-1000">
                        {/* Runner-up (Left) */}
                        {podiumOrder[1] && (
                            <div className="relative group transform hover:scale-105 transition-all duration-500">
                                <div className="absolute -inset-2 bg-gradient-to-r from-slate via-gray-300 to-slate rounded-3xl blur opacity-50 group-hover:opacity-75 transition duration-1000"></div>
                                <div className="relative flex flex-col items-center">
                                    <div className="bg-gradient-to-br from-navy to-dark-navy rounded-3xl p-6 text-center border-2 border-slate/50 mb-4 min-w-[280px] transform hover:rotate-1 transition-transform duration-300">
                                        <div className="text-4xl mb-3">🥈</div>
                                        <h2 className="text-2xl font-bold text-slate mb-2">NAIB JUARA</h2>
                                        <h3 className="text-xl font-bold text-white mb-2 leading-tight">{podiumOrder[1].name}</h3>
                                        <p className="text-light-slate">{podiumOrder[1].association}</p>
                                    </div>
                                    <div className="w-full h-32 bg-gradient-to-t from-slate/40 to-slate/20 rounded-t-3xl border-x-4 border-t-4 border-slate/50 shadow-2xl"></div>
                                </div>
                            </div>
                        )}

                        {/* Champion (Center) */}
                        {podiumOrder[0] && (
                            <div className="relative group transform hover:scale-105 transition-all duration-500">
                                <div className="absolute -inset-3 bg-gradient-to-r from-gold via-yellow-300 to-gold rounded-3xl blur opacity-75 group-hover:opacity-100 transition duration-1000 animate-pulse"></div>
                                <div className="relative flex flex-col items-center">
                                    <div className="bg-gradient-to-br from-navy to-dark-navy rounded-3xl p-8 text-center border-4 border-gold mb-4 min-w-[320px] transform hover:-rotate-1 transition-transform duration-300 shadow-2xl">
                                        <div className="text-6xl mb-4 animate-bounce">👑</div>
                                        <h2 className="text-4xl font-bold text-gold mb-3">JUARA</h2>
                                        <h3 className="text-2xl font-bold text-white mb-3 leading-tight">{podiumOrder[0].name}</h3>
                                        <p className="text-light-slate text-lg">{podiumOrder[0].association}</p>
                                    </div>
                                    <div className="w-full h-48 bg-gradient-to-t from-gold/40 to-gold/20 rounded-t-3xl border-x-4 border-t-4 border-gold/50 shadow-2xl"></div>
                                </div>
                            </div>
                        )}

                        {/* Third place (Right) */}
                        {podiumOrder[2] && (
                            <div className="relative group transform hover:scale-105 transition-all duration-500">
                                <div className="absolute -inset-2 bg-gradient-to-r from-bronze via-orange-400 to-bronze rounded-3xl blur opacity-50 group-hover:opacity-75 transition duration-1000"></div>
                                <div className="relative flex flex-col items-center">
                                    <div className="bg-gradient-to-br from-navy to-dark-navy rounded-3xl p-6 text-center border-2 border-bronze/50 mb-4 min-w-[280px] transform hover:rotate-1 transition-transform duration-300">
                                        <div className="text-4xl mb-3">🥉</div>
                                        <h2 className="text-2xl font-bold text-bronze mb-2">TEMPAT KETIGA</h2>
                                        <h3 className="text-xl font-bold text-white mb-2 leading-tight">{podiumOrder[2].name}</h3>
                                        <p className="text-light-slate">{podiumOrder[2].association}</p>
                                    </div>
                                    <div className="w-full h-24 bg-gradient-to-t from-bronze/40 to-bronze/20 rounded-t-3xl border-x-4 border-t-4 border-bronze/50 shadow-2xl"></div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer message */}
                <div className="mt-12 text-center">
                    <p className="text-lg md:text-xl text-light-slate">✨ Tahniah kepada semua pemenang! ✨</p>
                    <p className="text-sm md:text-base text-slate mt-2">Dibawakan oleh {ORGANIZER}</p>
                </div>
            </div>
        </div>
    );
};

const OnlinePlayersView: React.FC = () => {
    const { players, format } = useTournamentStore();
    const sortedPlayers = [...players].sort((a, b) => a.id.localeCompare(b.id));

    // Calculate optimal grid based on number of players
    const getGridConfig = (playerCount: number) => {
        if (playerCount <= 16) return { cols: 'repeat(auto-fit, minmax(180px, 1fr))', rows: 'auto' };
        if (playerCount <= 32) return { cols: 'repeat(auto-fit, minmax(150px, 1fr))', rows: 'auto' };
        if (playerCount <= 48) return { cols: 'repeat(auto-fit, minmax(130px, 1fr))', rows: '1fr' };
        return { cols: 'repeat(auto-fit, minmax(110px, 1fr))', rows: '1fr' };
    };

    const gridConfig = getGridConfig(players.length);

    return (
        <div className="animate-fadeIn flex flex-col h-full min-h-0">
            <h2 className="text-xl md:text-2xl font-bold text-gold mb-1 flex items-center gap-2 shrink-0"><UsersIcon className="w-6 h-6" /> SENARAI PESERTA ({players.length})</h2>
            <div className="grid gap-1 flex-grow min-h-0 overflow-auto pb-4" style={{
                gridTemplateColumns: gridConfig.cols,
                gridAutoRows: gridConfig.rows
            }}>
                {sortedPlayers.map((player) => {
                    const cardPadding = players.length <= 16 ? 'p-2' : players.length <= 32 ? 'p-1.5' : 'p-1';
                    const nameSize = players.length <= 16 ? 'text-sm' : players.length <= 32 ? 'text-xs' : 'text-xs';
                    const assocSize = players.length <= 16 ? 'text-xs' : 'text-[10px]';

                    return (
                        <div key={player.id} className={`bg-light-navy rounded-lg ${cardPadding} text-center border border-transparent hover:border-gold/50 transition-colors flex flex-col justify-center h-full`}>
                            <p className={`font-bold text-lightest-slate ${nameSize} leading-tight truncate`} title={player.name}>{player.name}</p>
                            <p className={`${assocSize} text-slate truncate`} title={player.association}>{player.association}</p>
                            <p className="font-mono text-xs text-gold mt-0.5">ID: {player.id}</p>
                            {format === TournamentFormat.KNOCKOUT && (
                                <div className="mt-0.5 text-xs font-semibold">
                                    {player.active ?
                                        <span className="px-1 py-0.5 rounded-full bg-green-900 text-green-300 text-[9px]">Aktif</span> :
                                        <span className="px-1 py-0.5 rounded-full bg-red-900 text-red-400 text-[9px]">Tersingkir</span>
                                    }
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const formatPlayerName = (fullName: string): string => {
  if (!fullName) return '';
  const parts = fullName.trim().split(/\s+/);
  if (parts.length <= 1) return fullName; 
  const firstName = parts[0];
  const lastName = parts[parts.length - 1];
  return `${firstName} ${lastName.charAt(0)}.`;
};

const OnlineMatchesView: React.FC = () => {
    const { matches, currentRound } = useTournamentStore();
    const currentMatches = [...matches]
        .filter(m => m.round === currentRound)
        .sort((a, b) => {
            // Sort: 3rd place playoff first, then final, then by table number
            if (a.stage === 'Penentuan Tempat Ke-3/4') return -1;
            if (b.stage === 'Penentuan Tempat Ke-3/4') return 1;
            if (a.stage === 'Final') return 1;
            if (b.stage === 'Final') return -1;
            return a.table - b.table;
        });

    // Calculate optimal grid based on number of matches - fit all in viewport
    const getGridConfig = (matchCount: number) => {
        if (matchCount <= 2) return { cols: 'grid-cols-1 md:grid-cols-2', rows: 'auto' };
        if (matchCount <= 4) return { cols: 'grid-cols-1 md:grid-cols-2', rows: 'auto' };
        if (matchCount <= 6) return { cols: 'grid-cols-2 md:grid-cols-3', rows: 'auto' };
        if (matchCount <= 8) return { cols: 'grid-cols-2 md:grid-cols-4', rows: 'auto' };
        if (matchCount <= 10) return { cols: 'grid-cols-2 md:grid-cols-5', rows: 'auto' };
        if (matchCount <= 12) return { cols: 'grid-cols-3 md:grid-cols-6', rows: 'auto' };
        if (matchCount <= 15) return { cols: 'grid-cols-3 md:grid-cols-5', rows: 'auto' };
        if (matchCount <= 20) return { cols: 'grid-cols-3 md:grid-cols-5', rows: 'auto' };
        return { cols: 'grid-cols-3 md:grid-cols-6', rows: 'auto' };
    };

    const gridConfig = getGridConfig(currentMatches.length);

    return (
        <div className="animate-fadeIn flex flex-col h-full min-h-0">
            <h2 className="text-xl md:text-2xl font-bold text-gold mb-1 flex items-center gap-2 shrink-0"><ListIcon className="w-6 h-6"/> PERLAWANAN PUSINGAN {currentRound}</h2>
            {currentMatches.length > 0 ? (
                <div className={`grid ${currentMatches.length <= 4 ? 'gap-4 md:gap-6' : currentMatches.length <= 8 ? 'gap-3 md:gap-4' : currentMatches.length <= 12 ? 'gap-2 md:gap-3' : 'gap-1.5 md:gap-2'} h-full pb-4 ${gridConfig.cols}`}>
                    {currentMatches.map(match => {
                        const { isFinished, isDraw, winnerId, playerA, playerB } = match;
                        const getPlayerClasses = (player: Player) => {
                            if (!isFinished) return { container: 'opacity-100', text: 'text-lightest-slate' };
                            if (isDraw) return { container: 'opacity-100', text: 'text-light-slate' };
                            return winnerId === player.id ? { container: 'opacity-100', text: 'text-gold' } : { container: 'opacity-50', text: 'text-lightest-slate' };
                        };
                        const playerAStyle = getPlayerClasses(playerA);
                        const playerBStyle = playerB ? getPlayerClasses(playerB) : null;

                        const cardPadding = currentMatches.length <= 4 ? 'p-3 md:p-4' : currentMatches.length <= 8 ? 'p-2 md:p-3' : currentMatches.length <= 12 ? 'p-2 md:p-2.5' : 'p-1.5 md:p-2';
                        const stageSize = currentMatches.length <= 4 ? 'text-sm md:text-base' : currentMatches.length <= 8 ? 'text-xs md:text-sm' : currentMatches.length <= 12 ? 'text-xs md:text-sm' : 'text-xs';
                        const nameSize = currentMatches.length <= 4 ? 'text-base md:text-lg' : currentMatches.length <= 8 ? 'text-sm md:text-base' : currentMatches.length <= 12 ? 'text-xs md:text-sm' : 'text-xs md:text-sm';
                        const idSize = currentMatches.length <= 4 ? 'text-xs md:text-sm' : currentMatches.length <= 8 ? 'text-xs' : currentMatches.length <= 12 ? 'text-xs' : 'text-xs';
                        const vsSize = currentMatches.length <= 4 ? 'text-lg md:text-xl' : currentMatches.length <= 8 ? 'text-base md:text-lg' : currentMatches.length <= 12 ? 'text-sm md:text-base' : 'text-sm md:text-base';

                        return (
                            <div key={match.id} className={`bg-light-navy rounded ${cardPadding} flex flex-col justify-center transition-all duration-300 ${isFinished ? (isDraw ? 'border border-blue-400/40' : 'border border-gold/40') : 'border border-transparent'} h-full`}>
                                <p className={`text-center text-slate font-semibold mb-2 ${stageSize}`}>{match.stage || `Meja ${match.table}`}</p>
                                <div className="flex items-center justify-center text-center">
                                    <div className={`flex-1 px-2 min-w-0 transition-opacity duration-300 ${playerAStyle.container}`}>
                                        <p className={`font-bold ${nameSize} leading-tight transition-colors ${playerAStyle.text}`} title={playerA.name}>{formatPlayerName(playerA.name)}</p>
                                        <p className={`${idSize} text-slate font-mono mt-1`}>ID: {playerA.id}</p>
                                    </div>
                                    <div className={`font-black text-gold ${vsSize} mx-2`}>{isDraw ? 'SERI' : 'VS'}</div>
                                    <div className={`flex-1 px-2 min-w-0 transition-opacity duration-300 ${playerBStyle?.container ?? ''}`}>
                                        {playerB ? (
                                            <>
                                                <p className={`font-bold ${nameSize} leading-tight transition-colors ${playerBStyle?.text}`} title={playerB.name}>{formatPlayerName(playerB.name)}</p>
                                                <p className={`${idSize} text-slate font-mono mt-1`}>ID: {playerB.id}</p>
                                            </>
                                        ) : (
                                            <p className={`font-semibold text-red-400 italic ${nameSize}`}>Error: Tiada Lawan</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (<div className="flex-grow flex items-center justify-center text-center py-12 text-slate text-2xl"><p>Pusingan sedang disediakan... Sila tunggu.</p></div>)}
        </div>
    );
};

const OnlineLeaderboardView: React.FC = () => {
    const { players, format, matches, status } = useTournamentStore();

    const getKnockoutLeaderboard = () => {
        if (status === TournamentStatus.FINISHED) {
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
            // During tournament, sort by wins/losses
            return [...players].sort((a, b) => b.wins - a.wins || a.losses - b.losses);
        }
    };

    const leaderboard = format === TournamentFormat.LEAGUE
        ? [...players].sort((a, b) => b.points - a.points || b.wins - a.wins || a.losses - b.losses)
        : getKnockoutLeaderboard();

    const getRankClass = (index: number) => {
        switch(index) {
            case 0: return 'border-gold';
            case 1: return 'border-slate';
            case 2: return 'border-bronze';
            default: return 'border-transparent';
        }
    };

    // Calculate optimal grid based on number of players
    const getGridConfig = (playerCount: number) => {
        if (playerCount <= 16) return { cols: 'repeat(auto-fit, minmax(180px, 1fr))', rows: 'auto' };
        if (playerCount <= 32) return { cols: 'repeat(auto-fit, minmax(150px, 1fr))', rows: 'auto' };
        if (playerCount <= 48) return { cols: 'repeat(auto-fit, minmax(130px, 1fr))', rows: '1fr' };
        return { cols: 'repeat(auto-fit, minmax(110px, 1fr))', rows: '1fr' };
    };

    const gridConfig = getGridConfig(players.length);

    return (
        <div className="animate-fadeIn flex flex-col h-full min-h-0">
            <h2 className="text-xl md:text-2xl font-bold text-gold mb-1 flex items-center gap-2 shrink-0"><TrophyIcon className="w-6 h-6"/> PAPAN KEDUDUKAN</h2>
            <div className="grid gap-1 flex-grow min-h-0 overflow-auto pb-4" style={{
                gridTemplateColumns: gridConfig.cols,
                gridAutoRows: gridConfig.rows
            }}>
                {leaderboard.map((player, index) => {
                    const cardPadding = players.length <= 16 ? 'p-2' : players.length <= 32 ? 'p-1.5' : 'p-1';
                    const nameSize = players.length <= 16 ? 'text-sm' : 'text-xs';
                    const rankSize = players.length <= 16 ? 'text-sm' : 'text-xs';
                    const topMargin = players.length <= 16 ? 'mt-4' : 'mt-3';

                    return (
                        <div key={player.id} className={`bg-light-navy rounded-lg ${cardPadding} text-center border-2 ${getRankClass(index)} hover:border-gold/50 transition-colors flex flex-col justify-center relative h-full`}>
                            <span className={`absolute top-0.5 left-1 font-bold ${rankSize} ${index < 3 ? 'text-white' : 'text-light-slate'}`}>#{index + 1}</span>
                            <p className={`font-bold text-lightest-slate ${nameSize} leading-tight truncate ${topMargin}`} title={player.name}>{player.name}</p>
                            <p className="font-mono text-xs text-gold mt-0.5">ID: {player.id}</p>
                            <div className="mt-0.5 text-xs font-semibold text-light-slate">
                               {format === TournamentFormat.LEAGUE && <><span className="font-bold text-gold">{player.points} M</span><span className="mx-0.5">|</span></>}
                               <span>W: <span className="text-green-400">{player.wins}</span></span>
                               {format === TournamentFormat.LEAGUE && <><span className="mx-0.5">/</span><span>D: <span className="text-yellow-400">{player.draws}</span></span></>}
                               <span className="mx-0.5">/</span>
                               <span>L: <span className="text-red-400">{player.losses}</span></span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const OnlineScreen: React.FC = () => {
    const [activeView, setActiveView] = useState<'matches' | 'leaderboard' | 'players'>('matches');

    return (
        <div className="p-2 md:p-4 flex-grow flex flex-col w-full max-w-7xl mx-auto min-h-0">
            <GlassPanel className="p-2 md:p-3 flex flex-col flex-grow min-h-0">
                <div className="flex border-b-2 border-slate/30 mb-2 shrink-0 -mx-2 -mt-2 px-2">
                    <button onClick={() => setActiveView('matches')} className={`py-2 px-4 transition-colors font-semibold text-base border-b-4 ${activeView === 'matches' ? 'border-gold text-gold' : 'border-transparent text-slate hover:text-gold'}`}>Perlawanan</button>
                    <button onClick={() => setActiveView('players')} className={`py-2 px-4 transition-colors font-semibold text-base border-b-4 ${activeView === 'players' ? 'border-gold text-gold' : 'border-transparent text-slate hover:text-gold'}`}>Senarai Peserta</button>
                    <button onClick={() => setActiveView('leaderboard')} className={`py-2 px-4 transition-colors font-semibold text-base border-b-4 ${activeView === 'leaderboard' ? 'border-gold text-gold' : 'border-transparent text-slate hover:text-gold'}`}>Papan Kedudukan</button>
                </div>
                <div className="flex-grow min-h-0 overflow-hidden">
                    {activeView === 'matches' && <OnlineMatchesView />}
                    {activeView === 'leaderboard' && <OnlineLeaderboardView />}
                    {activeView === 'players' && <OnlinePlayersView />}
                </div>
            </GlassPanel>
        </div>
    );
};

const PublicView: React.FC = () => {
  const status = useTournamentStore(state => state.status);
  const footerText = useTournamentStore(state => state.footerText);
  const backgroundImageUrl = useTournamentStore(state => state.backgroundImageUrl);
  
  const renderContent = () => {
      switch(status) {
          case TournamentStatus.OFFLINE: return <OfflineScreen />;
          case TournamentStatus.ONLINE: return <OnlineScreen />;
          case TournamentStatus.FINISHED: return <FinishedScreen />;
          default: return <OfflineScreen />;
      }
  };

  return (
    <div className="h-screen bg-navy text-lightest-slate flex flex-col bg-cover bg-center" style={{ backgroundImage: `url(${backgroundImageUrl || DAM_AJI_BOARD_BG})` }}>
        <div className="h-full flex flex-col bg-navy/80">
            <Header />

            {/* Audio Manager - Smart background music */}
            <div className="px-4 py-2">
                <AudioManager tournamentStatus={status} className="max-w-7xl mx-auto" />
            </div>

            <main className="flex-grow flex flex-col min-h-0 overflow-hidden">{renderContent()}</main>
            <footer className="w-full text-base text-slate bg-navy p-3 shrink-0 border-t-2 border-gold">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-2">
                    <span>{footerText}</span>
                    <div className="flex items-center gap-4"><span className="font-semibold text-light-slate">Maklumat Pertandingan</span><Link to="/admin" className="hover:text-gold transition-colors font-semibold">Akses Admin Panel</Link></div>
                </div>
            </footer>
        </div>
    </div>
  );
};

export default PublicView;