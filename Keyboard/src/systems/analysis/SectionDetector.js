import { noteToMidi } from '../../utils/noteUtils.js';

/**
 * @typedef {Object} Section
 * @property {number} startBeat
 * @property {number} endBeat
 * @property {string} type - 'intro' | 'verse' | 'chorus' | 'bridge' | 'solo' | 'outro' | 'unknown'
 * @property {number} confidence - 0-1
 */

export class SectionDetector {
    /**
     * @param {Object[]} notes - [{ note, start, duration, velocity }]
     * @param {number} bpm
     * @param {Object} [densityProfile] - from DensityAnalyzer
     * @returns {Section[]}
     */
    detect(notes, bpm, densityProfile) {
        if (!notes.length) return [];

        const secondsPerBeat = 60 / bpm;
        const maxBeats = Math.max(...notes.map(n => n.start + n.duration)) + 1;

        const densityWindows = densityProfile?.windows || this._buildDensityWindows(notes, bpm);
        const sections = this._segmentByDensity(densityWindows, notes, bpm);
        const labeled = this._labelSections(sections, notes, maxBeats);

        return labeled;
    }

    _buildDensityWindows(notes, bpm) {
        const secondsPerBeat = 60 / bpm;
        const maxTime = Math.max(...notes.map(n => (n.start + n.duration) * secondsPerBeat));
        const windowSize = 4;
        const step = 2;
        const windows = [];

        for (let t = 0; t < maxTime; t += step) {
            const windowEnd = t + windowSize;
            let count = 0;
            for (const note of notes) {
                const ns = note.start * secondsPerBeat;
                if (ns >= t && ns < windowEnd) count++;
            }
            windows.push({ startTime: t, endTime: windowEnd, noteCount: count });
        }

        return windows;
    }

    _segmentByDensity(densityWindows, notes, bpm) {
        if (!densityWindows.length) return [];

        const counts = densityWindows.map(w => w.noteCount);
        const avgCount = counts.reduce((a, b) => a + b, 0) / counts.length;
        const maxCount = Math.max(...counts);

        const windowsPerSection = Math.max(2, Math.floor(densityWindows.length / 8));
        const sections = [];
        let segmentStart = 0;

        while (segmentStart < densityWindows.length) {
            const segmentEnd = Math.min(segmentStart + windowsPerSection, densityWindows.length);
            const segmentWindows = densityWindows.slice(segmentStart, segmentEnd);
            const segAvg = segmentWindows.reduce((s, w) => s + w.noteCount, 0) / segmentWindows.length;

            sections.push({
                startBeat: this._secondsToBeats(segmentWindows[0].startTime, bpm),
                endBeat: this._secondsToBeats(segmentWindows[segmentWindows.length - 1].endTime, bpm),
                avgDensity: segAvg,
                relativeDensity: maxCount > 0 ? segAvg / maxCount : 0,
                length: segmentWindows.length
            });

            segmentStart = segmentEnd;
        }

        return sections;
    }

    _labelSections(sections, notes, maxBeats) {
        if (!sections.length) return [];

        const relativeDensities = sections.map(s => s.relativeDensity);
        const avgRelDensity = relativeDensities.reduce((a, b) => a + b, 0) / relativeDensities.length;

        const labeled = sections.map((s, i) => {
            let type = 'unknown';
            let confidence = 0.5;

            if (i === 0) {
                if (s.relativeDensity < avgRelDensity * 0.7) {
                    type = 'intro';
                    confidence = 0.7;
                } else {
                    type = 'verse';
                    confidence = 0.5;
                }
            } else if (i === sections.length - 1) {
                if (s.relativeDensity < avgRelDensity * 0.7) {
                    type = 'outro';
                    confidence = 0.7;
                } else {
                    type = 'chorus';
                    confidence = 0.4;
                }
            } else if (s.relativeDensity > avgRelDensity * 1.3) {
                type = 'chorus';
                confidence = 0.65;
            } else if (s.relativeDensity < avgRelDensity * 0.6) {
                type = 'bridge';
                confidence = 0.55;
            } else {
                type = 'verse';
                confidence = 0.5;
            }

            return {
                startBeat: Math.round(s.startBeat * 100) / 100,
                endBeat: Math.round(s.endBeat * 100) / 100,
                type,
                confidence
            };
        });

        return this._mergeAdjacentSections(labeled);
    }

    _mergeAdjacentSections(sections) {
        if (sections.length <= 1) return sections;

        const merged = [sections[0]];

        for (let i = 1; i < sections.length; i++) {
            const prev = merged[merged.length - 1];
            const curr = sections[i];

            if (prev.type === curr.type) {
                prev.endBeat = curr.endBeat;
                prev.confidence = Math.max(prev.confidence, curr.confidence);
            } else {
                merged.push(curr);
            }
        }

        return merged;
    }

    _secondsToBeats(seconds, bpm) {
        return (seconds * bpm) / 60;
    }
}
