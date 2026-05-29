export class FreePlayMode {
    constructor(stateManager) {
        this.stateManager = stateManager;
        this.name = 'free_play';
    }

    enter() {
        this.stateManager.setState({ scaleLock: null });
    }

    handleNote(noteEvent) {
        // Pass everything through
        return noteEvent;
    }

    exit() {
        // Cleanup
    }
}