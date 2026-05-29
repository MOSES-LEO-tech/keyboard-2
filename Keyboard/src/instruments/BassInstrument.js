import { BaseInstrument } from './BaseInstrument.js';
import { SharedSampler } from '../core/SharedSampler.js';

export class BassInstrument extends BaseInstrument {
    constructor() {
        super();
        this.sampler = SharedSampler.get();

        this.eq3 = new Tone.EQ3({ low: 6, mid: -2, high: -6 });
        this.filter = new Tone.Filter({ type: 'lowpass', frequency: 600, Q: 0.7 });
        this.compressor = new Tone.Compressor({ threshold: -12, ratio: 6, attack: 0.002, release: 0.1 });
    }

    connect(destination) {
        if (this.sampler) this.sampler.chain(this.eq3, this.filter, this.compressor, destination);
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
        this.filter.frequency.value = 300 + amount * 800;
    }

    dispose() {
        this.sampler = null;
        this.eq3.dispose();
        this.filter.dispose();
        this.compressor.dispose();
    }
}
