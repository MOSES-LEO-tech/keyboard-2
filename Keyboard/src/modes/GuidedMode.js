export class GuidedMode {
    constructor(stateManager, sequencer, ui) {
        this.stateManager = stateManager;
        this.sequencer = sequencer;
        this.ui = ui;
        this.name = 'guided';
        this.isWaitingForNote = false;
        this.currentTargetNotes = [];
        this.onNoteRequired = null; // Callback for UI updates
        this.onWrongNote = null; // Callback for wrong note feedback
    }

    enter() {
        this.isWaitingForNote = false;
        this.currentTargetNotes = [];
        this.setupSequencerCallbacks();
        this.ui.showGuidedIndicator('Press any key to start');
    }

    setupSequencerCallbacks() {
        if (this.sequencer) {
            const guidedCallback = (notes) => {
                this.currentTargetNotes = Array.isArray(notes) ? notes : [notes];
                this.isWaitingForNote = true;
                this.ui.highlightNextNote(this.currentTargetNotes);

                if (this.onNoteRequired) {
                    this.onNoteRequired(this.currentTargetNotes);
                }

                if (this.currentTargetNotes.length > 1) {
                    this.ui.showGuidedIndicator('Play these notes together');
                } else {
                    this.ui.showGuidedIndicator('Play the highlighted note');
                }
            };

            this.sequencer.onNoteRequired = guidedCallback;
        }
    }

    handleNote(noteEvent) {
        if (noteEvent.type === 'noteOn') {
            const playedNote = noteEvent.fullName;

            if (this.isWaitingForNote) {
                const isMatch = this.currentTargetNotes.includes(playedNote);

                if (isMatch) {
                    const index = this.currentTargetNotes.indexOf(playedNote);
                    this.currentTargetNotes.splice(index, 1);
                    this.ui.showCorrectNote(playedNote);

                    if (this.currentTargetNotes.length === 0) {
                        this.isWaitingForNote = false;
                        if (this.sequencer) {
                            this.sequencer.advance(playedNote);
                        }
                        this.ui.showGuidedIndicator('Good! Next note...');
                    } else {
                        this.ui.showGuidedIndicator('Keep holding...');
                    }

                    return noteEvent;
                } else {
                    this.ui.showWrongNote(playedNote);

                    if (this.onWrongNote) {
                        this.onWrongNote(playedNote);
                    }

                    this.playErrorSound();
                    return null;
                }
            } else {
                return noteEvent;
            }
        }

        return noteEvent;
    }

    playErrorSound() {
        // Play a subtle error sound using the audio engine
        if (window.app && window.app.audio) {
            try {
                // Create a short low-frequency beep
                const ctx = window.app.audio.context;
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.type = 'sine';
                osc.frequency.setValueAtTime(150, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);

                gain.gain.setValueAtTime(0.1, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + 0.1);
            } catch (e) {
            }
        }
    }

    exit() {
        this.isWaitingForNote = false;
        this.currentTargetNotes = [];

        // Cleanup UI
        this.ui.clearHighlights();
        this.ui.hideGuidedIndicator();
        this.ui.hideProgressBar();

        // Stop sequencer
        if (this.sequencer) {
            this.sequencer.stop();
        }
    }
}
