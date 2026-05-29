import { BaseInstrument } from './BaseInstrument.js';
import { SharedSampler } from '../core/SharedSampler.js';

export class PluckInstrument extends BaseInstrument {
    constructor() {
        super();
        this.sampler = SharedSampler.get();

        this.eq3 = new Tone.EQ3({ low: -1, mid: 2, high: 3 });
        this.compressor = new Tone.Compressor({ threshold: -20, ratio: 4, attack: 0.001, release: 0.05 });
        this.gain = new Tone.Gain(1.2);
    }

    connect(destination) {
        if (this.sampler) this.sampler.chain(this.eq3, this.compressor, this.gain, destination);
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
        this.eq3.high.value = 1 + amount * 6;
    }

    dispose() {
        this.sampler = null;
        this.eq3.dispose();
        this.compressor.dispose();
        this.gain.dispose();
    }
}
