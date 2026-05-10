import React, { useState, useRef, useEffect } from 'react';
import { X, Camera } from 'lucide-react';
import useStore from '../../store/useStore';
import { translations } from '../../utils/translation';

export default function ProfileModal({ isOpen, onClose }) {
  const { userInfo, setUserInfo, lang } = useStore();
  const t = translations[lang];
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: userInfo?.name || '',
    age: userInfo?.age || '',
    city: userInfo?.city || '',
    gender: userInfo?.gender || 'male',
  });
  const [previewUrl, setPreviewUrl] = useState(null);
  const [avatarError, setAvatarError] = useState(false);



  if (!isOpen) return null;

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ').filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const handleChange = (e) => {
    try {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    } catch (error) {
      console.error('Error updating form data:', error);
    }
  };

  const handleSave = () => {
    try {
      setUserInfo(formData);
      onClose();
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  const handleImageChange = (e) => {
    try {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrl(reader.result);
          setUserInfo({ avatar: reader.result });
        };
        reader.readAsDataURL(file);
      }
    } catch (error) {
      console.error('Error changing image:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-md bg-[#141414] rounded-3xl shadow-2xl border border-neutral-800 flex flex-col overflow-hidden animate-slide-up text-white">
        <div className="px-6 py-5 border-b border-neutral-800 flex justify-between items-center bg-neutral-900/50 backdrop-blur-sm">
          <h2 className="text-lg font-bold truncate pr-4">{t.EDIT_PROFILE}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-neutral-800 shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              {avatarError ? (
                <div className="w-24 h-24 rounded-full border-4 border-neutral-800 flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-3xl font-bold">
                  {getInitials(userInfo?.name)}
                </div>
              ) : (
                <img 
                  src={userInfo?.avatar || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&q=80'} 
                  alt="Avatar" 
                  className="w-24 h-24 rounded-full object-cover border-4 border-neutral-800 bg-neutral-800"
                  onError={() => setAvatarError(true)} 
                />
              )}
              
              <label className="absolute bottom-0 right-0 p-2 bg-neutral-800 border-2 border-[#141414] rounded-full hover:bg-neutral-700 transition-colors cursor-pointer">
                <Camera className="w-4 h-4 text-white" />
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleImageChange}
                />
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1 block truncate">{t.DISPLAY_NAME}</label>
              <input 
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-neutral-900 border border-transparent focus:border-neutral-700 rounded-xl px-4 py-3 text-sm outline-none transition-colors text-white placeholder-gray-500" 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1 block truncate">{t.AGE}</label>
                <input 
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  className="w-full bg-neutral-900 border border-transparent focus:border-neutral-700 rounded-xl px-4 py-3 text-sm outline-none transition-colors text-white" 
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1 block truncate">{t.GENDER}</label>
                <select 
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full bg-neutral-900 border border-transparent focus:border-neutral-700 rounded-xl px-4 py-3 text-sm outline-none transition-colors text-white appearance-none"
                >
                  <option value="male">{t.GENDER_MALE}</option>
                  <option value="female">{t.GENDER_FEMALE}</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1 block truncate">{t.CITY}</label>
              <input 
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full bg-neutral-900 border border-transparent focus:border-neutral-700 rounded-xl px-4 py-3 text-sm outline-none transition-colors text-white" 
              />
            </div>
          </div>

          <div className="flex items-center gap-3 mt-8">
            <button 
              onClick={onClose}
              className="flex-1 py-3 rounded-xl font-bold bg-neutral-800 text-white hover:bg-neutral-700 transition-colors whitespace-nowrap truncate px-2"
            >
              {t.CANCEL}
            </button>
            <button 
              onClick={handleSave}
              className="flex-1 py-3 rounded-xl font-bold bg-gradient-to-r from-rose-500 to-orange-500 text-white hover:scale-105 active:scale-95 transition-all shadow-lg shadow-rose-500/30 whitespace-nowrap truncate px-2"
            >
              {t.SAVE_CHANGES}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
