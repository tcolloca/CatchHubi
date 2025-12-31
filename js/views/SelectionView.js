class SelectionView {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.onStart = null;
    }

    bindStartGame(handler) {
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

        document.getElementById('start-btn').addEventListener('click', async () => await this.handleStart());
    }

    async handleStart() {
        const selected = Array.from(this.container.querySelectorAll('input[type="checkbox"]:checked'))
            .map(cb => this.idToPlayer(cb.dataset.id));

        const firstPlayerRadio = this.container.querySelector('input[name="first-player"]:checked');
        let firstPlayer = firstPlayerRadio ? this.idToPlayer(firstPlayerRadio.value) : null;

        if (this.onStart) {
            // We just pass the data, validation is done by the Controller/GameState
            await this.onStart({ players: selected, firstPlayer });
        }
    }

    idToPlayer(id) {
        if (id === 'blue-rabbit') return Player.BLUE_RABBIT;
        if (id === 'green-rabbit') return Player.GREEN_RABBIT;
        if (id === 'yellow-mouse') return Player.YELLOW_MOUSE;
        if (id === 'red-mouse') return Player.RED_MOUSE;
        return null;
    }

    showError(msg) {
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
