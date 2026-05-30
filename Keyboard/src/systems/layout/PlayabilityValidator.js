import { noteToMidi } from '../../utils/noteUtils.js';
import { getProfile } from '../difficulty/profiles.js';

/**
 * @typedef {Object} ValidationResult
 * @property {boolean} playable
 * @property {string[]} issues
 * @property {Object} stats
 */

export class PlayabilityValidator {
    /**
     * @param {Object[]} arrangement - mapped notes [{ note, start, duration, code, hand }]
     * @param {string} difficultyLabel
     * @param {number} bpm
     * @param {Object} [ergonomicScore] - from ErgonomicAnalyzer
     * @returns {ValidationResult}
     */
    validate(arrangement, difficultyLabel, bpm, ergonomicScore) {
        const profile = getProfile(difficultyLabel);
        const issues = [];

        const densityIssue = this._checkDensity(arrangement, profile, bpm);
        if (densityIssue) issues.push(densityIssue);

        const polyphonyIssue = this._checkPolyphony(arrangement, profile);
        if (polyphonyIssue) issues.push(polyphonyIssue);

        const jumpIssue = this._checkJumpDistance(arrangement, profile);
        if (jumpIssue) issues.push(jumpIssue);

        const ergonomicIssue = this._checkErgonomics(ergonomicScore);
        if (ergonomicIssue) issues.push(ergonomicIssue);

        const fastNotesIssue = this._checkFastNotes(arrangement, profile, bpm);
        if (fastNotesIssue) issues.push(fastNotesIssue);

        const stats = this._computeStats(arrangement, bpm);

        return {
            playable: issues.length === 0,
            issues,
            stats
        };
    }

    _checkDensity(notes, profile, bpm) {
        if (!notes.length) return null;

        const secondsPerBeat = 60 / bpm;
        const maxTime = Math.max(...notes.map(n => n.start * secondsPerBeat));
        let peakDensity = 0;
        const windowSize = 1.0;

        for (let t = 0; t < maxTime; t += 0.5) {
            let count = 0;
            for (const note of notes) {
                const ns = note.start * secondsPerBeat;
                if (ns >= t && ns < t + windowSize) count++;
            }
            peakDensity = Math.max(peakDensity, count);
        }

        if (peakDensity > profile.maxNotesPerSecond * 1.5) {
            return `density: ${peakDensity} notes/sec exceeds limit of ${profile.maxNotesPerSecond}`;
        }
        return null;
    }

    _checkPolyphony(notes, profile) {
        const groups = this._groupByTime(notes);
        let maxSimultaneous = 0;

        for (const group of groups) {
            const uniqueNotes = [...new Set(group.map(n => n.note))];
            maxSimultaneous = Math.max(maxSimultaneous, uniqueNotes.length);
        }

        if (maxSimultaneous > profile.maxSimultaneousNotes) {
            return `polyphony: ${maxSimultaneous} simultaneous notes exceeds limit of ${profile.maxSimultaneousNotes}`;
        }
        return null;
    }

    _checkJumpDistance(notes, profile) {
        if (notes.length < 2) return null;

        for (let i = 1; i < notes.length; i++) {
            if (notes[i].hand !== notes[i-1].hand) continue;

            const midi1 = noteToMidi(notes[i-1].note);
            const midi2 = noteToMidi(notes[i].note);
            if (midi1 < 0 || midi2 < 0) continue;

            const jump = Math.abs(midi2 - midi1);
            if (jump > profile.maxJumpDistance) {
                return `jump distance: ${jump} semitones exceeds limit of ${profile.maxJumpDistance}`;
            }
        }

        return null;
    }

    _checkErgonomics(ergonomicScore) {
        if (!ergonomicScore) return null;

        if (ergonomicScore.comfort < 30) {
            return `ergonomics: comfort score ${ergonomicScore.comfort} is critically low`;
        }
        if (ergonomicScore.fatigue > 80) {
            return `ergonomics: fatigue score ${ergonomicScore.fatigue} is dangerously high`;
        }
        return null;
    }

    _checkFastNotes(notes, profile, bpm) {
        const secondsPerBeat = 60 / bpm;
        let tooFast = 0;

        for (const note of notes) {
            const durationSec = note.duration * secondsPerBeat;
            if (durationSec < profile.minNoteDuration && durationSec > 0) {
                tooFast++;
            }
        }

        if (tooFast > notes.length * 0.15) {
            return `fast notes: ${tooFast} notes below minimum duration of ${profile.minNoteDuration}s`;
        }
        return null;
    }

    _computeStats(notes, bpm) {
        return {
            totalNotes: notes.length,
            rightHandNotes: notes.filter(n => n.hand === 'right').length,
            leftHandNotes: notes.filter(n => n.hand === 'left').length,
            averageDuration: notes.length > 0
                ? Math.round((notes.reduce((s, n) => s + n.duration, 0) / notes.length) * 1000) / 1000
                : 0
        };
    }

    _groupByTime(notes) {
        const groups = [];
        let current = [];
        let currentStart = -Infinity;

        const sorted = [...notes].sort((a, b) => a.start - b.start);

        for (const note of sorted) {
            if (Math.abs(note.start - currentStart) < 0.05) {
                current.push(note);
            } else {
                if (current.length) groups.push(current);
                current = [note];
                currentStart = note.start;
            }
        }

        if (current.length) groups.push(current);
        return groups;
    }
}
