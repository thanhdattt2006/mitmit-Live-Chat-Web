export const createDeviceSlice = (set) => ({
  localStream: null,
  remoteStream: null,
  setLocalStream: (stream) => set({ localStream: stream }),

  cameras: [],
  microphones: [],
  selectedCameraId: null,
  selectedMicId: null,
  setSelectedCameraId: (id) => set({ selectedCameraId: id }),
  setSelectedMicId: (id) => set({ selectedMicId: id }),
  
  fetchDevices: async () => {
    try {
      const tempStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter(d => d.kind === 'videoinput');
      const microphones = devices.filter(d => d.kind === 'audioinput');
      
      set((state) => ({
        cameras,
        microphones,
        selectedCameraId: state.selectedCameraId || (cameras.length > 0 ? cameras[0].deviceId : null),
        selectedMicId: state.selectedMicId || (microphones.length > 0 ? microphones[0].deviceId : null)
      }));

      tempStream.getTracks().forEach(t => t.stop());
    } catch (error) {
      console.error("Lỗi lấy thiết bị Camera/Mic:", error);
    }
  },
});
