import { Difficulty } from './Difficulty';
import { Creature } from './Creature';

export class GhostHint {
    ghostCreature: Creature;
    difficulty: string;

    constructor(ghostCreature: Creature, difficulty: string) {
        this.ghostCreature = ghostCreature;
        this.difficulty = difficulty;
    }

    getGhostCreatureHint(): string {
        if (this.difficulty === Difficulty.EASY) {
            return this._getFullGhostCreature();
        } else {
            return this._getPartialGhostCreature();
        }
    }

    _getFullGhostCreature(): string {
        return `${this.ghostCreature.color}_${this.ghostCreature.type}`;
    }

    _getPartialGhostCreature(): string {
        return `${this.ghostCreature.type}`;
    }
}