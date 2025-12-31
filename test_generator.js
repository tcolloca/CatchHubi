const WallGenerator = require('./js/models/WallGenerator.js');

// Mock Wall Class
class Wall {
    constructor(row, col, type) {
        this.row = row;
        this.col = col;
        this.type = type;
        this.type = 0;
        this.isOpen = false;
        this.isExternal = (row === 0 || row === 8 || col === 0 || col === 8);
    }
}

// Mock Tile Class
class Tile {
    constructor(row, col) {
        this.row = row;
        this.col = col;
    }
}

// Mock BoardModel Class
class BoardModel {
    constructor() {
        this.grid = [];
        this.initialize();
    }

    initialize() {
        for (let r = 0; r < 9; r++) {
            const row = [];
            for (let c = 0; c < 9; c++) {
                const isRowWall = r % 2 === 0;
                const isColWall = c % 2 === 0;

                if (isRowWall && isColWall) {
                    row.push({ type: 'corner', r, c });
                } else if (isRowWall) {
                    row.push(new Wall(r, c, 'horizontal'));
                } else if (isColWall) {
                    row.push(new Wall(r, c, 'vertical'));
                } else {
                    const tileRow = Math.floor(r / 2);
                    const tileCol = Math.floor(c / 2);
                    row.push(new Tile(tileRow, tileCol));
                }
            }
            this.grid.push(row);
        }
    }

    getWallBetween(r1, c1, r2, c2) {
        const gr1 = r1 * 2 + 1;
        const gc1 = c1 * 2 + 1;
        const gr2 = r2 * 2 + 1;
        const gc2 = c2 * 2 + 1;

        const wallR = (gr1 + gr2) / 2;
        const wallC = (gc1 + gc2) / 2;

        return this.grid[wallR][wallC];
    }
}

// Run Test
console.log("Initializing Board...");
const board = new BoardModel();

console.log("Generating Walls...");
WallGenerator.generate(board);

console.log("\nGenerated Board ASCII Representation:");
console.log(WallGenerator.generateASCII(board));
