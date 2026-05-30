/**
 * @typedef {Object} DifficultyProfile
 * @property {string} name
 * @property {number} maxSimultaneousNotes
 * @property {number} maxNotesPerSecond
 * @property {number} maxJumpDistance - in semitones
 * @property {number} minNoteDuration - in seconds
 * @property {boolean} allowChords
 * @property {boolean} allowLeftHand
 * @property {boolean} preserveMeter
 * @property {boolean} simplifyArpeggios
 * @property {number} priorityThreshold - notes below this importance are candidates for removal
 * @property {number} maxChordSize
 * @property {boolean} keepOctaveDoubles
 * @property {boolean} keepGraceNotes
 */

/** @type {Object<string, DifficultyProfile>} */
export const DIFFICULTY_PROFILES = {
    beginner: {
        name: 'beginner',
        maxSimultaneousNotes: 2,
        maxNotesPerSecond: 4,
        maxJumpDistance: 6,
        minNoteDuration: 0.25,
        allowChords: false,
        allowLeftHand: true,
        preserveMeter: true,
        simplifyArpeggios: true,
        priorityThreshold: 0.65,
        maxChordSize: 1,
        keepOctaveDoubles: false,
        keepGraceNotes: false,
    },

    easy: {
        name: 'easy',
        maxSimultaneousNotes: 2,
        maxNotesPerSecond: 6,
        maxJumpDistance: 9,
        minNoteDuration: 0.15,
        allowChords: true,
        allowLeftHand: true,
        preserveMeter: true,
        simplifyArpeggios: true,
        priorityThreshold: 0.50,
        maxChordSize: 2,
        keepOctaveDoubles: false,
        keepGraceNotes: false,
    },

    medium: {
        name: 'medium',
        maxSimultaneousNotes: 4,
        maxNotesPerSecond: 10,
        maxJumpDistance: 16,
        minNoteDuration: 0.08,
        allowChords: true,
        allowLeftHand: true,
        preserveMeter: true,
        simplifyArpeggios: false,
        priorityThreshold: 0.35,
        maxChordSize: 3,
        keepOctaveDoubles: false,
        keepGraceNotes: true,
    },

    hard: {
        name: 'hard',
        maxSimultaneousNotes: 6,
        maxNotesPerSecond: 16,
        maxJumpDistance: 24,
        minNoteDuration: 0.04,
        allowChords: true,
        allowLeftHand: true,
        preserveMeter: true,
        simplifyArpeggios: false,
        priorityThreshold: 0.20,
        maxChordSize: 4,
        keepOctaveDoubles: true,
        keepGraceNotes: true,
    },

    expert: {
        name: 'expert',
        maxSimultaneousNotes: 10,
        maxNotesPerSecond: 30,
        maxJumpDistance: 48,
        minNoteDuration: 0.01,
        allowChords: true,
        allowLeftHand: true,
        preserveMeter: true,
        simplifyArpeggios: false,
        priorityThreshold: 0.05,
        maxChordSize: 6,
        keepOctaveDoubles: true,
        keepGraceNotes: true,
    }
};

/**
 * Maps old difficulty labels to profile keys.
 */
export const LEGACY_LABEL_MAP = {
    'veryEasy': 'beginner',
    'easy': 'easy',
    'medium': 'medium',
    'hard': 'hard',
    'veryHard': 'expert',
    'beginner': 'beginner',
    'custom': 'medium'
};

/**
 * @param {string} label
 * @returns {DifficultyProfile}
 */
export function getProfile(label) {
    const key = LEGACY_LABEL_MAP[label] || 'medium';
    return DIFFICULTY_PROFILES[key] || DIFFICULTY_PROFILES.medium;
}
