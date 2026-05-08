import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import { translations } from '../utils/translation';
import Button from '../components/common/Button';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { lang, setUserInfo, userInfo } = useStore();
  const t = translations[lang];
  
  const [gender, setGender] = useState(userInfo?.gender || '');
  const [age, setAge] = useState(userInfo?.age || '');

  const handleStart = () => {
    if (gender && age) {
      setUserInfo({ gender, age });
      navigate('/room');
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center w-full h-full relative">
      <div className="absolute inset-0 z-0 flex items-center justify-center opacity-30 pointer-events-none">
        <div className="w-[800px] h-[800px] bg-gradient-to-tr from-pink-500/20 via-transparent to-blue-500/20 rounded-full blur-[100px]"></div>
      </div>
      
      <div className="w-full max-w-md p-8 glass-panel rounded-3xl border border-white/20 dark:border-white/10 shadow-2xl z-10 animate-slide-up flex flex-col items-center">
        <div className="w-16 h-16 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-2xl flex items-center justify-center font-bold text-3xl shadow-lg mb-6 rotate-3">
          <span className="animate-pulse">👋</span>
        </div>
        
        <h2 className="text-2xl font-bold mb-2 text-center">{t.ONBOARDING_GREETING}</h2>
        <p className="text-gray-500 dark:text-gray-400 text-center text-sm mb-8">{t.SELECT_GENDER_AGE}</p>

        <div className="w-full space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-semibold">{t.GENDER}</label>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setGender('male')}
                className={`py-3 rounded-2xl border-2 transition-all font-medium ${gender === 'male' ? 'border-neutral-900 dark:border-white bg-neutral-50 dark:bg-neutral-800' : 'border-gray-200 dark:border-neutral-800 hover:border-gray-300 dark:hover:border-neutral-700'}`}
              >
                👨 {t.GENDER_MALE}
              </button>
              <button 
                onClick={() => setGender('female')}
                className={`py-3 rounded-2xl border-2 transition-all font-medium ${gender === 'female' ? 'border-neutral-900 dark:border-white bg-neutral-50 dark:bg-neutral-800' : 'border-gray-200 dark:border-neutral-800 hover:border-gray-300 dark:hover:border-neutral-700'}`}
              >
                👩 {t.GENDER_FEMALE}
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-semibold">{t.AGE}</label>
            <div className="grid grid-cols-4 gap-2">
              {['18-21', '22-25', '26-30', '30+'].map((a) => (
                <button 
                  key={a}
                  onClick={() => setAge(a)}
                  className={`py-2 text-sm rounded-xl border-2 transition-all font-medium ${age === a ? 'border-neutral-900 dark:border-white bg-neutral-50 dark:bg-neutral-800' : 'border-gray-200 dark:border-neutral-800 hover:border-gray-300 dark:hover:border-neutral-700'}`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          <Button 
            className="w-full py-3.5 mt-4 text-base"
            disabled={!gender || !age}
            onClick={handleStart}
          >
            {t.START_CHAT}
          </Button>
        </div>
      </div>
    </div>
  );
}
