import { BaseInstrument } from './BaseInstrument.js';
import { SharedSampler } from '../core/SharedSampler.js';

export class StringsInstrument extends BaseInstrument {
    constructor() {
        super();
        this.sampler = SharedSampler.get();

        this.eq3 = new Tone.EQ3({ low: 2, mid: 1, high: -1 });
        this.filter = new Tone.Filter({ type: 'lowpass', frequency: 1800, Q: 0.5 });
        this.compressor = new Tone.Compressor({ threshold: -18, ratio: 3, attack: 0.1, release: 0.8 });
        this.reverb = new Tone.Reverb({ decay: 3.5, preDelay: 0.08, wet: 0.35 });
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
        this.reverb.wet.value = 0.1 + amount * 0.35;
        this.reverb.decay = 2.5 + amount * 3.0;
    }

    setBrightness(amount) {
        this.filter.frequency.value = 800 + amount * 2500;
    }

    dispose() {
        this.sampler = null;
        this.eq3.dispose();
        this.filter.dispose();
        this.compressor.dispose();
        this.reverb.dispose();
    }
}
