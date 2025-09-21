'use client';

import { useEffect } from 'react';
import { redirect } from 'next/navigation';

export default function RecipesRedirectPage() {
  useEffect(() => {
    redirect('/recipes/cookbook');
  }, []);

  return null;
}
