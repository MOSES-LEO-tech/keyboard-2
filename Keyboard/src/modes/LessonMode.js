export class LessonMode {
    constructor(stateManager) {
        this.stateManager = stateManager;
        this.name = 'lesson';
    }

    enter() {
    }

    handleNote(noteEvent) {
        if (noteEvent.type === 'noteOn') {
            const noteName = noteEvent.fullName; // e.g. "C4"

            // Check against sequencer
            if (window.app.sequencer && window.app.sequencer.isPlaying) {
                window.app.sequencer.advance(noteName);
            }
        }

        return noteEvent; // Always allow sound in lesson mode (so user hears what they play)
    }

    exit() {
        if (window.app.sequencer) {
            window.app.sequencer.stop();
        }
    }
}
