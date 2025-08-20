
'use client';

import * as Tone from 'tone';

export const alarmSounds = ['Beep', 'Synth', 'Triangle', 'Chime', 'Digital'] as const;
export type AlarmSound = (typeof alarmSounds)[number];

let synth: Tone.Synth | null = null;
let triangleSynth: Tone.Synth | null = null;
let metalSynth: Tone.MetalSynth | null = null;
let polySynth: Tone.PolySynth | null = null;

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
}

export const playSound = (sound: AlarmSound) => {
  if (Tone.context.state !== 'running') {
    Tone.context.resume();
  }

  const now = Tone.now();
  switch (sound) {
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
