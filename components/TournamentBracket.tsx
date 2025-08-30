import React from 'react';
import { Match, Player, TournamentFormat } from '../types';
import { formatPlayerName } from '../utils/helpers';

interface TournamentBracketProps {
  matches: Match[];
  format: TournamentFormat;
  onSetWinner?: (matchId: string, winnerId: string) => void;
  isAdmin?: boolean;
}

const TournamentBracket: React.FC<TournamentBracketProps> = ({ 
  matches, 
  format, 
  onSetWinner,
  isAdmin = false 
}) => {
  if (format === TournamentFormat.LEAGUE) {
    return (
      <div className="text-center text-slate p-8">
        <p>Bracket tidak tersedia untuk format Liga</p>
      </div>
    );
  }

  // Group matches by round
  const matchesByRound = matches.reduce((acc, match) => {
    if (!acc[match.round]) {
      acc[match.round] = [];
    }
    acc[match.round].push(match);
    return acc;
  }, {} as Record<number, Match[]>);

  const rounds = Object.keys(matchesByRound)
    .map(Number)
    .sort((a, b) => a - b);

  const MatchCard: React.FC<{ match: Match; roundIndex: number }> = ({ match, roundIndex }) => {
    const isFinished = match.isFinished;
    const winner = match.winnerId;

    return (
      <div className={`bg-light-navy rounded-lg p-3 border-2 transition-all ${
        isFinished ? 'border-gold/40' : 'border-lightest-navy/30'
      }`}>
        {/* Match Header */}
        <div className="text-center mb-2">
          <span className="text-xs text-slate font-semibold">
            {match.stage || `Meja ${match.table}`}
          </span>
        </div>

        {/* Players */}
        <div className="space-y-2">
          {/* Player A */}
          <div className={`flex items-center justify-between p-2 rounded transition-all ${
            isFinished && winner === match.playerA.id 
              ? 'bg-green-900/50 border-l-4 border-green-400' 
              : 'bg-navy/50'
          }`}>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium truncate ${
                isFinished && winner !== match.playerA.id ? 'line-through text-slate' : 'text-lightest-slate'
              }`} title={match.playerA.name}>
                {formatPlayerName(match.playerA.name, 15)}
              </p>
              <p className="text-xs text-slate">ID: {match.playerA.id}</p>
            </div>
            {isAdmin && !isFinished && (
              <button
                onClick={() => onSetWinner?.(match.id, match.playerA.id)}
                className="ml-2 text-xs bg-slate hover:bg-light-slate text-navy font-bold py-1 px-2 rounded"
              >
                ✓
              </button>
            )}
          </div>

          {/* VS or BYE */}
          <div className="text-center">
            <span className="text-xs font-bold text-gold">
              {match.playerB ? 'VS' : 'BYE'}
            </span>
          </div>

          {/* Player B */}
          {match.playerB ? (
            <div className={`flex items-center justify-between p-2 rounded transition-all ${
              isFinished && winner === match.playerB.id 
                ? 'bg-green-900/50 border-l-4 border-green-400' 
                : 'bg-navy/50'
            }`}>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${
                  isFinished && winner !== match.playerB.id ? 'line-through text-slate' : 'text-lightest-slate'
                }`} title={match.playerB.name}>
                  {formatPlayerName(match.playerB.name, 15)}
                </p>
                <p className="text-xs text-slate">ID: {match.playerB.id}</p>
              </div>
              {isAdmin && !isFinished && (
                <button
                  onClick={() => onSetWinner?.(match.id, match.playerB!.id)}
                  className="ml-2 text-xs bg-slate hover:bg-light-slate text-navy font-bold py-1 px-2 rounded"
                >
                  ✓
                </button>
              )}
            </div>
          ) : (
            <div className="p-2 text-center text-slate italic text-sm">
              Menang Automatik
            </div>
          )}
        </div>

        {/* Match Status */}
        <div className="mt-2 text-center">
          {isFinished ? (
            <span className="text-xs text-green-400 font-semibold">
              ✓ Selesai
            </span>
          ) : (
            <span className="text-xs text-yellow-400 font-semibold">
              ⏳ Menunggu
            </span>
          )}
        </div>
      </div>
    );
  };

  const getRoundName = (round: number, totalRounds: number) => {
    if (format === TournamentFormat.SWISS) {
      return `Pusingan ${round}`;
    }

    const remainingRounds = totalRounds - round + 1;
    if (remainingRounds === 1) return 'Final';
    if (remainingRounds === 2) return 'Separuh Akhir';
    if (remainingRounds === 3) return 'Suku Akhir';
    return `Pusingan ${round}`;
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gold text-center">Bracket Pertandingan</h3>
      
      {rounds.length === 0 ? (
        <div className="text-center text-slate p-8">
          <p>Belum ada perlawanan dijana</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="flex gap-6 min-w-max p-4">
            {rounds.map((round, roundIndex) => (
              <div key={round} className="flex flex-col items-center space-y-4 min-w-[200px]">
                {/* Round Header */}
                <div className="text-center">
                  <h4 className="text-lg font-bold text-gold">
                    {getRoundName(round, rounds.length)}
                  </h4>
                  <p className="text-sm text-slate">Pusingan {round}</p>
                </div>

                {/* Matches in Round */}
                <div className="space-y-4">
                  {matchesByRound[round]
                    .sort((a, b) => {
                      // Sort: 3rd place playoff first, then final, then by table number
                      if (a.stage === 'Penentuan Tempat Ke-3/4') return -1;
                      if (b.stage === 'Penentuan Tempat Ke-3/4') return 1;
                      if (a.stage === 'Final') return 1;
                      if (b.stage === 'Final') return -1;
                      return a.table - b.table;
                    })
                    .map((match) => (
                      <MatchCard 
                        key={match.id} 
                        match={match} 
                        roundIndex={roundIndex}
                      />
                    ))}
                </div>

                {/* Connection Lines (for visual effect) */}
                {roundIndex < rounds.length - 1 && (
                  <div className="flex items-center">
                    <div className="w-8 h-0.5 bg-slate/50"></div>
                    <div className="w-2 h-2 bg-slate/50 rounded-full"></div>
                    <div className="w-8 h-0.5 bg-slate/50"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="bg-navy rounded-lg p-4 border border-lightest-navy/30">
        <h5 className="text-sm font-bold text-gold mb-2">Legenda:</h5>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-900 border-l-2 border-green-400 rounded"></div>
            <span className="text-slate">Pemenang</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-navy border border-lightest-navy/30 rounded"></div>
            <span className="text-slate">Belum Selesai</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate line-through">Nama</span>
            <span className="text-slate">Kalah</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-yellow-400">⏳</span>
            <span className="text-slate">Menunggu</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TournamentBracket;
