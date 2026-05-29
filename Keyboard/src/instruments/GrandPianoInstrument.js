import { BaseInstrument } from './BaseInstrument.js';

export class GrandPianoInstrument extends BaseInstrument {
    constructor() {
        super();

        this.poly = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: 'triangle' },
            envelope: { attack: 0.02, decay: 0.2, sustain: 0.35, release: 2.0 },
            volume: -5
        });

        this.reverb = new Tone.Reverb({ decay: 3.5, preDelay: 0.08, wet: 0.25 });
        this.reverb.generate();

        this.poly.chain(this.reverb);
        this.output = this.reverb;
    }

    connect(destination) { this.reverb.disconnect(); this.reverb.connect(destination); }
    disconnect() { this.reverb.disconnect(); }

    noteOn(note, velocity = 1, time) {
        this.poly.triggerAttack(note, time || Tone.now(), velocity * velocity);
    }

    noteOff(note, time) { this.poly.triggerRelease(note, time || Tone.now()); }

    setRoom(amount) {
        this.reverb.wet.value = 0.1 + amount * 0.3;
        this.reverb.decay = 2.5 + amount * 3.0;
    }

    dispose() { this.poly.dispose(); this.reverb.dispose(); }
}
