import { InstrumentManager } from './InstrumentManager.js';

export class AudioEngine {
    constructor(stateManager) {
        this.stateManager = stateManager;
        this.context = null;
        this.masterGain = null;
        this.instrumentManager = null;
        this.isInitialized = false;
        this.sustain = false;
        this.sustainedNotes = new Set();
        this.contextStarted = false;
        this.reverbAmount = 0.3;
        this.brightnessAmount = 0.5;

        this.init();
    }

    async init() {
        if (typeof Tone === 'undefined') return;

        this.context = Tone.context;
        this.masterGain = new Tone.Gain(this.stateManager.getState().volume ?? 1.8);
        this.masterGain.toDestination();

        try {
            this.instrumentManager = new InstrumentManager(this.context, this.masterGain);
        } catch (error) {
            return;
        }

        this.stateManager.subscribe(state => {
            if (state.instrument) {
                this.instrumentManager.switchTo(state.instrument);
                const inst = this.instrumentManager.getCurrent();
                if (inst) {
                    if (typeof inst.setRoom === 'function') inst.setRoom(this.reverbAmount);
                    if (typeof inst.setBrightness === 'function') inst.setBrightness(this.brightnessAmount);
                }
            }
            if (typeof state.volume === 'number' && this.masterGain) {
                this.masterGain.gain.rampTo(state.volume, 0.1);
            }
            const newSustain = !!state.sustain;
            if (newSustain !== this.sustain) {
                if (this.sustain && !newSustain) {
                    const inst = this.instrumentManager.getCurrent();
                    if (inst) this.sustainedNotes.forEach(n => inst.noteOff(n));
                    this.sustainedNotes.clear();
                }
                this.sustain = newSustain;
            }
        });

        this.isInitialized = true;
    }

    handleNote(noteEvent) {
        if (!this.isInitialized) return;

        if (!this.contextStarted) {
            Tone.start().catch(() => {});
            this.contextStarted = true;
        }

        const instrument = this.instrumentManager.getCurrent();
        if (!instrument) return;

        if (noteEvent.type === 'noteOn') {
            this.sustainedNotes.delete(noteEvent.fullName);
            instrument.noteOn(noteEvent.fullName, noteEvent.velocity ?? 1, noteEvent.time);
        } else if (noteEvent.type === 'noteOff') {
            if (this.sustain) {
                this.sustainedNotes.add(noteEvent.fullName);
            } else {
                instrument.noteOff(noteEvent.fullName, noteEvent.time);
            }
        }
    }

    setRoom(amount) {
        this.reverbAmount = amount;
        const inst = this.instrumentManager && this.instrumentManager.getCurrent();
        if (inst && typeof inst.setRoom === 'function') inst.setRoom(amount);
    }

    setBrightness(amount) {
        this.brightnessAmount = amount;
        const inst = this.instrumentManager && this.instrumentManager.getCurrent();
        if (inst && typeof inst.setBrightness === 'function') inst.setBrightness(amount);
    }
}
