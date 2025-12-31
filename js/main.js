document.addEventListener('DOMContentLoaded', async () => {
    const playBtn = document.getElementById('play-btn');
    const languageSelect = document.getElementById('language-select');
    const difficultySelect = document.getElementById('difficulty-select');
    const languageLabel = document.getElementById('language-label');
    const difficultyLabel = document.getElementById('difficulty-label');

    function updateTexts() {
        const lang = languageSelect.value;
        playBtn.textContent = Messages[lang].play;
        languageLabel.textContent = Messages[lang].language_label;
        difficultyLabel.textContent = Messages[lang].difficulty_label;

        // Update difficulty options if needed (though they are static, we could localize them too)
        // For now, let's just update the main labels.
    }

    languageSelect.addEventListener('change', updateTexts);
    updateTexts();

    if (playBtn) {
        playBtn.addEventListener('click', async () => {
            const language = languageSelect.value;
            const difficulty = difficultySelect.value;

            const audioManager = new AudioManager();
            const narrator = new Narrator(audioManager, Messages, language);
            const game = new Game(difficulty, narrator);
            const compassView = new MagicCompassView('compass-container');
            const selectionView = new SelectionView('selection-container');
            const boardView = new BoardView('board-container');
            const controller = new GameController(game, boardView, selectionView, compassView, narrator);

            controller.init();
            await controller.start();
        });
    }
});
