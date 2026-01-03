import { Tile, CreatureType, CreatureColor } from './Tile';
import { Wall, WallOrientation } from './Wall';
import { WallGenerator } from './WallGenerator';
import { Creature } from './Creature';
import { Entity } from './Entity';
import { Difficulty } from './Difficulty';

export class Board {
    tiles: Tile[][];
    horizontalWalls: Wall[][];
    verticalWalls: Wall[][];
    magicDoors: Wall[];

    constructor(difficulty: Difficulty) {
        this.tiles = [];
        this.horizontalWalls = [];
        this.verticalWalls = [];
        this.magicDoors = [];
        this.initialize(difficulty);
    }

    initialize(difficulty: Difficulty) {
        const top = [[CreatureType.Owl, CreatureType.Millipede, CreatureType.Frog, CreatureType.Owl],
        [CreatureType.Frog, CreatureType.Bat, CreatureType.Bat, CreatureType.Millipede]];
        for (let r = 0; r < 4; r++) {
            let tilesRow: Tile[] = [];
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
            let horizontalRow: Wall[] = [];
            let verticalRow: Wall[] = [];
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
        WallGenerator.generate(this, difficulty);
    }

    // Helper to get wall between two tiles
    getWallBetween(r1: number, c1: number, r2: number, c2: number): Wall | undefined {
        if (r1 == r2) {
            return this.verticalWalls[r1][Math.max(c1, c2)];
        } else if (c1 == c2) {
            return this.horizontalWalls[Math.max(r1, r2)][c1];
        }
        throw new Error(`Invalid wall coordinates: ${r1},${c1} to ${r2},${c2}`);
    }

    getTilesOnBothSides(wall: Wall): Tile[] {
        if (wall.orientation === WallOrientation.HORIZONTAL) {
            return [this.tiles[wall.row - 1][wall.col], this.tiles[wall.row][wall.col]];
        } else {
            return [this.tiles[wall.row][wall.col - 1], this.tiles[wall.row][wall.col]];
        }
    }

    getCell(r: number, c: number): Tile {
        return this.tiles[r][c];
    }

    getCreature(entity: Entity): Creature {
        return this.tiles[entity.row][entity.col];
    }
}
