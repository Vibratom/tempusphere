
'use client';

import { redirect } from 'next/navigation';

export default function ProjectsPage() {
  // Redirect to the default tool, which is the board view.
  redirect('/projects/board');
}
