import React, { useState, useEffect, useRef } from 'react';
import { Share2, Plus, Maximize2, Minimize2, ZoomIn, ZoomOut, X } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

interface Alarm {
  id: string;
  time: string;
  label: string;
  isActive: boolean;
  sound: string;
  repeat: boolean;
  // days?: string[];
}

// Persistent AudioContext for the whole component
let persistentAudioCtx: AudioContext | null = null;
if (typeof window !== 'undefined' && (window.AudioContext || (window as any).webkitAudioContext)) {
  persistentAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
}
// Resume AudioContext on first user gesture
if (typeof window !== 'undefined' && persistentAudioCtx) {
  window.addEventListener('click', () => {
    if (persistentAudioCtx && persistentAudioCtx.state === 'suspended') {
      persistentAudioCtx.resume().then(() => {
        console.log('Persistent AudioContext resumed');
      });
    }
  }, { once: true });
}

const AlarmClock: React.FC = () => {
  const location = useLocation();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('');
  const [fontSize, setFontSize] = useState(144);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const shareRef = useRef<HTMLDivElement>(null);
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [showAlarmModal, setShowAlarmModal] = useState(false);
  const [customTime, setCustomTime] = useState('');
  const [alarmLabel, setAlarmLabel] = useState('');
  const [activeAlarm, setActiveAlarm] = useState<Alarm | null>(null);
  const [alarmHour, setAlarmHour] = useState(11);
  const [alarmMinute, setAlarmMinute] = useState(24);
  const [alarmAMPM, setAlarmAMPM] = useState('AM');
  const [alarmSound, setAlarmSound] = useState('Bells');
  const [alarmRepeat, setAlarmRepeat] = useState(true);
  const [audioError, setAudioError] = useState<string | null>(null);
  // Add this state at the top of the component
  const [isPlaying, setIsPlaying] = useState(false);

  // Add this ref at the top of the component
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

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

  // Load alarms from localStorage
  useEffect(() => {
    const savedAlarms = localStorage.getItem('vclock-alarms');
    if (savedAlarms) {
      setAlarms(JSON.parse(savedAlarms));
    }
  }, []);

  // Save alarms to localStorage
  useEffect(() => {
    localStorage.setItem('vclock-alarms', JSON.stringify(alarms));
  }, [alarms]);

  // Check for alarm triggers
  useEffect(() => {
    const checkAlarms = () => {
      const now = new Date();
      const currentTimeString = now.toLocaleTimeString('en-US', {
        hour12: true,
        hour: 'numeric',
        minute: '2-digit'
      });

      alarms.forEach(alarm => {
        if (alarm.isActive && alarm.time === currentTimeString) {
          triggerAlarm(alarm);
        }
      });
    };

    const interval = setInterval(checkAlarms, 1000);
    return () => clearInterval(interval);
  }, [alarms]);

  // Add this utility function at the top or near the dropdown
  const soundFiles = [
    "Alarm_Clock_Bell.mp3",
    "Alarm_Clock.mp3",
    "Alarm_Fairee_Soiree.mp3",
    "Alarm_In_Camp.mp3",
    "Alarm_Soft.mp3",
    "Alarm_Tone.mp3",
    "Alarm.mp3",
    "Alarming.mp3",
    "Bach_Cello_Courante.mp3",
    "Beautiful_Piano.mp3",
    "Buzzer_Alarm_Clock_2.mp3",
    "Car_Alarm.mp3",
    "Cherry.mp3",
    "Classic_Alarm_Lg_78.mp3",
    "Classic_Alarm.mp3",
    "Classic_Bell.mp3",
    "Classicalarm.mp3",
    "Clock_Alert.mp3",
    "Cr7_Bom_Dia_Br.mp3",
    "Daybreak_Iphone_Alarm.mp3",
    "Dxd_Help_Me_Doctor.mp3",
    "Dxd_Morning_Wood.mp3",
    "Esser_Feueralarm.mp3",
    "File.mp3",
    "Fresh_Start_Pixel.mp3",
    "Funny_Car_Alarm.mp3",
    "Get_Up_And_Don_T_Tur.mp3",
    "Goodmorning_Alarm.mp3",
    "Har_Du_Vaknat.mp3",
    "Hop_Da_Electro.mp3",
    "Htc_Progressive.mp3",
    "Iphone_Alarm_Sound.mp3",
    "Kamen_Rider.mp3",
    "Kanye_West_Alarm.mp3",
    "La_Cucaracha.mp3",
    "Love_Connects_Alarm.mp3",
    "Lumia_Clock_Bells.mp3",
    "Mornig_Alarm_Piano.mp3",
    "Morning_Alarm.mp3",
    "Morning_Alarm_1.mp3",
    "Morning_Alarm_2.mp3",
    "Morning_Alert_Clock.mp3",
    "Motivation.mp3",
    "Multo_Cup_Of_Joe.mp3",
    "New_Lumia_Alarm.mp3",
    "Nice_Morning_Alarm.mp3",
    "Otter_Me_Alarm.mp3",
    "Polish_Army_Alarm.mp3",
    "Predator_Alarm.mp3",
    "Rain_Dance.mp3",
    "Romantic.mp3",
    "Seiya_Levantate.mp3",
    "Sica_Sweet_Delight.mp3",
    "Soft_Piano_Alarm.mp3",
    "Standart.mp3",
    "Transiberian_Orchestra.mp3",
    "Violin.mp3",
    "Wake_Up_Alarm.mp3",
    "Wake_Up_Sid.mp3",
    "Xperia_Seasons_Alarm.mp3"
  ];

  function getDisplayName(fileName: string) {
    return fileName
      .replace('.mp3', '')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
  }

  // Helper to format time string for alarm
  const getAlarmTimeString = () => {
    const hour = alarmHour;
    const minute = alarmMinute.toString().padStart(2, '0');
    return `${hour}:${minute} ${alarmAMPM}`;
  };

  const triggerAlarm = (alarm: Alarm) => {
    setActiveAlarm(alarm);
    playSound(alarm.sound, alarm.repeat);
    if (Notification.permission === 'granted') {
      new Notification('Alarm', {
        body: `${alarm.label} - ${alarm.time}`,
        icon: '/vite.svg'
      });
    }
  };

  // Update formatTime to return the time with AM/PM inline
  const formatTime = (date: Date) => {
    const full = date.toLocaleTimeString('en-US', {
      hour12: true,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    const [time, ampm] = full.split(' ');
    return `${time.replace(/^0/, '')} ${ampm}`;
  };

  // Add a function to get AM/PM
  const getAMPM = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour12: true }).split(' ')[1];
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    }).toUpperCase();
  };

  const increaseFontSize = () => {
    setFontSize(prev => Math.min(prev + 16, 256));
  };

  const decreaseFontSize = () => {
    setFontSize(prev => Math.max(prev - 16, 64));
  };

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        const clockElement = document.getElementById('clock-display');
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

  const openAlarmModal = () => {
    setShowAlarmModal(true);
    setCustomTime('');
    setAlarmLabel('');
    // Request notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  const addAlarm = () => {
    const timeToUse = getAlarmTimeString();
    if (!timeToUse) return;

    const newAlarm: Alarm = {
      id: Date.now().toString(),
      time: timeToUse,
      label: alarmLabel || `Alarm ${timeToUse}`,
      isActive: true,
      sound: alarmSound,
      repeat: alarmRepeat,
    };

    setAlarms(prev => [...prev, newAlarm]);
    setShowAlarmModal(false);
    setSelectedTime('');
    setCustomTime('');
    setAlarmLabel('');
  };

  // Play sound helper
  const playSound = (sound: string, repeat: boolean) => {
    setAudioError(null);
    // Stop any currently playing sound
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
      setIsPlaying(false);
    }
    console.log('playSound called with', sound, repeat);
    const src = `/sounds/${sound}`;
    try {
      const audio = new Audio(src);
      audioRef.current = audio;
      audio.volume = 1.0;
      audio.muted = false;
      audio.play().then(() => {
        setIsPlaying(true);
        console.log('Audio element played');
      }).catch((e) => {
        setAudioError('Audio play error: ' + e.message);
        setIsPlaying(false);
        console.error('Audio play error:', e);
      });
      audio.addEventListener('ended', () => {
        setIsPlaying(false);
        if (repeat) {
          playSound(sound, repeat);
        }
      }, { once: true });
    } catch (err: any) {
      setAudioError('Audio object error: ' + err.message);
      setIsPlaying(false);
      console.error('Audio object error:', err);
    }
  };

  // Test button handler
  const handleTestSound = () => {
    if (isPlaying) {
      stopSound();
    } else {
      playSound(alarmSound, alarmRepeat);
    }
  };

  const toggleAlarm = (id: string) => {
    setAlarms(prev => prev.map(alarm => 
      alarm.id === id ? { ...alarm, isActive: !alarm.isActive } : alarm
    ));
  };

  const deleteAlarm = (id: string) => {
    setAlarms(prev => prev.filter(alarm => alarm.id !== id));
  };

  const dismissActiveAlarm = () => {
    setActiveAlarm(null);
  };

  const timeSlots = [
    '4:00 AM', '4:30 AM', '5:30 AM', '5:45 AM',
    '5:00 AM', '5:15 AM', '6:30 AM', '6:45 AM',
    '6:00 AM', '6:15 AM', '7:30 AM', '7:45 AM',
    '7:00 AM', '7:15 AM', '8:30 AM', '8:45 AM',
    '8:00 AM', '8:15 AM', '9:00 AM', '10:00 AM',
    '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM'
  ];

  const recentlyUsed = [
    { label: 'Alarm 6:00 AM', time: '6:00 AM' },
    { label: 'Alarm 7:00 AM', time: '7:00 AM' },
    { label: 'Alarm 8:00 AM', time: '8:00 AM' },
    { label: 'Alarm 9:00 AM', time: '9:00 AM' },
    { label: 'Alarm 10:00 AM', time: '10:00 AM' },
    { label: 'Alarm 12:00 PM', time: '12:00 PM' },
    { label: 'Alarm 1:00 PM', time: '1:00 PM' },
    { label: 'Alarm 2:00 PM', time: '2:00 PM' },
    { label: 'Alarm 5:00 PM', time: '5:00 PM' },
    { label: 'Alarm 6:00 PM', time: '6:00 PM' }
  ];

  // Add this function inside the component
  const stopSound = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
      setIsPlaying(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Free Online Alarm Clock | Set Multiple Alarms Instantly</title>
        <meta name="description" content="Free online alarm clock with multiple alarms, custom sounds, and repeat options. Perfect for waking up, reminders, and daily routines. Works on all devices." />
        <link rel="canonical" href={location.pathname === '/' ? "https://vclock.app/" : "https://vclock.app/alarm"} />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="Free Online Alarm Clock | Set Multiple Alarms Instantly" />
        <meta property="og:description" content="Free online alarm clock with multiple alarms, custom sounds, and repeat options. Perfect for waking up, reminders, and daily routines. Works on all devices." />
        <meta property="og:url" content={location.pathname === '/' ? "https://vclock.app/" : "https://vclock.app/alarm"} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Free Online Alarm Clock | Set Multiple Alarms Instantly" />
        <meta name="twitter:description" content="Free online alarm clock with multiple alarms, custom sounds, and repeat options. Perfect for waking up, reminders, and daily routines. Works on all devices." />
      </Helmet>
      {/* Active Alarm Notification */}
      {activeAlarm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center">
            <div className="text-6xl mb-4">⏰</div>
            <h2 className="text-2xl font-bold mb-2">Alarm</h2>
            <p className="text-lg mb-2">{activeAlarm.label}</p>
            <p className="text-xl font-mono mb-6">{activeAlarm.time}</p>
            <button
              onClick={dismissActiveAlarm}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Alarm Modal */}
      {showAlarmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-40 p-4">
          <div className="bg-white dark:bg-black rounded-2xl shadow-2xl max-w-6xl w-full mx-4 overflow-hidden border border-gray-200 dark:border-gray-700">
            {/* Header */}
            <div className="px-6 py-4 relative overflow-hidden" style={{ background: 'linear-gradient(90deg, #0090DD 60%, #00C6FB 100%)' }}>
              <div className="absolute inset-0 bg-black bg-opacity-10"></div>
              <div className="relative flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-white text-2xl">⏰</span>
                  <h2 className="text-xl font-semibold text-white">Set Alarm</h2>
                </div>
                <button
                  onClick={() => setShowAlarmModal(false)}
                  className="text-white hover:text-blue-100 transition-colors p-2 rounded-full hover:bg-white hover:bg-opacity-20"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            {/* Body */}
            <div className="p-6 space-y-4 bg-white dark:bg-black">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Hours Picker */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wide">Hours</label>
                  <div className="flex items-center justify-center space-x-1">
                    <button onClick={() => setAlarmHour(h => h === 1 ? 12 : h - 1)} className="w-8 h-8 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-500 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-all shadow-sm hover:shadow-md"><span className="text-sm font-bold">−</span></button>
                    <div className="w-12 h-10 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 rounded-lg flex items-center justify-center border border-blue-200 dark:border-blue-700 shadow-sm">
                      <span className="text-lg font-bold text-gray-800 dark:text-white">{alarmHour.toString().padStart(2, '0')}</span>
                    </div>
                    <button onClick={() => setAlarmHour(h => h === 12 ? 1 : h + 1)} className="w-8 h-8 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-500 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-all shadow-sm hover:shadow-md"><span className="text-sm font-bold">+</span></button>
                  </div>
                </div>
                {/* Minutes Picker */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wide">Minutes</label>
                  <div className="flex items-center justify-center space-x-1">
                    <button onClick={() => setAlarmMinute(m => m === 0 ? 59 : m - 1)} className="w-8 h-8 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-500 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-all shadow-sm hover:shadow-md"><span className="text-sm font-bold">−</span></button>
                    <div className="w-12 h-10 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 rounded-lg flex items-center justify-center border border-blue-200 dark:border-blue-700 shadow-sm">
                      <span className="text-lg font-bold text-gray-800 dark:text-white">{alarmMinute.toString().padStart(2, '0')}</span>
                    </div>
                    <button onClick={() => setAlarmMinute(m => m === 59 ? 0 : m + 1)} className="w-8 h-8 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-500 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-all shadow-sm hover:shadow-md"><span className="text-sm font-bold">+</span></button>
                  </div>
                </div>
              </div>
              {/* AM/PM Picker */}
              <div className="flex items-center justify-center gap-4">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1 uppercase tracking-wide">AM/PM</label>
                <select value={alarmAMPM} onChange={e => setAlarmAMPM(e.target.value)} className="w-24 px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all bg-white dark:bg-gray-800 text-gray-800 dark:text-white">
                  <option>AM</option>
                  <option>PM</option>
                </select>
              </div>
              {/* Sound and Repeat */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                <div className="w-full sm:flex-1 flex items-center border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-800 h-10 sm:h-12">
                  <select value={alarmSound} onChange={e => setAlarmSound(e.target.value)} className="flex-1 h-full px-2 sm:px-4 text-sm sm:text-base font-normal border-0 focus:ring-2 focus:ring-blue-400 focus:outline-none appearance-none bg-white dark:bg-gray-800">
                    {soundFiles.map(file => (
                      <option key={file} value={file}>
                        {getDisplayName(file)}
                      </option>
                    ))}
                  </select>
                  <button onClick={handleTestSound} className="w-10 sm:w-12 h-full flex items-center justify-center text-sm sm:text-lg text-gray-500 bg-gray-100 hover:bg-gray-200 border-l border-gray-200 dark:border-gray-600" title={isPlaying ? 'Stop Sound' : 'Play Sound'}>
                    {isPlaying ? (
                      // Stop icon
                      <svg width="16" height="16" className="sm:w-5 sm:h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="8" height="8" /></svg>
                    ) : (
                      // Play icon
                      <svg width="16" height="16" className="sm:w-5 sm:h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                    )}
                  </button>
                </div>
                {audioError && (
                  <div className="text-red-600 text-sm mt-2">{audioError}</div>
                )}
                <div className="flex items-center w-full sm:w-auto">
                  <input type="checkbox" id="repeatSound" className="peer hidden" checked={alarmRepeat} onChange={e => setAlarmRepeat(e.target.checked)} />
                  <label htmlFor="repeatSound" className="w-6 h-6 flex items-center justify-center border-2 border-blue-500 bg-white cursor-pointer mr-2">
                    {alarmRepeat && (
                      <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="#0090DD" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 11 8 15 16 6" /></svg>
                    )}
                  </label>
                  <span className="text-gray-700 dark:text-gray-300 text-base font-normal select-none">Repeat sound</span>
                </div>
              </div>
              {/* Title */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1 uppercase tracking-wide">Title</label>
                <input
                  type="text"
                  value={alarmLabel}
                  onChange={(e) => setAlarmLabel(e.target.value)}
                  placeholder="Alarm"
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all bg-white dark:bg-gray-800 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
            </div>
            {/* Footer */}
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900 px-6 py-4 flex gap-3 border-t border-gray-100 dark:border-gray-700">
              <button
                onClick={handleTestSound}
                className="flex-1 py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm hover:shadow-md"
              >
                Test
              </button>
              <button
                onClick={() => { stopSound(); setShowAlarmModal(false); }}
                className="flex-1 py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm hover:shadow-md"
              >
                Cancel
              </button>
              <button
                onClick={addAlarm}
                disabled={false /* TODO: disable if invalid */}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-green-500 via-green-600 to-green-700 text-white font-medium rounded-lg hover:from-green-600 hover:via-green-700 hover:to-green-800 transition-all shadow-sm hover:shadow-lg transform hover:scale-105"
              >
                Start
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Clock Display */}
      <div 
        id="clock-display"
        className={
          isFullscreen
            ? 'fixed inset-0 z-50 flex flex-col justify-center items-center bg-black text-white border-0 text-center'
            : 'bg-white dark:bg-black border-b border-gray-200 dark:border-gray-700 text-center relative p-2 sm:p-4 md:p-6 lg:p-8 xl:p-12'
        }
      >
        <div className="absolute top-1 sm:top-2 md:top-4 right-1 sm:right-2 md:right-4 flex space-x-1">
          <button 
            onClick={decreaseFontSize}
            className={`p-2 rounded transition-colors ${
              isFullscreen 
                ? 'hover:bg-gray-800 text-white' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300'
            }`}
            title="Decrease font size"
          >
            <ZoomOut className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
          </button>
          <button 
            onClick={increaseFontSize}
            className={`p-2 rounded transition-colors ${
              isFullscreen 
                ? 'hover:bg-gray-800 text-white' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300'
            }`}
            title="Increase font size"
          >
            <ZoomIn className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
          </button>
          <div className="relative" ref={shareRef}>
            <button
              className={`p-2 rounded transition-colors ${
                isFullscreen 
                  ? 'hover:bg-gray-800 text-white'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300'
              }`}
              title="Share"
              aria-label="Share"
              onClick={() => setShowShare(s => !s)}
            >
              <Share2 className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
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
          <button 
            onClick={toggleFullscreen}
            className={`p-2 rounded transition-colors ${
              isFullscreen 
                ? 'hover:bg-gray-800 text-white' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300'
            }`}
            title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? (
              <Minimize2 className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
            ) : (
              <Maximize2 className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
            )}
          </button>
        </div>
        
        <div className={isFullscreen ? '' : 'mt-2 sm:mt-4'}>
          <div 
            className={`font-light mb-4 tracking-tight leading-none flex items-baseline justify-center font-nunito ${
              isFullscreen ? 'text-white' : 'text-black'
            }`}
            style={{ 
              fontSize: `${Math.round(isFullscreen ? fontSize * 1.5 : Math.min(fontSize, window.innerWidth * 0.12))}px`,
              fontWeight: 900,
              color: isFullscreen ? '#fff' : '#555555',
              letterSpacing: '0.04em',
              textAlign: 'center',
            }}
          >
            {/* Split time and AM/PM for styling */}
            <span>{formatTime(currentTime).replace(/\s?(AM|PM)$/i, '')}</span>
            <span style={{ fontSize: '0.35em', marginLeft: '0.25em', fontWeight: 400, letterSpacing: '0.08em', verticalAlign: 'baseline' }}>
              {formatTime(currentTime).match(/(AM|PM)$/i)?.[0]}
            </span>
          </div>
          <div className={`tracking-wide font-medium font-bold mt-2 sm:mt-0 ${
            isFullscreen 
              ? 'text-gray-300 text-xl sm:text-2xl md:text-3xl' 
              : 'text-gray-500 text-xs sm:text-sm md:text-base lg:text-xl'
          } font-nunito`} style={{
            color: '#555555',
            letterSpacing: '0.18em',
            textAlign: 'center',
            textTransform: 'uppercase',
            fontWeight: 900,
            fontSize: isFullscreen ? 'clamp(1.5rem, 5vw, 3rem)' : 'clamp(0.75rem, 3vw, 1.5rem)',
          }}>
            {formatDate(currentTime)}
          </div>
        </div>
        
        {!isFullscreen && (
          <button 
            onClick={openAlarmModal}
            className="mt-3 sm:mt-4 md:mt-6 bg-green-500 hover:bg-green-600 text-white px-3 sm:px-4 md:px-6 py-2 text-xs sm:text-sm md:text-base rounded-md font-medium transition-colors shadow-sm"
          >
            Set Alarm
          </button>
        )}
      </div>

      {/* Active Alarms List */}
      {!isFullscreen && alarms.length > 0 && (
        <div className="p-2 sm:p-3 md:p-4 lg:p-6">
          <div className="bg-white dark:bg-black rounded-lg p-3 sm:p-4 md:p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm sm:text-base md:text-lg font-medium text-gray-800 dark:text-white mb-2 sm:mb-3 md:mb-4">Active Alarms</h3>
            <div className="space-y-2 sm:space-y-3">
              {alarms.map((alarm) => (
                <div key={alarm.id} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <button
                      onClick={() => toggleAlarm(alarm.id)}
                      className={`w-8 sm:w-10 md:w-12 h-4 sm:h-5 md:h-6 rounded-full transition-colors ${
                        alarm.isActive ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`w-3 sm:w-4 md:w-5 h-3 sm:h-4 md:h-5 bg-white rounded-full transition-transform ${
                        alarm.isActive ? 'translate-x-4 sm:translate-x-5 md:translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                    <div>
                      <div className="text-xs sm:text-sm md:text-base font-medium text-gray-800 dark:text-white">{alarm.time}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">{alarm.label}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteAlarm(alarm.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <X className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Alarm Settings Section */}
      {!isFullscreen && (
      <div className="p-2 sm:p-3 md:p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
        {/* Set Alarm Times */}
        <div className="bg-white dark:bg-black rounded-lg p-3 sm:p-4 md:p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm sm:text-base md:text-lg font-medium text-gray-800 dark:text-white mb-2 sm:mb-3 md:mb-4">
            Set the alarm for the specified time
          </h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1 sm:gap-2">
            {timeSlots.map((time, index) => (
              <button
                key={index}
                onClick={() => setSelectedTime(time)}
                className="px-1 sm:px-2 md:px-3 py-1 sm:py-2 text-xs sm:text-sm rounded transition-colors bg-[#00A1F7] text-white hover:bg-[#0086c3]"
              >
                {time}
              </button>
            ))}
          </div>
        </div>

        {/* Recently Used */}
        <div className="bg-white dark:bg-black rounded-lg p-3 sm:p-4 md:p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2 sm:mb-3 md:mb-4">
            <h3 className="text-sm sm:text-base md:text-lg font-medium text-gray-800 dark:text-white">Recently used</h3>
            <button className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
              <svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
          
          <div className="space-y-2">
            {recentlyUsed.map((alarm, index) => (
              <div key={index} className="flex items-center justify-between py-1">
                <span 
                  className="text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 cursor-pointer text-xs sm:text-sm"
                  onClick={() => setSelectedTime(alarm.time)}
                >
                  {alarm.label}
                </span>
                <span className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">{alarm.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      )}

      {/* Instructions */}
      {!isFullscreen && (
      <div className="p-3 sm:p-4 md:p-6 bg-white dark:bg-black mx-2 sm:mx-3 md:mx-6 rounded-lg border border-gray-200 dark:border-gray-700" style={{ marginBottom: '20px' }}>
        <h3 className="text-sm sm:text-base md:text-lg font-medium text-gray-800 dark:text-white mb-2 sm:mb-3 md:mb-4">
          How to Use the Online Alarm Clock
        </h3>
        
        <div className="space-y-2 sm:space-y-3 text-gray-600 dark:text-gray-300 text-xs sm:text-sm">
          <p>
            Need a reliable alarm clock right in your browser? You’re in the perfect spot. Setting an alarm here is quick and easy—just pick your time, choose a sound, and add a label if you want. When your alarm goes off, you’ll see a message and hear your chosen sound, even if you’re working in another tab.
          </p>
          <ul className="list-disc pl-3 sm:pl-4 md:pl-6 space-y-1">
            <li><strong>Set your alarm:</strong> Select the hour and minute, pick a sound you like, and add a label to remember what it’s for.</li>
            <li><strong>Test before you trust:</strong> Hit the “Test” button to make sure the alert and volume are just right.</li>
            <li><strong>Personalize it:</strong> Change the look and feel—adjust the text color, style, and size. Your preferences are saved for next time.</li>
            <li><strong>Works offline:</strong> The alarm will ring even if you lose your internet connection (just don’t close your browser or shut down your computer).</li>
            <li><strong>Easy access:</strong> Bookmark your favorite alarm settings or share a link to set the alarm instantly next time.</li>
          </ul>
          <p>
            When your alarm time arrives, you’ll get a clear notification and your chosen sound will play. If you want to change or delete an alarm, it’s just a click away. Your alarms and settings stay private—nothing is stored on our servers.
          </p>
          <p>
            Try it out and never miss an important moment again!
          </p>
        </div>
      </div>
      )}
    </>
  );
};

export default AlarmClock;