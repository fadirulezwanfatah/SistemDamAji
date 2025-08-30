
export enum TournamentStatus {
  OFFLINE = 'OFFLINE',
  ONLINE = 'ONLINE',
  FINISHED = 'FINISHED',
}

export enum TournamentFormat {
  NOT_SELECTED = 'NOT_SELECTED',
  LEAGUE = 'Liga',
  KNOCKOUT = 'Kalah Mati',
  SWISS = 'Swiss System',
}

export enum TournamentMode {
  AUTO = 'AUTO',
  MANUAL = 'MANUAL',
}

export enum PairingStatus {
  DRAFT = 'DRAFT',
  LOCKED = 'LOCKED',
  CONFIRMED = 'CONFIRMED',
}

export interface Player {
  id: string;
  name: string;
  association: string;
  icNumber?: string;
  phoneNumber?: string;
  wins: number;
  losses: number;
  draws: number; // For league
  points: number; // For league
  active: boolean; // For knockout format
}

export interface Match {
  id: string;
  round: number;
  table: number;
  stage?: string; // e.g., 'Suku Akhir', 'Separuh Akhir', 'Final'
  playerA: Player;
  playerB: Player | null; // Legacy support - should always have both players in Dam Aji
  winnerId: string | null;
  isDraw: boolean;
  isFinished: boolean;
  isManualPairing?: boolean; // Indicates if this match was manually paired
}

export interface ManualPairing {
  id: string;
  round: number;
  table: number;
  playerAId: string;
  playerBId: string; // No null allowed - BYE not permitted in Dam Aji
  status: PairingStatus;
  createdAt: Date;
  modifiedAt: Date;
}