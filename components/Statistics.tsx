import React from 'react';
import { Player, Match, TournamentFormat } from '../types';
import { calculateTournamentStats } from '../utils/helpers';

interface StatisticsProps {
  players: Player[];
  matches: Match[];
  format: TournamentFormat;
  currentRound: number;
}

const Statistics: React.FC<StatisticsProps> = ({ players, matches, format, currentRound }) => {
  const stats = calculateTournamentStats(players, matches);

  const StatCard: React.FC<{ title: string; value: string | number; icon: string; color?: string }> = ({ 
    title, 
    value, 
    icon, 
    color = 'text-gold' 
  }) => (
    <div className="bg-navy rounded-lg p-4 border border-lightest-navy/30">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate text-sm font-medium">{title}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
        </div>
        <div className={`text-3xl ${color}`}>{icon}</div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gold">Statistik Pertandingan</h3>
      
      {/* Basic Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard 
          title="Jumlah Pemain" 
          value={stats.totalPlayers} 
          icon="👥" 
          color="text-blue-400"
        />
        <StatCard 
          title="Pemain Aktif" 
          value={stats.activePlayers} 
          icon="✅" 
          color="text-green-400"
        />
        <StatCard 
          title="Jumlah Perlawanan" 
          value={stats.totalMatches} 
          icon="⚔️" 
          color="text-purple-400"
        />
        <StatCard 
          title="Pusingan Semasa" 
          value={currentRound || 'Belum Mula'} 
          icon="🏆" 
          color="text-gold"
        />
      </div>

      {/* Progress Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard 
          title="Perlawanan Selesai" 
          value={stats.completedMatches} 
          icon="✓" 
          color="text-green-400"
        />
        <StatCard 
          title="Perlawanan Tertunda" 
          value={stats.pendingMatches} 
          icon="⏳" 
          color="text-yellow-400"
        />
        <StatCard 
          title="Kemajuan" 
          value={`${stats.completionPercentage}%`} 
          icon="📊" 
          color="text-cyan-400"
        />
      </div>

      {/* Progress Bar */}
      {stats.totalMatches > 0 && (
        <div className="bg-navy rounded-lg p-4 border border-lightest-navy/30">
          <div className="flex justify-between items-center mb-2">
            <span className="text-slate font-medium">Kemajuan Pertandingan</span>
            <span className="text-gold font-bold">{stats.completionPercentage}%</span>
          </div>
          <div className="w-full bg-lightest-navy rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-gold to-yellow-400 h-3 rounded-full transition-all duration-500"
              style={{ width: `${stats.completionPercentage}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Format-specific Stats */}
      {format === TournamentFormat.LEAGUE && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard 
            title="Jumlah Kemenangan" 
            value={stats.totalWins} 
            icon="🏅" 
            color="text-green-400"
          />
          <StatCard 
            title="Jumlah Seri" 
            value={stats.totalDraws} 
            icon="🤝" 
            color="text-yellow-400"
          />
          <StatCard 
            title="Jumlah Kekalahan" 
            value={stats.totalLosses} 
            icon="❌" 
            color="text-red-400"
          />
        </div>
      )}

      {format === TournamentFormat.KNOCKOUT && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StatCard 
            title="Pemain Tersingkir" 
            value={stats.eliminatedPlayers} 
            icon="🚫" 
            color="text-red-400"
          />
          <StatCard 
            title="Pemain Masih Aktif" 
            value={stats.activePlayers} 
            icon="⚡" 
            color="text-green-400"
          />
        </div>
      )}

      {/* Top Performers */}
      {players.length > 0 && (
        <div className="bg-navy rounded-lg p-4 border border-lightest-navy/30">
          <h4 className="text-lg font-bold text-gold mb-3">Prestasi Terbaik</h4>
          <div className="space-y-2">
            {/* Most Wins */}
            {(() => {
              const topWinner = [...players].sort((a, b) => b.wins - a.wins)[0];
              return topWinner && topWinner.wins > 0 ? (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate">Paling Banyak Menang:</span>
                  <span className="text-green-400 font-semibold">
                    {topWinner.name} ({topWinner.wins} kemenangan)
                  </span>
                </div>
              ) : null;
            })()}

            {/* Most Points (League) */}
            {format === TournamentFormat.LEAGUE && (() => {
              const topScorer = [...players].sort((a, b) => b.points - a.points)[0];
              return topScorer && topScorer.points > 0 ? (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate">Mata Tertinggi:</span>
                  <span className="text-gold font-semibold">
                    {topScorer.name} ({topScorer.points} mata)
                  </span>
                </div>
              ) : null;
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default Statistics;
