import { NOTE_INDEX_MAP, noteToMidi, midiToNote } from '../../utils/noteUtils.js';

/**
 * @typedef {Object} ChordGroup
 * @property {number} startTime - beat position
 * @property {string[]} notes - note names in the chord
 * @property {number[]} midis - MIDI pitch numbers sorted
 * @property {string} type - 'unison' | 'interval' | 'triad' | 'seventh' | 'cluster'
 * @property {string} root - root note name
 * @property {string} quality - 'major' | 'minor' | 'diminished' | 'augmented' | 'suspended' | 'unknown'
 * @property {boolean} isInversion
 */

export class ChordAnalyzer {
    /**
     * @param {Object[]} notes - [{ note, start, duration }]
     * @param {number} [simultaneityThreshold=0.05] - beats tolerance
     * @returns {{ chordGroups: ChordGroup[], maxChordSize: number, avgChordSize: number }}
     */
    analyze(notes, simultaneityThreshold = 0.05) {
        if (!notes.length) return { chordGroups: [], maxChordSize: 0, avgChordSize: 0 };

        const groups = this._groupSimultaneous(notes, simultaneityThreshold);
        const chordGroups = groups.map(g => this._classifyChord(g));

        const sizes = chordGroups.map(c => c.midis.length);
        const maxChordSize = Math.max(...sizes, 1);
        const avgChordSize = sizes.length > 0
            ? Math.round((sizes.reduce((a, b) => a + b, 0) / sizes.length) * 100) / 100
            : 1;

        return { chordGroups, maxChordSize, avgChordSize };
    }

    _groupSimultaneous(notes, threshold) {
        const sorted = [...notes].sort((a, b) => a.start - b.start);
        const groups = [];
        let currentGroup = [sorted[0]];
        let groupStart = sorted[0].start;

        for (let i = 1; i < sorted.length; i++) {
            if (Math.abs(sorted[i].start - groupStart) <= threshold) {
                currentGroup.push(sorted[i]);
            } else {
                groups.push(currentGroup);
                currentGroup = [sorted[i]];
                groupStart = sorted[i].start;
            }
        }
        groups.push(currentGroup);
        return groups;
    }

    _classifyChord(group) {
        const startTime = group[0].start;
        const notes = group.map(n => n.note).filter(Boolean);
        const midis = notes.map(n => noteToMidi(n)).filter(m => m >= 0).sort((a, b) => a - b);
        const uniqueMidis = [...new Set(midis)];

        if (uniqueMidis.length <= 1) {
            return {
                startTime,
                notes,
                midis: uniqueMidis,
                type: 'unison',
                root: notes[0] || '?',
                quality: 'unknown',
                isInversion: false
            };
        }

        const root = midiToNote(uniqueMidis[0]) || '?';
        const rootNote = root.replace(/\d+$/, '');
        const octave = parseInt(root.match(/\d+/)?.[0] || '4');

        if (uniqueMidis.length === 2) {
            const interval = uniqueMidis[1] - uniqueMidis[0];
            return {
                startTime, notes, midis: uniqueMidis,
                type: 'interval',
                root,
                quality: this._intervalQuality(interval),
                isInversion: false
            };
        }

        const intervals = uniqueMidis.map(m => (m - uniqueMidis[0]) % 12);
        const quality = this._detectChordQuality(intervals, uniqueMidis.length);

        let type = 'cluster';
        if (uniqueMidis.length === 3) type = 'triad';
        else if (uniqueMidis.length === 4) type = 'seventh';
        else if (uniqueMidis.length <= 6) type = 'extended';

        const isInversion = intervals[1] >= 4 && intervals[1] <= 5 ? false : true;

        return {
            startTime, notes, midis: uniqueMidis,
            type, root, quality, isInversion
        };
    }

    _intervalQuality(semitones) {
        const map = {
            0: 'unison', 1: 'minor2nd', 2: 'major2nd', 3: 'minor3rd',
            4: 'major3rd', 5: 'perfect4th', 6: 'tritone',
            7: 'perfect5th', 8: 'minor6th', 9: 'major6th',
            10: 'minor7th', 11: 'major7th', 12: 'octave'
        };
        return map[semitones % 12] || 'unknown';
    }

    _detectChordQuality(intervals, size) {
        if (size === 3) {
            if (intervals[1] === 4 && intervals[2] === 7) return 'major';
            if (intervals[1] === 3 && intervals[2] === 7) return 'minor';
            if (intervals[1] === 3 && intervals[2] === 6) return 'diminished';
            if (intervals[1] === 4 && intervals[2] === 8) return 'augmented';
            if (intervals[1] === 5 && intervals[2] === 7) return 'suspended';
            if (intervals[1] === 2 && intervals[2] === 7) return 'suspended2';
        }
        if (size === 4) {
            if (intervals[1] === 4 && intervals[2] === 7 && intervals[3] === 11) return 'major7';
            if (intervals[1] === 3 && intervals[2] === 7 && intervals[3] === 10) return 'minor7';
            if (intervals[1] === 4 && intervals[2] === 7 && intervals[3] === 10) return 'dominant7';
        }
        return 'unknown';
    }
}
