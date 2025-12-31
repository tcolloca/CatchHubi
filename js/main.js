document.addEventListener('DOMContentLoaded', async () => {
    const language = Language.ES;
    const difficulty = Difficulty.EASY;
    const audioManager = new AudioManager();
    const narrator = new Narrator(audioManager, Messages, language);
    const game = new Game(difficulty, narrator);
    const compassView = new MagicCompassView('compass-container');
    const selectionView = new SelectionView('selection-container');
    const boardView = new BoardView('board-container');
    const controller = new GameController(game, boardView, selectionView, compassView, narrator);

    controller.init();

    const playBtn = document.getElementById('play-btn');
    playBtn.textContent = Messages[language].play;
    if (playBtn) {
        playBtn.addEventListener('click', async () => {
            await controller.start();
        });
    }
});
