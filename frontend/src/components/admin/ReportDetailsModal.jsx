import React, { useEffect, useState } from 'react';
import { X, ShieldAlert, Ban, EyeOff } from 'lucide-react';
import axiosClient from '../../api/axiosClient';

export default function ReportDetailsModal({ isOpen, onClose, report, handleAction, t }) {
  const [evidenceData, setEvidenceData] = useState(null);
  const [isLoadingEvidence, setIsLoadingEvidence] = useState(false);

  useEffect(() => {
    if (isOpen && report?.reason === 'NSFW' && report?.description?.includes('MongoDB')) {
      const match = report.description.match(/ID bằng chứng MongoDB:\s*([a-zA-Z0-9]+)/);
      if (match && match[1]) {
        fetchEvidence(match[1]);
      }
    } else {
      setEvidenceData(null);
    }
  }, [isOpen, report]);

  const fetchEvidence = async (evidenceId) => {
    try {
      setIsLoadingEvidence(true);
      const res = await axiosClient.get(`/api/v1/reports/evidence/${evidenceId}`);
      if (res.data?.evidenceData) {
        setEvidenceData(res.data.evidenceData);
      }
    } catch (err) {
      console.error('Failed to load evidence', err);
    } finally {
      setIsLoadingEvidence(false);
    }
  };

  if (!isOpen || !report) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-neutral-900 rounded-3xl shadow-2xl border border-white/10 flex flex-col overflow-hidden animate-slide-up text-white max-h-[90vh]">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-neutral-800 z-10">
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 border-b border-white/10 bg-white/5 flex items-center gap-3">
          <ShieldAlert className="w-6 h-6 text-rose-500" />
          <h2 className="text-xl font-bold">{t.REPORT_DETAILS}{report.id}</h2>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
              <p className="text-sm text-gray-400 mb-1">{t.REPORTED_USER}</p>
              <div className="flex items-center gap-3">
                <img src={report.avatarUrl || 'https://via.placeholder.com/150'} className="w-8 h-8 rounded-full" alt="" />
                <p className="font-semibold">{report.reportedUser}</p>
              </div>
            </div>
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
              <p className="text-sm text-gray-400 mb-1">{t.REPORTER}</p>
              <p className="font-semibold">{report.reporter}</p>
            </div>
          </div>

          <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-400 mb-2">{t.REASON}</p>
              <span className="px-3 py-1.5 rounded-lg text-sm font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                {report.reason}
              </span>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400 mb-2">{t.DATE_SENT}</p>
              <p className="text-sm">{new Date(report.createdAt).toLocaleString('vi-VN')}</p>
            </div>
          </div>

          <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
            <p className="text-sm text-gray-400 mb-2">{t.DESCRIPTION}</p>
            <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{report.description || t.NO_DESCRIPTION}</p>
          </div>

          {report.reason === 'NSFW' && (
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
              <p className="text-sm text-gray-400 mb-3 flex items-center gap-2"><EyeOff className="w-4 h-4" /> {t.EVIDENCE_IMAGE}</p>
              {isLoadingEvidence ? (
                <div className="h-48 flex items-center justify-center bg-black/50 rounded-xl border border-dashed border-white/20">
                  <span className="text-gray-500 animate-pulse">{t.LOADING_EVIDENCE}</span>
                </div>
              ) : evidenceData ? (
                <img src={evidenceData} className="w-full max-h-[500px] object-contain rounded-xl border border-white/10 bg-black" alt="NSFW Evidence" />
              ) : (
                <div className="h-48 flex items-center justify-center bg-black/50 rounded-xl border border-dashed border-white/20">
                  <span className="text-gray-500">{t.NO_EVIDENCE}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {report.status === 'PENDING' && (
          <div className="p-4 border-t border-white/10 bg-white/5 flex gap-3 justify-end">
            <button 
              onClick={() => handleAction('ignore', report.id)}
              className="px-6 py-2.5 rounded-xl font-semibold bg-neutral-800 hover:bg-neutral-700 transition-colors"
            >
              {t.IGNORE}
            </button>
            <button 
              onClick={() => handleAction('ban', { reportId: report.id, reportedId: report.reportedId })}
              className="px-6 py-2.5 rounded-xl font-bold bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-500/20 transition-all flex items-center gap-2"
            >
              <Ban className="w-4 h-4" /> {t.BAN_USER}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
