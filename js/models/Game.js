class Game {
    constructor(difficulty, narrator) {
        this.difficulty = difficulty;
        this.board = new Board();
        this.gameState = new GameState(this, narrator);
        this.narrator = narrator;
        this.players = new Set();
        this.ghost = new Ghost(this, narrator);
        this.currentPlayer = null;
        this.movesMade = 0;
        this.givenHints = new Map();
    }

    addPlayer(player) {
        if (this.hasPlayer(player)) {
            this.narrator.playerAlreadyInGame(player);
            return false;
        }
        this.players.add(player);
        this.narrator.addPlayer(player);
        return true;
    }

    hasPlayer(player) {
        return this.players.has(player);
    }

    getPlayersAt(row, col) {
        return this.players.values().filter(p => p.row === row && p.col === col).toArray();
    }

    async setFirstPlayer(player) {
        if (!this.hasPlayer(player)) {
            await this.narrator.firstPlayerMustBeInGame(player);
            return false;
        }
        this.currentPlayer = player;
        await this.narrator.firstPlayerSelected(player);
        return true;
    }

    spawnGhost() {
        this.ghost.spawn();
    }

    async moveToNextPlayer() {
        if (this.currentPlayer == Player.GREEN_RABBIT) {
            this.currentPlayer = Player.RED_MOUSE;
        } else if (this.currentPlayer == Player.RED_MOUSE) {
            this.currentPlayer = Player.YELLOW_MOUSE;
        } else if (this.currentPlayer == Player.YELLOW_MOUSE) {
            this.currentPlayer = Player.BLUE_RABBIT;
        } else if (this.currentPlayer == Player.BLUE_RABBIT) {
            this.currentPlayer = Player.GREEN_RABBIT;
        }
        if (this.hasPlayer(this.currentPlayer)) {
            await this.narrator.askWhereTo(this.board.getCreature(this.currentPlayer), this.currentPlayer);
        } else {
            await this.moveToNextPlayer();
        }
    }

    async moveCurrentPlayer(direction) {
        const player = this.currentPlayer;
        const creature = this.board.getCreature(player);
        const dRow = direction.dRow();
        const dCol = direction.dCol();
        const newRow = player.row + dRow;
        const newCol = player.col + dCol;

        if (!((Math.abs(dRow) === 1 && Math.abs(dCol) === 0) || (Math.abs(dRow) === 0 && Math.abs(dCol) === 1))) {
            await this.narrator.invalidMoveDiagonal();
            return;
        }

        // Check Wall
        const wall = this.board.getWallBetween(player.row, player.col, newRow, newCol);
        await this.narrator.announceWall(creature, wall);
        const isKnownWall = wall.isRevealed;
        wall.reveal();

        if (wall.type === WallType.MAGIC_DOOR && !wall.isOpen) {
            if (await this.gameState.tryOpenDoor(wall)) {
                this.givenHints = new Map();
            }
        }

        let hasMoved = this.canPass(wall, player);
        if (hasMoved) {
            await this.narrator.canPassThrough(creature);

            // Execute Move
            player.row = newRow;
            player.col = newCol;

            // Check Win Condition
            if (await this.gameState.checkWinCondition()) {
                return;
            }
        } else {
            await this.narrator.cannotPassThrough(creature);
        }

        if (this.ghost.active) {
            if (await this.ghost.maybeMove()) {
                this.givenHints = new Map();
            }
        }

        // Turn Logic
        if (isKnownWall) {
            this.movesMade++;

            if (this.movesMade === 1) {
                await this.narrator.bonusMove(creature);
                return;
            }
        }

        await this.endTurn();
    }

    canPass(wall, player) {
        if (wall.isExternal) {
            return false;
        }
        if (wall.type === WallType.NO_WALL) {
            console.error("Missing wall!");
            return false;
        }
        if (wall.type === WallType.WALL) return false; // Blocked
        if (wall.type === WallType.FREE_PASSAGE) return true; // Both (Green Tick)

        if (wall.type === WallType.MOUSE_HOLE && player.type === PlayerType.MOUSE) return true;
        if (wall.type === WallType.RABBIT_WINDOW && player.type === PlayerType.RABBIT) return true;

        if (wall.type === WallType.MAGIC_DOOR && wall.isOpen) return true;

        return false;
    }

    async giveHint() {
        const playerCreature = this.board.getCreature(this.currentPlayer);
        let hint = this.givenHints.get(playerCreature);
        if (!hint) {
            if (this.gameState.isHubiAwake()) {
                // const hintCreatureType = Math.floor(Math.random() * 2);
                const ghostCreature = this.board.getCreature(this.ghost);
                hint = new GhostHint(ghostCreature, this.difficulty);
            } else {
                let door = null;
                for (let i = 0; i < this.board.magicDoors.length; i++) {
                    door = this.board.magicDoors[i];
                    if (door.isOpen) {
                        continue;
                    }
                    break;
                }
                const tilesOnDoorSides = this.board.getTilesOnBothSides(door);
                hint = new DoorHint(tilesOnDoorSides[0], tilesOnDoorSides[1], this.difficulty);
            }
            this.givenHints.set(playerCreature, hint);
        }
        await this.narrator.giveHint(playerCreature, hint);
    }

    async givePlayerPosition(player) {
        const creature = this.board.getCreature(player);
        let owl = null;
        let color = null;
        if (player.row < 2 && player.col < 2) {
            owl = this.board.getCell(0, 0);
            color = 'green';
        } else if (player.row < 2 && player.col >= 2) {
            owl = this.board.getCell(0, 3);
            color = 'red';
        } else if (player.row >= 2 && player.col < 2) {
            owl = this.board.getCell(3, 0);
            color = 'blue';
        } else if (player.row >= 2 && player.col >= 2) {
            owl = this.board.getCell(3, 3);
            color = 'yellow';
        }
        console.log(color);
        await this.narrator.givePlayerPosition(player, creature, owl, color);
    }

    async endTurn() {
        this.movesMade = 0;
        await this.moveToNextPlayer();
    }

    isOver() {
        return this.gameState.isOver();
    }
}