export const CONFIG = {
    audio: {
        sampleRate: 44100,
        polyphony: 10,
        effectsQuality: 'low',
        masterVolume: 0.9
    },
    ui: {
        theme: 'dark',
        particleCount: 4,
        renderThrottle: 30,
        showParticles: true
    },
    difficulty: {
        enabled: true,
        difficultyRange: {
            veryEasy: { min: 0, max: 15 },
            easy: { min: 15, max: 30 },
            medium: { min: 30, max: 50 },
            hard: { min: 50, max: 70 },
            veryHard: { min: 70, max: 100 }
        },
        weights: {
            noteDensity: 0.35,
            tempo: 0.25,
            chordComplexity: 0.2,
            handSpan: 0.1,
            velocity: 0.05,
            polyphony: 0.05
        }
    }
};
