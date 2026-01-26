import { useState, useRef, useEffect } from "react";
import { Mic, Square, X, Loader2, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { DiaryEntry, MOODS, MOCK_KEYWORDS, Mood } from "@/app/types";

interface RecordingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: Omit<DiaryEntry, 'id'>) => void;
}

type RecordingState = 'idle' | 'recording' | 'analyzing' | 'done';

export function RecordingModal({ isOpen, onClose, onSave }: RecordingModalProps) {
  const [state, setState] = useState<RecordingState>('idle');
  const [duration, setDuration] = useState(0);
  const [liveText, setLiveText] = useState("");
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const audioUrlRef = useRef<string | null>(null);

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setState('idle');
      setDuration(0);
      setLiveText("");
      audioUrlRef.current = null;
    }
  }, [isOpen]);

  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
         toast.error("Audio recording not supported");
         return;
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        audioUrlRef.current = URL.createObjectURL(audioBlob);
        stream.getTracks().forEach(track => track.stop());
        
        // Start "Analysis"
        setState('analyzing');
        analyzeRecording();
      };

      mediaRecorder.start();
      setState('recording');
      
      // Mock live transcription
      simulateLiveText();

      timerRef.current = window.setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error(error);
      toast.error("Could not access microphone");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && state === 'recording') {
      mediaRecorderRef.current.stop();
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const simulateLiveText = () => {
    const phrases = ["Today was...", " a really interesting day.", " I went to...", " the park with friends.", " We had coffee..."];
    let i = 0;
    const interval = setInterval(() => {
      if (state === 'recording' || i >= phrases.length) {
        clearInterval(interval);
        return;
      }
      // Only update if still recording (checked inside effect in real app, but here simple timeout)
      // Actually state ref is tricky in intervals, but for mock this is fine
      setLiveText(prev => prev + phrases[i % phrases.length]);
      i++;
    }, 2000);
  };

  const analyzeRecording = () => {
    setTimeout(() => {
      setState('done');
    }, 2000); // 2 seconds analysis
  };

  const handleSave = () => {
    if (!audioUrlRef.current) return;

    // Generate Random Analysis Data
    const moods = Object.keys(MOODS) as Mood[];
    const randomMood = moods[Math.floor(Math.random() * moods.length)];
    const randomKeywords = Array.from({ length: 3 }, () => MOCK_KEYWORDS[Math.floor(Math.random() * MOCK_KEYWORDS.length)]);

    onSave({
      audioUrl: audioUrlRef.current,
      createdAt: new Date().toISOString(),
      duration: duration,
      text: "Today was a really interesting day. I went to the park with friends. We had coffee and talked about our future plans. It felt really good to catch up.", // Mock final text
      mood: randomMood,
      keywords: Array.from(new Set(randomKeywords)), // Unique
    });
    
    onClose();
  };

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 0.5 }} 
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-[60]"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-[70] p-6 pb-10 min-h-[400px] flex flex-col md:max-w-[400px] md:mx-auto md:relative md:rounded-3xl md:h-[600px] md:bottom-auto md:top-auto"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-lg font-semibold text-slate-900">Today's Entry</h3>
              <button onClick={onClose} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col items-center justify-center space-y-8">
              
              {state === 'idle' && (
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto">
                    <Mic className="w-8 h-8 text-indigo-500" />
                  </div>
                  <p className="text-slate-500">Tap to start recording</p>
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
                      <Mic className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  
                  <div className="font-mono text-3xl font-bold text-slate-800">
                    {formatDuration(duration)}
                  </div>

                  <p className="text-slate-400 text-sm animate-pulse">
                    Listening...
                  </p>
                </div>
              )}

              {state === 'analyzing' && (
                <div className="text-center space-y-4">
                  <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                    <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                  </div>
                  <p className="text-indigo-600 font-medium animate-pulse">AI is analyzing your mood...</p>
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
                    <h4 className="text-xl font-bold text-slate-800">Ready to save!</h4>
                    <p className="text-slate-500 text-sm mt-1">Duration: {formatDuration(duration)}</p>
                  </div>
                </div>
              )}

            </div>

            {/* Actions */}
            <div className="mt-auto pt-6">
              {state === 'idle' && (
                <button 
                  onClick={startRecording}
                  className="w-full bg-indigo-600 text-white py-4 rounded-xl font-semibold shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all"
                >
                  Start Recording
                </button>
              )}

              {state === 'recording' && (
                <button 
                  onClick={stopRecording}
                  className="w-full bg-slate-900 text-white py-4 rounded-xl font-semibold shadow-lg hover:bg-black active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Square className="w-5 h-5 fill-current" />
                  Stop Recording
                </button>
              )}

              {state === 'done' && (
                <button 
                  onClick={handleSave}
                  className="w-full bg-indigo-600 text-white py-4 rounded-xl font-semibold shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all"
                >
                  Save Entry
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
