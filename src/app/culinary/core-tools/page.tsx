'use client';

import { useEffect } from 'react';
import { redirect } from 'next/navigation';

export default function CoreToolsRedirectPage() {
  useEffect(() => {
    redirect('/culinary/core-tools/book');
  }, []);

  return null;
}
