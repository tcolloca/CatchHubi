class Ghost {
    constructor(game, narrator, difficulty) {
        this.game = game;
        this.narrator = narrator;
        this.row = -1;
        this.col = -1;
        this.active = false;
        this.probability = 0.0;
        this.difficulty = difficulty;
    }

    spawn() {
        if (this.active) return;

        // Find a random tile without players
        let validTiles = [];
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                // Check if any player is here
                const hasPlayer = this.game.getPlayersAt(r, c);
                if (hasPlayer.length === 0) {
                    validTiles.push({ r, c });
                }
            }
        }

        if (validTiles.length > 0) {
            const choice = validTiles[Math.floor(Math.random() * validTiles.length)];
            this.row = choice.r;
            this.col = choice.c;
            this.active = true;
            this.probability = Constants.GHOST_START_PROBABILITY[difficulty]; // Initial probability
            console.log(`Ghost spawned at ${this.row}, ${this.col}`);
        }
    }

    async maybeMove() {
        if (!this.active) return false;

        // Check probability
        if (Math.random() > this.probability) {
            // Did not move, increase probability for next time
            this.probability = Math.min(1, this.probability + Constants.GHOST_PROBABILITY_INCREMENT[difficulty]);
            console.log(`Ghost did not move. Probability increased to ${this.probability.toFixed(2)}`);
            return false;
        }

        // Reset probability after move
        this.probability = Constants.GHOST_START_PROBABILITY[difficulty];

        // Find valid neighbors (all 8 directions)
        const directions = [
            { dr: -1, dc: -1 }, { dr: -1, dc: 0 }, { dr: -1, dc: 1 },
            { dr: 0, dc: -1 }, { dr: 0, dc: 1 },
            { dr: 1, dc: -1 }, { dr: 1, dc: 0 }, { dr: 1, dc: 1 }
        ];

        const validMoves = [];

        for (const dir of directions) {
            const newR = this.row + dir.dr;
            const newC = this.col + dir.dc;

            // Check boundaries (0-3 for tiles)
            if (newR >= 0 && newR < 4 && newC >= 0 && newC < 4) {
                // Check for players
                const hasPlayer = this.game.getPlayersAt(newR, newC);
                if (hasPlayer.length === 0) {
                    validMoves.push({ r: newR, c: newC });
                }
            }
        }

        if (validMoves.length > 0) {
            const move = validMoves[Math.floor(Math.random() * validMoves.length)];
            this.row = move.r;
            this.col = move.c;
            console.log(`Ghost moved to ${this.row}, ${this.col}`);
            await this.narrator.ghostMoved();
            return true;
        } else {
            console.log("Ghost stuck! No valid moves.");
            return false;
        }
    }
}
