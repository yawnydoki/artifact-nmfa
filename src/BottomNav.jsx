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

  const navItems = [
    { path: '/language' }, 
    { path: '/map' },
    { path: '/' },         
    { path: '/passport' },
    { path: '/end' }
  ];

  const activeIndex = navItems.findIndex(item => location.pathname === item.path);
  
  const safeActiveIndex = isLangOpen ? 0 : (activeIndex === -1 ? 2 : activeIndex);

  return (
    <>
      {isLangOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fade-in-up"
          onClick={() => setIsLangOpen(false)}
        ></div>
      )}
      <div className={`fixed bottom-28 left-1/2 transform -translate-x-1/2 w-11/12 max-w-sm bg-artifact-card rounded-3xl p-6 shadow-2xl z-40 transition-transform duration-300 border-4 border-[#C9B99A] ${isLangOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'}`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-daruma text-artifact-border text-2xl">Select Language</h3>
          <button onClick={() => setIsLangOpen(false)} className="text-artifact-border font-bold text-xl hover:opacity-70">✕</button>
        </div>
        
        <div className="flex flex-col gap-3">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setCurrentLang(lang.code); 
                setTimeout(() => setIsLangOpen(false), 200); 
              }}
              className={`py-3 px-4 rounded-xl font-daruma text-lg text-left transition-all ${
                currentLang === lang.code 
                  ? 'bg-artifact-border text-white shadow-md pl-6' 
                  : 'bg-white/50 text-artifact-border hover:bg-white'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-white/20 backdrop-blur-md rounded-full p-1.5 w-11/12 max-w-sm border border-white/10 shadow-2xl z-50">
        <div className="relative flex items-center w-full h-14">
          
          <div 
            className="absolute top-0 h-full w-1/5 flex items-center justify-center transition-transform duration-500 ease-out z-0"
            style={{ transform: `translateX(${safeActiveIndex * 100}%)` }}
          >
            <div className="w-12 h-12 bg-white/30 backdrop-blur-md rounded-full border border-white/40 shadow-[inset_0_0_10px_rgba(255,255,255,0.3)]"></div>
          </div>

          <div className="w-1/5 flex justify-center items-center z-10 h-full cursor-pointer">
            <button 
              onClick={() => setIsLangOpen(!isLangOpen)}
              className={`transition-opacity ${safeActiveIndex === 0 ? 'text-white opacity-100 drop-shadow-md' : 'text-white opacity-70 hover:opacity-100'}`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
            </button>
          </div>

          <div className="w-1/5 flex justify-center items-center z-10 h-full cursor-pointer">
            <button 
              onClick={() => handleNav('/map')}
              className={`transition-opacity ${safeActiveIndex === 1 ? 'text-white opacity-100 drop-shadow-md' : 'text-white opacity-70 hover:opacity-100'}`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </button>
          </div>

          <div className="w-1/5 flex justify-center items-center z-10 h-full cursor-pointer">
            <button 
              onClick={() => handleNav('/')}
              className={`transition-opacity ${safeActiveIndex === 2 ? 'text-white opacity-100 drop-shadow-md' : 'text-white opacity-70 hover:opacity-100'}`}
            >
              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M4 4h3l2-2h6l2 2h3a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2z"/><circle cx="12" cy="13" r="4" fill="none" stroke="currentColor" strokeWidth="2"/></svg>
            </button>
          </div>

          <div className="w-1/5 flex justify-center items-center z-10 h-full cursor-pointer">
            <button 
              onClick={() => handleNav('/passport')}
              className={`transition-opacity ${safeActiveIndex === 3 ? 'text-white opacity-100 drop-shadow-md' : 'text-white opacity-70 hover:opacity-100'}`}
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>
            </button>
          </div>

          <div className="w-1/5 flex justify-center items-center z-10 h-full cursor-pointer">
            <button 
              onClick={() => handleNav('/end')}
              className={`transition-opacity ${safeActiveIndex === 4 ? 'text-white opacity-100 drop-shadow-md' : 'text-white opacity-70 hover:opacity-100'}`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </button>
          </div>

        </div>
      </div>
    </>
  );
};

export default BottomNav;