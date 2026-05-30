import { noteToMidi } from '../../utils/noteUtils.js';

/**
 * PriorityScorer scores each note 0-1 based on musical importance.
 *
 * Factors:
 *   melodyImportance  — from MelodyDetector (weight 0.40)
 *   harmonicAnchor    — bass roots, chord roots (weight 0.25)
 *   rhythmicAnchor    — downbeat/groove position (weight 0.20)
 *   structuralImport  — section boundaries (weight 0.15)
 */

export class PriorityScorer {
    /**
     * @param {Object[]} notes - [{ note, start, duration, velocity, hand, trackIndex }]
     * @param {Object} songAnalysis - from SongAnalyzer
     * @returns {number[]} priority scores parallel to notes array
     */
    scoreNotes(notes, songAnalysis) {
        const melodyImportance = this._getMelodyScores(notes, songAnalysis);
        const harmonicScores = this._scoreHarmonicAnchor(notes);
        const rhythmicScores = this._scoreRhythmicAnchor(notes);
        const structuralScores = this._scoreStructuralImportance(notes, songAnalysis);

        return notes.map((_, i) => {
            const score =
                melodyImportance[i] * 0.40 +
                harmonicScores[i] * 0.25 +
                rhythmicScores[i] * 0.20 +
                structuralScores[i] * 0.15;

            return Math.round(Math.max(0, Math.min(1, score)) * 1000) / 1000;
        });
    }

    _getMelodyScores(notes, analysis) {
        if (!analysis.melody || !analysis.melody.length) {
            return notes.map(() => 0.5);
        }

        const melodyMap = new Map();
        analysis.melody.forEach(m => {
            melodyMap.set(m.noteId, m.importance);
        });

        return notes.map((_, i) => melodyMap.get(String(i)) || 0.3);
    }

    /**
     * Bass notes and chord roots are harmonic anchors.
     */
    _scoreHarmonicAnchor(notes) {
        const midis = notes.map(n => noteToMidi(n.note));
        if (!midis.length) return notes.map(() => 0.5);

        const globalMin = Math.min(...midis.filter(m => m >= 0));

        return notes.map((n, i) => {
            const midi = midis[i];
            if (midi < 0) return 0.3;

            // Lowest notes in the arrangement are harmonic anchors
            const isBass = midi <= globalMin + 6;

            // Check if note is a downbeat (beat position near 0)
            const beatFraction = n.start % 1;
            const isDownbeat = beatFraction < 0.1;

            // Check hand — left hand often carries harmony
            const isLeftHand = n.hand === 'left';

            let score = 0.3;
            if (isBass && isDownbeat) score = 1.0;
            else if (isBass) score = 0.8;
            else if (isLeftHand && isDownbeat) score = 0.7;
            else if (isDownbeat) score = 0.6;
            else if (isLeftHand) score = 0.5;

            return score;
        });
    }

    /**
     * Notes on strong beats are rhythmically important.
     */
    _scoreRhythmicAnchor(notes) {
        return notes.map(n => {
            const beatPosition = n.start % 4;
            const fraction = beatPosition - Math.floor(beatPosition);

            if (fraction < 0.08) return 1.0;
            if (Math.abs(fraction - 0.5) < 0.08) return 0.7;
            if (Math.abs(fraction - 0.25) < 0.08 || Math.abs(fraction - 0.75) < 0.08) return 0.5;
            return 0.3;
        });
    }

    /**
     * Notes near section boundaries carry structural weight.
     */
    _scoreStructuralImportance(notes, analysis) {
        if (!analysis.sections || !analysis.sections.length) {
            return notes.map(() => 0.5);
        }

        const sectionStarts = new Set();
        analysis.sections.forEach(s => {
            sectionStarts.add(Math.round(s.startBeat * 10) / 10);
        });

        return notes.map(n => {
            const beat = Math.round(n.start * 10) / 10;
            if (sectionStarts.has(beat)) return 0.9;
            return 0.4;
        });
    }
}
