import { BaseInstrument } from './BaseInstrument.js';
import { SharedSampler } from '../core/SharedSampler.js';

export class OrganInstrument extends BaseInstrument {
    constructor() {
        super();
        this.sampler = SharedSampler.get();

        this.eq3 = new Tone.EQ3({ low: -2, mid: 4, high: -1 });
        this.distortion = new Tone.Distortion({ distortion: 0.15, wet: 0.3 });
        this.reverb = new Tone.Reverb({ decay: 1.5, preDelay: 0.03, wet: 0.12 });
        this.reverb.generate();
    }

    connect(destination) {
        if (this.sampler) this.sampler.chain(this.eq3, this.distortion, this.reverb, destination);
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

    setRoom(amount) {
        this.reverb.wet.value = 0.05 + amount * 0.2;
    }

    setBrightness(amount) {
        this.eq3.mid.value = 2 + amount * 4;
        this.distortion.distortion = 0.05 + amount * 0.3;
    }

    dispose() {
        this.sampler = null;
        this.eq3.dispose();
        this.distortion.dispose();
        this.reverb.dispose();
    }
}
