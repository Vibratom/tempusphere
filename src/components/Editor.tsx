
'use client'

import React from 'react';
import BaseEditor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-markup';
import 'prismjs/themes/prism-tomorrow.css';
import { ScrollArea } from './ui/scroll-area';

export type OnChange = (value: string) => void;

interface EditorProps {
    value: string;
    onValueChange: OnChange;
    onBlur: () => void;
}

export function Editor({ value, onValueChange, onBlur }: EditorProps) {
  return (
    <ScrollArea className="absolute inset-0">
        <BaseEditor
            value={value}
            onValueChange={onValueChange}
            onBlur={onBlur}
            highlight={(code) => Prism.highlight(code, Prism.languages.markup, 'markup')}
            padding={16}
            className="font-mono text-sm"
            style={{ minHeight: '100%' }}
        />
    </ScrollArea>
  );
}

    