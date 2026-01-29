'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Square, X, Loader2, Check } from 'lucide-react';
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder';
import MicPencilIcon from '@/components/icons/MicPencilIcon';
import { AnalysisResult, DiaryEntry } from '@/types';
import { saveEntry, generateId, getLocalDateString } from '@/lib/storage';
import { useTranslation } from '@/lib/i18n';

interface RecordingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (entry: DiaryEntry) => void;
}

type RecordingState = 'idle' | 'recording' | 'analyzing' | 'done';

export default function RecordingModal({ isOpen, onClose, onSaved }: RecordingModalProps) {
  const {
    status,
    transcript,
    isSupported,
    errorKey,
    startRecording,
    stopRecording,
    resetRecording,
  } = useVoiceRecorder();
  const { t } = useTranslation();

  const [state, setState] = useState<RecordingState>('idle');
  const [recordingTime, setRecordingTime] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setState('idle');
      setRecordingTime(0);
      setAnalysisResult(null);
      resetRecording();
    }
  }, [isOpen, resetRecording]);

  // Recording timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (state === 'recording') {
      interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [state]);

  // Sync voice recorder status
  useEffect(() => {
    if (status === 'recording' && state !== 'recording') {
      setState('recording');
    }
  }, [status, state]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartRecording = () => {
    resetRecording();
    setRecordingTime(0);
    startRecording();
    setState('recording');
  };

  const handleStopRecording = async () => {
    stopRecording();

    if (!transcript.trim()) {
      setState('idle');
      return;
    }

    setState('analyzing');

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript }),
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const analysis: AnalysisResult = await response.json();
      setAnalysisResult(analysis);
      setState('done');
    } catch (err) {
      console.error('Analysis error:', err);
      // Fallback: save without analysis
      setAnalysisResult({
        keywords: [],
        emotion: 'neutral',
        summary: transcript.slice(0, 50),
      });
      setState('done');
    }
  };

  const handleSave = () => {
    if (!analysisResult) return;

    const now = new Date();
    const entry: DiaryEntry = {
      id: generateId(),
      date: getLocalDateString(now),
      createdAt: now.toISOString(),
      transcript,
      keywords: analysisResult.keywords,
      emotion: analysisResult.emotion,
      summary: analysisResult.summary,
    };

    saveEntry(entry);
    onSaved(entry);
    handleClose();
  };

  const handleClose = () => {
    resetRecording();
    setState('idle');
    setRecordingTime(0);
    setAnalysisResult(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black z-[60]"
          />

          {/* Modal */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-[70] p-6 pb-10 min-h-[400px] flex flex-col safe-bottom"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-lg font-semibold text-slate-900">{t('recorder.title')}</h3>
              <button
                onClick={handleClose}
                className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Browser not supported */}
            {!isSupported && (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <p className="text-red-500">{errorKey ? t(errorKey) : ''}</p>
                <p className="text-slate-500 text-sm mt-2">
                  {t('recorder.browserNotSupported')}
                </p>
              </div>
            )}

            {/* Content */}
            {isSupported && (
              <div className="flex-1 flex flex-col items-center justify-center space-y-8">
                {state === 'idle' && (
                  <div className="text-center space-y-4">
                    <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto">
                      <MicPencilIcon size={40} className="text-indigo-500" />
                    </div>
                    <p className="text-slate-500">{t('recorder.tapToStart')}</p>
                  </div>
                )}

                {state === 'recording' && (
                  <div className="text-center w-full space-y-6">
                    <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="absolute inset-0 bg-red-500 rounded-full"
                      />
                      <div className="relative bg-red-500 w-16 h-16 rounded-full flex items-center justify-center shadow-lg shadow-red-200">
                        <MicPencilIcon size={32} className="text-white" />
                      </div>
                    </div>

                    <div className="font-mono text-3xl font-bold text-slate-800">
                      {formatDuration(recordingTime)}
                    </div>

                    {/* Live transcript */}
                    {transcript && (
                      <div className="bg-slate-50 rounded-xl p-4 max-h-32 overflow-y-auto">
                        <p className="text-slate-600 text-sm">{transcript}</p>
                      </div>
                    )}

                    <p className="text-slate-400 text-sm animate-pulse">{t('recorder.listening')}</p>
                  </div>
                )}

                {state === 'analyzing' && (
                  <div className="text-center space-y-4">
                    <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                      <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                    </div>
                    <p className="text-indigo-600 font-medium animate-pulse">
                      {t('recorder.analyzing')}
                    </p>
                  </div>
                )}

                {state === 'done' && (
                  <div className="text-center space-y-6">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto"
                    >
                      <Check className="w-10 h-10 text-green-600" />
                    </motion.div>
                    <div>
                      <h4 className="text-xl font-bold text-slate-800">{t('recorder.ready')}</h4>
                      <p className="text-slate-500 text-sm mt-1">
                        {t('recorder.duration')}: {formatDuration(recordingTime)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            {isSupported && (
              <div className="mt-auto pt-6">
                {state === 'idle' && (
                  <button
                    onClick={handleStartRecording}
                    className="w-full bg-indigo-600 text-white py-4 rounded-xl font-semibold shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all"
                  >
                    {t('recorder.start')}
                  </button>
                )}

                {state === 'recording' && (
                  <button
                    onClick={handleStopRecording}
                    className="w-full bg-slate-900 text-white py-4 rounded-xl font-semibold shadow-lg hover:bg-black active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <Square className="w-5 h-5 fill-current" />
                    {t('recorder.stop')}
                  </button>
                )}

                {state === 'done' && (
                  <button
                    onClick={handleSave}
                    className="w-full bg-indigo-600 text-white py-4 rounded-xl font-semibold shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all"
                  >
                    {t('recorder.save')}
                  </button>
                )}
              </div>
            )}

            {/* Error message */}
            {errorKey && state !== 'idle' && (
              <p className="text-red-500 text-sm text-center mt-4">{t(errorKey)}</p>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
