// Musical constants and helpers

export const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const NOTE_INDEX_MAP = {
    'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5,
    'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11
};

/**
 * Convert note name like "C4" or "F#3" to MIDI number (0-127).
 */
export function noteToMidi(noteName) {
    if (!noteName) return -1;
    const match = noteName.match(/^([A-G]#?)(-?\d)$/);
    if (!match) return -1;
    const note = match[1];
    const octave = parseInt(match[2]);
    const noteIndex = NOTE_INDEX_MAP[note];
    if (noteIndex === undefined) return -1;
    return noteIndex + (octave + 1) * 12;
}

/**
 * Convert MIDI number to note name like "C4".
 */
export function midiToNote(midi) {
    if (midi < 0 || midi > 127) return null;
    const octave = Math.floor(midi / 12) - 1;
    const noteIndex = midi % 12;
    return `${NOTES[noteIndex]}${octave}`;
}

export function getNoteFromOffset(baseOctave, offset) {
    const totalSemis = (baseOctave * 12) + offset;
    const octave = Math.floor(totalSemis / 12);
    const noteIndex = totalSemis % 12;
    return {
        note: NOTES[noteIndex],
        octave: octave,
        fullName: `${NOTES[noteIndex]}${octave}`,
        midi: totalSemis + 12 // MIDI C4 is 60. If baseOctave is 4 (C4), offset 0 -> 48 + 12 = 60.
    };
}

export function getFrequency(note, octave) {
    // A4 = 440Hz
    // MIDI A4 = 69
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const noteIndex = notes.indexOf(note);
    if (noteIndex === -1) return 0;
    
    const semitonesFromC4 = (octave - 4) * 12 + (noteIndex - 9); // -9 because A is index 9
    // Actually easier: calculate distance from A4
    // MIDI number calculation
    const midi = (octave + 1) * 12 + noteIndex;
    const frequency = 440 * Math.pow(2, (midi - 69) / 12);
    return frequency;
}
