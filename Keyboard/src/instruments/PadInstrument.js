import { BaseInstrument } from './BaseInstrument.js';
import { SharedSampler } from '../core/SharedSampler.js';

export class PadInstrument extends BaseInstrument {
    constructor() {
        super();
        this.sampler = SharedSampler.get();

        this.eq3 = new Tone.EQ3({ low: 2, mid: -1, high: -1 });
        this.filter = new Tone.Filter({ type: 'lowpass', frequency: 1500, Q: 0.4 });
        this.compressor = new Tone.Compressor({ threshold: -16, ratio: 3, attack: 0.15, release: 1.5 });
        this.reverb = new Tone.Reverb({ decay: 5.0, preDelay: 0.1, wet: 0.4 });
        this.reverb.generate();
    }

    connect(destination) {
        if (this.sampler) this.sampler.chain(this.eq3, this.filter, this.compressor, this.reverb, destination);
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
        this.reverb.wet.value = 0.15 + amount * 0.40;
    }

    setBrightness(amount) {
        this.filter.frequency.value = 800 + amount * 3000;
    }

    dispose() {
        this.sampler = null;
        this.eq3.dispose();
        this.filter.dispose();
        this.compressor.dispose();
        this.reverb.dispose();
    }
}
