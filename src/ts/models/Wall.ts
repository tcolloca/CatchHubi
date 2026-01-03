export enum WallType {
    NO_WALL = 'no_wall',
    MOUSE_HOLE = 'mouse_hole',
    RABBIT_WINDOW = 'rabbit_window',
    WALL = 'wall',
    FREE_PASSAGE = 'free_passage',
    MAGIC_DOOR = 'magic_door',
}

export enum WallOrientation {
    HORIZONTAL = 'horizontal',
    VERTICAL = 'vertical',
}

export class Wall {
    row: number;
    col: number;
    type: WallType;
    isOpen: boolean;
    isExternal: boolean;
    orientation: WallOrientation;
    isRevealed: boolean;

    constructor(row: number, col: number, isExternal: boolean, orientation: WallOrientation) {
        this.row = row;
        this.col = col;
        this.type = WallType.NO_WALL;
        this.isOpen = false;
        this.isExternal = isExternal;
        this.orientation = orientation;
        this.isRevealed = this.isExternal; // External always revealed, internal hidden
    }

    cycleState() {
        if (this.isExternal) return;

        switch (this.type) {
            case WallType.NO_WALL:
                this.type = WallType.MOUSE_HOLE;
                break;
            case WallType.MOUSE_HOLE:
                this.type = WallType.RABBIT_WINDOW;
                break;
            case WallType.RABBIT_WINDOW:
                this.type = WallType.WALL;
                break;
            case WallType.WALL:
                this.type = WallType.FREE_PASSAGE;
                break;
            case WallType.FREE_PASSAGE:
                this.type = WallType.MAGIC_DOOR;
                break;
            case WallType.MAGIC_DOOR:
                this.type = WallType.NO_WALL;
                this.isOpen = false;
                break;
        }
    }

    toggleOpen() {
        if (this.isExternal) return;

        if (this.type === WallType.MAGIC_DOOR) {
            this.isOpen = !this.isOpen;
        }
    }

    open() {
        this.isOpen = true;
    }

    reveal() {
        this.isRevealed = true;
    }
}
