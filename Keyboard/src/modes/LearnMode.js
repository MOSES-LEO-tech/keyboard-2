import { NOTES } from '../utils/noteUtils.js';

export class LearnMode {
    constructor(stateManager) {
        this.stateManager = stateManager;
        this.name = 'learn';
        // Simple C Major scale for now
        this.targetScale = ['C', 'D', 'E', 'F', 'G', 'A', 'B']; 
    }

    enter() {
    }

    handleNote(noteEvent) {
        // Filter: Only allow notes in the scale
        // noteEvent.note is "C" or "C#" etc.
        const noteName = noteEvent.note; 
        
        if (this.targetScale.includes(noteName)) {
            return noteEvent;
        } else {
            if (noteEvent.type === 'noteOn') {
            }
            return null;
        }
    }

    exit() {
        // Cleanup
    }
}