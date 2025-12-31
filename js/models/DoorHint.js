class DoorHint {
    constructor(creature1, creature2, difficulty) {
        this.creature1 = creature1;
        this.creature2 = creature2;
        this.difficulty = difficulty;
    }

    getCreature1Hint() {
        if (this.difficulty === Difficulty.EASY) {
            return this._getFullCreature1();
        } else {
            return this._getPartialCreature1();
        }
    }

    getCreature2Hint() {
        if (this.difficulty === Difficulty.EASY) {
            return this._getFullCreature2();
        } else {
            return this._getPartialCreature2();
        }
    }

    _getFullCreature1() {
        return `${this.creature1.color}_${this.creature1.type}`;
    }

    _getPartialCreature1() {
        return `${this.creature1.type}`;
    }

    _getFullCreature2() {
        return `${this.creature2.color}_${this.creature2.type}`;
    }

    _getPartialCreature2() {
        return `${this.creature2.type}`;
    }
}