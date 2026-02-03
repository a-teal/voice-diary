'use client';

import { useEffect, useState } from 'react';
import '../../lib/i18n';

interface I18nProviderProps {
  children: React.ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // i18n 초기화 완료
    setIsInitialized(true);
  }, []);

  // SSR/정적 빌드에서 hydration mismatch 방지
  if (!isInitialized) {
    return <>{children}</>;
  }

  return <>{children}</>;
}
