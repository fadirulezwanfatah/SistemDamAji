import React from 'react';
import { Player, Match, TournamentFormat } from '../types';
import { formatICNumber, formatPhoneNumber } from '../utils/helpers';

interface PlayerProfileProps {
  player: Player;
  matches: Match[];
  format: TournamentFormat;
  rank?: number;
  onClose: () => void;
}

const PlayerProfile: React.FC<PlayerProfileProps> = ({ 
  player, 
  matches, 
  format, 
  rank,
  onClose 
}) => {
  // Get player's matches
  const playerMatches = matches.filter(match => 
    match.playerA.id === player.id || match.playerB?.id === player.id
  );

  const completedMatches = playerMatches.filter(match => match.isFinished);
  const upcomingMatches = playerMatches.filter(match => !match.isFinished);

  // Calculate additional statistics
  const totalMatches = completedMatches.length;
  const winRate = totalMatches > 0 ? Math.round((player.wins / totalMatches) * 100) : 0;
  
  // Get opponents faced
  const opponents = completedMatches.map(match => {
    const opponent = match.playerA.id === player.id ? match.playerB : match.playerA;
    const isWin = match.winnerId === player.id;
    const isDraw = match.isDraw;
    return { opponent, isWin, isDraw, match };
  }).filter(item => item.opponent !== null);

  const getMatchResult = (match: Match) => {
    if (!match.isFinished) return 'Belum Selesai';
    if (match.isDraw) return 'Seri';
    if (match.winnerId === player.id) return 'Menang';
    return 'Kalah';
  };

  const getResultColor = (match: Match) => {
    if (!match.isFinished) return 'text-yellow-400';
    if (match.isDraw) return 'text-blue-400';
    if (match.winnerId === player.id) return 'text-green-400';
    return 'text-red-400';
  };

  const getPlayerStatus = () => {
    if (format === TournamentFormat.KNOCKOUT) {
      return player.active ? 'Aktif' : 'Tersingkir';
    }
    return 'Aktif';
  };

  const getStatusColor = () => {
    if (format === TournamentFormat.KNOCKOUT) {
      return player.active ? 'text-green-400' : 'text-red-400';
    }
    return 'text-green-400';
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-light-navy rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-lightest-navy/30">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gold">{player.name}</h2>
              <p className="text-light-slate">{player.association}</p>
              <p className="text-sm text-slate">ID: {player.id}</p>
              {rank && (
                <p className="text-sm font-semibold text-gold">Kedudukan: #{rank}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-slate hover:text-lightest-slate text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        {/* Player Details */}
        <div className="p-6 space-y-6">
          {/* Contact Information */}
          {(player.icNumber || player.phoneNumber) && (
            <div className="bg-navy rounded-lg p-4">
              <h3 className="text-lg font-bold text-gold mb-3">Maklumat Peribadi</h3>
              <div className="space-y-2 text-sm">
                {player.icNumber && (
                  <div className="flex justify-between">
                    <span className="text-slate">No. Kad Pengenalan:</span>
                    <span className="text-lightest-slate font-mono">
                      {formatICNumber(player.icNumber)}
                    </span>
                  </div>
                )}
                {player.phoneNumber && (
                  <div className="flex justify-between">
                    <span className="text-slate">No. Telefon:</span>
                    <span className="text-lightest-slate font-mono">
                      {formatPhoneNumber(player.phoneNumber)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Statistics */}
          <div className="bg-navy rounded-lg p-4">
            <h3 className="text-lg font-bold text-gold mb-3">Statistik Prestasi</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-400">{player.wins}</p>
                <p className="text-xs text-slate">Menang</p>
              </div>
              {format === TournamentFormat.LEAGUE && (
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-400">{player.draws}</p>
                  <p className="text-xs text-slate">Seri</p>
                </div>
              )}
              <div className="text-center">
                <p className="text-2xl font-bold text-red-400">{player.losses}</p>
                <p className="text-xs text-slate">Kalah</p>
              </div>
              {format === TournamentFormat.LEAGUE && (
                <div className="text-center">
                  <p className="text-2xl font-bold text-gold">{player.points}</p>
                  <p className="text-xs text-slate">Mata</p>
                </div>
              )}
            </div>

            {/* Additional Stats */}
            <div className="mt-4 pt-4 border-t border-lightest-navy/30">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate">Jumlah Perlawanan:</span>
                  <span className="text-lightest-slate font-semibold">{totalMatches}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate">Kadar Kemenangan:</span>
                  <span className="text-lightest-slate font-semibold">{winRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate">Status:</span>
                  <span className={`font-semibold ${getStatusColor()}`}>
                    {getPlayerStatus()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate">Perlawanan Akan Datang:</span>
                  <span className="text-lightest-slate font-semibold">{upcomingMatches.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Match History */}
          {completedMatches.length > 0 && (
            <div className="bg-navy rounded-lg p-4">
              <h3 className="text-lg font-bold text-gold mb-3">Sejarah Perlawanan</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {completedMatches
                  .sort((a, b) => b.round - a.round)
                  .map((match) => {
                    const opponent = match.playerA.id === player.id ? match.playerB : match.playerA;
                    return (
                      <div key={match.id} className="flex justify-between items-center p-2 bg-light-navy rounded text-sm">
                        <div>
                          <span className="text-lightest-slate">
                            vs {opponent?.name || 'BYE'}
                          </span>
                          <span className="text-slate text-xs ml-2">
                            (Pusingan {match.round})
                          </span>
                        </div>
                        <span className={`font-semibold ${getResultColor(match)}`}>
                          {getMatchResult(match)}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Upcoming Matches */}
          {upcomingMatches.length > 0 && (
            <div className="bg-navy rounded-lg p-4">
              <h3 className="text-lg font-bold text-gold mb-3">Perlawanan Akan Datang</h3>
              <div className="space-y-2">
                {upcomingMatches
                  .sort((a, b) => a.round - b.round)
                  .map((match) => {
                    const opponent = match.playerA.id === player.id ? match.playerB : match.playerA;
                    return (
                      <div key={match.id} className="flex justify-between items-center p-2 bg-light-navy rounded text-sm">
                        <div>
                          <span className="text-lightest-slate">
                            vs {opponent?.name || 'BYE'}
                          </span>
                          <span className="text-slate text-xs ml-2">
                            (Pusingan {match.round})
                          </span>
                        </div>
                        <span className="text-yellow-400 font-semibold">
                          Menunggu
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-lightest-navy/30">
          <button
            onClick={onClose}
            className="w-full bg-gold hover:opacity-90 text-navy font-bold py-2 px-4 rounded transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlayerProfile;
