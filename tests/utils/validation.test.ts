// Test suite for validation utilities

import { 
  validatePlayerName, 
  validateAssociation, 
  validateICNumber, 
  validatePhoneNumber,
  validateURL,
  validateMessage,
  checkDuplicatePlayer,
  validateTournamentFormat,
  validateMinimumPlayers
} from '../../utils/validation';

describe('Validation Utilities', () => {
  describe('validatePlayerName', () => {
    test('should accept valid names', () => {
      expect(validatePlayerName('Ahmad bin Abdullah')).toEqual({ isValid: true });
      expect(validatePlayerName('Siti Nurhaliza')).toEqual({ isValid: true });
      expect(validatePlayerName('Lim Wei Chong')).toEqual({ isValid: true });
      expect(validatePlayerName("O'Connor")).toEqual({ isValid: true });
    });

    test('should reject empty names', () => {
      expect(validatePlayerName('')).toEqual({ 
        isValid: false, 
        error: 'Nama pemain diperlukan' 
      });
      expect(validatePlayerName('   ')).toEqual({ 
        isValid: false, 
        error: 'Nama pemain diperlukan' 
      });
    });

    test('should reject names that are too short', () => {
      expect(validatePlayerName('A')).toEqual({ 
        isValid: false, 
        error: 'Nama pemain mestilah sekurang-kurangnya 2 aksara' 
      });
    });

    test('should reject names that are too long', () => {
      const longName = 'A'.repeat(101);
      expect(validatePlayerName(longName)).toEqual({ 
        isValid: false, 
        error: 'Nama pemain tidak boleh melebihi 100 aksara' 
      });
    });

    test('should reject names with invalid characters', () => {
      expect(validatePlayerName('Ahmad<script>')).toEqual({ 
        isValid: false, 
        error: 'Nama pemain mengandungi aksara yang tidak sah' 
      });
      expect(validatePlayerName('Ahmad123')).toEqual({ 
        isValid: false, 
        error: 'Nama pemain mengandungi aksara yang tidak sah' 
      });
    });
  });

  describe('validateAssociation', () => {
    test('should accept valid associations', () => {
      expect(validateAssociation('Persatuan Dam Negeri Sembilan')).toEqual({ isValid: true });
      expect(validateAssociation('Kelab Sukan Komuniti Johor')).toEqual({ isValid: true });
    });

    test('should reject empty associations', () => {
      expect(validateAssociation('')).toEqual({ 
        isValid: false, 
        error: 'Persatuan/Daerah diperlukan' 
      });
    });

    test('should reject associations that are too short', () => {
      expect(validateAssociation('AB')).toEqual({ 
        isValid: false, 
        error: 'Persatuan/Daerah mestilah sekurang-kurangnya 3 aksara' 
      });
    });
  });

  describe('validateICNumber', () => {
    test('should accept valid IC numbers', () => {
      expect(validateICNumber('850101-05-1234')).toEqual({ isValid: true });
      expect(validateICNumber('850101051234')).toEqual({ isValid: true });
      expect(validateICNumber('')).toEqual({ isValid: true }); // Optional field
    });

    test('should reject invalid IC formats', () => {
      expect(validateICNumber('123')).toEqual({ 
        isValid: false, 
        error: 'Format No. K/P tidak sah (contoh: 850101-05-1234)' 
      });
      expect(validateICNumber('85010105123a')).toEqual({ 
        isValid: false, 
        error: 'Format No. K/P tidak sah (contoh: 850101-05-1234)' 
      });
    });

    test('should reject invalid dates in IC', () => {
      expect(validateICNumber('851301-05-1234')).toEqual({ 
        isValid: false, 
        error: 'Bulan dalam No. K/P tidak sah' 
      });
      expect(validateICNumber('850132-05-1234')).toEqual({ 
        isValid: false, 
        error: 'Hari dalam No. K/P tidak sah' 
      });
    });
  });

  describe('validatePhoneNumber', () => {
    test('should accept valid phone numbers', () => {
      expect(validatePhoneNumber('012-3456789')).toEqual({ isValid: true });
      expect(validatePhoneNumber('0123456789')).toEqual({ isValid: true });
      expect(validatePhoneNumber('03-12345678')).toEqual({ isValid: true });
      expect(validatePhoneNumber('')).toEqual({ isValid: true }); // Optional field
    });

    test('should reject invalid phone formats', () => {
      expect(validatePhoneNumber('123')).toEqual({ 
        isValid: false, 
        error: 'Format No. Telefon tidak sah (contoh: 012-3456789)' 
      });
      expect(validatePhoneNumber('abc-defghij')).toEqual({ 
        isValid: false, 
        error: 'Format No. Telefon tidak sah (contoh: 012-3456789)' 
      });
    });
  });

  describe('validateURL', () => {
    test('should accept valid URLs', () => {
      expect(validateURL('https://example.com')).toEqual({ isValid: true });
      expect(validateURL('http://localhost:3000')).toEqual({ isValid: true });
      expect(validateURL('')).toEqual({ isValid: true }); // Optional field
    });

    test('should reject invalid URLs', () => {
      expect(validateURL('not-a-url')).toEqual({ 
        isValid: false, 
        error: 'Format URL tidak sah' 
      });
      expect(validateURL('javascript:alert(1)')).toEqual({ 
        isValid: false, 
        error: 'Format URL tidak sah' 
      });
    });
  });

  describe('checkDuplicatePlayer', () => {
    const existingPlayers = [
      { id: '001', name: 'Ahmad bin Abdullah' },
      { id: '002', name: 'Siti Nurhaliza' }
    ];

    test('should allow unique names', () => {
      expect(checkDuplicatePlayer('Lim Wei Chong', existingPlayers)).toEqual({ isValid: true });
    });

    test('should reject duplicate names', () => {
      expect(checkDuplicatePlayer('Ahmad bin Abdullah', existingPlayers)).toEqual({ 
        isValid: false, 
        error: 'Nama pemain sudah wujud dalam senarai' 
      });
    });

    test('should allow same name when excluding current player', () => {
      expect(checkDuplicatePlayer('Ahmad bin Abdullah', existingPlayers, '001')).toEqual({ isValid: true });
    });

    test('should be case insensitive', () => {
      expect(checkDuplicatePlayer('AHMAD BIN ABDULLAH', existingPlayers)).toEqual({ 
        isValid: false, 
        error: 'Nama pemain sudah wujud dalam senarai' 
      });
    });
  });

  describe('validateTournamentFormat', () => {
    test('should accept valid formats', () => {
      expect(validateTournamentFormat('Liga')).toEqual({ isValid: true });
      expect(validateTournamentFormat('Kalah Mati')).toEqual({ isValid: true });
    });

    test('should reject invalid formats', () => {
      expect(validateTournamentFormat('Invalid Format')).toEqual({ 
        isValid: false, 
        error: 'Sila pilih format pertandingan yang sah' 
      });
    });
  });

  describe('validateMinimumPlayers', () => {
    test('should accept sufficient players for league', () => {
      expect(validateMinimumPlayers(4, 'Liga')).toEqual({ isValid: true });
    });

    test('should accept sufficient players for knockout', () => {
      expect(validateMinimumPlayers(2, 'Kalah Mati')).toEqual({ isValid: true });
    });

    test('should reject insufficient players for league', () => {
      expect(validateMinimumPlayers(2, 'Liga')).toEqual({ 
        isValid: false, 
        error: 'Format Liga memerlukan sekurang-kurangnya 3 pemain' 
      });
    });

    test('should reject insufficient players for knockout', () => {
      expect(validateMinimumPlayers(1, 'Kalah Mati')).toEqual({ 
        isValid: false, 
        error: 'Format Kalah Mati memerlukan sekurang-kurangnya 2 pemain' 
      });
    });
  });
});
