import { Player } from '../models/Player';

export class SelectionView {
    container: HTMLElement;
    onStart: ((data: { players: Player[], firstPlayer: Player | null }) => Promise<void> | void) | null;

    constructor(containerId: string) {
        this.container = document.getElementById(containerId) as HTMLElement;
        this.onStart = null;
    }

    bindStartGame(handler: (data: { players: Player[], firstPlayer: Player | null }) => Promise<void> | void) {
        this.onStart = handler;
    }

    render() {
        this.container.innerHTML = `
            <div class="selection-screen">
                <h2>Select Players</h2>
                <p>Must have at least 1 Rabbit and 1 Mouse.</p>
                <div class="player-options">
                    <div class="option-row">
                        <label class="option blue">
                            <input type="checkbox" value="blue-rabbit" data-id="blue-rabbit"> Blue Rabbit 🐰
                        </label>
                        <label class="first-select"><input type="radio" name="first-player" value="blue-rabbit"> 1st</label>
                    </div>
                    
                    <div class="option-row">
                        <label class="option green">
                            <input type="checkbox" value="green-rabbit" data-id="green-rabbit"> Green Rabbit 🐰
                        </label>
                        <label class="first-select"><input type="radio" name="first-player" value="green-rabbit"> 1st</label>
                    </div>
                    
                    <div class="option-row">
                        <label class="option yellow">
                            <input type="checkbox" value="yellow-mouse" data-id="yellow-mouse"> Yellow Mouse 🐭
                        </label>
                        <label class="first-select"><input type="radio" name="first-player" value="yellow-mouse"> 1st</label>
                    </div>
                    
                    <div class="option-row">
                        <label class="option red">
                            <input type="checkbox" value="red-mouse" data-id="red-mouse"> Red Mouse 🐭
                        </label>
                        <label class="first-select"><input type="radio" name="first-player" value="red-mouse"> 1st</label>
                    </div>
                </div>
                <div id="selection-error" class="error"></div>
                <button id="start-btn">Start Game</button>
            </div>
        `;

        (document.getElementById('start-btn') as HTMLElement).addEventListener('click', async () => await this.handleStart());
    }

    async handleStart() {
        const checkboxes = Array.from(this.container.querySelectorAll('input[type="checkbox"]:checked')) as HTMLInputElement[];
        const selected = checkboxes
            .map(cb => this.idToPlayer(cb.dataset.id!))
            .filter((p): p is Player => p !== null);

        const firstPlayerRadio = this.container.querySelector('input[name="first-player"]:checked') as HTMLInputElement;
        let firstPlayer = firstPlayerRadio ? this.idToPlayer(firstPlayerRadio.value) : null;

        if (this.onStart) {
            // We just pass the data, validation is done by the Controller/GameState
            await this.onStart({ players: selected, firstPlayer });
        }
    }

    idToPlayer(id: string): Player {
        if (id === 'blue-rabbit') return Player.BLUE_RABBIT;
        if (id === 'green-rabbit') return Player.GREEN_RABBIT;
        if (id === 'yellow-mouse') return Player.YELLOW_MOUSE;
        if (id === 'red-mouse') return Player.RED_MOUSE;
        throw new Error(`Unknown player id: ${id}`);
    }

    showError(msg: string) {
        const errorDiv = document.getElementById('selection-error');
        if (errorDiv) {
            errorDiv.textContent = msg;
            errorDiv.classList.add('visible');
        }
    }

    hide() {
        this.container.style.display = 'none';
    }

    show() {
        this.container.style.display = 'block';
    }
}
