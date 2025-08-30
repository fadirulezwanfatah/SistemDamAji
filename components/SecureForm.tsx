import React, { useState, useEffect } from 'react';
import { sanitizeInput, playerActionLimiter, auditLogger } from '../utils/security';
import { validatePlayerName, validateAssociation, validateICNumber, validatePhoneNumber } from '../utils/validation';

interface SecureFormProps {
  onSubmit: (data: FormData) => Promise<{ success: boolean; error?: string }>;
  onCancel?: () => void;
  initialData?: Partial<FormData>;
  submitLabel?: string;
  isLoading?: boolean;
}

interface FormData {
  name: string;
  association: string;
  icNumber: string;
  phoneNumber: string;
}

interface FormErrors {
  name?: string;
  association?: string;
  icNumber?: string;
  phoneNumber?: string;
  general?: string;
}

const SecureForm: React.FC<SecureFormProps> = ({
  onSubmit,
  onCancel,
  initialData = {},
  submitLabel = 'Simpan',
  isLoading = false
}) => {
  const [formData, setFormData] = useState<FormData>({
    name: initialData.name || '',
    association: initialData.association || '',
    icNumber: initialData.icNumber || '',
    phoneNumber: initialData.phoneNumber || ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Real-time validation
  useEffect(() => {
    const newErrors: FormErrors = {};

    if (touched.name) {
      const nameValidation = validatePlayerName(formData.name);
      if (!nameValidation.isValid) {
        newErrors.name = nameValidation.error;
      }
    }

    if (touched.association) {
      const associationValidation = validateAssociation(formData.association);
      if (!associationValidation.isValid) {
        newErrors.association = associationValidation.error;
      }
    }

    if (touched.icNumber) {
      const icValidation = validateICNumber(formData.icNumber);
      if (!icValidation.isValid) {
        newErrors.icNumber = icValidation.error;
      }
    }

    if (touched.phoneNumber) {
      const phoneValidation = validatePhoneNumber(formData.phoneNumber);
      if (!phoneValidation.isValid) {
        newErrors.phoneNumber = phoneValidation.error;
      }
    }

    setErrors(newErrors);
  }, [formData, touched]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    // Sanitize input
    const sanitizedValue = sanitizeInput(value);
    
    setFormData(prev => ({
      ...prev,
      [field]: sanitizedValue
    }));

    // Mark field as touched
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check rate limiting
    const clientId = 'player_form'; // In a real app, this would be user-specific
    if (!playerActionLimiter.isAllowed(clientId)) {
      const remainingTime = Math.ceil(playerActionLimiter.getRemainingTime(clientId) / 1000);
      setErrors({ general: `Terlalu banyak percubaan. Cuba lagi dalam ${remainingTime} saat.` });
      return;
    }

    // Mark all fields as touched for validation
    setTouched({
      name: true,
      association: true,
      icNumber: true,
      phoneNumber: true
    });

    // Validate all fields
    const validations = {
      name: validatePlayerName(formData.name),
      association: validateAssociation(formData.association),
      icNumber: validateICNumber(formData.icNumber),
      phoneNumber: validatePhoneNumber(formData.phoneNumber)
    };

    const newErrors: FormErrors = {};
    let hasErrors = false;

    Object.entries(validations).forEach(([field, validation]) => {
      if (!validation.isValid) {
        newErrors[field as keyof FormErrors] = validation.error;
        hasErrors = true;
      }
    });

    if (hasErrors) {
      setErrors(newErrors);
      auditLogger.log('FORM_VALIDATION_ERROR', { errors: newErrors });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      // Sanitize all data before submission
      const sanitizedData = {
        name: sanitizeInput(formData.name),
        association: sanitizeInput(formData.association),
        icNumber: sanitizeInput(formData.icNumber),
        phoneNumber: sanitizeInput(formData.phoneNumber)
      };

      auditLogger.log('FORM_SUBMIT_ATTEMPT', { 
        action: 'player_form_submit',
        hasIC: !!sanitizedData.icNumber,
        hasPhone: !!sanitizedData.phoneNumber
      });

      const result = await onSubmit(sanitizedData);

      if (result.success) {
        auditLogger.log('FORM_SUBMIT_SUCCESS', { action: 'player_form_submit' });
        // Reset form on success
        setFormData({
          name: '',
          association: '',
          icNumber: '',
          phoneNumber: ''
        });
        setTouched({});
      } else {
        setErrors({ general: result.error || 'Ralat tidak dijangka' });
        auditLogger.log('FORM_SUBMIT_ERROR', { 
          action: 'player_form_submit',
          error: result.error 
        });
      }
    } catch (error) {
      setErrors({ general: 'Ralat tidak dijangka semasa menyimpan data' });
      auditLogger.log('FORM_SUBMIT_EXCEPTION', { 
        action: 'player_form_submit',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFieldClassName = (field: keyof FormData) => {
    const baseClass = "w-full bg-navy p-3 rounded border transition-colors focus:outline-none";
    const hasError = errors[field];
    const isTouched = touched[field];

    if (hasError && isTouched) {
      return `${baseClass} border-red-500 text-red-200 focus:border-red-400`;
    }

    if (isTouched && !hasError) {
      return `${baseClass} border-green-500 text-lightest-slate focus:border-green-400`;
    }

    return `${baseClass} border-lightest-navy text-lightest-slate focus:border-gold`;
  };

  const isFormValid = Object.keys(errors).length === 0 && 
                     formData.name.trim() && 
                     formData.association.trim();

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* General Error */}
      {errors.general && (
        <div className="p-3 bg-red-900/50 border border-red-500 rounded text-red-200 text-sm">
          {errors.general}
        </div>
      )}

      {/* Name Field */}
      <div>
        <label className="block mb-2 font-semibold text-light-slate">
          Nama Penuh <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          className={getFieldClassName('name')}
          placeholder="Masukkan nama penuh"
          maxLength={100}
          disabled={isLoading || isSubmitting}
          autoComplete="name"
        />
        {errors.name && touched.name && (
          <p className="mt-1 text-sm text-red-400">{errors.name}</p>
        )}
      </div>

      {/* Association Field */}
      <div>
        <label className="block mb-2 font-semibold text-light-slate">
          Persatuan/Daerah <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={formData.association}
          onChange={(e) => handleInputChange('association', e.target.value)}
          className={getFieldClassName('association')}
          placeholder="Masukkan persatuan atau daerah"
          maxLength={150}
          disabled={isLoading || isSubmitting}
          autoComplete="organization"
        />
        {errors.association && touched.association && (
          <p className="mt-1 text-sm text-red-400">{errors.association}</p>
        )}
      </div>

      {/* IC Number Field */}
      <div>
        <label className="block mb-2 font-semibold text-light-slate">
          No. Kad Pengenalan <span className="text-slate text-sm">(Pilihan)</span>
        </label>
        <input
          type="text"
          value={formData.icNumber}
          onChange={(e) => handleInputChange('icNumber', e.target.value)}
          className={getFieldClassName('icNumber')}
          placeholder="Contoh: 850101-05-1234"
          maxLength={14}
          disabled={isLoading || isSubmitting}
          autoComplete="off"
        />
        {errors.icNumber && touched.icNumber && (
          <p className="mt-1 text-sm text-red-400">{errors.icNumber}</p>
        )}
      </div>

      {/* Phone Number Field */}
      <div>
        <label className="block mb-2 font-semibold text-light-slate">
          No. Telefon <span className="text-slate text-sm">(Pilihan)</span>
        </label>
        <input
          type="tel"
          value={formData.phoneNumber}
          onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
          className={getFieldClassName('phoneNumber')}
          placeholder="Contoh: 012-3456789"
          maxLength={15}
          disabled={isLoading || isSubmitting}
          autoComplete="tel"
        />
        {errors.phoneNumber && touched.phoneNumber && (
          <p className="mt-1 text-sm text-red-400">{errors.phoneNumber}</p>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex gap-3 pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-slate hover:bg-light-slate text-navy font-bold py-2 px-4 rounded transition-colors disabled:opacity-50"
            disabled={isLoading || isSubmitting}
          >
            Batal
          </button>
        )}
        <button
          type="submit"
          className="flex-1 bg-gold hover:opacity-90 text-navy font-bold py-2 px-4 rounded transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          disabled={!isFormValid || isLoading || isSubmitting}
        >
          {isSubmitting && (
            <div className="w-4 h-4 border-2 border-navy border-t-transparent rounded-full animate-spin"></div>
          )}
          {isSubmitting ? 'Menyimpan...' : submitLabel}
        </button>
      </div>
    </form>
  );
};

export default SecureForm;
