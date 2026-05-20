import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from './LanguageContext';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { currentLang, setCurrentLang } = useLanguage(); 
  const [isLangOpen, setIsLangOpen] = useState(false);

  const hideNavPaths = ['/quiz', '/end', '/end-prompt'];
  if (hideNavPaths.includes(location.pathname)) {
    return null;
  }

  const languages = [
    { code: 'eng', label: 'English' },
    { code: 'tag', label: 'Tagalog' },
    { code: 'chi', label: '中文 (Chinese)' },
    { code: 'jap', label: '日本語 (Japanese)' },
    { code: 'kor', label: '한국어 (Korean)' }
  ];

  const handleNav = (path) => {
    setIsLangOpen(false); 
    if (location.pathname !== path) {
      navigate(path); 
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {isLangOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] animate-fade-in"
          onClick={() => setIsLangOpen(false)}
        ></div>
      )}
      
      <div className={`fixed bottom-28 left-1/2 transform -translate-x-1/2 w-11/12 max-w-sm bg-museum-brown rounded-[2rem] p-6 shadow-2xl z-[100] transition-all duration-300 border border-museum-gold/30 ${isLangOpen ? 'translate-y-0 opacity-100' : 'translate-y-[120%] opacity-0 pointer-events-none'}`}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-serif text-museum-gold text-2xl tracking-wide">Select Language</h3>
          <button onClick={() => setIsLangOpen(false)} className="text-white/50 hover:text-white font-bold text-xl transition-colors">✕</button>
        </div>
        
        <div className="flex flex-col gap-3">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setCurrentLang(lang.code); 
                setTimeout(() => setIsLangOpen(false), 200); 
              }}
              className={`py-3.5 px-5 rounded-xl font-neohellenic text-lg text-left transition-all tracking-wide border ${
                currentLang === lang.code n
                  ? 'bg-museum-gold/10 border-museum-gold text-museum-gold shadow-md pl-6' 
                  : 'bg-white/5 border-transparent text-white hover:bg-white/10'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      <div className="fixed bottom-6 left-0 w-full px-6 flex justify-between items-center z-50 pointer-events-none">
        
        <button 
          onClick={() => setIsLangOpen(!isLangOpen)}
          className="pointer-events-auto p-3 rounded-full transition-all duration-300 text-white hover:bg-white/5 active:scale-95"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
        </button>

        <div className="pointer-events-auto relative flex items-center justify-center bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 rounded-full h-16 px-4 w-[240px] shadow-[0_15px_35px_rgba(0,0,0,0.4),_inset_0_1px_3px_rgba(255,255,255,0.3)] isolation-isolate">

          <div className="absolute w-20 h-20 rounded-full bg-gradient-to-b from-white/20 to-white/5 border border-white/40 backdrop-blur-xl shadow-[0_8px_20px_rgba(0,0,0,0.3),_inset_0_2px_4px_rgba(255,255,255,0.4)] pointer-events-none top-1/2 -translate-y-1/2 -translate-x-1/2 transition-[left] duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]"
            style={{
              left: isActive('/map')
                ? 'calc(16px + 24px)'
                : isActive('/passport')
                ? 'calc(100% - 16px - 24px)'
                : '50%',
            }}
          />

          <div className="absolute inset-0 flex justify-between items-center px-4 z-10">
            <button 
              onClick={() => handleNav('/map')}
              className={`w-12 h-12 flex items-center justify-center transition-all duration-300 active:scale-90 ${isActive('/map') ? 'text-museum-gold' : 'text-white/70 hover:text-white'}`}
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </button>

            <button 
              onClick={() => handleNav('/')}
              className={`w-12 h-12 flex items-center justify-center transition-all duration-300 active:scale-90 ${isActive('/') ? 'text-museum-gold' : 'text-white/70 hover:text-white'}`}
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
              </svg>          
            </button>

            <button 
              onClick={() => handleNav('/passport')}
              className={`w-12 h-12 flex items-center justify-center transition-all duration-300 active:scale-90 ${isActive('/passport') ? 'text-museum-gold' : 'text-white/70 hover:text-white'}`}
            >
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>
            </button>
          </div>

        </div>

        <button 
          onClick={() => handleNav('/end-prompt')}
          className="pointer-events-auto p-3 rounded-full transition-all duration-300 text-white hover:bg-white/5 active:scale-95"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
        </button>

      </div>
    </>
  );
};

export default BottomNav;