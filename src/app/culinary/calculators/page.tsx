'use client';

import { useEffect } from 'react';
import { redirect } from 'next/navigation';

export default function CalculatorsRedirectPage() {
  useEffect(() => {
    redirect('/culinary/calculators/unit-converter');
  }, []);

  return null;
}
