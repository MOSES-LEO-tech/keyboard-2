import { BaseInstrument } from './BaseInstrument.js';

export class OrganInstrument extends BaseInstrument {
    constructor() {
        super();

        this.poly = new Tone.PolySynth(Tone.AMSynth, {
            harmonicity: 3,
            oscillator: { type: 'sine' },
            envelope: { attack: 0.01, decay: 0.15, sustain: 0.8, release: 0.6 },
            modulation: { type: 'sine' },
            modulationEnvelope: { attack: 0.01, decay: 0.15, sustain: 0.8, release: 0.6 },
            volume: -6
        });

        this.reverb = new Tone.Reverb({ decay: 2.0, preDelay: 0.04, wet: 0.15 });
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
        this.reverb.wet.value = 0.05 + amount * 0.2;
    }

    dispose() { this.poly.dispose(); this.reverb.dispose(); }
}
