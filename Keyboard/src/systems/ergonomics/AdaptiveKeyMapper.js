import { noteToMidi } from '../../utils/noteUtils.js';

/**
 * AdaptiveKeyMapper maps MIDI notes to QWERTY keyboard keys.
 * It considers: hand assignment, pitch ordering, ergonomic comfort.
 */

export class AdaptiveKeyMapper {
    constructor(ergonomicAnalyzer) {
        this.ergonomic = ergonomicAnalyzer;
    }

    /**
     * @param {Object[]} notes - reduced notes [{ note, hand, start, duration }]
     * @param {string} [layoutType='standard'] - 'standard' | 'compact' | 'split'
     * @returns {Object[]} notes with added { code, key, finger } mappings
     */
    mapArrangement(notes, layoutType = 'standard') {
        if (!notes.length) return [];

        const rightHand = notes.filter(n => n.hand === 'right');
        const leftHand = notes.filter(n => n.hand === 'left');

        const rightKeys = this._getHandKeys('right', layoutType);
        const leftKeys = this._getHandKeys('left', layoutType);

        const mapped = [];

        if (rightHand.length) {
            mapped.push(...this._mapHand(rightHand, rightKeys));
        }

        if (leftHand.length) {
            mapped.push(...this._mapHand(leftHand, leftKeys));
        }

        return mapped.sort((a, b) => a.start - b.start);
    }

    /**
     * Map a single hand's notes to available keys.
     * Strategy: sort notes by pitch, assign lowest pitch to leftmost key.
     */
    _mapHand(notes, availableKeys) {
        if (!notes.length || !availableKeys.length) return notes;

        const midis = notes.map(n => noteToMidi(n.note));
        const uniquePitches = [...new Set(midis)].filter(m => m >= 0).sort((a, b) => a - b);

        const pitchToKey = new Map();
        const keysPerPitch = Math.max(1, Math.floor(availableKeys.length / Math.max(1, uniquePitches.length)));

        uniquePitches.forEach((pitch, idx) => {
            const keyIdx = Math.min(idx * keysPerPitch, availableKeys.length - 1);
            pitchToKey.set(pitch, availableKeys[keyIdx]);
        });

        // For pitches beyond the key range, wrap around
        const mapped = notes.map(note => {
            const midi = noteToMidi(note.note);
            if (midi >= 0 && pitchToKey.has(midi)) {
                const keyInfo = pitchToKey.get(midi);
                return {
                    ...note,
                    code: keyInfo.code,
                    key: keyInfo.code,
                    finger: keyInfo.finger,
                    handSide: keyInfo.hand
                };
            }

            const closest = this._findClosestMappedPitch(midi, pitchToKey);
            if (closest) {
                return {
                    ...note,
                    code: closest.code,
                    key: closest.code,
                    finger: closest.finger,
                    handSide: closest.hand
                };
            }

            return note;
        });

        return mapped;
    }

    _findClosestMappedPitch(targetMidi, pitchToKey) {
        let bestDist = Infinity;
        let bestKey = null;

        for (const [pitch, key] of pitchToKey) {
            const dist = Math.abs(pitch - targetMidi);
            if (dist < bestDist) {
                bestDist = dist;
                bestKey = key;
            }
        }

        return bestKey;
    }

    /**
     * Get available keys for a hand in the given layout.
     */
    _getHandKeys(hand, layoutType) {
        const allLeft = [
            { code: 'KeyA', finger: 'pinky', hand: 'left' },
            { code: 'KeyS', finger: 'ring', hand: 'left' },
            { code: 'KeyD', finger: 'middle', hand: 'left' },
            { code: 'KeyF', finger: 'index', hand: 'left' },
            { code: 'KeyG', finger: 'index', hand: 'left' },
            { code: 'KeyQ', finger: 'pinky', hand: 'left' },
            { code: 'KeyW', finger: 'ring', hand: 'left' },
            { code: 'KeyE', finger: 'middle', hand: 'left' },
            { code: 'KeyR', finger: 'index', hand: 'left' },
            { code: 'KeyT', finger: 'index', hand: 'left' },
            { code: 'KeyZ', finger: 'pinky', hand: 'left' },
            { code: 'KeyX', finger: 'ring', hand: 'left' },
            { code: 'KeyC', finger: 'middle', hand: 'left' },
            { code: 'KeyV', finger: 'index', hand: 'left' },
            { code: 'Digit1', finger: 'pinky', hand: 'left' },
            { code: 'Digit2', finger: 'ring', hand: 'left' },
            { code: 'Digit3', finger: 'middle', hand: 'left' },
            { code: 'Digit4', finger: 'index', hand: 'left' },
            { code: 'Digit5', finger: 'index', hand: 'left' },
        ];

        const allRight = [
            { code: 'KeyJ', finger: 'index', hand: 'right' },
            { code: 'KeyK', finger: 'middle', hand: 'right' },
            { code: 'KeyL', finger: 'ring', hand: 'right' },
            { code: 'Semicolon', finger: 'pinky', hand: 'right' },
            { code: 'KeyH', finger: 'index', hand: 'right' },
            { code: 'KeyU', finger: 'index', hand: 'right' },
            { code: 'KeyI', finger: 'middle', hand: 'right' },
            { code: 'KeyO', finger: 'ring', hand: 'right' },
            { code: 'KeyP', finger: 'pinky', hand: 'right' },
            { code: 'Quote', finger: 'pinky', hand: 'right' },
            { code: 'KeyN', finger: 'index', hand: 'right' },
            { code: 'KeyM', finger: 'middle', hand: 'right' },
            { code: 'Comma', finger: 'ring', hand: 'right' },
            { code: 'Period', finger: 'pinky', hand: 'right' },
            { code: 'Digit6', finger: 'index', hand: 'right' },
            { code: 'Digit7', finger: 'index', hand: 'right' },
            { code: 'Digit8', finger: 'middle', hand: 'right' },
            { code: 'Digit9', finger: 'ring', hand: 'right' },
            { code: 'Digit0', finger: 'pinky', hand: 'right' },
        ];

        const sourceKeys = hand === 'left' ? allLeft : allRight;

        if (layoutType === 'compact') {
            return sourceKeys.slice(0, 8);
        }

        return sourceKeys;
    }
}
