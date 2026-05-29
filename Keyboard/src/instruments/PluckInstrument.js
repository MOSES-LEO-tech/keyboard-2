import { BaseInstrument } from './BaseInstrument.js';

export class PluckInstrument extends BaseInstrument {
    constructor() {
        super();

        this.poly = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: 'triangle' },
            envelope: { attack: 0.005, decay: 0.1, sustain: 0, release: 0.15 },
            volume: -8
        });

        this.poly.connect(Tone.Destination);
        this.output = this.poly;
    }

    connect(destination) { this.poly.disconnect(); this.poly.connect(destination); }
    disconnect() { this.poly.disconnect(); }

    noteOn(note, velocity = 1, time) {
        this.poly.triggerAttack(note, time || Tone.now(), velocity);
    }

    noteOff(note, time) { this.poly.triggerRelease(note, time || Tone.now()); }

    dispose() { this.poly.dispose(); }
}
