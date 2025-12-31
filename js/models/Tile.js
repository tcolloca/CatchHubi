const CreatureType = {
    Owl: "owl",
    Millipede: "millipede",
    Bat: "bat",
    Frog: "frog",
};

const CreatureColor = {
    White: "white",
    Black: "black",
}

class Tile {
    constructor(row, col, type, color, flipped) {
        this.row = row;
        this.col = col;
        this.type = type;
        this.color = color;
        this.flipped = flipped;
    }
}
