import React, { useState, useRef, useEffect } from 'react';
import { Share2, Plus, Maximize2, Minimize2, ZoomIn, ZoomOut, X } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const Stopwatch: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [laps, setLaps] = useState<{ time: number; label: string }[]>([]);
  const [fontSize, setFontSize] = useState(144);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showLapModal, setShowLapModal] = useState(false);
  const [lapLabel, setLapLabel] = useState('');
  const [lapTime, setLapTime] = useState(0);
  const [showShare, setShowShare] = useState(false);
  const shareRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Hide share dropdown when clicking outside
  useEffect(() => {
    if (!showShare) return;
    function handleClick(e: MouseEvent) {
      if (shareRef.current && !shareRef.current.contains(e.target as Node)) {
        setShowShare(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showShare]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = window.setInterval(() => {
        setElapsed((prev) => prev + 100);
      }, 100);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const formatTime = (ms: number) => {
    const centiseconds = Math.floor((ms % 1000) / 10);
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / 60000) % 60);
    const hours = Math.floor(ms / 3600000);
    return `${hours > 0 ? String(hours).padStart(2, '0') + ':' : ''}${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(centiseconds).padStart(2, '0')}`;
  };
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    }).toUpperCase();
  };
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLap = () => {
    setLapTime(elapsed);
    setLapLabel('');
    setShowLapModal(true);
  };

  const saveLap = () => {
    setLaps((prev) => [
      { time: lapTime, label: lapLabel || `Lap ${prev.length + 1}` },
      ...prev,
    ]);
    setShowLapModal(false);
  };

  const reset = () => {
    setIsRunning(false);
    setElapsed(0);
    setLaps([]);
  };

  const increaseFontSize = () => setFontSize((f) => Math.min(f + 16, 256));
  const decreaseFontSize = () => setFontSize((f) => Math.max(f - 16, 64));

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        const clockElement = document.getElementById('stopwatch-display');
        if (clockElement) {
          await clockElement.requestFullscreen();
        }
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error('Error toggling fullscreen:', error);
    }
  };

  return (
    <>
      <Helmet>
        <title>Free Online Stopwatch with Lap Timer | Track Time Instantly</title>
        <meta name="description" content="Free online stopwatch with lap recording. Perfect for workouts, sports timing, study sessions, and productivity tracking. Works on all devices, no signup needed." />
        <link rel="canonical" href="https://vclock.app/stopwatch" />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="Free Online Stopwatch with Lap Timer | Track Time Instantly" />
        <meta property="og:description" content="Free online stopwatch with lap recording. Perfect for workouts, sports timing, study sessions, and productivity tracking. Works on all devices, no signup needed." />
        <meta property="og:url" content="https://vclock.app/stopwatch" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Free Online Stopwatch with Lap Timer | Track Time Instantly" />
        <meta name="twitter:description" content="Free online stopwatch with lap recording. Perfect for workouts, sports timing, study sessions, and productivity tracking. Works on all devices, no signup needed." />
      </Helmet>
      {/* Lap Modal */}
      {showLapModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 transition-opacity duration-300 p-2 sm:p-4">
          <div className="bg-white rounded-xl max-w-md w-full mx-2 sm:mx-4 shadow-2xl border border-gray-200 transform transition-all duration-300 scale-100 opacity-100 animate-alarm-modal-in max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center px-4 sm:px-8 py-3 sm:py-5 rounded-t-xl" style={{ backgroundColor: '#0090DD' }}>
              <h2 className="text-xl sm:text-2xl font-light text-white">Lap Name</h2>
              <button onClick={() => setShowLapModal(false)} className="text-white hover:text-blue-100 text-xl sm:text-2xl flex items-center justify-center w-8 h-8 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-white" aria-label="Close">
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
            <div className="px-4 sm:px-8 pt-4 sm:pt-8 pb-0 space-y-4 sm:space-y-8">
              <input
                type="text"
                value={lapLabel}
                onChange={(e) => setLapLabel(e.target.value)}
                placeholder="Lap label"
                className="w-full h-10 sm:h-12 px-3 sm:px-4 text-sm sm:text-base font-normal border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
              />
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-end px-4 sm:px-8 py-3 sm:py-5 border-t bg-gray-50 rounded-b-xl mt-2 gap-3 sm:gap-0">
              <button onClick={() => setShowLapModal(false)} className="w-full sm:w-24 h-10 border border-gray-300 rounded bg-white text-sm sm:text-base font-normal hover:bg-gray-100 sm:mr-4">Cancel</button>
              <button onClick={saveLap} className="w-full sm:w-24 h-10 bg-green-500 text-white text-sm sm:text-base font-normal rounded hover:bg-green-600">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Main Stopwatch Display */}
      <div 
        id="stopwatch-display"
        className={
          isFullscreen
            ? 'fixed inset-0 z-50 flex flex-col justify-center items-center bg-black text-white border-0 text-center'
            : 'bg-white dark:bg-black border-b border-gray-200 text-center relative p-4 sm:p-8 lg:p-12'
        }
      >
        <div className="absolute top-2 sm:top-4 right-2 sm:right-4 flex space-x-1 sm:space-x-2">
          <button onClick={decreaseFontSize} className={`p-2 rounded transition-colors ${isFullscreen ? 'hover:bg-gray-800 text-white' : 'hover:bg-gray-100 text-gray-600'}`} title="Decrease font size">
            <ZoomOut className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button onClick={increaseFontSize} className={`p-2 rounded transition-colors ${isFullscreen ? 'hover:bg-gray-800 text-white' : 'hover:bg-gray-100 text-gray-600'}`} title="Increase font size">
            <ZoomIn className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <div className="relative" ref={shareRef}>
            <button
              className={`p-2 rounded transition-colors ${
                isFullscreen 
                  ? 'hover:bg-gray-800 text-white' 
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
              title="Share"
              aria-label="Share"
              onClick={() => setShowShare(s => !s)}
            >
              <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            {showShare && (
              <>
                {/* Caret Arrow */}
                <div className="absolute right-4 sm:right-6 -top-2 z-50 hidden sm:block">
                  <svg width="24" height="12" viewBox="0 0 24 12"><polygon points="12,0 24,12 0,12" fill="#fff" style={{filter:'drop-shadow(0 2px 4px rgba(0,0,0,0.08))'}} /></svg>
                </div>
                <div className="absolute right-0 sm:right-0 left-0 sm:left-auto mt-3 z-50 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border border-gray-200 dark:border-gray-600 rounded-2xl shadow-2xl p-3 sm:p-4 flex flex-col gap-2 sm:gap-3 min-w-[200px] sm:min-w-[220px] max-w-[280px] sm:max-w-none" style={{boxShadow:'0 8px 32px 0 rgba(31,38,135,0.15)'}}>
                  {/* Close Button */}
                  <button onClick={()=>setShowShare(false)} className="absolute top-1 sm:top-2 right-1 sm:right-2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors" aria-label="Close"><X className="w-3 h-3 sm:w-4 sm:h-4" /></button>
                  <span className="text-xs text-gray-500 dark:text-gray-400 mb-1 pl-1 pr-4 sm:pr-6">Share this page:</span>
                  <div className="flex flex-wrap gap-1 sm:gap-2 md:gap-3 justify-center mt-1 mb-1 sm:mb-2">
                    <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 flex items-center justify-center rounded-full bg-[#1877f2] hover:bg-[#145db2] shadow text-white transition-transform hover:scale-110" title="Share on Facebook"><svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.522-4.477-10-10-10S2 6.478 2 12c0 5 3.657 9.127 8.438 9.877v-6.987h-2.54v-2.89h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.242 0-1.632.771-1.632 1.562v1.875h2.773l-.443 2.89h-2.33v6.987C18.343 21.127 22 17 22 12"/></svg></a>
                    <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 flex items-center justify-center rounded-full bg-[#1da1f2] hover:bg-[#0d8ddb] shadow text-white transition-transform hover:scale-110" title="Share on Twitter"><svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.46 6c-.77.35-1.6.59-2.47.69a4.3 4.3 0 0 0 1.88-2.37 8.59 8.59 0 0 1-2.72 1.04A4.28 4.28 0 0 0 16.11 4c-2.37 0-4.29 1.92-4.29 4.29 0 .34.04.67.11.99C7.69 9.13 4.07 7.38 1.64 4.7c-.37.64-.58 1.38-.58 2.17 0 1.5.76 2.82 1.92 3.6-.71-.02-1.38-.22-1.97-.54v.05c0 2.1 1.5 3.85 3.5 4.25-.36.1-.74.16-1.13.16-.28 0-.54-.03-.8-.08.54 1.7 2.12 2.94 3.99 2.97A8.6 8.6 0 0 1 2 19.54a12.13 12.13 0 0 0 6.56 1.92c7.88 0 12.2-6.53 12.2-12.2 0-.19 0-.39-.01-.58A8.72 8.72 0 0 0 24 4.59a8.5 8.5 0 0 1-2.54.7z"/></svg></a>
                    <a href={`https://wa.me/?text=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 flex items-center justify-center rounded-full bg-[#25d366] hover:bg-[#1da851] shadow text-white transition-transform hover:scale-110" title="Share on WhatsApp"><svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.52 3.48A11.93 11.93 0 0 0 12 0C5.37 0 0 5.37 0 12c0 2.11.55 4.16 1.6 5.97L0 24l6.18-1.62A11.93 11.93 0 0 0 12 24c6.63 0 12-5.37 12-12 0-3.19-1.24-6.19-3.48-8.52zM12 22c-1.85 0-3.68-.5-5.25-1.44l-.38-.22-3.67.96.98-3.58-.25-.37A9.94 9.94 0 0 1 2 12c0-5.52 4.48-10 10-10s10 4.48 10 10-4.48 10-10 10zm5.2-7.6c-.28-.14-1.65-.81-1.9-.9-.25-.09-.43-.14-.61.14-.18.28-.7.9-.86 1.08-.16.18-.32.2-.6.07-.28-.14-1.18-.44-2.25-1.4-.83-.74-1.39-1.65-1.55-1.93-.16-.28-.02-.43.12-.57.13-.13.28-.34.42-.51.14-.17.18-.29.28-.48.09-.19.05-.36-.02-.5-.07-.14-.61-1.47-.84-2.01-.22-.53-.45-.46-.62-.47-.16-.01-.35-.01-.54-.01-.19 0-.5.07-.76.34-.26.27-1 1-.97 2.43.03 1.43 1.03 2.81 1.18 3 .15.19 2.03 3.1 4.93 4.23.69.3 1.23.48 1.65.61.69.22 1.32.19 1.81.12.55-.08 1.65-.67 1.88-1.32.23-.65.23-1.2.16-1.32-.07-.12-.25-.19-.53-.33z"/></svg></a>
                    <a href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 flex items-center justify-center rounded-full bg-[#0077b5] hover:bg-[#005983] shadow text-white transition-transform hover:scale-110" title="Share on LinkedIn"><svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.327-.027-3.037-1.849-3.037-1.851 0-2.132 1.445-2.132 2.939v5.667H9.358V9h3.414v1.561h.049c.476-.899 1.637-1.849 3.37-1.849 3.602 0 4.267 2.369 4.267 5.455v6.285zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zm1.777 13.019H3.56V9h3.554v11.452zM22.225 0H1.771C.792 0 0 .771 0 1.723v20.549C0 23.229.792 24 1.771 24h20.451C23.2 24 24 23.229 24 22.271V1.723C24 .771 23.2 0 22.225 0z"/></svg></a>
                  </div>
                </div>
              </>
            )}
          </div>
          <button onClick={toggleFullscreen} className={`p-2 rounded transition-colors ${isFullscreen ? 'hover:bg-gray-800 text-white' : 'hover:bg-gray-100 text-gray-600'}`} title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}>
            {isFullscreen ? <Minimize2 className="w-4 h-4 sm:w-5 sm:h-5" /> : <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>
        </div>
        <div className={isFullscreen ? '' : 'mt-4'}>
          <div 
            className={`font-light mb-4 tracking-tight leading-none flex items-baseline justify-center font-nunito ${
              isFullscreen ? 'text-gray-600' : 'text-gray-600'
            }`}
            style={{ 
              fontSize: `${Math.round(isFullscreen ? fontSize * 1.5 : Math.min(fontSize, window.innerWidth * 0.15))}px`,
              fontWeight: 900,
              color: isFullscreen ? '#fff' : '#555555',
              letterSpacing: '0.04em',
              textAlign: 'center',
            }}
          >
            <span>{formatTime(elapsed)}</span>
          </div>
          <div className="tracking-wide font-medium font-bold mt-4 sm:mt-6 font-nunito" style={{
            fontSize: isFullscreen ? '1.5rem' : 'clamp(0.875rem, 3vw, 1rem)',
            color: '#555555',
            letterSpacing: '0.18em',
            textAlign: 'center',
            textTransform: 'uppercase',
            fontWeight: 900,
          }}>
            {formatDate(currentTime)}
          </div>
        </div>
        {!isFullscreen && (
          <div className="mt-4 sm:mt-6 flex flex-wrap justify-center gap-2 sm:gap-4">
            <button onClick={() => setIsRunning((r) => !r)} className={`px-4 sm:px-8 py-2 sm:py-3 rounded-md font-medium text-white transition-colors shadow-sm text-sm sm:text-base ${isRunning ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}>{isRunning ? 'Stop' : 'Start'}</button>
            <button onClick={reset} className="px-4 sm:px-8 py-2 sm:py-3 rounded-md font-medium bg-gray-200 hover:bg-gray-300 text-gray-700 transition-colors shadow-sm text-sm sm:text-base">Reset</button>
            <button onClick={handleLap} className="px-4 sm:px-8 py-2 sm:py-3 rounded-md font-medium bg-blue-500 hover:bg-blue-600 text-white transition-colors shadow-sm text-sm sm:text-base">Lap</button>
          </div>
        )}
      </div>

      {/* Laps List */}
      {!isFullscreen && laps.length > 0 && (
        <div className="p-3 sm:p-6">
          <div className="bg-white dark:bg-black rounded-lg p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-medium text-gray-800 mb-3 sm:mb-4">Laps</h3>
            <div className="space-y-2 sm:space-y-3">
              {laps.map((lap, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="text-sm sm:text-base font-medium">{lap.label}</div>
                  </div>
                  <div className="text-mono text-gray-700 text-sm sm:text-base">{formatTime(lap.time)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      {!isFullscreen && (
        <div className="p-4 sm:p-6 lg:p-8 xl:p-12 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-700 mb-4 sm:mb-6" style={{ marginTop: '15px' }}>
          <div className="space-y-2 sm:space-y-3 text-gray-600 text-xs sm:text-sm">
            <p>Looking for a fast, easy-to-use <strong>online stopwatch</strong>? You're in the right place. Our stopwatch tool is designed to be simple, accurate, and completely free. Whether you're timing a workout, tracking productivity, or just need a quick way to measure time, our digital stopwatch gets the job done — no downloads, no sign-ups.</p>
            <h2 className="text-sm sm:text-base font-semibold mt-4 sm:mt-6 mb-2">✅ Why Use Our Stopwatch Tool?</h2>
            <ul className="list-disc pl-4 sm:pl-6 space-y-1">
              <li><strong>Instant Start</strong> – Just press <strong>Start</strong> and you're timing in seconds.</li>
              <li><strong>User-Friendly Design</strong> – Clean layout that works on any device.</li>
              <li><strong>Pause & Reset Anytime</strong> – Full control with just a click.</li>
              <li><strong>Runs in Background</strong> – Switch tabs, we'll keep counting.</li>
              <li><strong>100% Free & Ad-Lite</strong> – No clutter, just what you need.</li>
            </ul>
            <h3 className="text-sm sm:text-base font-semibold mt-4 sm:mt-6 mb-2">🔍 What Can You Use This Stopwatch For?</h3>
            <p>Our stopwatch is perfect for all kinds of tasks:</p>
            <ul className="list-disc pl-4 sm:pl-6 space-y-1">
              <li><strong>Workouts & Fitness</strong> – Track intervals, rest times, or total workout duration.</li>
              <li><strong>Study Sessions</strong> – Stay focused with timed study blocks.</li>
              <li><strong>Games & Challenges</strong> – Time races, puzzles, or speed rounds.</li>
              <li><strong>Cooking & Baking</strong> – Keep an eye on exact prep or cook times.</li>
              <li><strong>Productivity</strong> – Use it with the Pomodoro technique or time blocking.</li>
            </ul>
            <h3 className="text-sm sm:text-base font-semibold mt-4 sm:mt-6 mb-2">🖥️ Works on Any Device</h3>
            <p>Whether you're on a desktop, tablet, or smartphone, our stopwatch adjusts to fit your screen. It's fully responsive and designed to work in all modern browsers—no app required.</p>
            <h3 className="text-sm sm:text-base font-semibold mt-4 sm:mt-6 mb-2">🔒 Private & Secure</h3>
            <p>Your time data stays on your device. We don't store your usage history, and there are no unnecessary permissions. Just open and go.</p>
            <h3 className="text-sm sm:text-base font-semibold mt-4 sm:mt-6 mb-2">⏱️ How to Use the Stopwatch</h3>
            <ol className="list-decimal pl-4 sm:pl-6 space-y-1">
              <li><strong>Click "Start"</strong> to begin timing.</li>
              <li><strong>Click "Pause"</strong> to stop the clock without resetting.</li>
              <li><strong>Click "Reset"</strong> to clear the timer.</li>
            </ol>
          </div>
        </div>
      )}
    </>
  );
};

export default Stopwatch;