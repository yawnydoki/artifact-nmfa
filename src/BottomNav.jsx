import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from './LanguageContext';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { currentLang, setCurrentLang } = useLanguage(); 
  const [isLangOpen, setIsLangOpen] = useState(false);

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
                currentLang === lang.code 
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
          className={`pointer-events-auto p-3 rounded-full transition-all duration-300 drop-shadow-lg ${isLangOpen ? 'bg-museum-gold text-museum-brown' : 'bg-museum-brown/60 backdrop-blur-md text-white border border-white/20 hover:bg-museum-brown'}`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
        </button>

        <div className="pointer-events-auto relative flex items-center bg-museum-brown/60 backdrop-blur-md border border-white/20 rounded-full h-14 px-5 gap-7 shadow-xl">
          
          <button 
            onClick={() => handleNav('/map')}
            className={`transition-colors duration-300 ${isActive('/map') ? 'text-museum-gold' : 'text-white opacity-70 hover:opacity-100'}`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </button>

          <button 
            onClick={() => handleNav('/')}
            className={`relative -top-4 w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.5)] border ${isActive('/') ? 'bg-museum-gold border-museum-gold text-museum-brown scale-105' : 'bg-museum-brown/90 backdrop-blur-xl border-white/30 text-white hover:bg-museum-brown'}`}
          >
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M4 4h3l2-2h6l2 2h3a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2z"/><circle cx="12" cy="13" r="4" fill="none" stroke="currentColor" strokeWidth="2"/></svg>
          </button>

          <button 
            onClick={() => handleNav('/passport')}
            className={`transition-colors duration-300 ${isActive('/passport') ? 'text-museum-gold' : 'text-white opacity-70 hover:opacity-100'}`}
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>
          </button>
        </div>

        <button 
          onClick={() => handleNav('/end')}
          className={`pointer-events-auto p-3 rounded-full transition-all duration-300 drop-shadow-lg ${isActive('/end') ? 'bg-museum-gold text-museum-brown' : 'bg-museum-brown/60 backdrop-blur-md text-white border border-white/20 hover:bg-museum-brown'}`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
        </button>

      </div>
    </>
  );
};

export default BottomNav;