import React, { useState } from 'react';
import { useLanguage } from './LanguageContext';

const LanguageToggle = () => {
  const { currentLang, setCurrentLang } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'eng', label: 'English' },
    { code: 'tag', label: 'Tagalog' },
    { code: 'kor', label: '한국어' },
    { code: 'chinese', label: '中文' },
    { code: 'jap', label: '日本語' }
  ];

  return (
    <div className="absolute top-6 left-6 z-50">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 bg-[#FCEBBB] border-2 border-[#5C432A] rounded-full flex items-center justify-center text-2xl shadow-md hover:bg-white transition-colors"
      >
        🌐
      </button>

      {isOpen && (
        <div className="absolute top-14 left-0 w-32 bg-[#FCEBBB] border-2 border-[#5C432A] rounded-xl shadow-xl flex flex-col overflow-hidden animate-fade-in">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setCurrentLang(lang.code);
                setIsOpen(false);
              }}
              className={`py-3 px-4 font-daruma text-left transition-colors ${
                currentLang === lang.code 
                  ? 'bg-[#5C432A] text-white' 
                  : 'text-[#5C432A] hover:bg-black/5'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageToggle;