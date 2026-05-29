import { BaseInstrument } from './BaseInstrument.js';

export class ElectricPianoInstrument extends BaseInstrument {
    constructor() {
        super();

        this.poly = new Tone.PolySynth(Tone.FMSynth, {
            harmonicity: 3,
            modulationIndex: 8,
            oscillator: { type: 'sine' },
            modulation: { type: 'triangle' },
            envelope: { attack: 0.01, decay: 0.25, sustain: 0.3, release: 1.2 },
            modulationEnvelope: { attack: 0.01, decay: 0.2, sustain: 0.2, release: 1.2 },
            volume: -8
        });

        this.reverb = new Tone.Reverb({ decay: 1.8, preDelay: 0.04, wet: 0.12 });
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

    setBrightness(amount) {
        this.poly.set({ modulationIndex: 4 + amount * 14 });
    }

    setRoom(amount) {
        this.reverb.wet.value = 0.05 + amount * 0.2;
    }

    dispose() { this.poly.dispose(); this.reverb.dispose(); }
}
