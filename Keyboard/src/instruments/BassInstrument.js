import { BaseInstrument } from './BaseInstrument.js';

export class BassInstrument extends BaseInstrument {
    constructor() {
        super();

        this.poly = new Tone.PolySynth(Tone.MonoSynth, {
            oscillator: { type: 'sawtooth' },
            filter: { type: 'lowpass' },
            envelope: { attack: 0.01, decay: 0.15, sustain: 0.5, release: 0.5 },
            filterEnvelope: { attack: 0.01, decay: 0.15, sustain: 0.2, release: 0.4, baseFrequency: 40, octaves: 2 },
            volume: 0
        });

        this.poly.connect(Tone.Destination);
        this.output = this.poly;
    }

    connect(destination) { this.poly.disconnect(); this.poly.connect(destination); }
    disconnect() { this.poly.disconnect(); }

    noteOn(note, velocity = 1, time) {
        this.poly.triggerAttack(note, time || Tone.now(), velocity);
    }

    noteOff(note, time) {
        this.poly.triggerRelease(note, time || Tone.now());
    }

    dispose() { this.poly.dispose(); }
}
