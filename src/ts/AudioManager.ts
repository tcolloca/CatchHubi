export class AudioManager {
    currentAudio: HTMLAudioElement | null;
    waitingForAudios: number;
    interrupted: boolean;

    constructor() {
        this.currentAudio = null;
        this.waitingForAudios = 0;
        this.interrupted = false;
    }

    async playFile(source: string, filename: string): Promise<boolean> {
        return new Promise((resolve) => {
            this.stopAll();

            const audio = new Audio(`audio/${source}/${filename}`);
            this.currentAudio = audio;
            let handled = false;

            const failAndAlert = (source: string) => {
                if (handled) return;
                handled = true;
                this.currentAudio = null;
                console.warn(`[AudioManager] failed: ${filename} (source: ${source})`);
                resolve(false);
            };

            audio.onended = () => {
                console.log(`[AudioManager] finished: ${filename}`);
                if (handled) return;
                handled = true;
                this.currentAudio = null;
                resolve(true);
            };

            audio.onerror = () => failAndAlert('onerror');

            audio.play()
                .then(() => console.log(`[AudioManager] playing: ${filename}`))
                .catch(() => {
                    failAndAlert('catch');
                });
        });
    }

    async playSequence(source: string, filesSequence: string[]): Promise<boolean> {
        this.interrupted = false;
        for (const file of filesSequence) {
            this.waitingForAudios++;
            const success = await this.playFile(source, file);
            this.waitingForAudios--;
            if (this.interrupted) {
                return true;
            }

            if (!success) {
                return false;
            }
        }

        return true;
    }

    stopAll() {
        if (this.currentAudio) {
            this.interrupted = true;
            this.currentAudio.pause();
            (this.currentAudio.onended as any)?.(new Event('ended'));
        }
        this.currentAudio = null;
        return this.waitingForAudios > 0;
    }
}
