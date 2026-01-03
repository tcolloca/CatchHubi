export class Direction {
    static NORTH: Direction = new Direction('north');
    static EAST: Direction = new Direction('east');
    static SOUTH: Direction = new Direction('south');
    static WEST: Direction = new Direction('west');

    static getDirection(dRow: number, dCol: number): Direction {
        if (dRow === 0 && dCol === 0) {
            throw new Error("Invalid direction delta: 0, 0");
        }
        if (dRow === 0) {
            return dCol < 0 ? Direction.WEST : Direction.EAST;
        }
        if (dCol === 0) {
            return dRow < 0 ? Direction.NORTH : Direction.SOUTH;
        }
        throw new Error(`Invalid direction delta: ${dRow}, ${dCol}`);
    }

    value: string;

    constructor(value: string) {
        this.value = value;
    }

    dRow(): number {
        switch (this) {
            case Direction.NORTH:
                return -1;
            case Direction.SOUTH:
                return 1;
            default:
                return 0;
        }
    }

    dCol(): number {
        switch (this) {
            case Direction.EAST:
                return 1;
            case Direction.WEST:
                return -1;
            default:
                return 0;
        }
    }
}