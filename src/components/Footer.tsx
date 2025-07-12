import React from 'react';

const Footer: React.FC = React.memo(() => {
  return (
    <footer className="text-white py-2 sm:py-3 md:py-4 px-2 sm:px-3 md:px-6" style={{ backgroundColor: '#1A1A1A' }}>
      <div className="flex items-center justify-center text-xs sm:text-sm">
        <div className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2 md:space-x-4 text-center">
          <a href="#" className="hover:text-gray-300 transition-colors text-xs sm:text-sm">Contacts</a>
          <span className="hidden sm:inline">|</span>
          <a href="#" className="hover:text-gray-300 transition-colors text-xs sm:text-sm">Terms of use</a>
          <span className="hidden sm:inline">|</span>
          <a href="#" className="hover:text-gray-300 transition-colors text-xs sm:text-sm">Privacy</a>
          <span className="hidden sm:inline">|</span>
          <span className="text-xs sm:text-sm">© 2025 VClock.App</span>
        </div>
      </div>
    </footer>
  );
});

export default React.memo(Footer);