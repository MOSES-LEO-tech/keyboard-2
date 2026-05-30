/**
 * @typedef {Object} DensityWindow
 * @property {number} startTime - beat position
 * @property {number} endTime - beat position
 * @property {number} noteCount
 * @property {number} maxSimultaneous
 * @property {number} notesPerSecond
 */

/**
 * @typedef {Object} DensityProfile
 * @property {DensityWindow[]} windows
 * @property {number} peakDensity
 * @property {number} avgDensity
 * @property {number} peakSimultaneous
 */

export class DensityAnalyzer {
    /**
     * @param {Object[]} notes - flat note array with { start, duration, note }
     * @param {number} bpm
     * @param {number} [windowSeconds=2]
     * @returns {DensityProfile}
     */
    analyze(notes, bpm, windowSeconds = 2) {
        if (!notes.length) {
            return { windows: [], peakDensity: 0, avgDensity: 0, peakSimultaneous: 0 };
        }

        const secondsPerBeat = 60 / bpm;
        const maxTime = Math.max(...notes.map(n => (n.start + n.duration) * secondsPerBeat));
        const windowSize = windowSeconds;
        const step = windowSize / 2;

        const windows = [];
        let peakDensity = 0;
        let peakSimultaneous = 0;
        let totalDensity = 0;

        for (let t = 0; t < maxTime; t += step) {
            const windowEnd = t + windowSize;
            const notesInWindow = [];

            for (const note of notes) {
                const noteStartBeats = note.start;
                const noteEndBeats = note.start + note.duration;
                const noteStartSec = noteStartBeats * secondsPerBeat;
                const noteEndSec = noteEndBeats * secondsPerBeat;

                if (noteStartSec < windowEnd && noteEndSec > t) {
                    notesInWindow.push(note);
                }
            }

            const noteCount = notesInWindow.length;
            const notesPerSecond = noteCount / windowSize;

            const simultaneous = this._countMaxSimultaneous(notesInWindow, windowSize);

            windows.push({
                startTime: t,
                endTime: windowEnd,
                noteCount,
                maxSimultaneous: simultaneous,
                notesPerSecond: Math.round(notesPerSecond * 100) / 100
            });

            peakDensity = Math.max(peakDensity, notesPerSecond);
            peakSimultaneous = Math.max(peakSimultaneous, simultaneous);
            totalDensity += notesPerSecond;
        }

        const avgDensity = windows.length > 0 ? totalDensity / windows.length : 0;

        return {
            windows,
            peakDensity: Math.round(peakDensity * 100) / 100,
            avgDensity: Math.round(avgDensity * 100) / 100,
            peakSimultaneous
        };
    }

    /**
     * Count maximum simultaneous notes within a time tolerance
     */
    _countMaxSimultaneous(notes, timeWindow) {
        if (!notes.length) return 0;

        const sorted = [...notes].sort((a, b) => a.start - b.start);
        let max = 0;

        for (let i = 0; i < sorted.length; i++) {
            let count = 1;
            const baseTime = sorted[i].start;

            for (let j = i + 1; j < sorted.length; j++) {
                if (Math.abs(sorted[j].start - baseTime) < 0.05) {
                    count++;
                } else {
                    break;
                }
            }
            max = Math.max(max, count);
        }

        return max;
    }
}
