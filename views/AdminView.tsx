

import React, { useState, useEffect } from 'react';
import { useTournamentStore } from '../hooks/useTournamentStore';
import { useAuthStore } from '../hooks/useAuthStore';
import { TournamentStatus, TournamentFormat, TournamentMode, Player, Match } from '../types';
import Header from '../components/Header';
import MusicSettings from '../components/MusicSettings';
import AudioManager from '../components/AudioManager';
import Loading from '../components/Loading';
import SearchInput from '../components/SearchInput';
import Statistics from '../components/Statistics';
import TournamentBracket from '../components/TournamentBracket';
import PlayerProfile from '../components/PlayerProfile';
import DataManager from '../components/DataManager';
import ManualPairingManager from '../components/ManualPairingManager';
import { ToastContainer, useToast } from '../components/Toast';

const AdminView: React.FC = () => {
    const {
        status, setStatus,
        format, setFormat,
        mode, setMode,
        players, addPlayer, removePlayer, updatePlayer,
        matches, generateNextRound, setMatchWinner, setMatchDraw,
        currentRound, isRoundtable,
        welcomeMessage: storeWelcomeMessage, setWelcomeMessage,
        footerText: storeFooterText, setFooterText,
        eventDetails: storeEventDetails, setEventDetails,
        lkimLogoUrl: storeLkimLogoUrl, setLkimLogoUrl,
        madaniLogoUrl: storeMadaniLogoUrl, setMadaniLogoUrl,
        backgroundImageUrl: storeBackgroundImageUrl, setBackgroundImageUrl,
        isSystemLocked, toggleSystemLock,
        resetTournament, exportTournamentData,
    } = useTournamentStore();

    const { username, role, logout, hasPermission } = useAuthStore();
    const { toasts, removeToast, showSuccess, showError } = useToast();

    const [newPlayerName, setNewPlayerName] = useState('');
    const [newPlayerAssoc, setNewPlayerAssoc] = useState('');
    const [newPlayerIC, setNewPlayerIC] = useState('');
    const [newPlayerPhone, setNewPlayerPhone] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showStatistics, setShowStatistics] = useState(false);
    const [showBracket, setShowBracket] = useState(false);
    const [showDataManager, setShowDataManager] = useState(false);
    const [showManualPairing, setShowManualPairing] = useState(false);
    const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

    const [editingPlayer, setEditingPlayer] = useState<{ id: string; name: string; association: string; icNumber?: string; phoneNumber?: string; } | null>(null);

    const [localWelcomeMessage, setLocalWelcomeMessage] = useState(storeWelcomeMessage);
    const [localFooterText, setLocalFooterText] = useState(storeFooterText);
    const [localEventDetails, setLocalEventDetails] = useState(storeEventDetails);
    const [localLkimLogoUrl, setLocalLkimLogoUrl] = useState(storeLkimLogoUrl);
    const [localMadaniLogoUrl, setLocalMadaniLogoUrl] = useState(storeMadaniLogoUrl);
    const [localBackgroundImageUrl, setLocalBackgroundImageUrl] = useState(storeBackgroundImageUrl);
    
    useEffect(() => {
        setLocalWelcomeMessage(storeWelcomeMessage);
        setLocalFooterText(storeFooterText);
        setLocalEventDetails(storeEventDetails);
        setLocalLkimLogoUrl(storeLkimLogoUrl);
        setLocalMadaniLogoUrl(storeMadaniLogoUrl);
        setLocalBackgroundImageUrl(storeBackgroundImageUrl);
    }, [storeWelcomeMessage, storeFooterText, storeEventDetails, storeLkimLogoUrl, storeMadaniLogoUrl, storeBackgroundImageUrl]);

    const handleAddPlayer = async () => {
        if (!newPlayerName.trim() || !newPlayerAssoc.trim()) {
            showError('Nama dan Persatuan/Daerah diperlukan');
            return;
        }

        setIsLoading(true);

        const result = addPlayer(newPlayerName, newPlayerAssoc, newPlayerIC, newPlayerPhone);

        if (result.success) {
            setNewPlayerName('');
            setNewPlayerAssoc('');
            setNewPlayerIC('');
            setNewPlayerPhone('');
            showSuccess('Pemain berjaya ditambah');
        } else {
            showError(result.error || 'Ralat tidak dijangka');
        }

        setIsLoading(false);
    };
    
    const handleRemovePlayer = (id: string) => {
        const playerToRemove = players.find(p => p.id === id);
        if (!playerToRemove) return;

        if (confirm(`Anda pasti mahu memadam peserta "${playerToRemove.name}"?`)) {
            const result = removePlayer(id);

            if (result.success) {
                showSuccess('Pemain berjaya dipadamkan');
            } else {
                showError(result.error || 'Ralat tidak dijangka');
            }
        }
    };

    const handleEdit = (player: Player) => {
        setEditingPlayer({ id: player.id, name: player.name, association: player.association, icNumber: player.icNumber || '', phoneNumber: player.phoneNumber || '' });
    };

    const handleCancelEdit = () => setEditingPlayer(null);

    const handleSaveEdit = () => {
        if (!editingPlayer) return;

        if (!editingPlayer.name.trim() || !editingPlayer.association.trim()) {
            showError('Nama dan Persatuan/Daerah diperlukan');
            return;
        }

        const result = updatePlayer(
            editingPlayer.id,
            editingPlayer.name,
            editingPlayer.association,
            editingPlayer.icNumber,
            editingPlayer.phoneNumber
        );

        if (result.success) {
            setEditingPlayer(null);
            showSuccess('Pemain berjaya dikemaskini');
        } else {
            showError(result.error || 'Ralat tidak dijangka');
        }
    };

    const handleStart = () => {
        if (players.length < 2 || format === TournamentFormat.NOT_SELECTED) {
            showError("Sila tambah sekurang-kurangnya 2 peserta dan pilih format pertandingan.");
            return;
        }

        const result = generateNextRound();
        if (result.success) {
            setStatus(TournamentStatus.ONLINE);
            showSuccess("Pertandingan telah dimulakan!");
        } else {
            showError(result.error || "Ralat semasa memulakan pertandingan");
        }
    };

    const handleGenerateNextRound = () => {
        const result = generateNextRound();
        if (result.success) {
            showSuccess("Pusingan seterusnya telah dijana!");
        } else {
            showError(result.error || "Ralat semasa menjana pusingan seterusnya");
        }
    };

    const handleSetMatchWinner = (matchId: string, winnerId: string) => {
        const result = setMatchWinner(matchId, winnerId);
        if (result.success) {
            showSuccess("Pemenang telah ditetapkan!");
        } else {
            showError(result.error || "Ralat semasa menetapkan pemenang");
        }
    };

    const handleSetMatchDraw = (matchId: string) => {
        const result = setMatchDraw(matchId);
        if (result.success) {
            showSuccess("Keputusan seri telah ditetapkan!");
        } else {
            showError(result.error || "Ralat semasa menetapkan seri");
        }
    };

    const handleImportData = (data: any) => {
        try {
            // This would need to be implemented in the store
            // For now, we'll show a success message
            showSuccess("Import data akan dilaksanakan dalam versi akan datang");
        } catch (error) {
            showError("Ralat semasa import data");
        }
    };

    const handlePlayerClick = (player: Player) => {
        const rank = getLeaderboard().findIndex(p => p.id === player.id) + 1;
        setSelectedPlayer({ ...player, rank } as any);
    };
    
    const handleSaveChanges = () => {
        setWelcomeMessage(localWelcomeMessage);
        setFooterText(localFooterText);
        setEventDetails(localEventDetails);
        setLkimLogoUrl(localLkimLogoUrl);
        setMadaniLogoUrl(localMadaniLogoUrl);
        setBackgroundImageUrl(localBackgroundImageUrl);
        alert('Perubahan telah disimpan!');
    };
    
    const handleResetTournament = () => {
        const confirmationText = "RESET";
        const userInput = prompt(`Ini akan memadamkan SEMUA data pertandingan termasuk peserta.\n\nUntuk mengesahkan, taip "${confirmationText}" di bawah:`);
        
        if (userInput === confirmationText) {
            resetTournament();
            alert("Pertandingan telah di-reset sepenuhnya.");
        } else if (userInput !== null) {
            alert("Teks pengesahan tidak sepadan. Reset dibatalkan.");
        }
    };

    const hasUnsavedChanges = localWelcomeMessage !== storeWelcomeMessage || localFooterText !== storeFooterText || localEventDetails !== storeEventDetails || localLkimLogoUrl !== storeLkimLogoUrl || localMadaniLogoUrl !== storeMadaniLogoUrl || localBackgroundImageUrl !== storeBackgroundImageUrl;
    const allMatchesInRoundDecided = currentRound > 0 && matches.filter(m => m.round === currentRound).length > 0 && matches.filter(m => m.round === currentRound).every(m => m.isFinished);

    // Filter players based on search query
    const filteredPlayers = players.filter(player =>
        player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        player.association.toLowerCase().includes(searchQuery.toLowerCase()) ||
        player.id.includes(searchQuery)
    );

    const getLeaderboard = () => {
        if (format === TournamentFormat.LEAGUE) {
           return [...players].sort((a, b) => b.points - a.points || (b.wins - b.losses) - (a.wins - a.losses));
        } else {
           // Knockout format - sort by tournament ranking, not just wins/losses
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
        }
    };
    
    const getPlayerKnockoutStatus = (player: Player): React.ReactNode => {
        if (status !== TournamentStatus.FINISHED) {
            return player.active ? <span className="text-green-400">Aktif</span> : <span className="text-red-400">Tersingkir</span>;
        }

        const finalMatch = matches.find(m => m.stage === 'Final');
        if (finalMatch?.winnerId === player.id) {
            return <span className="font-bold text-gold">Juara</span>;
        }
        const finalLoserId = finalMatch?.playerA.id === finalMatch?.winnerId ? finalMatch?.playerB?.id : finalMatch?.playerA.id;
        if (finalLoserId === player.id) {
            return <span className="font-bold text-light-slate">Naib Juara</span>;
        }

        const thirdPlaceMatch = matches.find(m => m.stage === 'Penentuan Tempat Ke-3/4');
        if (thirdPlaceMatch?.winnerId === player.id) {
            return <span className="font-bold text-bronze">Tempat Ke-3</span>;
        }
        const thirdPlaceLoserId = thirdPlaceMatch?.playerA.id === thirdPlaceMatch?.winnerId ? thirdPlaceMatch?.playerB?.id : thirdPlaceMatch?.playerA.id;
        if (thirdPlaceLoserId === player.id) {
            return <span className="font-semibold text-slate/80">Tempat Ke-4</span>;
        }

        const semiFinalRounds = matches.filter(m => m.stage === 'Separuh Akhir');
        const semiFinalRoundNumbers = [...new Set(semiFinalRounds.map(m => m.round))];
        for (const roundNum of semiFinalRoundNumbers) {
            const matchesInRound = semiFinalRounds.filter(m => m.round === roundNum);
            if (matchesInRound.length === 2 && matchesInRound.some(m => m.playerB === null)) {
                const actualMatch = matchesInRound.find(m => m.playerB !== null);
                if (actualMatch?.isFinished) {
                    const loserId = actualMatch.playerA.id === actualMatch.winnerId ? actualMatch.playerB?.id : actualMatch.playerA.id;
                    if (loserId === player.id) {
                        return <span className="font-bold text-bronze">Tempat Ke-3</span>;
                    }
                }
            }
        }
        
        return <span className="text-red-400">Tersingkir</span>;
    };


    return (
        <div className="min-h-screen bg-navy text-lightest-slate">
            <Header isAdmin={true} />
            <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
            <main className="p-4 md:p-8">
                {/* User Info & System Status */}
                <div className="mb-6 p-4 rounded-lg border-2 border-gold/50 bg-light-navy/50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {/* Show system status only for Main Admin */}
                            {hasPermission('canLockSystem') || hasPermission('canUnlockSystem') ? (
                                <>
                                    <div className={`w-4 h-4 rounded-full ${isSystemLocked ? 'bg-red-500' : 'bg-green-500'}`}></div>
                                    <span className="text-lg font-semibold">
                                        Status Sistem: {isSystemLocked ? '🔒 DIKUNCI' : '🔓 TERBUKA'}
                                    </span>
                                </>
                            ) : (
                                <span className="text-lg font-semibold text-gold">
                                    {role === 'urusetia' ? '📋 Panel Urusetia' : '👤 Dashboard Personal'}
                                </span>
                            )}
                            <span className="text-sm text-light-slate">
                                | Logged in as: <span className="text-gold font-semibold">{username}</span>
                                <span className="text-xs text-slate ml-2">
                                    ({role === 'main_admin' ? 'Main Admin' : role === 'urusetia' ? 'Urusetia' : 'Personal'})
                                </span>
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            {/* System Lock/Unlock Button - Main Admin only */}
                            {(hasPermission('canLockSystem') || hasPermission('canUnlockSystem')) && (
                                <button
                                    onClick={toggleSystemLock}
                                    className={`px-4 py-2 rounded font-semibold transition-colors ${
                                        isSystemLocked
                                            ? 'bg-green-600 hover:bg-green-700 text-white'
                                            : 'bg-red-600 hover:bg-red-700 text-white'
                                    }`}
                                >
                                    {isSystemLocked ? '🔓 Buka Kunci Sistem' : '🔒 Kunci Sistem'}
                                </button>
                            )}
                            <button
                                onClick={logout}
                                className="px-4 py-2 rounded font-semibold bg-gray-600 hover:bg-gray-700 text-white transition-colors"
                            >
                                🚪 Logout
                            </button>
                        </div>
                    </div>
                    <p className="text-sm text-light-slate mt-2">
                        {isSystemLocked
                            ? 'Sistem dikunci. Semua fungsi admin dimatikan kecuali buka kunci.'
                            : 'Sistem terbuka. Semua fungsi admin boleh digunakan.'
                        }
                        {isSystemLocked && !hasPermission('canUnlockSystem') && (
                            <span className="block text-yellow-400 mt-1">
                                ⚠️ Anda tidak mempunyai kebenaran untuk membuka kunci sistem. Hubungi Main Admin.
                            </span>
                        )}
                    </p>
                </div>

                <section className="mb-8 p-6 bg-light-navy rounded-lg shadow-lg">
                    <h2 className="text-2xl font-bold text-gold mb-4">Kawalan Pertandingan</h2>
                    <div className="flex flex-wrap gap-4 items-center">
                        <span className="font-semibold mr-4">Status Semasa: <span className="px-3 py-1 rounded-full text-sm font-bold" style={{ backgroundColor: status === TournamentStatus.ONLINE ? '#22c55e' : status === TournamentStatus.OFFLINE ? '#f97316' : '#64748b', color: 'white' }}>{status}</span></span>
                        <div className="flex-grow flex flex-wrap gap-4">
                           {status === TournamentStatus.OFFLINE && hasPermission('canManageMatches') && <button onClick={handleStart} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-50" disabled={isSystemLocked || players.length < 2 || format === TournamentFormat.NOT_SELECTED}>🟢 Mula (Online)</button>}
                           {status === TournamentStatus.ONLINE && hasPermission('canManageMatches') && <button onClick={() => setStatus(TournamentStatus.OFFLINE)} className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-50" disabled={isSystemLocked}>⏸️ Tangguh (Offline)</button>}
                           {status === TournamentStatus.ONLINE && hasPermission('canManageMatches') && <button onClick={() => setStatus(TournamentStatus.FINISHED)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-50" disabled={isSystemLocked}>🏁 Tamat (Finished)</button>}
                           {hasPermission('canViewReports') && (
                               <button onClick={() => window.open('/#/print', '_blank')} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded transition-colors">📄 Cetak Laporan</button>
                           )}
                           {hasPermission('canExportData') && (
                               <button onClick={() => setShowDataManager(true)} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-50" disabled={isSystemLocked}>📊 Kelola Data</button>
                           )}
                           {hasPermission('canManageMatches') && (
                               <button onClick={() => setShowManualPairing(true)} className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-50" disabled={isSystemLocked}>
                                   🎲 {mode === TournamentMode.AUTO ? 'Mode Auto' : 'Mode Manual'}
                               </button>
                           )}
                           <button onClick={() => setShowStatistics(!showStatistics)} className={`${showStatistics ? 'bg-gold text-navy' : 'bg-slate hover:bg-light-slate text-navy'} font-bold py-2 px-4 rounded transition-colors`}>
                               {showStatistics ? 'Sembunyikan' : 'Tunjuk'} Statistik
                           </button>
                           {format === TournamentFormat.KNOCKOUT && (
                               <button onClick={() => setShowBracket(!showBracket)} className={`${showBracket ? 'bg-gold text-navy' : 'bg-indigo-600 hover:bg-indigo-700 text-white'} font-bold py-2 px-4 rounded transition-colors`}>
                                   {showBracket ? 'Sembunyikan' : 'Tunjuk'} Bracket
                               </button>
                           )}
                           {hasPermission('canResetTournament') && (
                               <button onClick={handleResetTournament} className="bg-red-700 hover:bg-red-800 text-white font-bold py-2 px-4 rounded transition-colors">Reset Pertandingan</button>
                           )}
                        </div>
                    </div>
                </section>

                {/* Format Selection - Prominent placement for Urusetia */}
                {hasPermission('canModifySettings') && (
                    <section className="mb-8 p-6 bg-light-navy rounded-lg shadow-lg border-2 border-gold/30">
                        <h2 className="text-2xl font-bold text-gold mb-4">
                            🎯 Format Pertandingan
                        </h2>
                        <div className="flex items-center gap-4">
                            <div className="flex-grow">
                                <label className="block mb-2 font-semibold">Pilih Format Pertandingan</label>
                                <select
                                    value={format}
                                    onChange={e => setFormat(e.target.value as TournamentFormat)}
                                    className="w-full bg-navy p-3 rounded border border-lightest-navy text-lg"
                                    disabled={isSystemLocked || status !== TournamentStatus.OFFLINE}
                                >
                                    <option value={TournamentFormat.NOT_SELECTED}>-- Pilih Format --</option>
                                    <option value={TournamentFormat.LEAGUE}>Liga (Round Robin)</option>
                                    <option value={TournamentFormat.KNOCKOUT}>Kalah Mati (Knockout)</option>
                                </select>
                            </div>
                            <div className="text-sm text-light-slate">
                                <div className="p-3 bg-navy rounded border border-lightest-navy">
                                    <p className="font-semibold text-gold mb-1">Format Semasa:</p>
                                    <p className="text-lightest-slate">
                                        {format === TournamentFormat.NOT_SELECTED ? '❌ Belum Dipilih' :
                                         format === TournamentFormat.LEAGUE ? '🔄 Liga (Round Robin)' :
                                         '⚔️ Kalah Mati (Knockout)'}
                                    </p>
                                </div>
                            </div>
                        </div>
                        {role === 'urusetia' && (
                            <div className="mt-4 p-3 bg-navy rounded border border-lightest-navy">
                                <p className="text-sm text-light-slate">
                                    ℹ️ Sila pilih format pertandingan sebelum mula pertandingan. Untuk tetapan lain, hubungi Main Admin.
                                </p>
                            </div>
                        )}
                    </section>
                )}

                <div className="grid md:grid-cols-2 gap-8 mb-8">
                    {/* Player Management - Urusetia & Main Admin only */}
                    {hasPermission('canManagePlayers') && (
                        <div className="p-6 bg-light-navy rounded-lg shadow-lg">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-bold text-gold">👥 Pengurusan Peserta ({players.length})</h2>
                                <div className="text-sm text-slate">
                                    {searchQuery && `Menunjukkan ${filteredPlayers.length} daripada ${players.length} peserta`}
                                </div>
                            </div>

                            {/* Search Input */}
                            <div className="mb-4">
                                <SearchInput
                                    placeholder="Cari peserta (nama, persatuan, atau ID)..."
                                    onSearch={setSearchQuery}
                                    className="w-full"
                                />
                            </div>
                            <div className="mb-4">
                                <input type="text" placeholder="Nama Penuh" value={newPlayerName} onChange={e => setNewPlayerName(e.target.value)} className="w-full bg-navy p-2 rounded border border-lightest-navy mb-2" />
                                <input type="text" placeholder="Persatuan/Daerah" value={newPlayerAssoc} onChange={e => setNewPlayerAssoc(e.target.value)} className="w-full bg-navy p-2 rounded border border-lightest-navy mb-2" />
                                <input type="text" placeholder="No Kad Pengenalan (Pilihan)" value={newPlayerIC} onChange={e => setNewPlayerIC(e.target.value)} className="w-full bg-navy p-2 rounded border border-lightest-navy mb-2" />
                                <input type="text" placeholder="No Telefon (Pilihan)" value={newPlayerPhone} onChange={e => setNewPlayerPhone(e.target.value)} className="w-full bg-navy p-2 rounded border border-lightest-navy mb-2" />
                            <button
                                onClick={handleAddPlayer}
                                className="w-full bg-gold hover:opacity-90 text-navy font-bold py-2 px-4 rounded transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                disabled={isSystemLocked || status !== TournamentStatus.OFFLINE || isLoading || !hasPermission('canManagePlayers')}
                            >
                                {isLoading && <div className="w-4 h-4 border-2 border-navy border-t-transparent rounded-full animate-spin"></div>}
                                {isLoading ? 'Menambah...' : 'Tambah Peserta'}
                            </button>
                        </div>
                        <ul className="max-h-96 overflow-y-auto pr-2">
                            {filteredPlayers.length === 0 ? (
                                <li className="p-4 text-center text-slate">
                                    {searchQuery ? 'Tiada peserta dijumpai' : 'Belum ada peserta ditambah'}
                                </li>
                            ) : (
                                filteredPlayers.map(p => (
                                <li key={p.id} className="p-3 bg-navy rounded mb-2 border border-lightest-navy/50">
                                    {editingPlayer?.id === p.id ? (
                                        <div>
                                            <input type="text" value={editingPlayer.name} onChange={(e) => setEditingPlayer({ ...editingPlayer, name: e.target.value })} className="w-full bg-light-navy p-2 rounded border border-lightest-navy mb-2" />
                                            <input type="text" value={editingPlayer.association} onChange={(e) => setEditingPlayer({ ...editingPlayer, association: e.target.value })} className="w-full bg-light-navy p-2 rounded border border-lightest-navy mb-2" />
                                            <input type="text" placeholder="No Kad Pengenalan (Pilihan)" value={editingPlayer.icNumber} onChange={(e) => setEditingPlayer({ ...editingPlayer, icNumber: e.target.value })} className="w-full bg-light-navy p-2 rounded border border-lightest-navy mb-2" />
                                            <input type="text" placeholder="No Telefon (Pilihan)" value={editingPlayer.phoneNumber} onChange={(e) => setEditingPlayer({ ...editingPlayer, phoneNumber: e.target.value })} className="w-full bg-light-navy p-2 rounded border border-lightest-navy mb-2" />
                                            <div className="flex gap-2 justify-end">
                                                <button onClick={handleCancelEdit} className="text-xs bg-slate hover:bg-light-slate text-navy font-bold py-1 px-3 rounded">Batal</button>
                                                <button onClick={handleSaveEdit} className="text-xs bg-gold hover:opacity-90 text-navy font-bold py-1 px-3 rounded">Simpan</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex justify-between items-start">
                                            <div className="text-base">
                                                <p className="font-semibold text-lightest-slate leading-tight"><span>{p.id} - </span><strong className="font-bold">{p.name}</strong><span className="text-light-slate text-sm ml-2">({p.association})</span></p>
                                                {(p.icNumber || p.phoneNumber) && (<div className="text-xs text-slate mt-1.5">{p.icNumber && <span>KP: {p.icNumber}</span>}{p.icNumber && p.phoneNumber && <span className="mx-2">|</span>}{p.phoneNumber && <span>Tel: {p.phoneNumber}</span>}</div>)}
                                            </div>
                                            <div className="flex gap-2 items-center flex-shrink-0 ml-4">
                                                <button onClick={() => handleEdit(p)} className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded disabled:opacity-50 disabled:cursor-not-allowed" disabled={isSystemLocked || status !== TournamentStatus.OFFLINE || !hasPermission('canManagePlayers')} title={isSystemLocked ? "Sistem dikunci" : status !== TournamentStatus.OFFLINE ? "Hanya boleh edit semasa status OFFLINE" : !hasPermission('canManagePlayers') ? "Tiada kebenaran edit peserta" : "Edit Peserta"}>Edit</button>
                                                <button onClick={() => handleRemovePlayer(p.id)} className="text-red-400 hover:text-red-200 text-2xl font-bold disabled:opacity-50 disabled:cursor-not-allowed" disabled={isSystemLocked || status !== TournamentStatus.OFFLINE || !hasPermission('canManagePlayers')} title={isSystemLocked ? "Sistem dikunci" : status !== TournamentStatus.OFFLINE ? "Hanya boleh padam semasa status OFFLINE" : !hasPermission('canManagePlayers') ? "Tiada kebenaran padam peserta" : "Padam Peserta"}>&times;</button>
                                            </div>
                                        </div>
                                    )}
                                </li>
                                ))
                            )}
                        </ul>
                        </div>
                    )}

                    {/* Personal Dashboard - Personal role only */}
                    {role === 'personal' && (
                        <div className="p-6 bg-light-navy rounded-lg shadow-lg">
                            <h2 className="text-2xl font-bold text-gold mb-4">👤 Dashboard Personal</h2>
                            <div className="space-y-4">
                                <div className="p-4 bg-navy rounded border border-lightest-navy">
                                    <h3 className="text-lg font-semibold text-gold mb-2">📊 Statistik Pertandingan</h3>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-light-slate">Total Peserta:</span>
                                            <span className="text-lightest-slate font-bold ml-2">{players.length}</span>
                                        </div>
                                        <div>
                                            <span className="text-light-slate">Status:</span>
                                            <span className="text-lightest-slate font-bold ml-2">{status}</span>
                                        </div>
                                        <div>
                                            <span className="text-light-slate">Format:</span>
                                            <span className="text-lightest-slate font-bold ml-2">
                                                {format === TournamentFormat.NOT_SELECTED ? 'Belum Dipilih' :
                                                 format === TournamentFormat.LEAGUE ? 'Liga' : 'Kalah Mati'}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-light-slate">Pusingan:</span>
                                            <span className="text-lightest-slate font-bold ml-2">{currentRound}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-navy rounded border border-lightest-navy">
                                    <h3 className="text-lg font-semibold text-gold mb-2">🎯 Akses Tersedia</h3>
                                    <ul className="space-y-2 text-sm text-light-slate">
                                        <li>✅ Lihat statistik pertandingan</li>
                                        <li>✅ Cetak laporan</li>
                                        <li>✅ Lihat papan kedudukan</li>
                                        <li>❌ Urus peserta (Hubungi Urusetia)</li>
                                        <li>❌ Urus perlawanan (Hubungi Urusetia)</li>
                                        <li>❌ Ubah tetapan sistem (Hubungi Main Admin)</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Advanced Settings Panel - Main Admin only */}
                    {role === 'main_admin' && (
                        <div className="p-6 bg-light-navy rounded-lg shadow-lg">
                            <h2 className="text-2xl font-bold text-gold mb-4">⚙️ Tetapan Sistem Lanjutan</h2>
                            <div className="mb-4"><label className="block mb-2 font-semibold">URL Logo Kiri (LKIM)</label><input type="text" value={localLkimLogoUrl} onChange={e => setLocalLkimLogoUrl(e.target.value)} className="w-full bg-navy p-2 rounded border border-lightest-navy" disabled={isSystemLocked || status !== TournamentStatus.OFFLINE} /></div>
                            <div className="mb-4"><label className="block mb-2 font-semibold">URL Logo Kanan (MADANI)</label><input type="text" value={localMadaniLogoUrl} onChange={e => setLocalMadaniLogoUrl(e.target.value)} className="w-full bg-navy p-2 rounded border border-lightest-navy" disabled={isSystemLocked || status !== TournamentStatus.OFFLINE} /></div>
                            <div className="mb-4"><label className="block mb-2 font-semibold">URL Gambar Background</label><input type="text" value={localBackgroundImageUrl} onChange={e => setLocalBackgroundImageUrl(e.target.value)} className="w-full bg-navy p-2 rounded border border-lightest-navy" disabled={isSystemLocked || status !== TournamentStatus.OFFLINE} placeholder="https://example.com/background.jpg" /></div>
                            <div className="mb-4"><label className="block mb-2 font-semibold">Butiran Acara</label><input type="text" value={localEventDetails} onChange={e => setLocalEventDetails(e.target.value)} className="w-full bg-navy p-2 rounded border border-lightest-navy" disabled={isSystemLocked || status !== TournamentStatus.OFFLINE} placeholder="Contoh: GELOMBANG SAMUDERA MADANI" /></div>
                            <div className="mb-4"><label className="block mb-2 font-semibold">Mesej Selamat Datang</label><textarea value={localWelcomeMessage} onChange={e => setLocalWelcomeMessage(e.target.value)} rows={3} className="w-full bg-navy p-2 rounded border border-lightest-navy" disabled={isSystemLocked || status !== TournamentStatus.OFFLINE}></textarea></div>
                            <div><label className="block mb-2 font-semibold">Teks Footer</label><textarea value={localFooterText} onChange={e => setLocalFooterText(e.target.value)} rows={3} className="w-full bg-navy p-2 rounded border border-lightest-navy" disabled={isSystemLocked || status !== TournamentStatus.OFFLINE}></textarea></div>
                            {hasUnsavedChanges && (<button onClick={handleSaveChanges} className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-50" disabled={isSystemLocked || status !== TournamentStatus.OFFLINE}>Simpan Perubahan</button>)}
                        </div>
                    )}
                </div>

                {/* Music Settings Panel - Main Admin only */}
                {role === 'main_admin' && (
                    <div className="mb-8 space-y-6">
                        {/* Music Status Monitor */}
                        <AudioManager tournamentStatus={status} />

                        {/* Full Music Settings */}
                        <MusicSettings />
                    </div>
                )}

                {status === TournamentStatus.ONLINE && (
                <section className="p-6 bg-light-navy rounded-lg shadow-lg">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h2 className="text-2xl font-bold text-gold">Perlawanan Pusingan {currentRound}</h2>
                            {isRoundtable && <p className="text-sm text-yellow-400 mt-1">🔄 Format Roundtable - Semua lawan semua</p>}
                        </div>
                        <button onClick={handleGenerateNextRound} className={`bg-gold hover:opacity-90 text-navy font-bold py-2 px-4 rounded transition-colors disabled:opacity-50 disabled:animate-none ${allMatchesInRoundDecided ? 'animate-pulse' : ''}`} disabled={isSystemLocked || !allMatchesInRoundDecided}>Jana Pusingan Seterusnya</button>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...matches]
                        .filter(m => m.round === currentRound)
                        .sort((a, b) => {
                            // Sort: 3rd place playoff first, then final, then by table number
                            if (a.stage === 'Penentuan Tempat Ke-3/4') return -1;
                            if (b.stage === 'Penentuan Tempat Ke-3/4') return 1;
                            if (a.stage === 'Final') return 1;
                            if (b.stage === 'Final') return -1;
                            return a.table - b.table;
                        })
                        .map(match => (
                        <div key={match.id} className="p-4 bg-navy rounded-lg border border-lightest-navy">
                            <p className="font-bold text-light-slate mb-2">{match.stage || `Meja ${match.table}`}</p>
                            {match.playerB ? (
                                <div className="space-y-2">
                                    <div className={`flex justify-between items-center p-2 rounded ${match.isFinished && match.winnerId === match.playerA.id ? 'bg-green-900 border-l-4 border-green-400' : ''}`}><span className={match.isFinished && match.winnerId !== match.playerA.id ? 'line-through text-slate' : ''}>{match.playerA.name}</span><button onClick={() => handleSetMatchWinner(match.id, match.playerA.id)} className="text-xs bg-slate hover:bg-light-slate text-navy font-bold py-1 px-2 rounded disabled:opacity-50" disabled={isSystemLocked || match.isFinished}>Pilih Pemenang</button></div>
                                    {format === TournamentFormat.LEAGUE && (<div className="text-center"><button onClick={() => handleSetMatchDraw(match.id)} className="text-xs bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-1 px-3 rounded disabled:opacity-50" disabled={isSystemLocked || match.isFinished}>Seri</button></div>)}
                                    <div className={`flex justify-between items-center p-2 rounded ${match.isFinished && match.winnerId === match.playerB.id ? 'bg-green-900 border-l-4 border-green-400' : ''}`}><span className={match.isFinished && match.winnerId !== match.playerB.id ? 'line-through text-slate' : ''}>{match.playerB.name}</span><button onClick={() => handleSetMatchWinner(match.id, match.playerB.id!)} className="text-xs bg-slate hover:bg-light-slate text-navy font-bold py-1 px-2 rounded disabled:opacity-50" disabled={isSystemLocked || match.isFinished}>Pilih Pemenang</button></div>
                                </div>
                            ) : (
                                <div className="p-2 text-center text-red-400">
                                    <span>Error: Perlawanan tidak lengkap - tiada lawan</span>
                                </div>
                            )}
                        </div>
                    ))}
                    </div>
                </section>
                )}
                 {players.length > 0 && (
                 <section className="mt-8 p-6 bg-light-navy rounded-lg shadow-lg">
                    <h2 className="text-2xl font-bold text-gold mb-4">Papan Kedudukan</h2>
                     <div className="overflow-x-auto">
                         <table className="w-full text-left">
                             <thead className="text-light-slate border-b-2 border-slate">
                                 <tr>
                                     <th className="p-2">No.</th>
                                     <th className="p-2">ID</th>
                                     <th className="p-2">Nama Pemain</th>
                                     <th className="p-2">Persatuan</th>
                                     {format === TournamentFormat.LEAGUE && <th className="p-2 text-center">Mata</th>}
                                     <th className="p-2 text-center">Menang</th>
                                     {format === TournamentFormat.LEAGUE && <th className="p-2 text-center">Seri</th>}
                                     <th className="p-2 text-center">Kalah</th>
                                     {format === TournamentFormat.KNOCKOUT && <th className="p-2 text-center">Status</th>}
                                 </tr>
                             </thead>
                             <tbody>
                                 {getLeaderboard().map((p, index) => (
                                     <tr key={p.id} className="border-b border-lightest-navy/20">
                                         <td className="p-2 font-bold text-light-slate">{index + 1}</td>
                                         <td className="p-2 font-mono text-light-slate">{p.id}</td>
                                         <td className="p-2 font-semibold text-lightest-slate">
                                             <button
                                                 onClick={() => handlePlayerClick(p)}
                                                 className="hover:text-gold transition-colors cursor-pointer text-left"
                                             >
                                                 {p.name}
                                             </button>
                                         </td>
                                         <td className="p-2 text-light-slate">{p.association}</td>
                                         {format === TournamentFormat.LEAGUE && <td className="p-2 text-center font-bold text-gold">{p.points}</td>}
                                         <td className="p-2 text-center font-semibold text-green-400">{p.wins}</td>
                                         {format === TournamentFormat.LEAGUE && <td className="p-2 text-center font-semibold text-yellow-400">{p.draws}</td>}
                                         <td className="p-2 text-center font-semibold text-red-400">{p.losses}</td>
                                         {format === TournamentFormat.KNOCKOUT && <td className="p-2 text-center">{getPlayerKnockoutStatus(p)}</td>}
                                     </tr>
                                 ))}
                             </tbody>
                         </table>
                     </div>
                </section>
                )}

                {/* Statistics Section */}
                {showStatistics && (
                    <section className="mt-8 p-6 bg-light-navy rounded-lg shadow-lg">
                        <Statistics
                            players={players}
                            matches={matches}
                            format={format}
                            currentRound={currentRound}
                        />
                    </section>
                )}

                {/* Tournament Bracket */}
                {showBracket && format === TournamentFormat.KNOCKOUT && (
                    <section className="mt-8 p-6 bg-light-navy rounded-lg shadow-lg">
                        <TournamentBracket
                            matches={matches}
                            format={format}
                            onSetWinner={handleSetMatchWinner}
                            isAdmin={true}
                        />
                    </section>
                )}
            </main>

            {/* Modals */}
            {selectedPlayer && (
                <PlayerProfile
                    player={selectedPlayer}
                    matches={matches}
                    format={format}
                    rank={getLeaderboard().findIndex(p => p.id === selectedPlayer.id) + 1}
                    onClose={() => setSelectedPlayer(null)}
                />
            )}

            {showDataManager && (
                <DataManager
                    onImportData={handleImportData}
                    onExportData={exportTournamentData}
                    onClose={() => setShowDataManager(false)}
                />
            )}

            {showManualPairing && (
                <ManualPairingManager
                    onClose={() => setShowManualPairing(false)}
                />
            )}
        </div>
    );
};

export default AdminView;