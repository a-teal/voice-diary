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
  onstart: (() => void) | null;
  onaudiostart: (() => void) | null;
  onspeechstart: (() => void) | null;
  onspeechend: (() => void) | null;
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
  const processedResultsRef = useRef<number>(0); // 처리된 결과 수 추적
  const interimDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const lastInterimRef = useRef<string>(''); // 마지막 interim 결과 저장
  const segmentStartRef = useRef(0); // 현재 세그먼트 시작 위치 (재시작 후 새 세그먼트 추적용)

  // Keep statusRef in sync
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  // Check platform
  useEffect(() => {
    const platform = Capacitor.getPlatform();
    const native = platform === 'ios' || platform === 'android';
    setIsNative(native);
  }, []);

  // Web Speech API setup
  useEffect(() => {
    if (isNative) return;

    // HTTPS 체크 (localhost 제외)
    const isSecureContext = window.isSecureContext ||
      window.location.protocol === 'https:' ||
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1';

    if (!isSecureContext) {
      setIsSupported(false);
      setError('음성 인식은 HTTPS 연결이 필요합니다.');
      return;
    }

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setIsSupported(false);
      setError('이 브라우저는 음성 인식을 지원하지 않습니다. Chrome, Safari, Edge를 사용해주세요.');
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = 'ko-KR';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1; // 안드로이드 성능 향상

    recognition.onresult = (event: WebSpeechRecognitionEvent) => {
      console.log('[STT] onresult fired, resultIndex:', event.resultIndex, 'results.length:', event.results.length);

      let interimTranscript = '';
      let finalTranscript = finalTranscriptRef.current;
      let hasFinalResult = false;

      // 안드로이드 중복 방지: 이미 처리한 결과는 건너뛰기
      const startIndex = Math.max(event.resultIndex, processedResultsRef.current);
      console.log('[STT] Processing from index:', startIndex, 'processedResults:', processedResultsRef.current);

      for (let i = startIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0].transcript;
        console.log('[STT] Result', i, '- isFinal:', result.isFinal, 'text:', text);

        if (result.isFinal) {
          const trimmedText = text.trim();
          if (trimmedText) {
            // Get the base (text before current segment) and current segment
            const base = finalTranscript.slice(0, segmentStartRef.current);
            const currentSegment = finalTranscript.slice(segmentStartRef.current).trim();

            if (currentSegment === '') {
              // First result in this segment
              finalTranscript = base + trimmedText + ' ';
              finalTranscriptRef.current = finalTranscript;
              console.log('[STT] New segment started:', trimmedText);
            } else if (trimmedText.startsWith(currentSegment)) {
              // Simple extension of current segment
              finalTranscript = base + trimmedText + ' ';
              finalTranscriptRef.current = finalTranscript;
              console.log('[STT] Extended segment to:', trimmedText);
            } else {
              // Android sends cumulative results with possible corrections
              // Compare by words within current segment only
              const currentWords = currentSegment.split(/\s+/);
              const newWords = trimmedText.split(/\s+/);

              // Find common prefix length (words matching from start)
              let commonPrefix = 0;
              const minLen = Math.min(currentWords.length, newWords.length);
              for (let j = 0; j < minLen; j++) {
                if (currentWords[j] === newWords[j]) {
                  commonPrefix++;
                } else {
                  break;
                }
              }

              // If at least 1 word matches at start, treat as cumulative/correction within segment
              if (commonPrefix >= 1) {
                // Use the newer version (likely longer or corrected)
                finalTranscript = base + trimmedText + ' ';
                finalTranscriptRef.current = finalTranscript;
                console.log('[STT] Corrected segment to:', trimmedText, `(${commonPrefix}/${minLen} words matched)`);
              } else if (!currentSegment.includes(trimmedText)) {
                // Completely different - skip (shouldn't happen within same segment)
                console.log('[STT] Skipping unrelated within segment:', trimmedText);
              } else {
                console.log('[STT] Skipping contained:', trimmedText);
              }
            }
          }
          // 처리 완료된 결과 인덱스 업데이트
          processedResultsRef.current = i + 1;
          hasFinalResult = true;
        } else {
          interimTranscript += text;
        }
      }

      // Final 결과는 즉시 반영
      if (hasFinalResult) {
        // 기존 debounce 타이머 취소
        if (interimDebounceRef.current) {
          clearTimeout(interimDebounceRef.current);
          interimDebounceRef.current = null;
        }
        lastInterimRef.current = '';
        setTranscript((finalTranscript + interimTranscript).trim());
      } else if (interimTranscript) {
        // Interim 결과는 debounce 처리 (150ms)
        // 자모 깨짐 방지: 빠른 업데이트 억제
        lastInterimRef.current = interimTranscript;

        if (interimDebounceRef.current) {
          clearTimeout(interimDebounceRef.current);
        }

        interimDebounceRef.current = setTimeout(() => {
          // 가장 최근 interim 결과만 반영
          setTranscript((finalTranscriptRef.current + lastInterimRef.current).trim());
          interimDebounceRef.current = null;
        }, 150);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.log('[STT] onerror fired:', event.error, 'status:', statusRef.current);

      if (event.error === 'not-allowed') {
        setError('마이크 접근 권한이 필요합니다.');
        setStatus('error');
      } else if (event.error === 'no-speech') {
        // Android에서 자주 발생 - 에러로 처리하지 않고 계속 녹음
        // 상태는 유지하고 onend에서 재시작
        console.log('No speech detected, will restart...');
      } else if (event.error === 'aborted') {
        // 사용자가 중단한 경우 - 무시
        console.log('Recognition aborted');
      } else if (event.error === 'network') {
        setError('네트워크 연결을 확인해주세요.');
        setStatus('error');
      } else if (event.error === 'service-not-allowed') {
        setError('음성 인식 서비스를 사용할 수 없습니다.');
        setStatus('error');
      } else {
        // 기타 에러는 재시도
        console.log('Other error, will try to restart...');
      }
    };

    recognition.onend = () => {
      console.log('[STT] onend fired, status:', statusRef.current, 'finalTranscript:', finalTranscriptRef.current);
      if (statusRef.current === 'recording') {
        // Android에서 continuous 모드가 불안정하므로 재시작
        // 재시작 전 인덱스 리셋 (새 세션은 0부터 시작)
        processedResultsRef.current = 0;
        // 새 세그먼트 시작 위치 기록 (현재 transcript 끝)
        segmentStartRef.current = finalTranscriptRef.current.length;
        console.log('[STT] Scheduling restart in 100ms, new segment starts at:', segmentStartRef.current);
        setTimeout(() => {
          if (statusRef.current === 'recording') {
            try {
              recognition.start();
              console.log('[STT] Recognition restarted successfully');
            } catch (e) {
              console.log('[STT] Restart failed:', e);
            }
          } else {
            console.log('[STT] Status changed, skipping restart');
          }
        }, 100);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
      // 타이머 정리
      if (interimDebounceRef.current) {
        clearTimeout(interimDebounceRef.current);
        interimDebounceRef.current = null;
      }
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
    if (!recognitionRef.current) {
      setError('음성 인식이 초기화되지 않았습니다. 페이지를 새로고침해주세요.');
      setStatus('error');
      return;
    }

    setError(null);
    finalTranscriptRef.current = '';
    setTranscript('');
    processedResultsRef.current = 0; // 새 녹음 시작 시 초기화

    try {
      // 먼저 마이크 권한 요청
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // 스트림 해제 (권한 확인용)
      stream.getTracks().forEach(track => track.stop());

      setStatus('recording');
      console.log('[STT] setStatus to recording, starting recognition...');

      // 약간의 딜레이 후 시작 (안드로이드 안정성)
      setTimeout(() => {
        try {
          recognitionRef.current?.start();
          console.log('[STT] recognition.start() called successfully');
        } catch (e) {
          console.error('[STT] Start error:', e);
          // 이미 시작된 경우 무시
          if (e instanceof Error && !e.message.includes('already started')) {
            setError('음성 인식을 시작할 수 없습니다.');
            setStatus('error');
          }
        }
      }, 100);
    } catch (err) {
      console.error('Microphone error:', err);
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setError('마이크 접근 권한이 필요합니다. 브라우저 설정에서 허용해주세요.');
        } else if (err.name === 'NotFoundError') {
          setError('마이크를 찾을 수 없습니다.');
        } else if (err.name === 'NotReadableError') {
          setError('마이크가 다른 앱에서 사용 중입니다.');
        } else {
          setError(`마이크 오류: ${err.message}`);
        }
      } else {
        setError('마이크 접근 권한이 필요합니다.');
      }
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
    // 타이머 정리
    if (interimDebounceRef.current) {
      clearTimeout(interimDebounceRef.current);
      interimDebounceRef.current = null;
    }
    setStatus('idle');
    setTranscript('');
    setError(null);
    finalTranscriptRef.current = '';
    processedResultsRef.current = 0;
    lastInterimRef.current = '';
    segmentStartRef.current = 0;
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
