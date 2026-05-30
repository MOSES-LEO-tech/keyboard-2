import { noteToMidi } from '../../utils/noteUtils.js';
import { getProfile } from './profiles.js';

/**
 * ReductionEngine applies difficulty rules to reduce note density
 * while preserving musical identity.
 *
 * CRITICAL RULES:
 *  1. NEVER delete melody notes
 *  2. NEVER destroy rhythmic groove
 *  3. NEVER alter song structure
 *  4. ALWAYS preserve downbeat anchors
 */

export class ReductionEngine {
    /**
     * @param {Object[]} notes - all notes flat array with priorities attached
     * @param {number[]} priorities - priority scores parallel to notes
     * @param {string} difficultyLabel - e.g. 'beginner', 'medium'
     * @param {Object} songAnalysis - from SongAnalyzer
     * @returns {Object[]} reduced notes array
     */
    reduce(notes, priorities, difficultyLabel, songAnalysis) {
        const profile = getProfile(difficultyLabel);
        if (!notes.length) return [];

        const enriched = notes.map((note, i) => ({
            ...note,
            priority: priorities[i] || 0.5,
            _originalIndex: i
        }));

        let result = [...enriched];

        result = this._filterLeftHand(result, profile);
        result = this._filterBelowPriority(result, profile);
        result = this._reduceChordSize(result, profile);
        result = this._filterFastNotes(result, profile);
        result = this._simplifyArpeggios(result, profile);
        result = this._filterGraceNotes(result, profile);
        result = this._filterOctaveDoubles(result, profile);
        result = this._enforceDensityCap(result, profile, songAnalysis?.bpm || 120);

        return result.sort((a, b) => a.start - b.start);
    }

    /**
     * Remove left hand notes for beginner/easy profiles.
     */
    _filterLeftHand(notes, profile) {
        if (profile.allowLeftHand) return notes;
        const filtered = notes.filter(n => n.hand !== 'left');
        if (filtered.length === 0) return notes;
        return filtered;
    }

    /**
     * Remove notes below the priority threshold (but never melody-essential).
     */
    _filterBelowPriority(notes, profile) {
        if (profile.priorityThreshold <= 0) return notes;

        return notes.filter(n => {
            if (n.priority >= 0.75) return true;
            if (n.priority >= profile.priorityThreshold) return true;

            const isDownbeat = (n.start % 1) < 0.08;
            if (isDownbeat && n.priority >= 0.4) return true;

            return false;
        });
    }

    /**
     * Reduce chord size — keep highest priority notes within chord.
     */
    _reduceChordSize(notes, profile) {
        const groups = this._groupByStartTime(notes);

        const reduced = [];
        for (const group of groups) {
            if (group.length <= profile.maxChordSize) {
                reduced.push(...group);
                continue;
            }

            const sorted = [...group].sort((a, b) => b.priority - a.priority);
            reduced.push(...sorted.slice(0, profile.maxChordSize));
        }

        return reduced;
    }

    /**
     * Remove very short notes that act as grace notes.
     */
    _filterFastNotes(notes, profile) {
        if (profile.minNoteDuration <= 0.01) return notes;

        return notes.filter(n => {
            if (n.duration >= profile.minNoteDuration) return true;

            const isStrongBeat = (n.start % 1) < 0.1;
            if (isStrongBeat && n.priority >= 0.5) return true;

            return false;
        });
    }

    /**
     * Simplify arpeggios to just the first and last note.
     */
    _simplifyArpeggios(notes, profile) {
        if (!profile.simplifyArpeggios) return notes;

        const result = [];
        let arpeggioRun = [];
        let lastEndBeat = -1;

        for (const note of notes) {
            const noteEnd = note.start + note.duration;
            const gap = note.start - lastEndBeat;

            if (gap < 0.05 && arpeggioRun.length > 0) {
                arpeggioRun.push(note);
            } else {
                if (arpeggioRun.length >= 4) {
                    const sorted = [...arpeggioRun].sort((a, b) => b.priority - a.priority);
                    const keep = sorted.slice(0, Math.min(2, sorted.length));
                    result.push(...keep);
                } else {
                    result.push(...arpeggioRun);
                }
                arpeggioRun = [note];
            }

            lastEndBeat = noteEnd;
        }

        if (arpeggioRun.length >= 4) {
            const sorted = [...arpeggioRun].sort((a, b) => b.priority - a.priority);
            result.push(...sorted.slice(0, 2));
        } else {
            result.push(...arpeggioRun);
        }

        return result;
    }

    /**
     * Remove grace notes (very short, low priority, off-beat).
     */
    _filterGraceNotes(notes, profile) {
        if (profile.keepGraceNotes) return notes;

        return notes.filter(n => {
            if (n.duration >= 0.1) return true;

            const isOnBeat = (n.start % 1) < 0.05;
            if (isOnBeat) return true;

            return n.priority >= 0.7;
        });
    }

    /**
     * Remove octave doubles — notes exactly 12 semitones apart at same time.
     */
    _filterOctaveDoubles(notes, profile) {
        if (profile.keepOctaveDoubles) return notes;

        const groups = this._groupByStartTime(notes);
        const result = [];

        for (const group of groups) {
            if (group.length <= 1) {
                result.push(...group);
                continue;
            }

            const midis = group.map(n => noteToMidi(n.note));
            const toRemove = new Set();

            for (let i = 0; i < group.length; i++) {
                for (let j = i + 1; j < group.length; j++) {
                    const diff = Math.abs(midis[i] - midis[j]);
                    if (diff === 12) {
                        if (group[i].priority >= group[j].priority) {
                            toRemove.add(j);
                        } else {
                            toRemove.add(i);
                        }
                    }
                }
            }

            for (let k = 0; k < group.length; k++) {
                if (!toRemove.has(k)) {
                    result.push(group[k]);
                }
            }
        }

        return result;
    }

    /**
     * Enforce maximum notes per second.
     */
    _enforceDensityCap(notes, profile, bpm) {
        if (!notes.length) return notes;

        const secondsPerBeat = 60 / bpm;
        const maxPerSecond = profile.maxNotesPerSecond;

        const sorted = [...notes].sort((a, b) => a.start - b.start);
        const result = [];
        let windowStart = sorted[0].start * secondsPerBeat;
        let windowCount = 0;

        for (const note of sorted) {
            const noteTime = note.start * secondsPerBeat;

            if (noteTime - windowStart > 1.0) {
                windowStart = noteTime;
                windowCount = 0;
            }

            windowCount++;
            if (windowCount <= maxPerSecond) {
                result.push(note);
            }
        }

        return result;
    }

    _groupByStartTime(notes) {
        const grouped = [];
        let currentGroup = [];
        let groupStart = -Infinity;

        const sorted = [...notes].sort((a, b) => a.start - b.start);

        for (const note of sorted) {
            if (Math.abs(note.start - groupStart) < 0.05) {
                currentGroup.push(note);
            } else {
                if (currentGroup.length) grouped.push(currentGroup);
                currentGroup = [note];
                groupStart = note.start;
            }
        }

        if (currentGroup.length) grouped.push(currentGroup);
        return grouped;
    }
}
