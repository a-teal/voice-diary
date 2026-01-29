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

interface UseVoiceRecorderReturn {
  status: RecordingStatus;
  transcript: string;
  isSupported: boolean;
  error: string | null;
  startRecording: () => void;
  stopRecording: () => void;
  resetRecording: () => void;
}

export function useVoiceRecorder(): UseVoiceRecorderReturn {
  const [status, setStatus] = useState<RecordingStatus>('idle');
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNative, setIsNative] = useState(false);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const finalTranscriptRef = useRef('');
  const statusRef = useRef<RecordingStatus>('idle');

  // Keep statusRef in sync
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

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
      setError('이 브라우저는 음성 인식을 지원하지 않습니다.');
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = 'ko-KR';
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
        setError('마이크 접근 권한이 필요합니다.');
      } else if (event.error === 'no-speech') {
        setError('음성이 감지되지 않았습니다.');
      } else {
        setError('음성 인식 중 오류가 발생했습니다.');
      }
      setStatus('error');
    };

    recognition.onend = () => {
      if (statusRef.current === 'recording') {
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
  }, [isNative]);

  // Native (Capacitor) speech recognition
  const startNativeRecording = useCallback(async () => {
    setError(null);
    setTranscript('');
    setStatus('recording');

    try {
      // Request permission
      const permissionStatus = await SpeechRecognition.requestPermissions();
      if (permissionStatus.speechRecognition !== 'granted') {
        setError('마이크 접근 권한이 필요합니다.');
        setStatus('error');
        return;
      }

      // Check availability
      const available = await SpeechRecognition.available();
      if (!available.available) {
        setError('이 기기에서 음성 인식을 지원하지 않습니다.');
        setStatus('error');
        return;
      }

      // Add listener for partial results
      await SpeechRecognition.addListener('partialResults', (data) => {
        if (data.matches && data.matches.length > 0) {
          setTranscript(data.matches[0]);
        }
      });

      // Start listening
      await SpeechRecognition.start({
        language: 'ko-KR',
        partialResults: true,
        popup: false,
      });
    } catch (err) {
      console.error('Native speech recognition error:', err);
      setError('음성 인식을 시작할 수 없습니다.');
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

    setError(null);
    finalTranscriptRef.current = '';
    setTranscript('');
    setStatus('recording');

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      recognitionRef.current.start();
    } catch (err) {
      console.error('Microphone error:', err);
      setError('마이크 접근 권한이 필요합니다.');
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
    setError(null);
    finalTranscriptRef.current = '';
  }, [isNative]);

  return {
    status,
    transcript,
    isSupported,
    error,
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
