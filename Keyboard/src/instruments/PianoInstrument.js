import { BaseInstrument } from './BaseInstrument.js';
import { CONFIG } from '../config.js';

const PROFILE_SYNTH = {
    normal:    { osc: 'triangle', attack: 0.02, decay: 0.15, sustain: 0.35, release: 0.8 },
    bright:    { osc: 'triangle', attack: 0.01, decay: 0.10, sustain: 0.40, release: 0.7 },
    soft:      { osc: 'sine',    attack: 0.05, decay: 0.20, sustain: 0.25, release: 1.2 },
    dark:      { osc: 'sine',    attack: 0.06, decay: 0.25, sustain: 0.20, release: 1.0 },
    warm:      { osc: 'triangle', attack: 0.03, decay: 0.18, sustain: 0.35, release: 0.9 },
    cinematic: { osc: 'sawtooth', attack: 0.08, decay: 0.30, sustain: 0.30, release: 2.0 },
    felt:      { osc: 'sine',    attack: 0.10, decay: 0.20, sustain: 0.15, release: 1.5 },
    upright:   { osc: 'triangle', attack: 0.02, decay: 0.12, sustain: 0.38, release: 0.6 },
    honkytonk: { osc: 'square',  attack: 0.01, decay: 0.05, sustain: 0.20, release: 0.3 }
};

export class PianoInstrument extends BaseInstrument {
    constructor(options = {}) {
        super();
        const profile = options.profile || 'normal';
        const synthDef = PROFILE_SYNTH[profile] || PROFILE_SYNTH.normal;
        const quality = CONFIG.audio.effectsQuality;

        this.poly = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: synthDef.osc },
            envelope: {
                attack: synthDef.attack,
                decay: synthDef.decay,
                sustain: synthDef.sustain,
                release: synthDef.release
            },
            volume: -6
        });

        if (quality === 'low') {
            this.poly.connect(this._getOutput());
            this._waitSampleLoad(profile);
        } else {
            this.reverb = new Tone.Reverb({ decay: 1.5, preDelay: 0.05, wet: 0.15 });
            this.poly.connect(this.reverb);
            this._getOutput = () => this.reverb;
            this._waitSampleLoad(profile);
        }
    }

    _buildSampleChain(profile) {
        if (this.reverb) this.reverb.dispose();
        this.reverb = new Tone.Reverb({ decay: 1.8, preDelay: 0.05, wet: 0.15 });

        this.eq = new Tone.EQ3(0, 0, 0);
        if (CONFIG.audio.effectsQuality !== 'low') {
            this.filter = new Tone.Filter(2000, 'lowpass');
        }

        const urls = {
            'A0':'A0.mp3','C1':'C1.mp3','D#1':'Ds1.mp3','F#1':'Fs1.mp3',
            'A1':'A1.mp3','C2':'C2.mp3','D#2':'Ds2.mp3','F#2':'Fs2.mp3',
            'A2':'A2.mp3','C3':'C3.mp3','D#3':'Ds3.mp3','F#3':'Fs3.mp3',
            'A3':'A3.mp3','C4':'C4.mp3','D#4':'Ds4.mp3','F#4':'Fs4.mp3',
            'A4':'A4.mp3','C5':'C5.mp3','D#5':'Ds5.mp3','F#5':'Fs5.mp3',
            'A5':'A5.mp3','C6':'C6.mp3','D#6':'Ds6.mp3','F#6':'Fs6.mp3',
            'A6':'A6.mp3','C7':'C7.mp3','D#7':'Ds7.mp3','F#7':'Fs7.mp3'
        };

        this.sampler = new Tone.Sampler({
            urls,
            release: 1.2,
            baseUrl: 'https://tonejs.github.io/audio/salamander/',
            onload: () => {
                this._switchToSampler(profile);
            }
        });

        if (this.filter) {
            this.sampler.chain(this.eq, this.filter, this.reverb);
        } else {
            this.sampler.chain(this.eq, this.reverb);
        }
    }

    _waitSampleLoad(profile) {
        if (CONFIG.audio.useSamples) {
            this._buildSampleChain(profile);
        }
    }

    _switchToSampler(profile) {
        window.dispatchEvent(new CustomEvent('samples-loaded', { detail: { instrument: 'piano', profile } }));
    }

    _getOutput() {
        if (this.reverb) return this.reverb;
        return Tone.Destination;
    }

    connect(destination) {
        const out = this._getOutput();
        if (out !== Tone.Destination) {
            out.disconnect();
            out.connect(destination);
        }
    }

    disconnect() {
        const out = this._getOutput();
        if (out !== Tone.Destination) out.disconnect();
    }

    noteOn(note, velocity = 1, time) {
        const now = time || Tone.now();
        if (this.sampler && this.sampler.loaded) {
            this.sampler.triggerAttack(note, now, velocity);
        } else {
            this.poly.triggerAttack(note, now, velocity);
        }
    }

    noteOff(note, time) {
        const now = time || Tone.now();
        if (this.sampler && this.sampler.loaded) {
            this.sampler.triggerRelease(note, now);
        } else {
            this.poly.triggerRelease(note, now);
        }
    }

    setRoom(amount) {
        if (this.reverb) this.reverb.wet.value = 0.05 + amount * 0.2;
    }

    setBrightness(amount) {
        if (this.filter) this.filter.frequency.rampTo(800 + amount * 3000, 0.2);
    }

    dispose() {
        this.poly.dispose();
        if (this.sampler) this.sampler.dispose();
        if (this.eq) this.eq.dispose();
        if (this.filter) this.filter.dispose();
        if (this.reverb) this.reverb.dispose();
    }
}
