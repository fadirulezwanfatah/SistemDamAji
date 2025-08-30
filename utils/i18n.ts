// Internationalization utilities for the Dam Aji Tournament System

export type Language = 'ms' | 'en';

interface Translations {
  [key: string]: string | Translations;
}

const translations: Record<Language, Translations> = {
  ms: {
    // Common
    common: {
      save: 'Simpan',
      cancel: 'Batal',
      close: 'Tutup',
      edit: 'Edit',
      delete: 'Padam',
      add: 'Tambah',
      search: 'Cari',
      loading: 'Memuatkan...',
      error: 'Ralat',
      success: 'Berjaya',
      warning: 'Amaran',
      info: 'Maklumat',
      yes: 'Ya',
      no: 'Tidak',
      confirm: 'Sahkan',
      back: 'Kembali',
      next: 'Seterusnya',
      previous: 'Sebelumnya',
      home: 'Utama',
      admin: 'Pentadbir',
      public: 'Awam'
    },

    // Navigation
    nav: {
      dashboard: 'Papan Pemuka',
      players: 'Peserta',
      matches: 'Perlawanan',
      statistics: 'Statistik',
      settings: 'Tetapan',
      reports: 'Laporan'
    },

    // Tournament
    tournament: {
      title: 'Sistem Pengurusan Dam Aji',
      status: 'Status Pertandingan',
      format: 'Format Pertandingan',
      offline: 'OFFLINE',
      online: 'ONLINE',
      finished: 'SELESAI',
      league: 'Liga',
      knockout: 'Kalah Mati',
      swiss: 'Swiss System',
      round: 'Pusingan',
      table: 'Meja',
      stage: 'Peringkat',
      winner: 'Pemenang',
      loser: 'Kalah',
      draw: 'Seri',
      active: 'Aktif',
      eliminated: 'Tersingkir'
    },

    // Players
    players: {
      title: 'Pengurusan Peserta',
      name: 'Nama Penuh',
      association: 'Persatuan/Daerah',
      icNumber: 'No. Kad Pengenalan',
      phoneNumber: 'No. Telefon',
      wins: 'Menang',
      losses: 'Kalah',
      draws: 'Seri',
      points: 'Mata',
      rank: 'Kedudukan',
      addPlayer: 'Tambah Peserta',
      editPlayer: 'Edit Peserta',
      removePlayer: 'Padam Peserta',
      playerProfile: 'Profil Peserta',
      totalPlayers: 'Jumlah Peserta',
      activePlayers: 'Peserta Aktif',
      eliminatedPlayers: 'Peserta Tersingkir'
    },

    // Matches
    matches: {
      title: 'Perlawanan',
      currentRound: 'Pusingan Semasa',
      generateRound: 'Jana Pusingan Seterusnya',
      setWinner: 'Tetapkan Pemenang',
      setDraw: 'Tetapkan Seri',
      matchHistory: 'Sejarah Perlawanan',
      upcomingMatches: 'Perlawanan Akan Datang',
      completedMatches: 'Perlawanan Selesai',
      pendingMatches: 'Perlawanan Tertunda',
      totalMatches: 'Jumlah Perlawanan',
      bracket: 'Bracket Pertandingan'
    },

    // Forms
    forms: {
      required: 'Diperlukan',
      optional: 'Pilihan',
      validation: {
        nameRequired: 'Nama pemain diperlukan',
        nameMinLength: 'Nama pemain mestilah sekurang-kurangnya 2 aksara',
        nameMaxLength: 'Nama pemain tidak boleh melebihi 100 aksara',
        nameInvalidChars: 'Nama pemain mengandungi aksara yang tidak sah',
        associationRequired: 'Persatuan/Daerah diperlukan',
        associationMinLength: 'Persatuan/Daerah mestilah sekurang-kurangnya 3 aksara',
        associationMaxLength: 'Persatuan/Daerah tidak boleh melebihi 150 aksara',
        icInvalid: 'Format No. K/P tidak sah (contoh: 850101-05-1234)',
        phoneInvalid: 'Format No. Telefon tidak sah (contoh: 012-3456789)',
        duplicateName: 'Nama pemain sudah wujud dalam senarai'
      }
    },

    // Messages
    messages: {
      playerAdded: 'Pemain berjaya ditambah',
      playerUpdated: 'Pemain berjaya dikemaskini',
      playerRemoved: 'Pemain berjaya dipadamkan',
      tournamentStarted: 'Pertandingan telah dimulakan!',
      roundGenerated: 'Pusingan seterusnya telah dijana!',
      winnerSet: 'Pemenang telah ditetapkan!',
      drawSet: 'Keputusan seri telah ditetapkan!',
      tournamentReset: 'Pertandingan telah di-reset sepenuhnya',
      dataExported: 'Data telah dieksport',
      dataImported: 'Data berjaya diimport',
      confirmReset: 'Ini akan memadamkan SEMUA data pertandingan termasuk peserta.',
      confirmDelete: 'Anda pasti mahu memadam peserta ini?',
      rateLimitExceeded: 'Terlalu banyak percubaan. Cuba lagi dalam {seconds} saat.',
      unexpectedError: 'Ralat tidak dijangka'
    },

    // Statistics
    statistics: {
      title: 'Statistik Pertandingan',
      winRate: 'Kadar Kemenangan',
      completion: 'Kemajuan',
      topPerformers: 'Prestasi Terbaik',
      mostWins: 'Paling Banyak Menang',
      highestPoints: 'Mata Tertinggi'
    },

    // Accessibility
    a11y: {
      skipToMain: 'Langkau ke kandungan utama',
      closeDialog: 'Tutup dialog',
      openMenu: 'Buka menu',
      closeMenu: 'Tutup menu',
      pageChanged: 'Halaman telah berubah',
      sortAscending: 'Susun menaik',
      sortDescending: 'Susun menurun',
      expandRow: 'Kembangkan baris',
      collapseRow: 'Runtuhkan baris'
    }
  },

  en: {
    // Common
    common: {
      save: 'Save',
      cancel: 'Cancel',
      close: 'Close',
      edit: 'Edit',
      delete: 'Delete',
      add: 'Add',
      search: 'Search',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      warning: 'Warning',
      info: 'Information',
      yes: 'Yes',
      no: 'No',
      confirm: 'Confirm',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      home: 'Home',
      admin: 'Admin',
      public: 'Public'
    },

    // Navigation
    nav: {
      dashboard: 'Dashboard',
      players: 'Players',
      matches: 'Matches',
      statistics: 'Statistics',
      settings: 'Settings',
      reports: 'Reports'
    },

    // Tournament
    tournament: {
      title: 'Dam Aji Tournament Management System',
      status: 'Tournament Status',
      format: 'Tournament Format',
      offline: 'OFFLINE',
      online: 'ONLINE',
      finished: 'FINISHED',
      league: 'League',
      knockout: 'Knockout',
      round: 'Round',
      table: 'Table',
      stage: 'Stage',
      winner: 'Winner',
      loser: 'Loser',
      draw: 'Draw',
      active: 'Active',
      eliminated: 'Eliminated'
    },

    // Players
    players: {
      title: 'Player Management',
      name: 'Full Name',
      association: 'Association/District',
      icNumber: 'IC Number',
      phoneNumber: 'Phone Number',
      wins: 'Wins',
      losses: 'Losses',
      draws: 'Draws',
      points: 'Points',
      rank: 'Rank',
      addPlayer: 'Add Player',
      editPlayer: 'Edit Player',
      removePlayer: 'Remove Player',
      playerProfile: 'Player Profile',
      totalPlayers: 'Total Players',
      activePlayers: 'Active Players',
      eliminatedPlayers: 'Eliminated Players'
    },

    // Matches
    matches: {
      title: 'Matches',
      currentRound: 'Current Round',
      generateRound: 'Generate Next Round',
      setWinner: 'Set Winner',
      setDraw: 'Set Draw',
      matchHistory: 'Match History',
      upcomingMatches: 'Upcoming Matches',
      completedMatches: 'Completed Matches',
      pendingMatches: 'Pending Matches',
      totalMatches: 'Total Matches',
      bracket: 'Tournament Bracket'
    },

    // Forms
    forms: {
      required: 'Required',
      optional: 'Optional',
      validation: {
        nameRequired: 'Player name is required',
        nameMinLength: 'Player name must be at least 2 characters',
        nameMaxLength: 'Player name cannot exceed 100 characters',
        nameInvalidChars: 'Player name contains invalid characters',
        associationRequired: 'Association/District is required',
        associationMinLength: 'Association/District must be at least 3 characters',
        associationMaxLength: 'Association/District cannot exceed 150 characters',
        icInvalid: 'Invalid IC format (example: 850101-05-1234)',
        phoneInvalid: 'Invalid phone format (example: 012-3456789)',
        duplicateName: 'Player name already exists'
      }
    },

    // Messages
    messages: {
      playerAdded: 'Player successfully added',
      playerUpdated: 'Player successfully updated',
      playerRemoved: 'Player successfully removed',
      tournamentStarted: 'Tournament has started!',
      roundGenerated: 'Next round has been generated!',
      winnerSet: 'Winner has been set!',
      drawSet: 'Draw result has been set!',
      tournamentReset: 'Tournament has been completely reset',
      dataExported: 'Data has been exported',
      dataImported: 'Data successfully imported',
      confirmReset: 'This will delete ALL tournament data including players.',
      confirmDelete: 'Are you sure you want to delete this player?',
      rateLimitExceeded: 'Too many attempts. Try again in {seconds} seconds.',
      unexpectedError: 'Unexpected error'
    },

    // Statistics
    statistics: {
      title: 'Tournament Statistics',
      winRate: 'Win Rate',
      completion: 'Completion',
      topPerformers: 'Top Performers',
      mostWins: 'Most Wins',
      highestPoints: 'Highest Points'
    },

    // Accessibility
    a11y: {
      skipToMain: 'Skip to main content',
      closeDialog: 'Close dialog',
      openMenu: 'Open menu',
      closeMenu: 'Close menu',
      pageChanged: 'Page has changed',
      sortAscending: 'Sort ascending',
      sortDescending: 'Sort descending',
      expandRow: 'Expand row',
      collapseRow: 'Collapse row'
    }
  }
};

