export enum CreatureType {
    Owl = "owl",
    Millipede = "millipede",
    Bat = "bat",
    Frog = "frog",
}

export enum CreatureColor {
    White = "white",
    Black = "black",
}

export class Tile {
    row: number;
    col: number;
    type: CreatureType;
    color: CreatureColor;
    flipped: boolean;

    constructor(row: number, col: number, type: CreatureType, color: CreatureColor, flipped: boolean) {
        this.row = row;
        this.col = col;
        this.type = type;
        this.color = color;
        this.flipped = flipped;
    }
}
