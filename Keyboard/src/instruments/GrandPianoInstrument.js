import { BaseInstrument } from './BaseInstrument.js';
import { SharedSampler } from '../core/SharedSampler.js';

export class GrandPianoInstrument extends BaseInstrument {
    constructor() {
        super();
        this.sampler = SharedSampler.get();

        this.eq3 = new Tone.EQ3({ low: 1, mid: 0.5, high: 3 });
        this.compressor = new Tone.Compressor({ threshold: -24, ratio: 4, attack: 0.003, release: 0.25 });
        this.reverb = new Tone.Reverb({ decay: 4.5, preDelay: 0.06, wet: 0.22 });
        this.reverb.generate();
    }

    connect(destination) {
        if (this.sampler) this.sampler.chain(this.eq3, this.compressor, this.reverb, destination);
    }

    disconnect() {
        if (this.sampler) this.sampler.disconnect();
    }

    noteOn(note, velocity = 1, time) {
        if (!this.sampler || !SharedSampler.isLoaded) return;
        this.sampler.triggerAttack(note, time || Tone.now(), velocity * velocity);
    }

    noteOff(note, time) {
        if (!this.sampler || !SharedSampler.isLoaded) return;
        this.sampler.triggerRelease(note, time || Tone.now());
    }

    setRoom(amount) {
        this.reverb.wet.value = 0.08 + amount * 0.30;
        this.reverb.decay = 3.0 + amount * 4.0;
    }

    setBrightness(amount) {
        this.eq3.high.value = -2 + amount * 8;
    }

    dispose() {
        this.sampler = null;
        this.eq3.dispose();
        this.compressor.dispose();
        this.reverb.dispose();
    }
}
