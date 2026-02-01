'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Square, X, Loader2, Check } from 'lucide-react';
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder';
import { AnalysisResult, DiaryEntry } from '@/types';
import { saveEntry, generateId } from '@/lib/storage';

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
    error,
    startRecording,
    stopRecording,
    resetRecording,
  } = useVoiceRecorder();

  const [state, setState] = useState<RecordingState>('idle');
  const [recordingTime, setRecordingTime] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const hasStartedRef = useRef(false);

  // Auto-start recording when modal opens
  useEffect(() => {
    if (isOpen && isSupported && !hasStartedRef.current) {
      hasStartedRef.current = true;
      resetRecording();
      setRecordingTime(0);
      setAnalysisResult(null);
      // Small delay to ensure modal is visible
      const timer = setTimeout(() => {
        startRecording();
        setState('recording');
      }, 300);
      return () => clearTimeout(timer);
    }
    if (!isOpen) {
      hasStartedRef.current = false;
    }
  }, [isOpen, isSupported, resetRecording, startRecording]);

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
    // Use local timezone for date (YYYY-MM-DD)
    const localDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    const entry: DiaryEntry = {
      id: generateId(),
      date: localDate,
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
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black z-[60]"
          />

          {/* Center Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[400px] md:max-h-[600px] bg-white rounded-3xl z-[70] p-6 flex flex-col overflow-hidden"
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors z-10"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>

            {/* Browser not supported */}
            {!isSupported && (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <p className="text-red-500">{error}</p>
                <p className="text-slate-500 text-sm mt-2">
                  Chrome, Safari, Edge 브라우저를 사용해주세요
                </p>
              </div>
            )}

            {/* Content */}
            {isSupported && (
              <div className="flex-1 flex flex-col">
                {/* Recording State */}
                {state === 'recording' && (
                  <div className="flex-1 flex flex-col">
                    {/* Header with timer */}
                    <div className="flex items-center justify-center gap-3 py-4">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 1 }}
                        className="w-3 h-3 bg-red-500 rounded-full"
                      />
                      <span className="font-mono text-2xl font-bold text-slate-800">
                        {formatDuration(recordingTime)}
                      </span>
                    </div>

                    {/* Live transcript area */}
                    <div className="flex-1 bg-slate-50 rounded-2xl p-4 overflow-y-auto min-h-[200px]">
                      {transcript ? (
                        <p className="text-slate-700 text-base leading-relaxed">{transcript}</p>
                      ) : (
                        <p className="text-slate-400 text-sm animate-pulse">천천히 말해도 돼요...</p>
                      )}
                    </div>

                    {/* Stop button */}
                    <button
                      onClick={handleStopRecording}
                      className="mt-6 w-full bg-slate-900 text-white py-4 rounded-xl font-semibold shadow-lg hover:bg-black active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      <Square className="w-5 h-5 fill-current" />
                      여기까지 할게요
                    </button>
                  </div>
                )}

                {/* Analyzing State */}
                {state === 'analyzing' && (
                  <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                    <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
                    <p className="text-indigo-600 font-medium animate-pulse">
                      정리하고 있어요...
                    </p>
                  </div>
                )}

                {/* Done State */}
                {state === 'done' && (
                  <div className="flex-1 flex flex-col">
                    <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center"
                      >
                        <Check className="w-8 h-8 text-green-600" />
                      </motion.div>
                      <div className="text-center">
                        <h4 className="text-xl font-bold text-slate-800">잘 남겨뒀어요!</h4>
                        <p className="text-slate-500 text-sm mt-1">
                          {formatDuration(recordingTime)} 동안 이야기했어요
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleSave}
                      className="w-full bg-indigo-600 text-white py-4 rounded-xl font-semibold shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all"
                    >
                      저장하기
                    </button>
                  </div>
                )}

                {/* Idle State (shouldn't normally show since auto-start) */}
                {state === 'idle' && (
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                    <p className="text-slate-500 mt-2">준비 중...</p>
                  </div>
                )}
              </div>
            )}

            {/* Error message */}
            {error && state !== 'idle' && (
              <p className="text-red-500 text-sm text-center mt-4">{error}</p>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