class I18n {
  private currentLanguage: Language = 'ms';
  private fallbackLanguage: Language = 'ms';

  setLanguage(language: Language): void {
    this.currentLanguage = language;
    document.documentElement.lang = language;
    localStorage.setItem('preferred-language', language);
  }

  getLanguage(): Language {
    return this.currentLanguage;
  }

  t(key: string, params?: Record<string, string | number>): string {
    const translation = this.getTranslation(key, this.currentLanguage) || 
                       this.getTranslation(key, this.fallbackLanguage) || 
                       key;

    if (params) {
      return this.interpolate(translation, params);
    }

    return translation;
  }

  private getTranslation(key: string, language: Language): string | null {
    const keys = key.split('.');
    let current: any = translations[language];

    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k];
      } else {
        return null;
      }
    }

    return typeof current === 'string' ? current : null;
  }

  private interpolate(template: string, params: Record<string, string | number>): string {
    return template.replace(/\{(\w+)\}/g, (match, key) => {
      return params[key]?.toString() || match;
    });
  }

  // Get available languages
  getAvailableLanguages(): { code: Language; name: string }[] {
    return [
      { code: 'ms', name: 'Bahasa Malaysia' },
      { code: 'en', name: 'English' }
    ];
  }

  // Initialize from localStorage
  initialize(): void {
    const saved = localStorage.getItem('preferred-language') as Language;
    if (saved && (saved === 'ms' || saved === 'en')) {
      this.setLanguage(saved);
    } else {
      // Detect browser language
      const browserLang = navigator.language.toLowerCase();
      if (browserLang.startsWith('ms') || browserLang.startsWith('my')) {
        this.setLanguage('ms');
      } else {
        this.setLanguage('en');
      }
    }
  }
}

export const i18n = new I18n();

// React hook for translations
export const useTranslation = () => {
  return {
    t: i18n.t.bind(i18n),
    language: i18n.getLanguage(),
    setLanguage: i18n.setLanguage.bind(i18n),
    availableLanguages: i18n.getAvailableLanguages()
  };
};
