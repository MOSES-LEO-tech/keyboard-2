import { SongAnalyzer } from '../analysis/SongAnalyzer.js';
import { PriorityScorer } from '../difficulty/PriorityScorer.js';
import { ReductionEngine } from '../difficulty/ReductionEngine.js';
import { ErgonomicAnalyzer } from '../ergonomics/ErgonomicAnalyzer.js';
import { AdaptiveKeyMapper } from '../ergonomics/AdaptiveKeyMapper.js';
import { PlayabilityValidator } from '../layout/PlayabilityValidator.js';
import { getProfile, LEGACY_LABEL_MAP } from '../difficulty/profiles.js';

/**
 * @typedef {Object} DifficultyMap
 * @property {Object} metadata - { difficulty, bpm, songTitle, generatedAt, sourceNotes, reducedNotes, reductionPercent }
 * @property {Object[]} noteMappings - [{ note, start, duration, hand, priority, code, finger }]
 * @property {Object} analysis - SongAnalysis
 * @property {Object} ergonomicScores - ErgonomicScore
 * @property {Object} validation - ValidationResult
 */

/**
 * ArrangementGenerator orchestrates the full pipeline:
 *   MIDI notes → Analysis → Priority → Reduction → Key Mapping → Validation → DifficultyMap
 */
export class ArrangementGenerator {
    constructor() {
        this.songAnalyzer = new SongAnalyzer();
        this.priorityScorer = new PriorityScorer();
        this.reductionEngine = new ReductionEngine();
        this.ergonomicAnalyzer = new ErgonomicAnalyzer();
        this.keyMapper = new AdaptiveKeyMapper(this.ergonomicAnalyzer);
        this.validator = new PlayabilityValidator();
    }

    /**
     * Generate all difficulty arrangements from a parsed song.
     *
     * @param {Object} parsedSong - output of MidiService.parseMidiFile()
     * @param {string[]} [difficulties] - which levels to generate
     * @returns {Object<string, DifficultyMap>}
     */
    generateAll(parsedSong, difficulties = null) {
        const levels = difficulties || ['beginner', 'easy', 'medium', 'hard', 'expert'];
        const results = {};

        for (const level of levels) {
            results[level] = this.generate(parsedSong, level);
        }

        return results;
    }

    /**
     * Generate a single difficulty arrangement.
     *
     * @param {Object} parsedSong
     * @param {string} difficultyLabel
     * @returns {DifficultyMap}
     */
    generate(parsedSong, difficultyLabel) {
        const { bpm, tracks, title } = parsedSong;
        const allNotes = tracks.flatMap((track, ti) =>
            track.notes.map((n, ni) => ({
                ...n,
                hand: track.hand || 'right',
                trackIndex: ti,
                noteIndex: ni
            }))
        );

        const analysis = this.songAnalyzer.analyze(tracks, bpm);
        const priorities = this.priorityScorer.scoreNotes(allNotes, analysis);

        const reduced = this.reductionEngine.reduce(allNotes, priorities, difficultyLabel, analysis);
        const mapped = this.keyMapper.mapArrangement(reduced);

        const ergonomicScores = this.ergonomicAnalyzer.analyze(mapped);
        const validation = this.validator.validate(mapped, difficultyLabel, bpm, ergonomicScores);

        const noteMappings = mapped.map((n, i) => ({
            note: n.note,
            start: n.start,
            duration: n.duration,
            velocity: n.velocity || 100,
            hand: n.hand,
            priority: n.priority || priorities[n._originalIndex || i] || 0.5,
            code: n.code || null,
            finger: n.finger || null
        }));

        const sourceNotes = allNotes.length;
        const reducedNotes = noteMappings.length;
        const reductionPercent = sourceNotes > 0
            ? Math.round(((sourceNotes - reducedNotes) / sourceNotes) * 100)
            : 0;

        return {
            metadata: {
                difficulty: difficultyLabel,
                bpm,
                songTitle: title || 'Untitled',
                generatedAt: new Date().toISOString(),
                sourceNotes,
                reducedNotes,
                reductionPercent,
            },
            noteMappings,
            analysis,
            ergonomicScores,
            validation,
        };
    }
}
