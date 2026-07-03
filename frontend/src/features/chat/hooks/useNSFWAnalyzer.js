import { useEffect, useRef } from 'react';
import axiosClient from '../../../api/axiosClient';

export function useNSFWAnalyzer(ref, remoteStream, callMode, isIdle, isMatching, remoteUserId) {
  const isMounted = useRef(true);
  const intervalRef = useRef(null);
  const strikeCount = useRef(0);

  useEffect(() => {
    isMounted.current = true;
    let model;

    const loadModelAndStartAnalysis = async () => {
      try {
        const nsfwjs = await import('nsfwjs');
        model = await nsfwjs.load();
        
        if (!isMounted.current) return;

        intervalRef.current = setInterval(async () => {
          if (callMode === 'video' && ref && ref.current && remoteStream && !isIdle && !isMatching && remoteUserId) {
            try {
              const predictions = await model.classify(ref.current);
              
              if (predictions && predictions.length > 0) {
              
              const pornProb = predictions.find(p => p.className === 'Porn')?.probability || 0;
              const hentaiProb = predictions.find(p => p.className === 'Hentai')?.probability || 0;
              
              // Nâng mức tin cậy lên 88% và áp dụng cơ chế "2 Strikes"
              if (pornProb > 0.88 || hentaiProb > 0.88) {
                strikeCount.current += 1;
                console.warn(`NSFW Warning: Strike ${strikeCount.current} (P: ${(pornProb * 100).toFixed(1)}%, H: ${(hentaiProb * 100).toFixed(1)}%)`);

                if (strikeCount.current >= 2) {
                  console.error("NSFW Content confirmed. Auto-reporting...");
                  
                  let base64Image = "";
                  if (ref && ref.current) {
                    try {
                      const canvas = document.createElement('canvas');
                      canvas.width = ref.current.videoWidth || 640;
                      canvas.height = ref.current.videoHeight || 480;
                      const ctx = canvas.getContext('2d');
                      ctx.drawImage(ref.current, 0, 0, canvas.width, canvas.height);
                      base64Image = canvas.toDataURL('image/jpeg', 0.5);
                    } catch (e) {
                      console.error("Failed to capture evidence", e);
                    }
                  }

                  await axiosClient.post('/api/v1/reports/nsfw', {
                    reportedId: remoteUserId,
                    evidenceImage: base64Image || "NO_EVIDENCE"
                  });

                  strikeCount.current = 0; // Reset sau khi ban
                }
              } else {
                // Nếu khung hình an toàn, reset strike ngay lập tức để tránh cộng dồn do lỗi nhỏ
                if (strikeCount.current > 0) {
                  strikeCount.current = 0;
                }
              }
            }
          } catch (err) {
            console.error("Classify error", err);
          }
          }
        }, 3000); // Giảm chu kỳ check xuống 3s (2 strikes = 6s liên tục để bị ban)
      } catch (err) {
        console.error("Failed to load NSFW model", err);
      }
    };

    if (callMode === 'video' && !isIdle && !isMatching && remoteStream) {
      loadModelAndStartAnalysis();
    }

    return () => {
      isMounted.current = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [callMode, isIdle, isMatching, remoteStream, ref, remoteUserId]);
}
