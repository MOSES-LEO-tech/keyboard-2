import { BaseInstrument } from './BaseInstrument.js';

export class PadInstrument extends BaseInstrument {
    constructor() {
        super();

        this.poly = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: 'sawtooth' },
            envelope: { attack: 0.4, decay: 0.3, sustain: 0.7, release: 2.5 },
            volume: -10
        });

        this.reverb = new Tone.Reverb({ decay: 3.0, preDelay: 0.1, wet: 0.3 });
        this.reverb.generate();

        this.poly.chain(this.reverb);
        this.output = this.reverb;
    }

    connect(destination) { this.reverb.disconnect(); this.reverb.connect(destination); }
    disconnect() { this.reverb.disconnect(); }

    noteOn(note, velocity = 1, time) {
        this.poly.triggerAttack(note, time || Tone.now(), velocity);
    }

    noteOff(note, time) { this.poly.triggerRelease(note, time || Tone.now()); }

    setRoom(amount) {
        this.reverb.wet.value = 0.1 + amount * 0.35;
    }

    setBrightness(amount) {
        this.poly.set({
            envelope: { attack: 0.2 + amount * 0.4, decay: 0.2, sustain: 0.7, release: 2.0 + amount * 1.5 }
        });
    }

    dispose() { this.poly.dispose(); this.reverb.dispose(); }
}
