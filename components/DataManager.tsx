import React, { useState, useRef } from 'react';
import { Player, Match, TournamentStatus, TournamentFormat } from '../types';

interface DataManagerProps {
  onImportData: (data: any) => void;
  onExportData: () => void;
  onClose: () => void;
}

interface ImportData {
  players?: Player[];
  matches?: Match[];
  tournamentInfo?: {
    status: TournamentStatus;
    format: TournamentFormat;
    currentRound: number;
    welcomeMessage: string;
    footerText: string;
  };
}

const DataManager: React.FC<DataManagerProps> = ({ onImportData, onExportData, onClose }) => {
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportError('');
    setImportSuccess('');
    setIsProcessing(true);

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      // Validate the imported data structure
      if (!validateImportData(data)) {
        setImportError('Format fail tidak sah. Sila pastikan fail adalah export dari sistem ini.');
        return;
      }

      onImportData(data);
      setImportSuccess('Data berjaya diimport!');
      
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Import error:', error);
      setImportError('Ralat membaca fail. Pastikan fail adalah format JSON yang sah.');
    } finally {
      setIsProcessing(false);
    }
  };

  const validateImportData = (data: any): data is ImportData => {
    // Basic structure validation
    if (typeof data !== 'object' || data === null) return false;

    // Check if it has expected properties
    const hasValidStructure = 
      (data.players && Array.isArray(data.players)) ||
      (data.matches && Array.isArray(data.matches)) ||
      (data.tournamentInfo && typeof data.tournamentInfo === 'object');

    if (!hasValidStructure) return false;

    // Validate players array if present
    if (data.players) {
      const isValidPlayers = data.players.every((player: any) => 
        typeof player === 'object' &&
        typeof player.id === 'string' &&
        typeof player.name === 'string' &&
        typeof player.association === 'string' &&
        typeof player.wins === 'number' &&
        typeof player.losses === 'number' &&
        typeof player.draws === 'number' &&
        typeof player.points === 'number' &&
        typeof player.active === 'boolean'
      );
      if (!isValidPlayers) return false;
    }

    // Validate matches array if present
    if (data.matches) {
      const isValidMatches = data.matches.every((match: any) =>
        typeof match === 'object' &&
        typeof match.id === 'string' &&
        typeof match.round === 'number' &&
        typeof match.table === 'number' &&
        typeof match.playerA === 'object' &&
        typeof match.isFinished === 'boolean' &&
        typeof match.isDraw === 'boolean'
      );
      if (!isValidMatches) return false;
    }

    return true;
  };

  const handleExportPlayers = () => {
    // This would be implemented to export only players
    onExportData();
  };

  const handleExportAll = () => {
    onExportData();
  };

  const generateSampleData = () => {
    const sampleData = {
      exportDate: new Date().toISOString(),
      tournamentInfo: {
        status: TournamentStatus.OFFLINE,
        format: TournamentFormat.NOT_SELECTED,
        currentRound: 0,
        welcomeMessage: "Selamat Datang\nPertandingan Dam Aji\nLKIM 2025",
        footerText: "© 2025 Persatuan Nelayan Kawasan Semerak. Semua hak cipta terpelihara."
      },
      players: [
        {
          id: "001",
          name: "Ahmad bin Abdullah",
          association: "Persatuan Dam Negeri Sembilan",
          icNumber: "850101-05-1234",
          phoneNumber: "012-3456789",
          wins: 0,
          losses: 0,
          draws: 0,
          points: 0,
          active: true
        }
      ],
      matches: [],
      statistics: {
        totalPlayers: 1,
        totalMatches: 0,
        completedMatches: 0
      }
    };

    const jsonString = JSON.stringify(sampleData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sample-tournament-data.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-light-navy rounded-lg shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="p-6 border-b border-lightest-navy/30">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gold">Pengurusan Data</h2>
            <button
              onClick={onClose}
              className="text-slate hover:text-lightest-slate text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Import Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-lightest-slate">Import Data</h3>
            
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="hidden"
                id="file-input"
              />
              
              <label
                htmlFor="file-input"
                className={`block w-full p-3 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${
                  isProcessing 
                    ? 'border-yellow-400 bg-yellow-900/20 text-yellow-400' 
                    : 'border-lightest-navy hover:border-gold text-slate hover:text-gold'
                }`}
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                    Memproses...
                  </div>
                ) : (
                  <>
                    <div className="text-2xl mb-2">📁</div>
                    <p className="font-medium">Klik untuk pilih fail JSON</p>
                    <p className="text-xs">Atau seret fail ke sini</p>
                  </>
                )}
              </label>

              {importError && (
                <div className="p-3 bg-red-900/50 border border-red-500 rounded text-red-200 text-sm">
                  {importError}
                </div>
              )}

              {importSuccess && (
                <div className="p-3 bg-green-900/50 border border-green-500 rounded text-green-200 text-sm">
                  {importSuccess}
                </div>
              )}
            </div>
          </div>

          {/* Export Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-lightest-slate">Export Data</h3>
            
            <div className="space-y-2">
              <button
                onClick={handleExportAll}
                className="w-full bg-gold hover:opacity-90 text-navy font-bold py-2 px-4 rounded transition-colors"
              >
                Export Semua Data
              </button>
              
              <button
                onClick={generateSampleData}
                className="w-full bg-slate hover:bg-light-slate text-navy font-bold py-2 px-4 rounded transition-colors"
              >
                Muat Turun Contoh Format
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-navy rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gold mb-2">Panduan:</h4>
            <ul className="text-xs text-slate space-y-1">
              <li>• Import akan menggantikan data sedia ada</li>
              <li>• Pastikan fail adalah format JSON yang sah</li>
              <li>• Buat backup sebelum import data baru</li>
              <li>• Export akan menyimpan semua data pertandingan</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-lightest-navy/30">
          <button
            onClick={onClose}
            className="w-full bg-lightest-navy hover:bg-slate text-lightest-slate font-bold py-2 px-4 rounded transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataManager;
