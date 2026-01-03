const GameStates = {
    NO_STATE: 'NO_STATE',
    SELECTING_PLAYERS: 'SELECTING_PLAYERS',
    SELECTING_FIRST_PLAYER: 'SELECTING_FIRST_PLAYER',
    PLAYING_BEFORE_DOOR: 'PLAYING_BEFORE_DOOR',
    PLAYING_WITH_HUBI: 'PLAYING_WITH_HUBI',
    WON: 'WON',
};

class GameState {
    constructor(game, narrator, difficulty) {
        this.game = game;
        this.narrator = narrator;
        this.currentState = GameStates.NO_STATE;
        this.requiredMagicDoorCount = this._computeRequiredMagicDoorCount(difficulty);
        this.openedMagicDoorCount = 0;
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
            await this.game.startTurn();
            return true;
        }
        return false;
    }

    async tryOpenDoor(door) {
        const tiles = this.game.board.getTilesOnBothSides(door);
        if (this.game.getPlayersAt(tiles[0].row, tiles[0].col).length >= 1
            && this.game.getPlayersAt(tiles[1].row, tiles[1].col).length >= 1) {
            door.open();
            this.openedMagicDoorCount++;
            const wasHubiAwake = this.isHubiAwake();
            if (!this.isHubiAwake() && this.openedMagicDoorCount >= this.requiredMagicDoorCount) {
                this.currentState = GameStates.PLAYING_WITH_HUBI;
                await this.game.spawnGhost();
            }
            await this.narrator.magicDoorOpened(this.game.board.getCreature(this.game.currentPlayer), !wasHubiAwake && this.isHubiAwake());
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

    async checkGameOverCondition() {
        console.log(this.game.totalTurns);
        const midnightMoves = Constants.MOVES_UNTIL_MIDNIGHT[this.game.difficulty];
        if (this.game.totalTurns == Math.floor(midnightMoves * Constants.SUNSET_PERCENTAGE)) {
            await this.narrator.sunset();
        } else if (this.game.totalTurns == Math.floor(midnightMoves * Constants.EVENING_PERCENTAGE)) {
            await this.narrator.evening();
        } else if (this.game.totalTurns == Math.floor(midnightMoves * Constants.CLOSE_TO_MIDNIGHT_PERCENTAGE)) {
            await this.narrator.closeToMidnight();
        } else if (this.game.totalTurns == midnightMoves) {
            await this.narrator.midnight();
            if (Constants.ALLOW_GAME_OVER[this.game.difficulty]) {
                await this.narrator.gameOver();
                this.currentState = GameStates.GAME_OVER;
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
        return this.currentState === GameStates.WON || this.currentState === GameStates.GAME_OVER;
    }

    _computeRequiredMagicDoorCount(difficulty) {
        if (Constants.MAGIC_DOOR_USE_RANDOM_COUNT) {
            return Math.floor(Math.random() * Constants.MAGIC_DOOR_MAX_COUNT_BY_DIFFICULTY[difficulty]) + 1;
        }
        return Constants.MAGIC_DOOR_MAX_COUNT_BY_DIFFICULTY[difficulty];
    }
}
