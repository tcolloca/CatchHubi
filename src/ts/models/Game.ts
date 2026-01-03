import { Board } from './Board';
import { GameState } from './GameState';
import { Player, PlayerType } from './Player';
import { Ghost } from './Ghost';
import { WallType, Wall } from './Wall';
import { DoorHint } from './DoorHint';
import { GhostHint } from './GhostHint';
import { Direction } from './Direction';
import { Tile } from './Tile';
import { Creature } from './Creature';
import { Narrator } from '../Narrator';
import { Difficulty } from './Difficulty';

export class Game {
    difficulty: Difficulty;
    board: Board;
    gameState: GameState;
    narrator: Narrator;
    players: Set<Player>;
    ghost: Ghost;
    currentPlayer: Player;
    previousPlayer: Player | null;
    movesMade: number;
    totalTurns: number;
    givenHints: Map<Creature, DoorHint | GhostHint>;

    constructor(difficulty: Difficulty, narrator: Narrator) {
        this.difficulty = difficulty;
        this.board = new Board(difficulty);
        this.gameState = new GameState(this, narrator, difficulty);
        this.narrator = narrator;
        this.players = new Set();
        this.ghost = new Ghost(this, narrator, difficulty);
        this.currentPlayer = Player.GREEN_RABBIT; // Default placeholder until setFirstPlayer
        this.previousPlayer = null;
        this.movesMade = 0;
        this.totalTurns = 0;
        this.givenHints = new Map();
    }

    addPlayer(player: Player) {
        if (this.hasPlayer(player)) {
            this.narrator.playerAlreadyInGame(player);
            return false;
        }
        this.players.add(player);
        this.narrator.addPlayer(player);
        return true;
    }

    hasPlayer(player: Player) {
        return this.players.has(player);
    }

    getPlayersAt(row: number, col: number): Player[] {
        return Array.from(this.players.values()).filter(p => p.row === row && p.col === col);
    }

    async setFirstPlayer(player: Player) {
        if (!this.hasPlayer(player)) {
            await this.narrator.firstPlayerMustBeInGame();
            return false;
        }
        this.previousPlayer = this.currentPlayer;
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
        if (this.currentPlayer && this.hasPlayer(this.currentPlayer)) {
            await this.startTurn();
        } else {
            await this.moveToNextPlayer();
        }
    }

    async moveCurrentPlayer(direction: Direction) {
        const player = this.currentPlayer;
        const creature = this.board.getCreature(player);
        const dRow = direction.dRow();
        const dCol = direction.dCol();
        const newRow = player.row + dRow;
        const newCol = player.col + dCol;

        if (!((Math.abs(dRow) === 1 && Math.abs(dCol) === 0) || (Math.abs(dRow) === 0 && Math.abs(dCol) === 1))) {
            console.error(`Invalid move: ${direction}`);
            await this.narrator.invalidMove();
            return;
        }

        // Check Wall
        const wall = this.board.getWallBetween(player.row, player.col, newRow, newCol);
        if (!wall) return;

        await this.narrator.announceWall(creature, wall);
        const isKnownWall = wall.isRevealed;
        wall.reveal();
        let wasGhostAlreadyActive = this.ghost.active;

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

            if (await this.gameState.checkWinCondition()) {
                return;
            }
        } else {
            await this.narrator.cannotPassThrough(creature);
        }

        if (hasMoved && this.ghost.active && player.row === this.ghost.row && player.col === this.ghost.col) {
            await this.narrator.hubiFoundByOnePlayer();
        } else if (wasGhostAlreadyActive) {
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

        this.totalTurns++;
        if (await this.gameState.checkGameOverCondition()) {
            return;
        }

        await this.endTurn();
    }

    canPass(wall: Wall, player: Player) {
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

    generateHint(): DoorHint | GhostHint {
        if (this.gameState.isHubiAwake()) {
            const ghostTile = this.board.getCreature(this.ghost);
            return new GhostHint(ghostTile, this.difficulty);
        } else {
            let door: Wall | null = null;
            for (let i = 0; i < this.board.magicDoors.length; i++) {
                const d = this.board.magicDoors[i];
                if (!d.isOpen) {
                    door = d;
                    break;
                }
            }
            if (door) {
                const tilesOnDoorSides = this.board.getTilesOnBothSides(door);
                return new DoorHint(tilesOnDoorSides[0], tilesOnDoorSides[1], this.difficulty);
            }
        }
        throw new Error("Failed to generate hint.");
    }

    async giveHint() {
        const playerCreature = this.board.getCreature(this.currentPlayer);
        let hint: DoorHint | GhostHint | undefined = this.givenHints.get(playerCreature);

        if (!hint) {
            hint = this.generateHint();
            this.givenHints.set(playerCreature, hint);
        }

        await this.narrator.giveHint(playerCreature, hint);

        this.totalTurns++;
        if (await this.gameState.checkGameOverCondition()) {
            return;
        }
        await this.endTurn();
    }

    async givePlayerPosition(player: Player) {
        const creature = this.board.getCreature(player);
        let owl: Tile = this.board.getCell(0, 0); // Default fallback
        let color: string = 'green';
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

    async startTurn() {
        await this.narrator.startRecordingTurn();
        await this.narrator.askWhereTo(this.board.getCreature(this.currentPlayer), this.currentPlayer);
    }

    async endTurn() {
        this.movesMade = 0;
        await this.narrator.stopRecordingTurn();
        this.previousPlayer = this.currentPlayer;
        await this.moveToNextPlayer();
    }

    isOver() {
        return this.gameState.isOver();
    }
}