class Narrator {
    constructor(audioManager, messages, language) {
        this.audioManager = audioManager;
        this.messages = messages;
        this.language = language;
    }

    async intro() {
        await this._playSequence('music', [
            'intro.m4a',
        ]);
        await this._playSequence('hubi', [
            'game_intro.m4a',
        ], 'game_intro');
        await this.selectPlayers();
    }

    async selectPlayers() {
        await this._playSequence('host',
            ['players_selection_intro.m4a'],
            'player_selection_intro');
    }

    async addPlayer(playerInfo) {
        await this._playSequence('host', [
            'player_selected_pre.m4a',
            this._playerName(playerInfo),
            'player_selected_post.m4a'
        ], 'player_selected', [playerInfo.name]);
    }

    async playerAlreadyInGame(playerInfo) {
        await this._playSequence('host', [
            this._playerName(playerInfo),
            'player_already_in_game.m4a',
        ], 'player_already_in_game', [playerInfo.name]);
    }

    async bothRabbitAndMouseRequired() {
        await this._playSequence('host', [
            'both_rabbit_and_mouse_required.m4a',
        ], 'both_rabbit_and_mouse_required');
    }

    async selectFirstPlayer() {
        await this._playSequence('host', [
            'select_first_player.m4a',
        ], 'select_first_player');
    }

    async firstPlayerSelected(playerInfo) {
        await this._playSequence('host', [
            this._playerName(playerInfo),
            'first_player_selected.m4a'
        ], 'first_player_selected', [playerInfo.name]);
    }

    async firstPlayerNotSelected() {
        await this._playSequence('host', [
            'first_player_not_selected.m4a',
        ], 'first_player_not_selected');
    }

    async firstPlayerMustBeInGame() {
        await this._playSequence('host', [
            'first_player_must_be_in_game.m4a',
        ], 'first_player_must_be_in_game');
    }

    async gameStart() {
        await this._playSequence('music', [
            'game_start.m4a',
        ]);
    }

    async askWhereTo(creature, playerInfo) {
        await this._playSequence('sfx', [`${creature.type}.m4a`]);
        await this._playSequence(creature.type, [
            this._playerName(playerInfo),
            'ask_where_to.m4a',
        ], 'ask_where_to', [playerInfo.name]);
    }

    async invalidMoveDiagonal() {
        await this._playSequence('host', [
            'invalid_mode_diagonal.m4a',
        ], 'invalid_mode_diagonal');
    }

    async magicDoorOpened(creature) {
        await this._playSequence('sfx', [
            'open_door.m4a',
        ]);
        await this._playSequence(creature.type, [
            'magic_door_opened.m4a',
        ], 'magic_door_opened');
    }

    async announceWall(creature, wall) {
        let wallName = `${wall.type}`;
        if (wall.isExternal) {
            wallName = "external_wall";
        } else if (wall.isOpen) {
            wallName = `opened_${wall.type}`;
        }
        await this._playSequence(creature.type, [
            `${wallName}.m4a`,
        ], wallName);
    }

    async canPassThrough(creature) {
        await this._playSequence(creature.type, [
            'can_pass_through.m4a',
        ], 'can_pass_through');
    }

    async cannotPassThrough(creature) {
        await this._playSequence(creature.type, [
            'cannot_pass_through.m4a',
        ], 'cannot_pass_through');
    }

    async giveHint(creature, hint) {
        if (hint instanceof GhostHint) {
            await this._playSequence(creature.type, [
                'ghost_hint.m4a',
                `${hint.getGhostCreatureHint()}.m4a`,
            ], 'ghost_hint', [hint.getGhostCreatureHint()]);
        } else if (hint instanceof DoorHint) {
            await this._playSequence(creature.type, [
                'door_hint.m4a',
                `${hint.getCreature1Hint()}.m4a`,
                'and.m4a',
                `${hint.getCreature2Hint()}.m4a`,
            ], 'door_hint', [hint.getCreature1Hint(), hint.getCreature2Hint()]);
        }
    }

    async givePlayerPosition(playerInfo, creature, owl, color) {
        await this._playSequence('host', [
            this._playerName(playerInfo),
            'player_position.m4a',
            `${creature.color}_${creature.type}.m4a`,
            `closer_to.m4a`,
            `${owl.color}_${owl.type}.m4a`,
            'cell.m4a',
            `${color}.m4a`,
        ], 'player_position',
            [playerInfo.name, `${creature.color}_${creature.type}`, `${owl.color}_${owl.type}`, color]
        );
    }

    async ghostMoved() {
        await this._playSequence('sfx', [
            'ghost.m4a',
        ]);
        await this._playSequence('hubi', [
            'ghost_moved.m4a',
        ], 'ghost_moved');
    }

    async bonusMove(creature) {
        await this._playSequence(creature.type, [
            'bonus_move.m4a',
        ], 'bonus_move');
    }

    async itsPlayerTurn(playerInfo) {
        await this._playSequence('host', [
            this._playerName(playerInfo),
            'its_player_turn.m4a',
        ], 'its_player_turn', [player.name]);
    }

    async gameWon() {
        await this._playSequence('music', [
            'game_win.m4a',
        ]);
        await this._playSequence('host', [
            'game_won.m4a',
        ], 'game_won');
    }

    async gameOver() {
        await this._playSequence('music', [
            'game_over.m4a',
        ]);
        await this._playSequence('host', [
            'game_over.m4a',
        ], 'game_over');
    }

    async _playSequence(source, filesSequence, labelId = null, args = []) {
        // TODO: remove
        if (source === 'sfx' || source === 'music') {
            return;
        }
        const success = await this.audioManager.playSequence(source, filesSequence);

        if (!success && labelId) {
            let msg = this._getMessage(labelId, args);
            if (source) {
                msg = `${this._capitalize(source)}: ${msg}`;
            }
            alert(msg);
        }
    }

    _getMessage(labelId, args = []) {
        let msg = this.messages[this.language][labelId] || labelId;
        args.forEach((arg, index) => {
            msg = msg.replace(`{${index}}`, this.messages[this.language][arg] || arg);
        });
        return msg;
    }

    _playerName(playerInfo) {
        return `${playerInfo.color}_${playerInfo.type}.m4a`;
    }

    _capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}
