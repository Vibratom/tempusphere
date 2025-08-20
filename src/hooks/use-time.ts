'use client';

import { useState, useEffect, useRef } from 'react';

export function useTime() {
  const [time, setTime] = useState(() => new Date());
  const animationFrameId = useRef<number>();

  useEffect(() => {
    const update = () => {
      setTime(new Date());
      animationFrameId.current = requestAnimationFrame(update);
    };

    animationFrameId.current = requestAnimationFrame(update);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  return time;
}
