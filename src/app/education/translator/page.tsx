
'use client';

import { Suspense, useState, useEffect } from 'react';
import { Translator } from '@/components/education/Translator';

function TranslatorContent() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return <Translator />;
}

export default function TranslatorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TranslatorContent />
    </Suspense>
  );
}
