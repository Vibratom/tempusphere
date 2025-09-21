'use client';

import { useEffect } from 'react';
import { redirect } from 'next/navigation';

export default function MarketingRedirectPage() {
  useEffect(() => {
    redirect('/productivity/marketing/channels');
  }, []);

  return null;
}
