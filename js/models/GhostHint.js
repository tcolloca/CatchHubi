class GhostHint {
    constructor(ghostCreature, difficulty) {
        this.ghostCreature = ghostCreature;
        this.difficulty = difficulty;
    }

    getGhostCreatureHint() {
        if (this.difficulty === Difficulty.EASY) {
            return this._getFullGhostCreature();
        } else {
            return this._getPartialGhostCreature();
        }
    }

    _getFullGhostCreature() {
        return `${this.ghostCreature.color}_${this.ghostCreature.type}`;
    }

    _getPartialGhostCreature() {
        return `${this.ghostCreature.type}`;
    }
}