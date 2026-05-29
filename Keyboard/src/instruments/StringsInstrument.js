import { BaseInstrument } from './BaseInstrument.js';

export class StringsInstrument extends BaseInstrument {
    constructor() {
        super();

        this.poly = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: 'sawtooth2' },
            envelope: { attack: 0.25, decay: 0.15, sustain: 0.7, release: 1.8 },
            volume: -10
        });

        this.reverb = new Tone.Reverb({ decay: 2.5, preDelay: 0.08, wet: 0.3 });
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
        this.reverb.wet.value = 0.1 + amount * 0.3;
        this.reverb.decay = 2.0 + amount * 2.5;
    }

    dispose() { this.poly.dispose(); this.reverb.dispose(); }
}
