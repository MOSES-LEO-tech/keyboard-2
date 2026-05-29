import { BaseInstrument } from './BaseInstrument.js';
import { SharedSampler } from '../core/SharedSampler.js';

export class ElectricPianoInstrument extends BaseInstrument {
    constructor() {
        super();
        this.sampler = SharedSampler.get();

        this.eq3 = new Tone.EQ3({ low: -4, mid: 0, high: 5 });
        this.chorus = new Tone.Chorus({ frequency: 0.8, delayTime: 3, depth: 0.4, spread: 180 });
        this.reverb = new Tone.Reverb({ decay: 1.8, preDelay: 0.04, wet: 0.15 });
        this.reverb.generate();
    }

    connect(destination) {
        if (this.sampler) this.sampler.chain(this.eq3, this.chorus, this.reverb, destination);
    }

    disconnect() {
        if (this.sampler) this.sampler.disconnect();
    }

    noteOn(note, velocity = 1, time) {
        if (!this.sampler || !SharedSampler.isLoaded) return;
        this.sampler.triggerAttack(note, time || Tone.now(), velocity);
    }

    noteOff(note, time) {
        if (!this.sampler || !SharedSampler.isLoaded) return;
        this.sampler.triggerRelease(note, time || Tone.now());
    }

    setBrightness(amount) {
        this.eq3.high.value = 1 + amount * 8;
        this.chorus.depth = 0.1 + amount * 0.5;
    }

    setRoom(amount) {
        this.reverb.wet.value = 0.05 + amount * 0.25;
    }

    dispose() {
        this.sampler = null;
        this.eq3.dispose();
        this.chorus.dispose();
        this.reverb.dispose();
    }
}
