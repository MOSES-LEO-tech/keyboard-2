/* global Tone */

/**
 * MetronomeService
 *
 * Provides a highly accurate, Tone.js-based audio/visual metronome.
 * Uses a synth to produce distinct click sounds (downbeat vs offbeats)
 * and dispatches callbacks synchronized with Tone's Transport timeline
 * to animate high-fidelity status LEDs in the UI.
 */
export class MetronomeService {
    constructor() {
        this.bpm = 120;
        this.isPlaying = false;
        this.volume = 0.6; // linear 0 to 1
        this.onBeat = null; // callback (beatNumber)
        this.beatCount = 0;

        this.synth = null;
        this.loopId = null;
    }

    _initSynth() {
        if (this.synth) return;
        
        if (!window.Tone) {
            console.error('[MetronomeService] Tone.js not loaded!');
            return;
        }

        // Create a synth designed for click sounds with fast transient attacks
        this.synth = new window.Tone.Synth({
            oscillator: {
                type: 'triangle'
            },
            envelope: {
                attack: 0.001,
                decay: 0.06,
                sustain: 0,
                release: 0.06
            }
        }).toDestination();
        
        this._updateSynthVolume();
    }

    _updateSynthVolume() {
        if (this.synth && window.Tone) {
            // Convert linear slider 0..1 to logarithmic db scale
            // Clamp to small positive value to avoid log(0) issues
            const linearVolume = Math.max(0.0001, this.volume);
            const db = window.Tone.gainToDb(linearVolume);
            this.synth.volume.value = db;
        }
    }

    setBpm(bpm) {
        const parsed = parseInt(bpm);
        if (isNaN(parsed) || parsed <= 0) return;
        
        this.baseBpm = parsed;
        const adjustedBpm = Math.round(parsed * (this._speed || 1));
        this._applyBpm(adjustedBpm);
    }

    updateSpeed(speed) {
        const s = Math.max(0.1, Math.min(3, parseFloat(speed) || 1));
        this._speed = s;
        if (this.baseBpm) {
            const adjustedBpm = Math.round(this.baseBpm * s);
            this._applyBpm(adjustedBpm);
        }
    }

    _applyBpm(bpm) {
        this.bpm = bpm;
        if (window.Tone && window.Tone.Transport) {
            window.Tone.Transport.bpm.value = bpm;
        }
    }

    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, parseFloat(volume)));
        this._updateSynthVolume();
    }

    start() {
        if (this.isPlaying) return;
        
        if (!window.Tone) return;

        if (window.Tone.context.state !== 'running') {
            window.Tone.context.resume();
        }

        this._initSynth();
        this.isPlaying = true;
        this.beatCount = 0;

        // Set transport tempo to match
        window.Tone.Transport.bpm.value = this.bpm;

        // Schedule click events repeat every quarter note ("4n")
        this.loopId = window.Tone.Transport.scheduleRepeat((time) => {
            const isDownbeat = this.beatCount % 4 === 0;
            const frequency = isDownbeat ? 1200 : 700; // accent first beat of each measure
            
            if (this.synth) {
                this.synth.triggerAttackRelease(frequency, '32n', time);
            }

            // Sync visual blinking with audio thread scheduling
            if (this.onBeat) {
                window.Tone.Draw.schedule(() => {
                    this.onBeat(this.beatCount);
                }, time);
            }

            this.beatCount++;
        }, '4n');

        window.Tone.Transport.start();
    }

    stop() {
        if (!this.isPlaying) return;
        this.isPlaying = false;
        
        if (this.loopId !== null && window.Tone?.Transport) {
            window.Tone.Transport.clear(this.loopId);
            this.loopId = null;
        }
        
        if (window.Tone?.Transport) {
            window.Tone.Transport.stop();
        }
    }

    toggle() {
        if (this.isPlaying) {
            this.stop();
        } else {
            this.start();
        }
        return this.isPlaying;
    }
}
