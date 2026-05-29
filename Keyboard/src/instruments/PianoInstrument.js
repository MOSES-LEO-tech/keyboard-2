import { BaseInstrument } from './BaseInstrument.js';
import { SharedSampler } from '../core/SharedSampler.js';

const PROFILES = {
    normal:    { eqLow: -2, eqMid: 0,  eqHigh: 2,  filterCutoff: 3000, reverbWet: 0.12, reverbDecay: 1.8 },
    bright:    { eqLow: -4, eqMid: 2,  eqHigh: 4,  filterCutoff: 4500, reverbWet: 0.10, reverbDecay: 1.5 },
    soft:      { eqLow:  0, eqMid: -1, eqHigh: -2, filterCutoff: 2000, reverbWet: 0.20, reverbDecay: 2.2 },
    dark:      { eqLow:  2, eqMid: 0,  eqHigh: -4, filterCutoff: 1200, reverbWet: 0.18, reverbDecay: 2.0 },
    warm:      { eqLow:  3, eqMid: 1,  eqHigh: -1, filterCutoff: 2500, reverbWet: 0.15, reverbDecay: 1.9 },
    cinematic: { eqLow:  4, eqMid: -1, eqHigh: 1,  filterCutoff: 3500, reverbWet: 0.28, reverbDecay: 2.8 },
    felt:      { eqLow: -3, eqMid: -2, eqHigh: -3, filterCutoff: 1800, reverbWet: 0.25, reverbDecay: 2.5 },
    upright:   { eqLow:  2, eqMid: 1,  eqHigh: -2, filterCutoff: 2200, reverbWet: 0.08, reverbDecay: 1.2 },
    honkytonk: { eqLow:  4, eqMid: 3,  eqHigh: 2,  filterCutoff: 4000, reverbWet: 0.05, reverbDecay: 1.0 }
};

export class PianoInstrument extends BaseInstrument {
    constructor(options = {}) {
        super();
        this.profile = PROFILES[options.profile] || PROFILES.normal;
        this.sampler = SharedSampler.get();

        this.eq3 = new Tone.EQ3({ low: this.profile.eqLow, mid: this.profile.eqMid, high: this.profile.eqHigh });
        this.filter = new Tone.Filter({ type: 'lowpass', frequency: this.profile.filterCutoff, Q: 0.3 });
        this.reverb = new Tone.Reverb({ decay: this.profile.reverbDecay, preDelay: 0.05, wet: this.profile.reverbWet });
        this.reverb.generate();
    }

    connect(destination) {
        if (this.sampler) this.sampler.chain(this.eq3, this.filter, this.reverb, destination);
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
        this.reverb.wet.value = 0.05 + amount * 0.25;
    }

    setBrightness(amount) {
        const freq = 800 + amount * 3500;
        this.filter.frequency.value = freq;
        this.eq3.high.value = -3 + amount * 7;
    }

    dispose() {
        this.sampler = null;
        this.eq3.dispose();
        this.filter.dispose();
        this.reverb.dispose();
    }
}
