class AudioManager {
    constructor() {
        this.currentAudio = null;
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
        for (const file of filesSequence) {
            const success = await this.playFile(source, file);

            if (!success) {
                return false;
            }
        }

        return true;
    }

    stopAll() {
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio.currentTime = 0;
            this.currentAudio = null;
            return true;
        }
        return false;
    }
}
