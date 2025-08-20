
'use client';

import * as Tone from 'tone';

export interface AlarmSound {
  name: string;
  type: 'synth' | 'file';
  path?: string; // for file type
}

export const alarmSounds: AlarmSound[] = [
  { name: 'Beep', type: 'synth' },
  { name: 'Synth', type: 'synth' },
  { name: 'Triangle', type: 'synth' },
  { name: 'Chime', type: 'synth' },
  { name: 'Digital', type: 'synth' },
  { name: 'My Sound 1', type: 'file', path: '/sounds/alarm1.mp3' },
  { name: 'My Sound 2', type: 'file', path: '/sounds/alarm2.mp3' },
];

let synth: Tone.Synth | null = null;
let triangleSynth: Tone.Synth | null = null;
let metalSynth: Tone.MetalSynth | null = null;
let polySynth: Tone.PolySynth | null = null;
const players: Record<string, Tone.Player> = {};

if (typeof window !== 'undefined') {
  synth = new Tone.Synth().toDestination();
  triangleSynth = new Tone.Synth({
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.005, decay: 0.1, sustain: 0.3, release: 1 },
  }).toDestination();
  metalSynth = new Tone.MetalSynth({
    frequency: 200,
    envelope: { attack: 0.001, decay: 1.4, release: 0.2 },
    harmonicity: 5.1,
    modulationIndex: 32,
    resonance: 4000,
    octaves: 1.5,
  }).toDestination();
  polySynth = new Tone.PolySynth(Tone.Synth, {
    oscillator: {
      type: "fmsquare",
      modulationType: "sawtooth",
      modulationIndex: 3,
      harmonicity: 3.4
    },
    envelope: {
      attack: 0.001,
      decay: 0.1,
      sustain: 0.1,
      release: 0.1
    }
  }).toDestination();

  // Pre-load file-based sounds
  alarmSounds.forEach(sound => {
    if (sound.type === 'file' && sound.path) {
      players[sound.name] = new Tone.Player(sound.path).toDestination();
    }
  });
}

export const playSound = (soundName: string) => {
  if (Tone.context.state !== 'running') {
    Tone.context.resume();
  }

  const sound = alarmSounds.find(s => s.name === soundName);
  if (!sound) return;

  const now = Tone.now();

  if (sound.type === 'file') {
    const player = players[sound.name];
    if (player && player.loaded) {
      player.start(now);
    } else if (player) {
      // If not loaded, try to load it and play
      player.load(player.buffer.url).then(() => {
        player.start(now);
      }).catch(e => console.error("Error loading sound:", e));
    }
    return;
  }

  switch (sound.name) {
    case 'Beep':
      synth?.triggerAttackRelease('C5', '8n', now);
      break;
    case 'Synth':
      synth?.triggerAttackRelease('G4', '8n', now);
      synth?.triggerAttackRelease('C5', '8n', now + 0.2);
      break;
    case 'Triangle':
      triangleSynth?.triggerAttackRelease('C6', '16n', now);
      break;
    case 'Chime':
      metalSynth?.triggerAttackRelease('C4', '4n', now);
      break;
    case 'Digital':
      polySynth?.triggerAttackRelease(['C4', 'E4', 'G4'], '16n', now);
      break;
  }
};
