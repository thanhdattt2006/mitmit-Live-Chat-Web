import React, { useState } from 'react';
import { X, Camera } from 'lucide-react';
import useStore from '../../store/useStore';

export default function ProfileModal({ isOpen, onClose }) {
  const { userInfo, setUserInfo } = useStore();
  const [formData, setFormData] = useState({
    name: userInfo?.name || '',
    age: userInfo?.age || '',
    city: userInfo?.city || '',
    gender: userInfo?.gender || 'male',
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    setUserInfo(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-md bg-[#141414] rounded-3xl shadow-2xl border border-neutral-800 flex flex-col overflow-hidden animate-slide-up text-white">
        <div className="px-6 py-5 border-b border-neutral-800 flex justify-between items-center bg-neutral-900/50 backdrop-blur-sm">
          <h2 className="text-lg font-bold">Edit Profile</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-neutral-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              <img src={userInfo?.avatar || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&q=80'} alt="Avatar" className="w-24 h-24 rounded-full object-cover border-4 border-neutral-800" />
              <button className="absolute bottom-0 right-0 p-2 bg-neutral-800 border-2 border-[#141414] rounded-full hover:bg-neutral-700 transition-colors">
                <Camera className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1 block">Display Name</label>
              <input 
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-neutral-900 border border-transparent focus:border-neutral-700 rounded-xl px-4 py-3 text-sm outline-none transition-colors text-white placeholder-gray-500" 
                placeholder="Your name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1 block">Age</label>
                <input 
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  className="w-full bg-neutral-900 border border-transparent focus:border-neutral-700 rounded-xl px-4 py-3 text-sm outline-none transition-colors text-white" 
                  placeholder="e.g. 25"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1 block">Gender</label>
                <select 
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full bg-neutral-900 border border-transparent focus:border-neutral-700 rounded-xl px-4 py-3 text-sm outline-none transition-colors text-white appearance-none"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1 block">City</label>
              <input 
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full bg-neutral-900 border border-transparent focus:border-neutral-700 rounded-xl px-4 py-3 text-sm outline-none transition-colors text-white" 
                placeholder="Where are you from?"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 mt-8">
            <button 
              onClick={onClose}
              className="flex-1 py-3 rounded-xl font-bold bg-neutral-800 text-white hover:bg-neutral-700 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              className="flex-1 py-3 rounded-xl font-bold bg-gradient-to-r from-rose-500 to-orange-500 text-white hover:scale-105 active:scale-95 transition-all shadow-lg shadow-rose-500/30"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
