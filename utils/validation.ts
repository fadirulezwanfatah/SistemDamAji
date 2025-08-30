// Validation utilities for the Dam Aji Tournament System

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

// Player name validation
export const validatePlayerName = (name: string): ValidationResult => {
  const trimmedName = name.trim();
  
  if (!trimmedName) {
    return { isValid: false, error: 'Nama pemain diperlukan' };
  }
  
  if (trimmedName.length < 2) {
    return { isValid: false, error: 'Nama pemain mestilah sekurang-kurangnya 2 aksara' };
  }
  
  if (trimmedName.length > 100) {
    return { isValid: false, error: 'Nama pemain tidak boleh melebihi 100 aksara' };
  }
  
  // Check for valid characters (letters, spaces, common Malaysian name characters)
  const nameRegex = /^[a-zA-Z\s\u00C0-\u017F\u0100-\u024F\u1E00-\u1EFF'.-]+$/;
  if (!nameRegex.test(trimmedName)) {
    return { isValid: false, error: 'Nama pemain mengandungi aksara yang tidak sah' };
  }
  
  return { isValid: true };
};

// Association validation
export const validateAssociation = (association: string): ValidationResult => {
  const trimmedAssociation = association.trim();
  
  if (!trimmedAssociation) {
    return { isValid: false, error: 'Persatuan/Daerah diperlukan' };
  }
  
  if (trimmedAssociation.length < 3) {
    return { isValid: false, error: 'Persatuan/Daerah mestilah sekurang-kurangnya 3 aksara' };
  }
  
  if (trimmedAssociation.length > 150) {
    return { isValid: false, error: 'Persatuan/Daerah tidak boleh melebihi 150 aksara' };
  }
  
  return { isValid: true };
};

// Malaysian IC number validation
export const validateICNumber = (icNumber: string): ValidationResult => {
  if (!icNumber.trim()) {
    return { isValid: true }; // Optional field
  }
  
  const cleanIC = icNumber.replace(/[-\s]/g, '');
  
  // Malaysian IC format: YYMMDD-PB-XXXX (12 digits)
  const icRegex = /^\d{12}$/;
  if (!icRegex.test(cleanIC)) {
    return { isValid: false, error: 'Format No. K/P tidak sah (contoh: 850101-05-1234)' };
  }
  
  // Validate date part
  const year = parseInt(cleanIC.substring(0, 2));
  const month = parseInt(cleanIC.substring(2, 4));
  const day = parseInt(cleanIC.substring(4, 6));
  
  if (month < 1 || month > 12) {
    return { isValid: false, error: 'Bulan dalam No. K/P tidak sah' };
  }
  
  if (day < 1 || day > 31) {
    return { isValid: false, error: 'Hari dalam No. K/P tidak sah' };
  }
  
  return { isValid: true };
};

// Phone number validation (Malaysian format)
export const validatePhoneNumber = (phoneNumber: string): ValidationResult => {
  if (!phoneNumber.trim()) {
    return { isValid: true }; // Optional field
  }
  
  const cleanPhone = phoneNumber.replace(/[-\s()]/g, '');
  
  // Malaysian phone formats: 01X-XXXXXXX, 03-XXXXXXXX, etc.
  const phoneRegex = /^(\+?6?0)(1[0-9]|3|4|5|6|7|8|9)\d{7,8}$/;
  if (!phoneRegex.test(cleanPhone)) {
    return { isValid: false, error: 'Format No. Telefon tidak sah (contoh: 012-3456789)' };
  }
  
  return { isValid: true };
};

// URL validation
export const validateURL = (url: string): ValidationResult => {
  if (!url.trim()) {
    return { isValid: true }; // Optional field
  }
  
  try {
    new URL(url);
    return { isValid: true };
  } catch {
    return { isValid: false, error: 'Format URL tidak sah' };
  }
};

// Message validation
export const validateMessage = (message: string, maxLength: number = 500): ValidationResult => {
  const trimmedMessage = message.trim();
  
  if (!trimmedMessage) {
    return { isValid: false, error: 'Mesej diperlukan' };
  }
  
  if (trimmedMessage.length > maxLength) {
    return { isValid: false, error: `Mesej tidak boleh melebihi ${maxLength} aksara` };
  }
  
  return { isValid: true };
};

// Sanitize input to prevent XSS
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// Check for duplicate player names
export const checkDuplicatePlayer = (
  newName: string, 
  existingPlayers: Array<{ name: string; id: string }>, 
  excludeId?: string
): ValidationResult => {
  const normalizedNewName = newName.trim().toLowerCase();
  
  const duplicate = existingPlayers.find(player => 
    player.id !== excludeId && 
    player.name.trim().toLowerCase() === normalizedNewName
  );
  
  if (duplicate) {
    return { isValid: false, error: 'Nama pemain sudah wujud dalam senarai' };
  }
  
  return { isValid: true };
};

// Validate tournament format selection
export const validateTournamentFormat = (format: string): ValidationResult => {
  const validFormats = ['Liga', 'Kalah Mati', 'Swiss System'];

  if (!validFormats.includes(format)) {
    return { isValid: false, error: 'Sila pilih format pertandingan yang sah' };
  }

  return { isValid: true };
};

// Validate minimum players for tournament
export const validateMinimumPlayers = (playerCount: number, format: string): ValidationResult => {
  let minimumPlayers = 2;
  if (format === 'Liga') minimumPlayers = 3;
  else if (format === 'Swiss System') minimumPlayers = 4;

  if (playerCount < minimumPlayers) {
    return {
      isValid: false,
      error: `Format ${format} memerlukan sekurang-kurangnya ${minimumPlayers} pemain`
    };
  }

  return { isValid: true };
};
