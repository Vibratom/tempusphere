
'use client';

import * as Tone from 'tone';

export interface AlarmSound {
  name: string;
  type: 'file';
  path: string;
}

export const alarmSounds: AlarmSound[] = [
  { name: 'Audio 1', type: 'file', path: '/sounds/1.ogg' },
  { name: 'Audio 2', type: 'file', path: '/sounds/2.ogg' },
  { name: 'Audio 3', type: 'file', path: '/sounds/3.ogg' },
  { name: 'Audio 4', type: 'file', path: '/sounds/4.ogg' },
  { name: 'Audio 5', type: 'file', path: '/sounds/5.ogg' },
  { name: 'Audio 6', type: 'file', path: '/sounds/6.ogg' },
  { name: 'Audio 7', type: 'file', path: '/sounds/7.ogg' },
  { name: 'Audio 8', type: 'file', path: '/sounds/8.ogg' },
  { name: 'Audio 9', type: 'file', path: '/sounds/9.ogg' },
  { name: 'Audio 10', type: 'file', path: '/sounds/10.ogg' },
];

const players: Record<string, Tone.Player> = {};

if (typeof window !== 'undefined') {
  // Pre-load file-based sounds
  alarmSounds.forEach(sound => {
    if (sound.type === 'file' && sound.path) {
      players[sound.name] = new Tone.Player(sound.path).toDestination();
    }
  });
}

export const stopAllSounds = () => {
    Object.values(players).forEach(player => {
        if (player.state === 'started') {
            player.stop();
        }
    });
    Tone.Transport.stop();
    Tone.Transport.cancel();
};

export const playSound = async (soundName: string, onEnded?: () => void) => {
  stopAllSounds();

  if (Tone.context.state !== 'running') {
    await Tone.context.resume();
  }

  const sound = alarmSounds.find(s => s.name === soundName);
  if (!sound) return;

  const player = players[sound.name];
  if (!player) return;
  
  if (onEnded) {
    player.onstop = onEnded;
  }

  try {
    if (!player.loaded) {
      await player.load(player.buffer.url);
    }
    player.start(Tone.now());
  } catch (e) {
    console.error("Error playing sound:", e);
    onEnded?.();
  }
};
