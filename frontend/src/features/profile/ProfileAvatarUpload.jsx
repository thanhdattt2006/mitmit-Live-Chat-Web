import React, { useRef } from 'react';
import { Camera } from 'lucide-react';
import useStore from '../../store/useStore';
import { translations } from '../../utils/translation';

export default function ProfileAvatarUpload({ previewUrl, setPreviewUrl, avatarError, setAvatarError, getInitials }) {
  const { userInfo, lang } = useStore();
  const t = translations[lang];
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    try {
      const file = e.target.files?.[0];
      if (file) {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      }
    } catch (error) {
      console.error('Error changing image:', error);
    }
  };

  return (
    <div className="flex flex-col items-center mb-6">
      <div className="relative">
        {avatarError ? (
          <div className="w-24 h-24 rounded-full border-4 border-neutral-800 flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-3xl font-bold">
            {getInitials(userInfo?.name)}
          </div>
        ) : (
          <img 
            src={previewUrl || userInfo?.avatarUrl} // Bỏ hardcode Unsplash
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
      
      <div className="mt-4 flex items-center gap-2">
        <h3 className="font-semibold text-lg">{userInfo?.name || t.GUEST}</h3>
      </div>
    </div>
  );
}
