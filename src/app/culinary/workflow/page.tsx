'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { usePathname, redirect } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const workflowTools = [
    { value: 'timers', label: 'Kitchen Timer Station', href: '/culinary/workflow/timers' },
    { value: 'checklist', label: 'Recipe Preparation Checklist', href: '/culinary/workflow/checklist' },
    { value: 'kds', label: 'Kitchen Display System (KDS) Light', href: '/culinary/workflow/kds' },
];

export default function CulinaryWorkflowRedirectPage() {
    const pathname = usePathname();
    if (pathname === '/culinary/workflow') {
        redirect('/culinary/workflow/timers');
    }
    
    return null;
}
