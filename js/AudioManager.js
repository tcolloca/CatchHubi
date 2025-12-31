class AudioManager {
    constructor() {
        this.currentAudio = null;
        this.waitingForAudios = 0;
    }

    async playFile(source, filename) {
        return new Promise((resolve) => {
            this.stopAll();

            const audio = new Audio(`audio/${source}/${filename}`);
            this.currentAudio = audio;
            let handled = false;

            const failAndAlert = (source) => {
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
                .catch(e => {
                    failAndAlert('catch');
                });
        });
    }

    async playSequence(source, filesSequence) {
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
            this.currentAudio.onended();
            this.currentAudio = null;
            return true && this.waitingForAudios > 0;
        }
        return false;
    }
}
