class AudioManager {
    async playFile(source, filename) {
        return new Promise((resolve) => {
            const audio = new Audio(`audio/${source}/${filename}`);
            let handled = false;

            const failAndAlert = (source) => {
                if (handled) return;
                handled = true;
                console.warn(`[AudioManager] failed: ${filename} (source: ${source})`);
                resolve(false);
            };

            audio.onended = () => {
                console.log(`[AudioManager] finished: ${filename}`);
                if (handled) return;
                handled = true;
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
}
