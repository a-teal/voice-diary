'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { RecordingStatus } from '@/types';
import { Capacitor } from '@capacitor/core';
import { SpeechRecognition } from '@capacitor-community/speech-recognition';

// Web Speech API types
interface WebSpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: WebSpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

// Error keys for i18n
export type VoiceRecorderErrorKey =
  | 'errors.browserNotSupported'
  | 'errors.micPermission'
  | 'errors.noSpeech'
  | 'errors.recognitionError'
  | 'errors.deviceNotSupported'
  | 'errors.cannotStart';

interface UseVoiceRecorderReturn {
  status: RecordingStatus;
  transcript: string;
  isSupported: boolean;
  errorKey: VoiceRecorderErrorKey | null;
  startRecording: () => void;
  stopRecording: () => void;
  resetRecording: () => void;
}

export function useVoiceRecorder(): UseVoiceRecorderReturn {
  const [status, setStatus] = useState<RecordingStatus>('idle');
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const [errorKey, setErrorKey] = useState<VoiceRecorderErrorKey | null>(null);
  const [isNative, setIsNative] = useState(false);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const finalTranscriptRef = useRef('');

  // Check platform
  useEffect(() => {
    const platform = Capacitor.getPlatform();
    setIsNative(platform === 'ios' || platform === 'android');
  }, []);

  // Web Speech API setup
  useEffect(() => {
    if (isNative) return;

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setIsSupported(false);
      setErrorKey('errors.browserNotSupported');
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    // Use browser's language for speech recognition
    const browserLang = typeof navigator !== 'undefined' ? navigator.language : 'en-US';
    recognition.lang = browserLang;
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: WebSpeechRecognitionEvent) => {
      let interimTranscript = '';
      let finalTranscript = finalTranscriptRef.current;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript + ' ';
          finalTranscriptRef.current = finalTranscript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      setTranscript((finalTranscript + interimTranscript).trim());
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        setErrorKey('errors.micPermission');
      } else if (event.error === 'no-speech') {
        setErrorKey('errors.noSpeech');
      } else {
        setErrorKey('errors.recognitionError');
      }
      setStatus('error');
    };

    recognition.onend = () => {
      if (status === 'recording') {
        try {
          recognition.start();
        } catch {
          // Ignore if already started
        }
      }
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
    };
  }, [status, isNative]);

  // Native (Capacitor) speech recognition
  const startNativeRecording = useCallback(async () => {
    setErrorKey(null);
    setTranscript('');
    setStatus('recording');

    try {
      // Request permission
      const permissionStatus = await SpeechRecognition.requestPermissions();
      if (permissionStatus.speechRecognition !== 'granted') {
        setErrorKey('errors.micPermission');
        setStatus('error');
        return;
      }

      // Check availability
      const available = await SpeechRecognition.available();
      if (!available.available) {
        setErrorKey('errors.deviceNotSupported');
        setStatus('error');
        return;
      }

      // Add listener for partial results
      await SpeechRecognition.addListener('partialResults', (data) => {
        if (data.matches && data.matches.length > 0) {
          setTranscript(data.matches[0]);
        }
      });

      // Use browser's language for speech recognition
      const browserLang = typeof navigator !== 'undefined' ? navigator.language : 'en-US';

      // Start listening
      await SpeechRecognition.start({
        language: browserLang,
        partialResults: true,
        popup: false,
      });
    } catch (err) {
      console.error('Native speech recognition error:', err);
      setErrorKey('errors.cannotStart');
      setStatus('error');
    }
  }, []);

  const stopNativeRecording = useCallback(async () => {
    try {
      await SpeechRecognition.stop();
      await SpeechRecognition.removeAllListeners();
    } catch (err) {
      console.error('Stop error:', err);
    }
    setStatus('idle');
  }, []);

  // Web speech recognition
  const startWebRecording = useCallback(async () => {
    if (!recognitionRef.current) return;

    setErrorKey(null);
    finalTranscriptRef.current = '';
    setTranscript('');
    setStatus('recording');

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      recognitionRef.current.start();
    } catch (err) {
      console.error('Microphone error:', err);
      setErrorKey('errors.micPermission');
      setStatus('error');
    }
  }, []);

  const stopWebRecording = useCallback(() => {
    if (!recognitionRef.current) return;
    recognitionRef.current.stop();
    setStatus('idle');
  }, []);

  // Unified interface
  const startRecording = useCallback(() => {
    if (isNative) {
      startNativeRecording();
    } else {
      startWebRecording();
    }
  }, [isNative, startNativeRecording, startWebRecording]);

  const stopRecording = useCallback(() => {
    if (isNative) {
      stopNativeRecording();
    } else {
      stopWebRecording();
    }
  }, [isNative, stopNativeRecording, stopWebRecording]);

  const resetRecording = useCallback(async () => {
    if (isNative) {
      try {
        await SpeechRecognition.stop();
        await SpeechRecognition.removeAllListeners();
      } catch {
        // Ignore
      }
    } else if (recognitionRef.current) {
      recognitionRef.current.abort();
    }
    setStatus('idle');
    setTranscript('');
    setErrorKey(null);
    finalTranscriptRef.current = '';
  }, [isNative]);

  return {
    status,
    transcript,
    isSupported,
    errorKey,
    startRecording,
    stopRecording,
    resetRecording,
  };
}

// Type declarations for Web Speech API
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    SpeechRecognition: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    webkitSpeechRecognition: any;
  }
}
