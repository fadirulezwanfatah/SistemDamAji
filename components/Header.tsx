import React from 'react';
import { Link } from 'react-router-dom';
import { APP_TITLE, EVENT_DETAILS, ORGANIZER } from '../constants';
import { useTournamentStore } from '../hooks/useTournamentStore';
import LanguageSwitcher from './LanguageSwitcher';

const EyeIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

interface HeaderProps {
    isAdmin?: boolean;
}

const Header: React.FC<HeaderProps> = ({ isAdmin = false }) => {
    const { lkimLogoUrl, madaniLogoUrl, eventDetails } = useTournamentStore();

    const headerClasses = "w-full bg-light-navy p-4 md:p-6 text-lightest-slate shadow-lg sticky top-0 z-10";
    
    const textContent = (
      <div className="text-center">
        <h1 className="text-3xl md:text-5xl font-extrabold text-gold tracking-wider">{APP_TITLE}</h1>
        <p className="text-md md:text-xl mt-2 text-light-slate">{eventDetails}</p>
      </div>
    );

    if (isAdmin) {
      return (
        <header className={headerClasses}>
          <div className="max-w-7xl mx-auto flex justify-center items-center relative">
            <Link to="/" className="absolute top-1/2 -translate-y-1/2 left-0 text-sm text-slate hover:text-gold transition-colors flex items-center gap-2" title="Lihat Paparan Awam">
              <EyeIcon className="w-5 h-5" />
              <span className="hidden md:inline">Lihat Paparan Awam</span>
            </Link>
            {textContent}
            <div className="absolute top-2 right-2 flex items-center gap-2">
              <LanguageSwitcher />
              <span className="bg-gold text-navy font-bold text-xs py-1 px-2 rounded-full">ADMIN PANEL</span>
            </div>
          </div>
        </header>
      );
    }
    
    return (
        <header className={headerClasses}>
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <div className="flex-1 flex justify-start">
                    <div className="text-center">
                        <img src={lkimLogoUrl} alt="Logo LKIM" className="h-12 md:h-16 w-auto object-contain" />
                    </div>
                </div>
                
                <div className="px-4 flex-shrink-0">
                    {textContent}
                </div>

                <div className="flex-1 flex justify-end items-start">
                    <div className="flex flex-col items-end gap-2">
                        <LanguageSwitcher />
                        <div className="text-center">
                            <img src={madaniLogoUrl} alt="Logo Malaysia Madani" className="h-12 md:h-16 w-auto object-contain" />
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;