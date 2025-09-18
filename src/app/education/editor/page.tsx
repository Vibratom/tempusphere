
'use client';

import { Suspense, useState, useEffect } from 'react';
import { EducationEditor } from '@/components/education/EducationEditor';

function EditorContent() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return <EducationEditor />;
}

export default function EditorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EditorContent />
    </Suspense>
  );
}
