import { DensityAnalyzer } from './DensityAnalyzer.js';
import { MelodyDetector } from './MelodyDetector.js';
import { ChordAnalyzer } from './ChordAnalyzer.js';
import { SectionDetector } from './SectionDetector.js';
import { PatternRecognizer } from './PatternRecognizer.js';
import { noteToMidi } from '../../utils/noteUtils.js';

/**
 * @typedef {Object} SongAnalysis
 * @property {number} bpm
 * @property {number} totalNotes
 * @property {number} durationBeats
 * @property {Object} density - DensityProfile
 * @property {Object} melody - ImportanceScore[]
 * @property {Object} chords - chord analysis result
 * @property {Object[]} sections - Section[]
 * @property {Object[]} patterns - RecognizedPattern[]
 * @property {Object} stats - aggregated statistics
 */

export class SongAnalyzer {
    constructor() {
        this.densityAnalyzer = new DensityAnalyzer();
        this.melodyDetector = new MelodyDetector();
        this.chordAnalyzer = new ChordAnalyzer();
        this.sectionDetector = new SectionDetector();
        this.patternRecognizer = new PatternRecognizer();
    }

    /**
     * @param {Object[]} tracks - [{ hand, instrument, notes: [{ note, start, duration, velocity }] }]
     * @param {number} bpm
     * @returns {SongAnalysis}
     */
    analyze(tracks, bpm) {
        const allNotes = tracks.flatMap((track, trackIdx) =>
            track.notes.map((note, noteIdx) => ({
                ...note,
                trackIndex: trackIdx,
                noteIndex: noteIdx,
                hand: track.hand || 'right',
                instrument: track.instrument || 'piano'
            }))
        ).sort((a, b) => a.start - b.start);

        if (!allNotes.length) {
            return this._emptyAnalysis(bpm);
        }

        const durationBeats = Math.max(...allNotes.map(n => n.start + n.duration)) + 1;

        const density = this.densityAnalyzer.analyze(allNotes, bpm);
        const melody = this.melodyDetector.analyze(allNotes, bpm);
        const chords = this.chordAnalyzer.analyze(allNotes);
        const sections = this.sectionDetector.detect(allNotes, bpm, density);
        const patterns = this.patternRecognizer.recognize(allNotes, bpm);

        const stats = this._computeStats(allNotes, melody, density, chords, patterns);

        return {
            bpm,
            totalNotes: allNotes.length,
            durationBeats: Math.round(durationBeats * 100) / 100,
            density,
            melody,
            chords,
            sections,
            patterns,
            stats
        };
    }

    _computeStats(allNotes, melody, density, chords, patterns) {
        const handCounts = { left: 0, right: 0 };
        allNotes.forEach(n => {
            if (n.hand === 'left') handCounts.left++;
            else handCounts.right++;
        });

        const midis = allNotes.map(n => noteToMidi(n.note)).filter(m => m >= 0);
        const pitchRange = midis.length > 1
            ? Math.max(...midis) - Math.min(...midis)
            : 0;

        const velocityValues = allNotes.map(n => n.velocity || 100);
        const avgVelocity = velocityValues.reduce((a, b) => a + b, 0) / velocityValues.length;

        const melodyThreshold = 0.5;
        const melodyNotes = melody.filter(m => m.importance >= melodyThreshold).length;

        const scalePatterns = patterns.filter(p => p.type === 'scale').length;
        const arpeggioPatterns = patterns.filter(p => p.type === 'arpeggio').length;
        const motifPatterns = patterns.filter(p => p.type === 'motif').length;

        return {
            handDistribution: handCounts,
            pitchRange,
            avgVelocity: Math.round(avgVelocity),
            melodyNoteCount: melodyNotes,
            melodyNotePercent: Math.round((melodyNotes / allNotes.length) * 100),
            peakDensity: density.peakDensity,
            avgDensity: density.avgDensity,
            peakSimultaneous: density.peakSimultaneous,
            maxChordSize: chords.maxChordSize,
            avgChordSize: chords.avgChordSize,
            sectionCount: chords.chordGroups.length,
            patternCounts: {
                scales: scalePatterns,
                arpeggios: arpeggioPatterns,
                motifs: motifPatterns
            }
        };
    }

    _emptyAnalysis(bpm) {
        return {
            bpm,
            totalNotes: 0,
            durationBeats: 0,
            density: { windows: [], peakDensity: 0, avgDensity: 0, peakSimultaneous: 0 },
            melody: [],
            chords: { chordGroups: [], maxChordSize: 0, avgChordSize: 0 },
            sections: [],
            patterns: [],
            stats: {
                handDistribution: { left: 0, right: 0 },
                pitchRange: 0,
                avgVelocity: 0,
                melodyNoteCount: 0,
                melodyNotePercent: 0,
                peakDensity: 0,
                avgDensity: 0,
                peakSimultaneous: 0,
                maxChordSize: 0,
                avgChordSize: 0,
                sectionCount: 0,
                patternCounts: { scales: 0, arpeggios: 0, motifs: 0 }
            }
        };
    }
}
