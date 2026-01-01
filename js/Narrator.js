class Narrator {
    constructor(audioManager, messages, language) {
        this.audioManager = audioManager;
        this.messages = messages;
        this.language = language;
        this._waitingForMessage = 0;
    }

    async intro() {
        await this._playSequence('music', [
            'intro.m4a',
        ]);
        await this._playSequence('hubi', [
            'game_intro.m4a',
        ], 'game_intro');
        await this._playSequence('host', [
            'game_intro_2.m4a',
        ], 'game_intro_2');
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
        console.log('askWhereTo');
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

    async magicDoorOpened(creature, isFirstDoor) {
        await this._playSequence('sfx', [
            'open_door.m4a',
        ]);
        await this._playSequence(creature.type, [
            'magic_door_opened.m4a',
        ], 'magic_door_opened');
        if (isFirstDoor) {
            await this._playSequence('hubi', [
                'hubi_awake.m4a',
            ], 'hubi_awake');
        }
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
        ], wallName, []);
    }

    async canPassThrough(creature) {
        await this._playSequence(creature.type, [
            'can_pass_through.m4a',
        ], 'can_pass_through', []);
    }

    async cannotPassThrough(creature) {
        await this._playSequence(creature.type, [
            'cannot_pass_through.m4a',
        ], 'cannot_pass_through', []);
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
            'hubi_moved.m4a',
        ], 'hubi_moved');
        await this._playSequence('host', [
            'ghost_moved.m4a',
        ], 'ghost_moved');
    }

    async hubiFoundByOnePlayer() {
        await this._playSequence('hubi', [
            'hubi_found_by_one_player.m4a',
        ], 'hubi_found_by_one_player');
    }

    async hubiFoundByTwoPlayers() {
        await this._playSequence('hubi', [
            'hubi_found_by_two_players.m4a',
        ], 'hubi_found_by_two_players');
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
        await this.hubiFoundByTwoPlayers();
        await this._playSequence('music', [
            'game_win_1.m4a',
        ]);
        await this._playSequence('host', [
            'game_won.m4a',
        ], 'game_won');
        await this._playSequence('music', [
            'game_win_2.m4a',
        ]);
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
        if (this._messagePromise) {
            this._waitingForMessage++;
            await this._messagePromise;
            this._waitingForMessage--;
        }
        this._interrupted = false;
        const success = await this.audioManager.playSequence(source, filesSequence);

        if (!success && labelId) {
            await this._displayMessage(source, labelId, args);
        }
    }

    async _displayMessage(source, labelId, args) {
        const container = document.getElementById('narrator-message-container');
        if (!container) return;

        let msg = this._getMessage(labelId, args);
        let localizedSource = source ? (this.messages[this.language][source] || this._capitalize(source)) : '';

        container.innerHTML = `
            ${localizedSource ? `<span class="source">${localizedSource}:</span>` : ''}
            <span class="text">${msg}</span>
        `;

        container.classList.add('active');

        this._messagePromise = new Promise(resolve => {
            const clear = (resolve) => {
                container.classList.remove('active');
                this._messagePromise = null;
                this._resolveInterruption = null;
                resolve();
            };

            this._resolveInterruption = () => clear(resolve);

            if (this._messageTimeout) {
                clearTimeout(this._messageTimeout);
            }
            this._messageTimeout = setTimeout(() => clear(resolve), Constants.NARRATOR_MESSAGE_DURATION);
        });
    }

    interrupt() {
        let interrupted = false;
        let waitingForAudios = 0;
        if (this.audioManager.stopAll()) {
            interrupted = true;
            waitingForAudios = this.audioManager.waitingForAudios;
        }

        const container = document.getElementById('narrator-message-container');
        if (container) {
            container.classList.remove('active');
        }

        if (this._messageTimeout) {
            clearTimeout(this._messageTimeout);
            this._messageTimeout = null;
        }

        // Only set interrupted if we are actually waiting for a message to finish
        if (this._messagePromise || this._resolveInterruption) {
            interrupted = true;
        }

        if (this._resolveInterruption) {
            this._resolveInterruption();
            this._resolveInterruption = null;
        }
        this._messagePromise = null;
        return interrupted && (this._waitingForMessage > 0 || waitingForAudios > 0);
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
