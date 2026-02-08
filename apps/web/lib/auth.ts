import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  OAuthProvider,
  signOut as firebaseSignOut,
  UserCredential,
} from 'firebase/auth';
import { auth } from './firebase';

// Google 로그인
export async function signInWithGoogle(): Promise<UserCredential> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({
    prompt: 'select_account',
  });

  // 모바일에서는 redirect, 데스크톱에서는 popup
  if (isMobile()) {
    await signInWithRedirect(auth, provider);
    return getRedirectResult(auth) as Promise<UserCredential>;
  }
  return signInWithPopup(auth, provider);
}

// Apple 로그인
export async function signInWithApple(): Promise<UserCredential> {
  const provider = new OAuthProvider('apple.com');
  provider.addScope('email');
  provider.addScope('name');

  if (isMobile()) {
    await signInWithRedirect(auth, provider);
    return getRedirectResult(auth) as Promise<UserCredential>;
  }
  return signInWithPopup(auth, provider);
}

// 로그아웃
export async function signOut(): Promise<void> {
  return firebaseSignOut(auth);
}

// 모바일 체크
function isMobile(): boolean {
  if (typeof window === 'undefined') return false;
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

// Redirect 결과 처리 (앱 시작 시 호출)
export async function handleRedirectResult(): Promise<UserCredential | null> {
  try {
    const result = await getRedirectResult(auth);
    return result;
  } catch (error) {
    console.error('Redirect result error:', error);
    return null;
  }
}
