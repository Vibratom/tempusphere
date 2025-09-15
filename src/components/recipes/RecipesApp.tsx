'use client';

import { UtensilsCrossed } from 'lucide-react';

export function RecipesApp() {
  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="flex flex-col items-center text-center mb-8">
        <UtensilsCrossed className="w-16 h-16 mb-4 text-primary" />
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">My Recipes</h1>
        <p className="text-lg text-muted-foreground mt-2">Your personal digital cookbook.</p>
      </div>
      <div className="text-center text-muted-foreground py-16">
        <p>Recipe management functionality will be built here.</p>
      </div>
    </div>
  );
}
