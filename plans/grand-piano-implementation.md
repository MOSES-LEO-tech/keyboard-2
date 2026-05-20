# Grand Piano Implementation Plan

## Overview
Add a grand piano instrument to the keyboard application using high-quality samples from a different source than the existing Salamander piano.

## Implementation Steps

### 1. Research Available Tone.js Grand Piano Sample Libraries

Tone.js provides several high-quality piano sample libraries:

| Library | Source | Quality | Notes |
|---------|--------|---------|-------|
| **Steinway Grand** | `tonejs-instruments` | High | Professional Steinway B recordings |
| **Yamaha CFX** | `tonejs-instruments` | High | Premium concert grand |
| **Salamander** (existing) | `tonejs` | Medium | Already used for standard piano |

**Recommended Source**: The [tonejs-instruments](https://github.com/s-tonejs/tonejs-instruments) collection provides professionally recorded grand piano samples with:
- Multiple velocity layers
- Full key range (A0-C8)
- High-quality release samples
- Both Steinway and Yamaha grand piano options

### 2. Create GrandPianoInstrument.js

**File**: `Keyboard/src/instruments/GrandPianoInstrument.js`

**Design**:
```javascript
import { BaseInstrument } from './BaseInstrument.js';

export class GrandPianoInstrument extends BaseInstrument {
    constructor(options = {}) {
        super();
        const profile = options.profile || 'steinway'; // Default to Steinway
        
        // Sample library configuration
        const sampleConfig = {
            steinway: {
                name: 'Steinway Grand',
                baseUrl: 'https://tonejs.github.io/audio/steinway/',
                urls: {
                    // Full key range mappings
                },
                onload: () => { /* dispatch event */ }
            },
            yamaha: {
                name: 'Yamaha CFX',
                baseUrl: 'https://tonejs.github.io/audio/cfx/',
                // CFX sample configuration
            }
        };
        
        // Audio chain: Sampler -> EQ -> Compressor -> Reverb -> Output
        this.sampler = new Tone.Sampler({
            ...sampleConfig[profile],
            release: 2, // Longer release for grand piano resonance
        });
        
        this.eq = new Tone.EQ3({
            low: 0,
            mid: 0,
            high: 0
        });
        
        this.compressor = new Tone.Compressor({
            threshold: -24,
            ratio: 4,
            attack: 0.003,
            release: 0.25
        });
        
        this.reverb = new Tone.Reverb({
            decay: 3.5, // Longer reverb for concert hall feel
            preDelay: 0.1,
            wet: 0.25
        });
        
        // Connect audio chain
        this.sampler.chain(this.eq, this.compressor, this.reverb);
        this.output = this.reverb;
        
        // Generate reverb on first note play
        this._reverbReady = false;
    }
    
    noteOn(note, velocity = 1, time) {
        if (!this._reverbReady) {
            this.reverb.generate();
            this._reverbReady = true;
        }
        this.sampler.triggerAttack(note, time || Tone.now(), velocity);
    }
    
    noteOff(note, time) {
        this.sampler.triggerRelease(note, time || Tone.now());
    }
    
    dispose() {
        this.sampler.dispose();
        this.eq.dispose();
        this.compressor.dispose();
        this.reverb.dispose();
    }
}
```

### 3. Register in InstrumentManager.js

**File**: `Keyboard/src/core/InstrumentManager.js`

**Add import**:
```javascript
import { GrandPianoInstrument } from '../instruments/GrandPianoInstrument.js';
```

**Add registration**:
```javascript
// Grand Piano variants
this.registerInstrument('grand-piano-steinway', new GrandPianoInstrument({ profile: 'steinway' }));
this.registerInstrument('grand-piano-yamaha', new GrandPianoInstrument({ profile: 'yamaha' }));
```

### 4. Add to UI Dropdown

**File**: `Keyboard/src/ui/KeyboardView.js`

**Update instrument dropdown** (in `renderControls()` method):
```html
<option value="grand-piano-steinway">Grand Piano (Steinway)</option>
<option value="grand-piano-yamaha">Grand Piano (Yamaha CFX)</option>
```

### 5. Audio Chain Design

```
┌─────────┐    ┌─────┐    ┌───────────┐    ┌───────┐    ┌─────────┐
│ Sampler │───>│ EQ  │───>│ Compressor│───>│ Reverb│───>│ Output  │
└─────────┘    └─────┘    └───────────┘    └───────┘    └─────────┘
```

**Components**:
- **Sampler**: Loads high-quality grand piano samples with longer release
- **EQ3**: Subtle tonal shaping (flat by default for authentic sound)
- **Compressor**: Controls dynamic range for consistent volume
- **Reverb**: Concert hall ambience with longer decay time

### 6. Sample Library Configuration

**Steinway Grand Samples** (A0-C8):
```
A0, C1, D#1, F#1, A1, C2, D#2, F#2, A2, C3, D#3, F#3, 
A3, C4, D#4, F#4, A4, C5, D#5, F#5, A5, C6, D#6, F#6, 
A6, C7, D#7, F#7, A7, C8
```

### 7. Error Handling & Fallback

- Graceful fallback to existing PianoInstrument if samples fail to load
- User notification via load status indicator
- Automatic retry on sample loading errors

### 8. Performance Considerations

- Lazy loading: Generate reverb only when first note is played
- Dispose unused instruments properly
- Cache loaded samples in memory

## Files to Create/Modify

| File | Action |
|------|--------|
| `Keyboard/src/instruments/GrandPianoInstrument.js` | Create |
| `Keyboard/src/core/InstrumentManager.js` | Modify - add import and registration |
| `Keyboard/src/ui/KeyboardView.js` | Modify - add dropdown options |

## Estimated Complexity

This implementation is **medium complexity**:
- Creating a new instrument class following existing patterns
- Integrating with existing instrument manager and UI
- Using reliable Tone.js sample library

## Next Steps

1. Switch to Code mode to implement the GrandPianoInstrument class
2. Test sample loading and audio quality
3. Refine audio chain parameters based on testing
4. Optionally: Add additional grand piano profiles (e.g., different mic positions)
