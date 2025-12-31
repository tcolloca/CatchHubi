const GameStates = {
    NO_STATE: 'NO_STATE',
    SELECTING_PLAYERS: 'SELECTING_PLAYERS',
    SELECTING_FIRST_PLAYER: 'SELECTING_FIRST_PLAYER',
    PLAYING_BEFORE_DOOR: 'PLAYING_BEFORE_DOOR',
    PLAYING_WITH_HUBI: 'PLAYING_WITH_HUBI',
    WON: 'WON',
};

class GameState {
    constructor(game, narrator) {
        this.game = game;
        this.narrator = narrator;
        this.currentState = GameStates.NO_STATE;
    }

    async init() {
        this.currentState = GameStates.SELECTING_PLAYERS;
        await this.narrator.intro();
    }

    async selectFirstPlayer() {
        if (this.currentState === GameStates.SELECTING_PLAYERS && await this._validatePlayers()) {
            this.currentState = GameStates.SELECTING_FIRST_PLAYER;
            await this.narrator.selectFirstPlayer();
            return true;
        }
        return false;
    }

    async startGame() {
        if (this.currentState === GameStates.SELECTING_FIRST_PLAYER && await this._validateFirstPlayer()) {
            this.currentState = GameStates.PLAYING_BEFORE_DOOR;
            await this.narrator.gameStart();
            await this.narrator.askWhereTo(this.game.board.getCreature(this.game.currentPlayer), this.game.currentPlayer);
            return true;
        }
        return false;
    }

    async tryOpenDoor(door) {
        const tiles = this.game.board.getTilesOnBothSides(door);
        if (this.game.getPlayersAt(tiles[0].row, tiles[0].col).length >= 1
            && this.game.getPlayersAt(tiles[1].row, tiles[1].col).length >= 1) {
            door.open();
            await this.narrator.magicDoorOpened(this.game.board.getCreature(this.game.currentPlayer), !this.isHubiAwake());
            if (!this.isHubiAwake()) {
                this.currentState = GameStates.PLAYING_WITH_HUBI;
                await this.game.spawnGhost();
            }
            return true;
        }
        return false;
    }

    async checkWinCondition() {
        if (this.currentState === GameStates.PLAYING_WITH_HUBI) {
            const playersOnGhost = this.game.getPlayersAt(this.game.ghost.row, this.game.ghost.col);
            if (playersOnGhost.length >= 2) {
                await this.narrator.gameWon();
                this.currentState = GameStates.WON;
                return true;
            }
        }
        return false;
    }

    async _validatePlayers() {
        const players = this.game.players;

        const rabbits = players.values().filter(p => p.type === PlayerType.RABBIT).toArray();
        const mice = players.values().filter(p => p.type === PlayerType.MOUSE).toArray();

        if (rabbits.length < 1 || mice.length < 1) {
            await this.narrator.bothRabbitAndMouseRequired();
            return false;
        }

        return true;
    }

    async _validateFirstPlayer() {
        const firstPlayer = this.game.currentPlayer;

        if (!firstPlayer) {
            await this.narrator.firstPlayerNotSelected();
            return false;
        }

        return true;
    }

    is(state) {
        return this.currentState === state;
    }

    isPlaying() {
        return this.currentState === GameStates.PLAYING_BEFORE_DOOR
            || this.currentState === GameStates.PLAYING_WITH_HUBI;
    }

    isHubiAwake() {
        return this.currentState === GameStates.PLAYING_WITH_HUBI;
    }

    isOver() {
        return this.currentState === GameStates.WON;
    }
}
