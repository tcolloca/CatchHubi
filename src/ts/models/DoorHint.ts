import { Difficulty } from './Difficulty';
import { Creature } from './Creature';

export class DoorHint {
    creature1: Creature;
    creature2: Creature;
    difficulty: string;

    constructor(creature1: Creature, creature2: Creature, difficulty: string) {
        this.creature1 = creature1;
        this.creature2 = creature2;
        this.difficulty = difficulty;
    }

    getCreature1Hint(): string {
        if (this.difficulty === Difficulty.EASY) {
            return this._getFullCreature1();
        } else {
            return this._getPartialCreature1();
        }
    }

    getCreature2Hint(): string {
        if (this.difficulty === Difficulty.EASY) {
            return this._getFullCreature2();
        } else {
            return this._getPartialCreature2();
        }
    }

    _getFullCreature1(): string {
        return `${this.creature1.color}_${this.creature1.type}`;
    }

    _getPartialCreature1(): string {
        return `${this.creature1.type}`;
    }

    _getFullCreature2(): string {
        return `${this.creature2.color}_${this.creature2.type}`;
    }

    _getPartialCreature2(): string {
        return `${this.creature2.type}`;
    }
}