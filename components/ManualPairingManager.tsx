import React, { useState } from 'react';
import { TournamentMode, PairingStatus, Player, ManualPairing } from '../types';
import { useTournamentStore } from '../hooks/useTournamentStore';
import { PlusIcon, TrashIcon, LockClosedIcon, LockOpenIcon, CheckIcon, DocumentArrowUpIcon } from './icons';

interface ManualPairingManagerProps {
  onClose: () => void;
}

const ManualPairingManager: React.FC<ManualPairingManagerProps> = ({ onClose }) => {
  const { 
    mode, 
    players, 
    manualPairings, 
    pairingStatus, 
    currentRound,
    setMode,
    addManualPairing,
    updateManualPairing,
    removeManualPairing,
    lockPairings,
    unlockPairings,
    confirmPairings,
    importPairings
  } = useTournamentStore();

  const [selectedPlayerA, setSelectedPlayerA] = useState<string>('');
  const [selectedPlayerB, setSelectedPlayerB] = useState<string>('');
  const [selectedTable, setSelectedTable] = useState<number>(1);
  const [showImport, setShowImport] = useState(false);
  const [importData, setImportData] = useState<string>('');

  const activePlayers = players.filter(p => p.active);
  const nextRound = currentRound + 1;

  const handleAddPairing = () => {
    if (!selectedPlayerA) {
      alert('Sila pilih Pemain A');
      return;
    }

    if (!selectedPlayerB) {
      alert('Sila pilih Pemain B. Tiada BYE dibenarkan dalam pertandingan Dam Aji.');
      return;
    }

    const result = addManualPairing(
      nextRound,
      selectedTable,
      selectedPlayerA,
      selectedPlayerB
    );

    if (result.success) {
      setSelectedPlayerA('');
      setSelectedPlayerB('');
      setSelectedTable(selectedTable + 1);
    } else {
      alert(result.error);
    }
  };

  const handleRemovePairing = (pairingId: string) => {
    if (confirm('Adakah anda pasti mahu membuang pasangan ini?')) {
      const result = removeManualPairing(pairingId);
      if (!result.success) {
        alert(result.error);
      }
    }
  };

  const handleLockPairings = () => {
    const result = lockPairings();
    if (!result.success) {
      alert(result.error);
    }
  };

  const handleConfirmPairings = () => {
    if (confirm('Adakah anda pasti mahu mengesahkan semua pasangan? Tindakan ini tidak boleh dibatalkan.')) {
      const result = confirmPairings();
      if (!result.success) {
        alert(result.error);
      }
    }
  };

  const handleImportPairings = () => {
    try {
      const lines = importData.trim().split('\n');
      const pairings: { table: number; playerAId: string; playerBId: string }[] = [];

      for (const line of lines) {
        const parts = line.split(',').map(p => p.trim());
        if (parts.length >= 3) {
          const table = parseInt(parts[0]);
          const playerAId = parts[1];
          const playerBId = parts[2];

          if (!isNaN(table) && playerAId && playerBId) {
            pairings.push({ table, playerAId, playerBId });
          }
        }
      }

      if (pairings.length === 0) {
        alert('Tiada data yang sah dijumpai. Format: Meja,PemainA,PemainB (kedua-dua pemain diperlukan)');
        return;
      }

      const result = importPairings(pairings);
      if (result.success) {
        setImportData('');
        setShowImport(false);
        alert(`${pairings.length} pasangan berjaya diimport`);
      } else {
        alert(result.error);
      }
    } catch (error) {
      alert('Ralat semasa memproses data import');
    }
  };

  const getPlayerName = (playerId: string) => {
    const player = players.find(p => p.id === playerId);
    return player ? `${player.id} - ${player.name}` : playerId;
  };

  const getAvailablePlayers = (excludeIds: string[] = []) => {
    const pairedPlayerIds = new Set(
      manualPairings.flatMap(p => [p.playerAId, p.playerBId].filter(Boolean))
    );
    
    return activePlayers.filter(p => 
      !pairedPlayerIds.has(p.id) && !excludeIds.includes(p.id)
    );
  };

  const isLocked = pairingStatus === PairingStatus.LOCKED || pairingStatus === PairingStatus.CONFIRMED;
  const isConfirmed = pairingStatus === PairingStatus.CONFIRMED;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-navy rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="bg-light-navy p-6 border-b border-lightest-navy/20">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gold">Pengurusan Pasangan Manual</h2>
              <p className="text-light-slate mt-1">
                Mode: <span className="text-gold font-semibold">{mode === TournamentMode.AUTO ? 'Automatik' : 'Manual'}</span>
                {' | '}Status: <span className={`font-semibold ${
                  pairingStatus === PairingStatus.DRAFT ? 'text-yellow-400' :
                  pairingStatus === PairingStatus.LOCKED ? 'text-orange-400' : 'text-green-400'
                }`}>
                  {pairingStatus === PairingStatus.DRAFT ? 'Draf' :
                   pairingStatus === PairingStatus.LOCKED ? 'Dikunci' : 'Disahkan'}
                </span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-light-slate hover:text-white transition-colors text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Mode Selector */}
          <div className="mb-6 p-4 bg-light-navy rounded-lg">
            <h3 className="text-lg font-semibold text-gold mb-3">Pilih Mode Pertandingan</h3>
            <div className="flex gap-4">
              <button
                onClick={() => setMode(TournamentMode.AUTO)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  mode === TournamentMode.AUTO
                    ? 'bg-gold text-navy'
                    : 'bg-lightest-navy text-light-slate hover:bg-slate/20'
                }`}
              >
                🤖 Mode Automatik (Testing/Demo)
              </button>
              <button
                onClick={() => setMode(TournamentMode.MANUAL)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  mode === TournamentMode.MANUAL
                    ? 'bg-gold text-navy'
                    : 'bg-lightest-navy text-light-slate hover:bg-slate/20'
                }`}
              >
                🎲 Mode Manual (Pertandingan Sebenar)
              </button>
            </div>
          </div>

          {mode === TournamentMode.MANUAL && (
            <>
              {/* Add New Pairing */}
              {!isConfirmed && (
                <div className="mb-6 p-4 bg-light-navy rounded-lg">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gold">Tambah Pasangan Baru</h3>
                    <button
                      onClick={() => setShowImport(!showImport)}
                      className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <DocumentArrowUpIcon className="w-4 h-4" />
                      Import CSV
                    </button>
                  </div>

                  {showImport && (
                    <div className="mb-4 p-3 bg-navy rounded border border-lightest-navy/20">
                      <p className="text-light-slate text-sm mb-2">
                        Format CSV: Meja,PemainA,PemainB (satu baris per pasangan)
                      </p>
                      <textarea
                        value={importData}
                        onChange={(e) => setImportData(e.target.value)}
                        placeholder="1,001,002&#10;2,003,004&#10;3,005,006"
                        className="w-full h-24 p-2 bg-lightest-navy text-white rounded border border-slate/30 resize-none"
                      />
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={handleImportPairings}
                          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                        >
                          Import
                        </button>
                        <button
                          onClick={() => setShowImport(false)}
                          className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                        >
                          Batal
                        </button>
                      </div>
                    </div>
                  )}

                  {!isLocked && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-light-slate text-sm mb-1">Meja</label>
                        <input
                          type="number"
                          min="1"
                          value={selectedTable}
                          onChange={(e) => setSelectedTable(parseInt(e.target.value) || 1)}
                          className="w-full p-2 bg-lightest-navy text-white rounded border border-slate/30"
                        />
                      </div>
                      <div>
                        <label className="block text-light-slate text-sm mb-1">Pemain A</label>
                        <select
                          value={selectedPlayerA}
                          onChange={(e) => setSelectedPlayerA(e.target.value)}
                          className="w-full p-2 bg-lightest-navy text-white rounded border border-slate/30"
                        >
                          <option value="">Pilih Pemain A</option>
                          {getAvailablePlayers([selectedPlayerB]).map(player => (
                            <option key={player.id} value={player.id}>
                              {player.id} - {player.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-light-slate text-sm mb-1">Pemain B</label>
                        <select
                          value={selectedPlayerB}
                          onChange={(e) => setSelectedPlayerB(e.target.value)}
                          className="w-full p-2 bg-lightest-navy text-white rounded border border-slate/30"
                        >
                          <option value="">Pilih Pemain B</option>
                          {getAvailablePlayers([selectedPlayerA]).map(player => (
                            <option key={player.id} value={player.id}>
                              {player.id} - {player.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-end">
                        <button
                          onClick={handleAddPairing}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <PlusIcon className="w-4 h-4" />
                          Tambah
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Current Pairings */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gold">
                    Pasangan Pusingan {nextRound} ({manualPairings.length} pasangan)
                  </h3>
                  <div className="flex gap-2">
                    {!isConfirmed && (
                      <>
                        {pairingStatus === PairingStatus.DRAFT ? (
                          <button
                            onClick={handleLockPairings}
                            className="flex items-center gap-2 px-3 py-1 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                          >
                            <LockClosedIcon className="w-4 h-4" />
                            Kunci Pasangan
                          </button>
                        ) : (
                          <button
                            onClick={unlockPairings}
                            className="flex items-center gap-2 px-3 py-1 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                          >
                            <LockOpenIcon className="w-4 h-4" />
                            Buka Kunci
                          </button>
                        )}
                        {pairingStatus === PairingStatus.LOCKED && (
                          <button
                            onClick={handleConfirmPairings}
                            className="flex items-center gap-2 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            <CheckIcon className="w-4 h-4" />
                            Sahkan Pasangan
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {manualPairings.length === 0 ? (
                  <div className="text-center py-8 text-light-slate">
                    Tiada pasangan ditambah lagi. Gunakan borang di atas untuk menambah pasangan.
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {[...manualPairings]
                      .sort((a, b) => a.table - b.table)
                      .map(pairing => (
                        <div
                          key={pairing.id}
                          className={`p-4 rounded-lg border ${
                            pairing.status === PairingStatus.CONFIRMED
                              ? 'bg-green-900/20 border-green-500/30'
                              : pairing.status === PairingStatus.LOCKED
                              ? 'bg-orange-900/20 border-orange-500/30'
                              : 'bg-light-navy border-lightest-navy/20'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex-1">
                              <div className="flex items-center gap-4">
                                <span className="text-gold font-bold">Meja {pairing.table}</span>
                                <span className="text-white">
                                  {getPlayerName(pairing.playerAId)}
                                </span>
                                <span className="text-light-slate">vs</span>
                                <span className="text-white">
                                  {getPlayerName(pairing.playerBId)}
                                </span>
                              </div>
                            </div>
                            {!isConfirmed && !isLocked && (
                              <button
                                onClick={() => handleRemovePairing(pairing.id)}
                                className="flex items-center gap-1 px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                              >
                                <TrashIcon className="w-4 h-4" />
                                Buang
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </>
          )}

          {mode === TournamentMode.AUTO && (
            <div className="text-center py-8">
              <p className="text-light-slate text-lg">
                Mode Automatik dipilih. Sistem akan menjana pasangan secara automatik.
              </p>
              <p className="text-slate text-sm mt-2">
                Tukar ke Mode Manual untuk mengurus pasangan secara manual.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManualPairingManager;
