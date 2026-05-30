/**
 * @typedef {Object} KeyPosition
 * @property {string} code - e.g. 'KeyQ', 'KeyW'
 * @property {number} x
 * @property {number} y
 * @property {number} row - 0 (digit row), 1 (QWERTY top), 2 (home), 3 (bottom)
 * @property {string} finger - 'pinky' | 'ring' | 'middle' | 'index' | 'thumb'
 * @property {string} hand - 'left' | 'right'
 */

/**
 * @typedef {Object} ErgonomicScore
 * @property {number} comfort - 0-100 (higher = better)
 * @property {number} fatigue - 0-100 (higher = worse)
 * @property {number} travelDistance - total finger travel in key-width units
 * @property {number} sameFingerRepetition - count of consecutive same-finger hits
 * @property {number} rowTransitions - count of row changes
 * @property {Object} fingerLoadDistribution - per-finger usage percentages
 */

export class ErgonomicAnalyzer {
    constructor() {
        this.keyGeometry = this._buildKeyGeometry();
    }

    /**
     * @returns {Map<string, KeyPosition>}
     */
    _buildKeyGeometry() {
        const map = new Map();

        // Row 0 — digit row (black keys)
        const digitRow = ['Digit1','Digit2','Digit3','Digit4','Digit5','Digit6','Digit7','Digit8','Digit9','Digit0','Minus','Equal'];
        digitRow.forEach((code, i) => {
            let finger = 'index';
            if (i <= 1) finger = 'pinky';
            else if (i === 2) finger = 'ring';
            else if (i === 3) finger = 'middle';
            else if (i <= 5) finger = 'index';
            else if (i <= 7) finger = 'index';
            else if (i === 8) finger = 'middle';
            else if (i === 9) finger = 'ring';
            else finger = 'pinky';

            map.set(code, {
                code, x: i * 1.0, y: 0, row: 0,
                finger,
                hand: i < 6 ? 'left' : 'right'
            });
        });

        // Row 1 — QWERTY top row
        const row1 = ['KeyQ','KeyW','KeyE','KeyR','KeyT','KeyY','KeyU','KeyI','KeyO','KeyP','BracketLeft','BracketRight'];
        row1.forEach((code, i) => {
            let finger = 'index';
            if (i <= 1) finger = 'pinky';
            else if (i === 2) finger = 'ring';
            else if (i === 3) finger = 'middle';
            else if (i <= 5) finger = 'index';
            else if (i <= 7) finger = 'index';
            else if (i === 8) finger = 'middle';
            else if (i === 9) finger = 'ring';
            else finger = 'pinky';

            map.set(code, {
                code, x: i * 1.0, y: 1.0, row: 1,
                finger,
                hand: i < 6 ? 'left' : 'right'
            });
        });

        // Row 2 — home row
        const row2 = ['KeyA','KeyS','KeyD','KeyF','KeyG','KeyH','KeyJ','KeyK','KeyL','Semicolon','Quote'];
        row2.forEach((code, i) => {
            let finger = 'index';
            if (i === 0) finger = 'pinky';
            else if (i === 1) finger = 'ring';
            else if (i === 2) finger = 'middle';
            else if (i <= 5) finger = 'index';
            else if (i <= 7) finger = 'index';
            else if (i === 8) finger = 'middle';
            else if (i === 9) finger = 'ring';
            else finger = 'pinky';

            map.set(code, {
                code, x: i * 1.0, y: 2.0, row: 2,
                finger,
                hand: i < 6 ? 'left' : 'right'
            });
        });

        // Row 3 — bottom row
        const row3 = ['KeyZ','KeyX','KeyC','KeyV','KeyB','KeyN','KeyM','Comma','Period','Slash'];
        row3.forEach((code, i) => {
            let finger = 'index';
            if (i === 0) finger = 'pinky';
            else if (i === 1) finger = 'ring';
            else if (i === 2) finger = 'middle';
            else if (i <= 5) finger = 'index';
            else if (i <= 7) finger = 'index';
            else if (i === 8) finger = 'middle';
            else if (i === 9) finger = 'ring';

            map.set(code, {
                code, x: i * 1.0, y: 3.0, row: 3,
                finger,
                hand: i < 6 ? 'left' : 'right'
            });
        });

        return map;
    }

    /**
     * @param {Object[]} keySequence - [{ code, key, hand }] ordered by time
     * @returns {ErgonomicScore}
     */
    analyze(keySequence) {
        if (!keySequence.length) {
            return { comfort: 100, fatigue: 0, travelDistance: 0, sameFingerRepetition: 0, rowTransitions: 0, fingerLoadDistribution: {} };
        }

        let totalTravel = 0;
        let sameFingerRepCount = 0;
        let rowTransitions = 0;
        const fingerCounts = { pinky: 0, ring: 0, middle: 0, index: 0, thumb: 0 };

        let prevPos = null;
        let prevFinger = null;
        let prevRow = null;

        for (const key of keySequence) {
            const pos = this.keyGeometry.get(key.code);
            if (!pos) continue;

            fingerCounts[pos.finger] = (fingerCounts[pos.finger] || 0) + 1;

            if (prevPos) {
                const dx = pos.x - prevPos.x;
                const dy = pos.y - prevPos.y;
                totalTravel += Math.sqrt(dx * dx + dy * dy);

                if (pos.finger === prevFinger) {
                    sameFingerRepCount++;
                }

                if (pos.row !== prevRow) {
                    rowTransitions++;
                }
            }

            prevPos = pos;
            prevFinger = pos.finger;
            prevRow = pos.row;
        }

        const totalFingerHits = Object.values(fingerCounts).reduce((a, b) => a + b, 0);
        const fingerDistribution = {};
        for (const [finger, count] of Object.entries(fingerCounts)) {
            fingerDistribution[finger] = totalFingerHits > 0
                ? Math.round((count / totalFingerHits) * 100)
                : 0;
        }

        const maxTravel = keySequence.length * 3;
        const travelScore = maxTravel > 0 ? Math.min(1, totalTravel / maxTravel) : 0;

        const repPenalty = keySequence.length > 1
            ? Math.min(1, sameFingerRepCount / (keySequence.length - 1))
            : 0;

        const rowPenalty = keySequence.length > 1
            ? Math.min(1, rowTransitions / (keySequence.length - 1))
            : 0;

        const fatigue = Math.round((travelScore * 0.4 + repPenalty * 0.35 + rowPenalty * 0.25) * 100);
        const comfort = Math.max(0, 100 - fatigue);

        return {
            comfort,
            fatigue,
            travelDistance: Math.round(totalTravel * 100) / 100,
            sameFingerRepetition: sameFingerRepCount,
            rowTransitions,
            fingerLoadDistribution: fingerDistribution
        };
    }

    /**
     * Get the distance between two keys in key-width units.
     */
    getDistance(code1, code2) {
        const p1 = this.keyGeometry.get(code1);
        const p2 = this.keyGeometry.get(code2);
        if (!p1 || !p2) return Infinity;

        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    getKeyPosition(code) {
        return this.keyGeometry.get(code) || null;
    }

    getFingerZone(code) {
        const pos = this.keyGeometry.get(code);
        return pos ? pos.finger : 'index';
    }
}
