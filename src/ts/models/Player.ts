export enum PlayerColor {
    BLUE = 'blue',
    GREEN = 'green',
    YELLOW = 'yellow',
    RED = 'red'
}

export enum PlayerType {
    RABBIT = 'rabbit',
    MOUSE = 'mouse'
}

export class Player {
    static BLUE_RABBIT = new Player(PlayerColor.BLUE, PlayerType.RABBIT);
    static GREEN_RABBIT = new Player(PlayerColor.GREEN, PlayerType.RABBIT);
    static YELLOW_MOUSE = new Player(PlayerColor.YELLOW, PlayerType.MOUSE);
    static RED_MOUSE = new Player(PlayerColor.RED, PlayerType.MOUSE);

    color: PlayerColor;
    type: PlayerType;
    name: string;
    row: number;
    col: number;

    constructor(color: PlayerColor, type: PlayerType) {
        this.color = color; // PlayerColor
        this.type = type; // PlayerType
        this.name = `${color}_${type}`;
        this.row = -1;
        this.col = -1;

        // Set initial position based on color
        // Green: Top-Left (0,0)
        // Red: Top-Right (0,3)
        // Blue: Bottom-Left (3,0)
        // Yellow: Bottom-Right (3,3)
        this.setInitialPosition();
    }

    setInitialPosition() {
        switch (this.color) {
            case PlayerColor.GREEN:
                this.row = 0;
                this.col = 0;
                break;
            case PlayerColor.RED:
                this.row = 0;
                this.col = 3;
                break;
            case PlayerColor.BLUE:
                this.row = 3;
                this.col = 0;
                break;
            case PlayerColor.YELLOW:
                this.row = 3;
                this.col = 3;
                break;
        }
    }

    capitalize(str: string): string {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}
