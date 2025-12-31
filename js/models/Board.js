class Board {
    constructor() {
        // this.grid = []; // 9x9 grid
        this.tiles = [];
        this.horizontalWalls = [];
        this.verticalWalls = [];
        this.magicDoors = [];
        this.initialize();
    }

    initialize() {
        const top = [[CreatureType.Owl, CreatureType.Millipede, CreatureType.Frog, CreatureType.Owl],
        [CreatureType.Frog, CreatureType.Bat, CreatureType.Bat, CreatureType.Millipede]];
        for (let r = 0; r < 4; r++) {
            let tilesRow = [];
            for (let c = 0; c < 4; c++) {
                const color = r % 2 === c % 2 ? CreatureColor.White : CreatureColor.Black;
                if (r < 2) {
                    tilesRow.push(new Tile(r, c, top[r][c], color, false));
                } else {
                    tilesRow.push(new Tile(r, c, top[4 - r - 1][4 - c - 1], color, true));
                }
            }
            this.tiles.push(tilesRow);
        }

        for (let r = 0; r < 5; r++) {
            let horizontalRow = [];
            let verticalRow = [];
            for (let c = 0; c < 5; c++) {
                if (c < 5) {
                    horizontalRow.push(new Wall(r, c, r == 0 || r == 4, WallOrientation.HORIZONTAL));
                }
                verticalRow.push(new Wall(r, c, c == 0 || c == 4, WallOrientation.VERTICAL));
            }
            this.horizontalWalls.push(horizontalRow);
            if (r < 5) {
                this.verticalWalls.push(verticalRow);
            }
        }

        // Generate Walls
        WallGenerator.generate(this);
    }

    // Helper to get wall between two tiles
    getWallBetween(r1, c1, r2, c2) {
        if (r1 == r2) {
            return this.verticalWalls[r1][Math.max(c1, c2)];
        } else if (c1 == c2) {
            return this.horizontalWalls[Math.max(r1, r2)][c1];
        }
    }

    getTilesOnBothSides(wall) {
        if (wall.orientation === WallOrientation.HORIZONTAL) {
            return [this.tiles[wall.row - 1][wall.col], this.tiles[wall.row][wall.col]];
        } else {
            return [this.tiles[wall.row][wall.col - 1], this.tiles[wall.row][wall.col]];
        }
    }

    getCell(r, c) {
        return this.tiles[r][c];
    }

    getCreature(player) {
        return this.tiles[player.row][player.col];
    }
}
