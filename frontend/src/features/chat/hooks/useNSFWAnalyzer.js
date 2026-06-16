import { useEffect } from 'react';
import axiosClient from '../../../api/axiosClient';

export function useNSFWAnalyzer(ref, remoteStream, callMode, isIdle, isMatching, remoteUserId) {
  useEffect(() => {
    let intervalId;
    let model;

    const loadModelAndStartAnalysis = async () => {
      try {
        const nsfwjs = await import('nsfwjs');
        model = await nsfwjs.load();
        
        intervalId = setInterval(async () => {
          if (callMode === 'video' && ref && ref.current && remoteStream && !isIdle && !isMatching && remoteUserId) {
            try {
              const predictions = await model.classify(ref.current);
              console.log("NSFW Probabilities:", predictions);
              
              const pornProb = predictions.find(p => p.className === 'Porn')?.probability || 0;
              const hentaiProb = predictions.find(p => p.className === 'Hentai')?.probability || 0;
              
              if (pornProb > 0.85 || hentaiProb > 0.85) {
                console.error("NSFW Content detected. Auto-reporting...");
                await axiosClient.post('/api/v1/reports/nsfw', {
                  reportedId: remoteUserId
                });
              }
            } catch (err) {
              // Ignore classify errors
            }
          }
        }, 5000);
      } catch (err) {
        console.error("Failed to load NSFW model", err);
      }
    };

    if (callMode === 'video' && !isIdle && !isMatching && remoteStream) {
      loadModelAndStartAnalysis();
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [callMode, isIdle, isMatching, remoteStream, ref, remoteUserId]);
}
