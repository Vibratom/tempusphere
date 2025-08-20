
'use client';

import { useEffect, useCallback } from 'react';

type Hotkey = [string, (e: KeyboardEvent) => void];

export const useHotkeys = (hotkeys: Hotkey[]) => {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      hotkeys.forEach(([key, handler]) => {
        if (event.target instanceof HTMLElement && ['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName) && event.key !== 'Escape') {
          return;
        }

        const keyCombination = key.split('+');
        const isCtrl = keyCombination.includes('Ctrl');
        const isAlt = keyCombination.includes('Alt');
        const isShift = keyCombination.includes('Shift');
        const mainKey = keyCombination.filter(k => !['Ctrl', 'Alt', 'Shift'].includes(k))[0];

        if (event.key.toLowerCase() === mainKey.toLowerCase() &&
            event.ctrlKey === isCtrl &&
            event.altKey === isAlt &&
            event.shiftKey === isShift) {
          handler(event);
        }
      });
    },
    [hotkeys]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
};
