import { useState, useRef, useEffect } from "react";
import { Mic, Square, Play, Pause, Trash2, Calendar, MoreVertical, X, Clock, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { format } from "date-fns";
import { toast } from "sonner";

// Type definition for a diary entry
interface DiaryEntry {
  id: string;
  audioUrl: string;
  createdAt: Date;
  duration: number; // in seconds
  title: string;
  mood?: "happy" | "neutral" | "sad" | "energetic";
}

export default function VoiceDiary() {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of list on new entry
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [entries.length]);

  // Start Recording
  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast.error("Your browser does not support audio recording");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        const newEntry: DiaryEntry = {
          id: crypto.randomUUID(),
          audioUrl,
          createdAt: new Date(),
          duration: recordingDuration,
          title: format(new Date(), "h:mm a"),
          mood: "neutral", 
        };

        setEntries((prev) => [newEntry, ...prev]);
        setRecordingDuration(0);
        toast.success("Voice memory captured");
        
        // Stop all tracks to fully release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      setRecordingDuration(0);
      timerRef.current = window.setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);

    } catch (error: any) {
      console.error("Error accessing microphone:", error);
      if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
        toast.error("Permission denied. Please allow microphone access in your browser address bar.");
      } else if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") {
        toast.error("No microphone found on this device.");
      } else {
        toast.error("Could not access microphone: " + (error.message || "Unknown error"));
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const playAudio = (entry: DiaryEntry) => {
    if (audioRef.current) {
      if (playingId === entry.id) {
        audioRef.current.pause();
        setPlayingId(null);
        return;
      }
      audioRef.current.pause();
    }

    const audio = new Audio(entry.audioUrl);
    audioRef.current = audio;
    setPlayingId(entry.id);
    
    audio.play();
    audio.onended = () => setPlayingId(null);
  };

  const deleteEntry = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEntries((prev) => prev.filter((e) => e.id !== id));
    if (playingId === id) {
      audioRef.current?.pause();
      setPlayingId(null);
    }
    toast.info("Memory discarded");
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="w-full h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden flex flex-col md:flex-row shadow-2xl rounded-none md:rounded-3xl md:h-[850px] md:w-[400px] md:mx-auto md:my-10 border border-slate-200 relative">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-indigo-50 to-transparent pointer-events-none" />
      
      {/* Header */}
      <header className="px-6 pt-10 pb-4 z-10 flex justify-between items-end bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0">
        <div>
          <p className="text-indigo-600 font-bold tracking-wide text-xs uppercase mb-1">My Journal</p>
          <h1 className="text-3xl font-serif text-slate-900">
            {format(new Date(), "eeee")}
          </h1>
          <p className="text-slate-500">{format(new Date(), "MMMM do, yyyy")}</p>
        </div>
        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
          JD
        </div>
      </header>

      {/* Main Content - List */}
      <main 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-5 pb-32 space-y-4 scroll-smooth"
      >
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6 opacity-60 mt-20">
            <div className="w-32 h-32 rounded-full bg-slate-100 flex items-center justify-center relative">
              <div className="absolute inset-0 border-4 border-slate-200 rounded-full animate-pulse opacity-50"></div>
              <Mic className="w-10 h-10 text-slate-400" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-slate-700">Empty Journal</h3>
              <p className="text-sm text-slate-500 max-w-[200px] mx-auto mt-2">
                Tap the microphone to record your thoughts for today.
              </p>
            </div>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {entries.map((entry) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={() => playAudio(entry)}
                className={`group relative p-4 rounded-2xl border transition-all cursor-pointer overflow-hidden ${
                  playingId === entry.id 
                    ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200" 
                    : "bg-white border-slate-100 text-slate-800 hover:border-indigo-200 hover:shadow-md"
                }`}
              >
                {/* Playing Waveform Animation Overlay */}
                {playingId === entry.id && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none overflow-hidden">
                    <div className="flex items-end gap-1 h-full w-full justify-center">
                      {[...Array(20)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="w-2 bg-white rounded-full"
                          animate={{ height: ["20%", "80%", "30%"] }}
                          transition={{
                            repeat: Infinity,
                            duration: 0.5 + Math.random() * 0.5,
                            delay: i * 0.05,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div className="relative z-10 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                       playingId === entry.id ? "bg-white/20 text-white" : "bg-indigo-50 text-indigo-600"
                    }`}>
                      {playingId === entry.id ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                    </div>
                    <div>
                      <h3 className={`font-semibold text-sm ${playingId === entry.id ? "text-white" : "text-slate-900"}`}>
                        {entry.title}
                      </h3>
                      <p className={`text-xs flex items-center gap-1 mt-0.5 ${playingId === entry.id ? "text-indigo-100" : "text-slate-500"}`}>
                        <Clock className="w-3 h-3" />
                        {formatDuration(entry.duration)}
                      </p>
                    </div>
                  </div>
                  
                  <button 
                    onClick={(e) => deleteEntry(entry.id, e)}
                    className={`p-2 rounded-full transition-colors ${
                      playingId === entry.id 
                        ? "text-indigo-200 hover:bg-white/10 hover:text-white" 
                        : "text-slate-300 hover:bg-red-50 hover:text-red-500"
                    }`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </main>

      {/* Recording Interface */}
      <div className="absolute bottom-0 left-0 right-0 p-6 z-20 pointer-events-none">
        <div className="pointer-events-auto flex flex-col items-center">
          <AnimatePresence mode="wait">
            {isRecording ? (
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                className="w-full bg-white/90 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/50 mb-2"
              >
                <div className="flex flex-col items-center gap-6">
                  <div className="text-center">
                    <h3 className="text-indigo-900 font-semibold mb-1">Recording...</h3>
                    <div className="font-mono text-2xl text-indigo-600 font-bold tracking-wider">
                      {formatDuration(recordingDuration)}
                    </div>
                  </div>
                  
                  {/* Active Visualizer */}
                  <div className="h-16 flex items-center justify-center gap-1 w-full max-w-[200px]">
                     {[...Array(7)].map((_, i) => (
                       <motion.div
                         key={i}
                         className="w-2 bg-gradient-to-t from-indigo-400 to-indigo-600 rounded-full"
                         animate={{ height: [10, 40 + Math.random() * 30, 10] }}
                         transition={{
                           repeat: Infinity,
                           duration: 0.4,
                           ease: "easeInOut",
                           delay: i * 0.1
                         }}
                       />
                     ))}
                  </div>

                  <div className="flex w-full gap-3">
                    <button 
                      onClick={stopRecording}
                      className="flex-1 bg-slate-900 text-white py-4 rounded-xl font-medium hover:bg-black transition-colors flex items-center justify-center gap-2 shadow-lg"
                    >
                      <Square className="w-4 h-4 fill-current" />
                      Stop & Save
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.button
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startRecording}
                className="h-16 w-16 bg-indigo-600 text-white rounded-full shadow-xl shadow-indigo-300 flex items-center justify-center mb-4 hover:bg-indigo-700 transition-colors"
              >
                <Mic className="w-7 h-7" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
