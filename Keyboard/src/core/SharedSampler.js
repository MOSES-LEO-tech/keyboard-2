const SALAMANDER_URLS = {
    'A0': 'A0.mp3',   'C1': 'C1.mp3',   'D#1': 'Ds1.mp3',  'F#1': 'Fs1.mp3',
    'A1': 'A1.mp3',   'C2': 'C2.mp3',   'D#2': 'Ds2.mp3',  'F#2': 'Fs2.mp3',
    'A2': 'A2.mp3',   'C3': 'C3.mp3',   'D#3': 'Ds3.mp3',  'F#3': 'Fs3.mp3',
    'A3': 'A3.mp3',   'C4': 'C4.mp3',   'D#4': 'Ds4.mp3',  'F#4': 'Fs4.mp3',
    'A4': 'A4.mp3',   'C5': 'C5.mp3',   'D#5': 'Ds5.mp3',  'F#5': 'Fs5.mp3',
    'A5': 'A5.mp3',   'C6': 'C6.mp3',   'D#6': 'Ds6.mp3',  'F#6': 'Fs6.mp3',
    'A6': 'A6.mp3',   'C7': 'C7.mp3',   'D#7': 'Ds7.mp3',  'F#7': 'Fs7.mp3'
};

export class SharedSampler {
    static _sampler = null;
    static _loaded = false;
    static _loading = false;
    static _loadPromise = null;

    static get isLoaded() {
        return SharedSampler._loaded;
    }

    static async load(baseUrl = '/public/audio/salamander/') {
        if (SharedSampler._sampler) return SharedSampler._sampler;
        if (SharedSampler._loading) return SharedSampler._loadPromise;

        SharedSampler._loading = true;
        SharedSampler._loadPromise = new Promise((resolve, reject) => {
            const sampler = new Tone.Sampler({
                urls: SALAMANDER_URLS,
                release: 1.5,
                curve: 'exponential',
                baseUrl: baseUrl,
                onload: () => {
                    SharedSampler._loaded = true;
                    SharedSampler._loading = false;
                    resolve(sampler);
                },
                onerror: (err) => {
                    SharedSampler._loading = false;
                    reject(err);
                }
            });
            SharedSampler._sampler = sampler;
        });

        return SharedSampler._loadPromise;
    }

    static get() {
        return SharedSampler._sampler;
    }
}
