import React, { useRef } from 'react';
import { Loader2 } from 'lucide-react';
import ReportModal from '../../components/common/ReportModal';
import VideoChatControls from './VideoChatControls';
import LocalStreamPreview from './LocalStreamPreview';
import RemoteStreamVideo from './RemoteStreamVideo';
import TimerCountdownOverlay from './TimerCountdownOverlay';
import { useVideoChat } from './hooks/useVideoChat';

export default function VideoChat() {
  const {
    isMicOn, setIsMicOn,
    isCamOn, setIsCamOn,
    timeLeft,
    isLikedByMe, showPremiumMatch,
    showReportModal, setShowReportModal,
    isIdle, displayStrangerImg,
    handleStartNext, handleStop, handleHeartClick,
    lang, isMatching, callMode, isMatched, remoteUserId, userInfo, t
  } = useVideoChat();

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  return (
    <section className="flex-1 relative lg:rounded-3xl overflow-hidden bg-black lg:bg-neutral-900 lg:border border-neutral-800 lg:shadow-sm flex items-center justify-center h-full min-w-0">
      <RemoteStreamVideo ref={remoteVideoRef} />
      
      {/* Loading Overlay */}
      <div className={`absolute inset-0 bg-neutral-900/80 backdrop-blur-md flex flex-col items-center justify-center transition-opacity duration-300 text-white z-20 p-4 ${isMatching ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <Loader2 className="animate-spin w-10 h-10 mb-3 text-white shrink-0" />
        <p className="font-medium tracking-wide animate-pulse text-center">{t.FINDING_SOMEONE}</p>
      </div>

      {/* Premium Match Overlay */}
      {showPremiumMatch && (
        <div className="fixed inset-0 flex items-center justify-center flex-col p-6 z-[9999] bg-black/80 backdrop-blur-sm animate-fade-in">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-center px-4 leading-tight tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 mb-8">
            {t.MATCH_SUCCESS.toUpperCase()}
          </h1>
          <div className="flex items-center gap-4">
            <img src={userInfo?.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100&q=80"} alt="You" className="w-20 h-20 rounded-full object-cover border-4 border-blue-500 shadow-2xl relative z-10 animate-bounce" />
            <img src={displayStrangerImg} alt="Stranger" className="w-20 h-20 rounded-full object-cover border-4 border-emerald-500 shadow-2xl relative z-10 animate-bounce delay-150" />
          </div>
        </div>
      )}

      <LocalStreamPreview ref={localVideoRef} />
      <TimerCountdownOverlay timeLeft={timeLeft} />

      <VideoChatControls 
        isIdle={isIdle}
        isMatching={isMatching}
        callMode={callMode}
        isMicOn={isMicOn}
        isCamOn={isCamOn}
        setIsMicOn={setIsMicOn}
        setIsCamOn={setIsCamOn}
        setShowReportModal={setShowReportModal}
        handleHeartClick={handleHeartClick}
        isLikedByMe={isLikedByMe}
        isMatched={isMatched}
        handleStop={handleStop}
        handleStartNext={handleStartNext}
        lang={lang}
      />

      <ReportModal isOpen={showReportModal} onClose={() => setShowReportModal(false)} reportedUserId={remoteUserId} onReportSuccess={handleStartNext} />
    </section>
  );
}
