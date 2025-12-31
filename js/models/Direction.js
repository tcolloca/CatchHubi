class Direction {
    static NORTH = new Direction('north');
    static EAST = new Direction('east');
    static SOUTH = new Direction('south');
    static WEST = new Direction('west');

    static getDirection(dRow, dCol) {
        if (dRow === 0 && dCol === 0) {
            return null;
        }
        if (dRow === 0) {
            return dCol < 0 ? Direction.WEST : Direction.EAST;
        }
        if (dCol === 0) {
            return dRow < 0 ? Direction.NORTH : Direction.SOUTH;
        }
    }

    constructor(value) {
        this.value = value;
    }

    dRow() {
        switch (this) {
            case Direction.NORTH:
                return -1;
            case Direction.SOUTH:
                return 1;
            default:
                return 0;
        }
    }

    dCol() {
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