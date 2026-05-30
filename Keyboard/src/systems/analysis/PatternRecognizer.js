import { noteToMidi, midiToNote } from '../../utils/noteUtils.js';

/**
 * @typedef {Object} RecognizedPattern
 * @property {string} type - 'scale' | 'arpeggio' | 'motif' | 'rhythmic_pattern'
 * @property {number} startIndex
 * @property {number} endIndex
 * @property {number} startBeat
 * @property {number} endBeat
 * @property {number} confidence
 * @property {string} [description]
 */

export class PatternRecognizer {
    /**
     * @param {Object[]} notes - [{ note, start, duration }]
     * @param {number} bpm
     * @returns {RecognizedPattern[]}
     */
    recognize(notes, bpm) {
        if (notes.length < 4) return [];

        const midis = notes.map(n => noteToMidi(n.note));
        const patterns = [];

        patterns.push(...this._detectScales(notes, midis, bpm));
        patterns.push(...this._detectArpeggios(notes, midis));
        patterns.push(...this._detectRepeatedMotifs(notes, midis));
        patterns.push(...this._detectRhythmicPatterns(notes, bpm));

        return patterns;
    }

    _detectScales(notes, midis, bpm) {
        const patterns = [];

        const majorScaleIntervals = [2, 2, 1, 2, 2, 2, 1];
        const minorScaleIntervals = [2, 1, 2, 2, 1, 2, 2];

        let runStart = 0;
        for (let i = 1; i < midis.length; i++) {
            if (midis[i] == null || midis[i-1] == null) {
                runStart = i + 1;
                continue;
            }

            const interval = midis[i] - midis[i - 1];

            if (Math.abs(interval) < 1 || Math.abs(interval) > 2) {
                this._checkScaleRun(notes, midis, runStart, i - 1, majorScaleIntervals, minorScaleIntervals, patterns);
                runStart = i;
            }
        }

        this._checkScaleRun(notes, midis, runStart, midis.length - 1, majorScaleIntervals, minorScaleIntervals, patterns);
        return patterns;
    }

    _checkScaleRun(notes, midis, start, end, majorIntervals, minorIntervals, patterns) {
        const length = end - start;
        if (length < 3) return;

        const intervals = [];
        for (let i = start + 1; i <= end; i++) {
            intervals.push(midis[i] - midis[i - 1]);
        }

        const absIntervals = intervals.map(Math.abs);

        if (this._matchIntervalSequence(absIntervals, majorIntervals)) {
            patterns.push({
                type: 'scale',
                startIndex: start,
                endIndex: end,
                startBeat: notes[start].start,
                endBeat: notes[end].start,
                confidence: 0.8,
                description: 'Major scale fragment'
            });
        } else if (this._matchIntervalSequence(absIntervals, minorIntervals)) {
            patterns.push({
                type: 'scale',
                startIndex: start,
                endIndex: end,
                startBeat: notes[start].start,
                endBeat: notes[end].start,
                confidence: 0.7,
                description: 'Minor scale fragment'
            });
        }
    }

    _detectArpeggios(notes, midis) {
        const patterns = [];

        const triadIntervals = [
            [4, 3, 5],
            [3, 4, 5],
            [4, 3],
            [3, 4]
        ];

        let runStart = 0;
        for (let i = 1; i < midis.length; i++) {
            if (midis[i] == null || midis[i-1] == null) {
                runStart = i + 1;
                continue;
            }

            const interval = Math.abs(midis[i] - midis[i - 1]);
            if (interval > 5 || interval < 2) {
                this._checkArpeggioRun(notes, midis, runStart, i - 1, triadIntervals, patterns);
                runStart = i;
            }
        }

        this._checkArpeggioRun(notes, midis, runStart, midis.length - 1, triadIntervals, patterns);
        return patterns;
    }

    _checkArpeggioRun(notes, midis, start, end, knownArpeggios, patterns) {
        const length = end - start;
        if (length < 3) return;

        const intervals = [];
        for (let i = start + 1; i <= end; i++) {
            intervals.push(Math.abs(midis[i] - midis[i - 1]));
        }

        for (const pattern of knownArpeggios) {
            if (this._matchIntervalSequence(intervals, pattern)) {
                patterns.push({
                    type: 'arpeggio',
                    startIndex: start,
                    endIndex: end,
                    startBeat: notes[start].start,
                    endBeat: notes[end].start,
                    confidence: 0.75,
                    description: 'Chord arpeggio'
                });
                return;
            }
        }
    }

    _detectRepeatedMotifs(notes, midis) {
        const patterns = [];
        if (midis.length < 6) return patterns;

        const intervals = [];
        for (let i = 1; i < midis.length; i++) {
            intervals.push(midis[i] != null && midis[i-1] != null ? midis[i] - midis[i-1] : null);
        }

        const motifLengths = [3, 4, 5];
        for (const len of motifLengths) {
            for (let i = 0; i <= intervals.length - len * 2; i++) {
                const a = intervals.slice(i, i + len).join(',');
                for (let j = i + len; j <= intervals.length - len; j++) {
                    const b = intervals.slice(j, j + len).join(',');
                    if (a === b && !a.includes('null')) {
                        patterns.push({
                            type: 'motif',
                            startIndex: i,
                            endIndex: j + len,
                            startBeat: notes[i].start,
                            endBeat: notes[j + len - 1].start,
                            confidence: 0.7,
                            description: `Repeated motif (${len} notes)`
                        });
                        break;
                    }
                }
            }
        }

        return patterns;
    }

    _detectRhythmicPatterns(notes, bpm) {
        const patterns = [];
        if (notes.length < 6) return patterns;

        const durations = notes.map(n => Math.round(n.duration * 10) / 10);

        const patternLen = 4;
        for (let i = 0; i <= durations.length - patternLen * 2; i++) {
            const a = durations.slice(i, i + patternLen).join(',');
            for (let j = i + patternLen; j <= durations.length - patternLen; j++) {
                const b = durations.slice(j, j + patternLen).join(',');
                if (a === b) {
                    patterns.push({
                        type: 'rhythmic_pattern',
                        startIndex: i,
                        endIndex: j + patternLen - 1,
                        startBeat: notes[i].start,
                        endBeat: notes[j + patternLen - 1].start,
                        confidence: 0.65,
                        description: 'Repeated rhythm'
                    });
                    break;
                }
            }
        }

        return patterns;
    }

    _matchIntervalSequence(source, target) {
        if (source.length < target.length) return false;

        for (let offset = 0; offset <= source.length - target.length; offset++) {
            let match = true;
            for (let k = 0; k < target.length; k++) {
                if (source[offset + k] !== target[k]) {
                    match = false;
                    break;
                }
            }
            if (match) return true;
        }

        return false;
    }
}
