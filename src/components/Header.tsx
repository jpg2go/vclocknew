import React from 'react';
import { Moon, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

interface HeaderProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const Header: React.FC<HeaderProps> = React.memo(({ darkMode, toggleDarkMode }) => {
  return (
    <header className="text-white px-2 sm:px-4 md:px-6 py-2 sm:py-3 flex items-center justify-between" style={{ backgroundColor: '#0090DD' }}>
      <div className="flex items-center">
        <Link to="/">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-wide" style={{ fontFamily: 'Quicksand, Nunito, Poppins, Arial, sans-serif', color: '#fff', letterSpacing: '0.05em' }}>vClock</h1>
        </Link>
      </div>
      
      <nav className="flex items-center space-x-1 sm:space-x-2 md:space-x-4 lg:space-x-6">
        <a href="#" className="hover:text-blue-100 transition-colors text-xs sm:text-sm md:text-base hidden md:block">Holidays</a>
        <div className="relative">
          <button className="flex items-center space-x-1 hover:text-blue-100 transition-colors text-xs sm:text-sm md:text-base">
            <span className="hidden md:inline">Tools</span>
            <span className="md:hidden">•••</span>
            <svg className="w-3 h-3 sm:w-4 sm:h-4 hidden md:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
        <button className={`p-1 rounded transition-colors ${darkMode ? 'bg-gray-800' : 'hover:bg-blue-700'}`} onClick={toggleDarkMode} title="Toggle dark mode">
          <Moon className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
        </button>
      </nav>
    </header>
  );
});

export default React.memo(Header);