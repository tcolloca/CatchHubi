import { Messages } from './Messages';
import { AudioManager } from './AudioManager';
import { Narrator } from './Narrator';
import { Game } from './models/Game';
import { Difficulty } from './models/Difficulty';
import { Language } from './models/Language';
import { MagicCompassView } from './views/MagicCompassView';
import { SelectionView } from './views/SelectionView';
import { BoardView } from './views/BoardView';
import { GameController } from './controllers/GameController';

const playBtn = document.getElementById('play-btn') as HTMLElement;
const languageSelect = document.getElementById('language-select') as HTMLSelectElement;
const difficultySelect = document.getElementById('difficulty-select') as HTMLSelectElement;
const languageLabel = document.getElementById('language-label') as HTMLElement;
const difficultyLabel = document.getElementById('difficulty-label') as HTMLElement;

function updateTexts() {
    const lang = languageSelect.value;
    const msg = Messages[lang];
    if (msg && playBtn) playBtn.textContent = msg.play;
    if (msg && languageLabel) languageLabel.textContent = msg.language_label;
    if (msg && difficultyLabel) difficultyLabel.textContent = msg.difficulty_label;

    // Update difficulty options if needed (though they are static, we could localize them too)
    // For now, let's just update the main labels.
}

if (languageSelect) {
    languageSelect.addEventListener('change', updateTexts);
    updateTexts();
}

if (playBtn) {
    playBtn.addEventListener('click', async () => {
        const language: Language = languageSelect.value as Language;
        const difficulty = difficultySelect.value as Difficulty;

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

