import React, { useState, useEffect } from 'react';
import { X, Settings, Camera, Mic, Bell } from 'lucide-react';
import useStore from '../../store/useStore';
import { translations } from '../../utils/translation';

export default function SettingsModal({ isOpen, onClose }) {
  const { 
    lang,
    cameras, microphones,
    selectedCameraId, selectedMicId,
    setSelectedCameraId, setSelectedMicId,
    fetchDevices,
    localStream, setLocalStream, callMode
  } = useStore();
  
  const t = translations[lang];

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchDevices();
    }
  }, [isOpen, fetchDevices]);

  const handleDeviceChange = async (type, deviceId) => {
    if (type === 'video') {
      setSelectedCameraId(deviceId);
    } else {
      setSelectedMicId(deviceId);
    }

    // Lập tức khởi động lại luồng media để update preview nếu đang có stream
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      
      const newVideoId = type === 'video' ? deviceId : selectedCameraId;
      const newAudioId = type === 'audio' ? deviceId : selectedMicId;

      const constraints = {
        video: callMode === 'video' 
          ? (newVideoId ? { deviceId: { exact: newVideoId } } : true)
          : false,
        audio: newAudioId ? { deviceId: { exact: newAudioId } } : true
      };

      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        setLocalStream(stream);
      } catch (err) {
        console.warn("Lỗi khi chuyển đổi thiết bị:", err);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-md bg-[#141414] rounded-3xl shadow-2xl border border-neutral-800 flex flex-col overflow-hidden animate-slide-up text-white">
        <div className="px-6 py-5 border-b border-neutral-800 flex justify-between items-center bg-neutral-900/50 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-gray-400" />
            <h2 className="text-lg font-bold">{t.SETTINGS}</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-all active:scale-95 p-1 rounded-full hover:bg-neutral-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          
          <div className="space-y-2">
            <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider flex items-center gap-2">
              <Camera className="w-4 h-4" /> {t.CAMERA_INPUT}
            </label>
            <select 
              className="w-full bg-neutral-900 border border-transparent focus:border-neutral-700 rounded-xl px-4 py-3 text-sm outline-none transition-colors text-white appearance-none"
              value={selectedCameraId || ''}
              onChange={(e) => handleDeviceChange('video', e.target.value)}
            >
              <option value="" disabled>{cameras.length === 0 ? t.DEFAULT_CAM : 'Select a camera'}</option>
              {cameras.map(cam => (
                <option key={cam.deviceId} value={cam.deviceId}>
                  {cam.label || `Camera ${cam.deviceId.substring(0,5)}`}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider flex items-center gap-2">
              <Mic className="w-4 h-4" /> {t.MIC_INPUT}
            </label>
            <select 
              className="w-full bg-neutral-900 border border-transparent focus:border-neutral-700 rounded-xl px-4 py-3 text-sm outline-none transition-colors text-white appearance-none"
              value={selectedMicId || ''}
              onChange={(e) => handleDeviceChange('audio', e.target.value)}
            >
              <option value="" disabled>{microphones.length === 0 ? t.DEFAULT_MIC : 'Select a microphone'}</option>
              {microphones.map(mic => (
                <option key={mic.deviceId} value={mic.deviceId}>
                  {mic.label || `Microphone ${mic.deviceId.substring(0,5)}`}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between bg-neutral-900 p-4 rounded-xl border border-neutral-800">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-gray-400" />
              <span className="text-sm font-medium">{t.ALLOW_NOTIFICATIONS}</span>
            </div>
            <button 
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className={`w-12 h-6 rounded-full transition-colors relative flex items-center ${notificationsEnabled ? 'bg-green-500' : 'bg-neutral-700'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow-sm absolute transition-transform ${notificationsEnabled ? 'translate-x-6' : 'translate-x-1'}`}></div>
            </button>
          </div>

        </div>

        <div className="px-6 pb-6 pt-2">
          <p className="text-center text-[10px] text-gray-500 font-medium tracking-wide opacity-50 hover:opacity-100 transition-opacity">
            mitmit v1.0 • Made with ❤️ by Dave
          </p>
        </div>
      </div>
    </div>
  );
}
