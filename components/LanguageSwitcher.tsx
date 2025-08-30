import React, { useState } from 'react';
import { useTranslation, Language } from '../utils/i18n';

interface LanguageSwitcherProps {
  className?: string;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ className = '' }) => {
  const { language, setLanguage, availableLanguages } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
    setIsOpen(false);
  };

  const currentLanguage = availableLanguages.find(lang => lang.code === language);

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm bg-lightest-navy hover:bg-slate text-lightest-slate hover:text-navy rounded transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Pilih bahasa / Select language"
      >
        <span className="text-lg">🌐</span>
        <span className="hidden sm:inline">{currentLanguage?.name}</span>
        <span className="sm:hidden">{language.toUpperCase()}</span>
        <svg 
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          
          {/* Dropdown */}
          <div 
            className="absolute right-0 mt-2 w-48 bg-light-navy border border-lightest-navy rounded-lg shadow-lg z-20"
            role="listbox"
            aria-label="Senarai bahasa / Language list"
          >
            {availableLanguages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`w-full text-left px-4 py-3 text-sm hover:bg-lightest-navy transition-colors first:rounded-t-lg last:rounded-b-lg ${
                  lang.code === language 
                    ? 'bg-gold text-navy font-semibold' 
                    : 'text-lightest-slate'
                }`}
                role="option"
                aria-selected={lang.code === language}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">
                    {lang.code === 'ms' ? '🇲🇾' : '🇬🇧'}
                  </span>
                  <div>
                    <div className="font-medium">{lang.name}</div>
                    <div className="text-xs opacity-75">
                      {lang.code === 'ms' ? 'Bahasa utama' : 'Secondary language'}
                    </div>
                  </div>
                  {lang.code === language && (
                    <span className="ml-auto text-lg">✓</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default LanguageSwitcher;
