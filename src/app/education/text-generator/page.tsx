
'use client';

import { Suspense, useState, useEffect } from 'react';
import { TextGenerator } from '@/components/education/TextGenerator';

function TextGeneratorContent() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return <TextGenerator />;
}

export default function TextGeneratorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TextGeneratorContent />
    </Suspense>
  );
}
