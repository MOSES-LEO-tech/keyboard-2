import { NOTE_INDEX_MAP, noteToMidi } from '../../utils/noteUtils.js';

/**
 * @typedef {Object} ImportanceScore
 * @property {string} noteId - index into the notes array
 * @property {number} importance - 0-1 score
 * @property {number} pitchProminence
 * @property {number} rhythmicProminence
 * @property {number} sustainProminence
 * @property {number} velocityEmphasis
 * @property {number} motifRepetition
 */

export class MelodyDetector {
    /**
     * @param {Object[]} notes - [{ note, start, duration, velocity }]
     * @param {number} bpm
     * @returns {ImportanceScore[]}
     */
    analyze(notes, bpm) {
        if (!notes.length) return [];

        const secondsPerBeat = 60 / bpm;
        const midis = notes.map(n => noteToMidi(n.note));

        const pitchScores = this._scorePitchProminence(midis);
        const rhythmScores = this._scoreRhythmicProminence(notes, secondsPerBeat);
        const sustainScores = this._scoreSustainProminence(notes);
        const velocityScores = this._scoreVelocityEmphasis(notes);
        const motifScores = this._detectMotifRepetition(notes, midis);

        return notes.map((note, i) => {
            const pitch = pitchScores[i] || 0;
            const rhythm = rhythmScores[i] || 0;
            const sustain = sustainScores[i] || 0;
            const velocity = velocityScores[i] || 0;
            const motif = motifScores[i] || 0;

            const importance = this._weightedScore({
                pitchProminence: pitch,
                rhythmicProminence: rhythm,
                sustain: sustain,
                velocity: velocity,
                motif: motif
            });

            return {
                noteId: String(i),
                importance: Math.round(importance * 1000) / 1000,
                pitchProminence: Math.round(pitch * 1000) / 1000,
                rhythmicProminence: Math.round(rhythm * 1000) / 1000,
                sustainProminence: Math.round(sustain * 1000) / 1000,
                velocityEmphasis: Math.round(velocity * 1000) / 1000,
                motifRepetition: Math.round(motif * 1000) / 1000,
            };
        });
    }

    /**
     * Higher notes tend to carry melody. Score relative pitch within a sliding window.
     */
    _scorePitchProminence(midis) {
        const windowSize = 8;
        const scores = new Array(midis.length).fill(0);

        for (let i = 0; i < midis.length; i++) {
            const start = Math.max(0, i - Math.floor(windowSize / 2));
            const end = Math.min(midis.length, i + Math.floor(windowSize / 2));
            const windowNotes = midis.slice(start, end).filter(m => m != null);
            if (!windowNotes.length) continue;

            const maxMidi = Math.max(...windowNotes);
            const minMidi = Math.min(...windowNotes);
            const range = maxMidi - minMidi || 1;

            scores[i] = (midis[i] - minMidi) / range;
        }

        return scores;
    }

    /**
     * Notes on strong beats are more prominent.
     */
    _scoreRhythmicProminence(notes, secondsPerBeat) {
        return notes.map(n => {
            const beatPosition = n.start % 4;
            const fraction = beatPosition - Math.floor(beatPosition);

            if (fraction < 0.05) return 1.0;
            if (fraction < 0.1 || Math.abs(fraction - 0.5) < 0.05) return 0.7;
            if (Math.abs(fraction - 0.25) < 0.05 || Math.abs(fraction - 0.75) < 0.05) return 0.5;
            return 0.3;
        });
    }

    /**
     * Longer notes are more melodically significant.
     */
    _scoreSustainProminence(notes) {
        if (!notes.length) return [];

        const durations = notes.map(n => n.duration);
        const maxDur = Math.max(...durations);
        if (maxDur <= 0) return new Array(notes.length).fill(0);

        return durations.map(d => Math.min(1, d / Math.max(maxDur, 0.5)));
    }

    /**
     * Louder notes carry more emphasis.
     */
    _scoreVelocityEmphasis(notes) {
        if (!notes.length) return [];

        const velocities = notes.map(n => n.velocity || 100);
        const maxVel = Math.max(...velocities);
        if (maxVel <= 0) return new Array(notes.length).fill(0.5);

        return velocities.map(v => v / maxVel);
    }

    /**
     * Detect repeated pitch intervals (motifs).
     */
    _detectMotifRepetition(notes, midis) {
        const scores = new Array(notes.length).fill(0);
        if (midis.length < 4) return scores;

        const intervalSequence = [];
        for (let i = 1; i < midis.length; i++) {
            if (midis[i] != null && midis[i - 1] != null) {
                intervalSequence.push(midis[i] - midis[i - 1]);
            } else {
                intervalSequence.push(null);
            }
        }

        const patternLength = 3;
        const seen = new Map();

        for (let i = 0; i <= intervalSequence.length - patternLength; i++) {
            const slice = intervalSequence.slice(i, i + patternLength).join(',');
            if (slice.includes('null')) continue;

            if (seen.has(slice)) {
                const firstIdx = seen.get(slice);
                for (let j = 0; j < patternLength; j++) {
                    scores[i + j] = 0.6;
                    scores[firstIdx + j] = 0.6;
                }
            } else {
                seen.set(slice, i);
            }
        }

        return scores;
    }

    _weightedScore({ pitchProminence, rhythmicProminence, sustain, velocity, motif }) {
        return (
            pitchProminence * 0.30 +
            rhythmicProminence * 0.20 +
            sustain * 0.15 +
            velocity * 0.10 +
            motif * 0.25
        );
    }
}
