class Narrator {
    constructor(audioManager, messages, language) {
        this.audioManager = audioManager;
        this.messages = messages;
        this.language = language;
        this._waitingForMessage = 0;
    }

    async intro() {
        this._interrupted = false;
        await this._playSequence('music', [
            'intro.m4a',
        ]);
        await this._playSequence('hubi', [
            'game_intro.m4a',
        ], 'game_intro');
        await this.selectPlayers();
    }

    async selectPlayers() {
        this._interrupted = false;
        await this._playSequence('host',
            ['players_selection_intro.m4a'],
            'player_selection_intro');
    }

    async addPlayer(playerInfo) {
        this._interrupted = false;
        await this._playSequence('host', [
            'player_selected_pre.m4a',
            this._playerName(playerInfo),
            'player_selected_post.m4a'
        ], 'player_selected', [playerInfo.name]);
    }

    async playerAlreadyInGame(playerInfo) {
        this._interrupted = false;
        await this._playSequence('host', [
            this._playerName(playerInfo),
            'player_already_in_game.m4a',
        ], 'player_already_in_game', [playerInfo.name]);
    }

    async bothRabbitAndMouseRequired() {
        this._interrupted = false;
        await this._playSequence('host', [
            'both_rabbit_and_mouse_required.m4a',
        ], 'both_rabbit_and_mouse_required');
    }

    async selectFirstPlayer() {
        this._interrupted = false;
        await this._playSequence('host', [
            'select_first_player.m4a',
        ], 'select_first_player');
    }

    async firstPlayerSelected(playerInfo) {
        this._interrupted = false;
        await this._playSequence('host', [
            this._playerName(playerInfo),
            'first_player_selected.m4a'
        ], 'first_player_selected', [playerInfo.name]);
    }

    async firstPlayerNotSelected() {
        this._interrupted = false;
        await this._playSequence('host', [
            'first_player_not_selected.m4a',
        ], 'first_player_not_selected');
    }

    async firstPlayerMustBeInGame() {
        this._interrupted = false;
        await this._playSequence('host', [
            'first_player_must_be_in_game.m4a',
        ], 'first_player_must_be_in_game');
    }

    async gameStart() {
        this._interrupted = false;
        await this._playSequence('music', [
            'game_start.m4a',
        ]);
    }

    async askWhereTo(creature, playerInfo) {
        this._interrupted = false;
        await this._playSequence('sfx', [`${creature.type}.m4a`]);
        await this._playSequence(creature.type, [
            this._playerName(playerInfo),
            'ask_where_to.m4a',
        ], 'ask_where_to', [playerInfo.name]);
    }

    async invalidMoveDiagonal() {
        this._interrupted = false;
        await this._playSequence('host', [
            'invalid_mode_diagonal.m4a',
        ], 'invalid_mode_diagonal');
    }

    async magicDoorOpened(creature) {
        this._interrupted = false;
        await this._playSequence('sfx', [
            'open_door.m4a',
        ]);
        await this._playSequence(creature.type, [
            'magic_door_opened.m4a',
        ], 'magic_door_opened');
    }

    async announceWall(creature, wall) {
        this._interrupted = false;
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
        this._interrupted = false;
        await this._playSequence(creature.type, [
            'can_pass_through.m4a',
        ], 'can_pass_through', []);
    }

    async cannotPassThrough(creature) {
        this._interrupted = false;
        await this._playSequence(creature.type, [
            'cannot_pass_through.m4a',
        ], 'cannot_pass_through', []);
    }

    async giveHint(creature, hint) {
        this._interrupted = false;
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
        this._interrupted = false;
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
        this._interrupted = false;
        await this._playSequence('sfx', [
            'ghost.m4a',
        ]);
        await this._playSequence('hubi', [
            'ghost_moved.m4a',
        ], 'ghost_moved');
    }

    async bonusMove(creature) {
        this._interrupted = false;
        await this._playSequence(creature.type, [
            'bonus_move.m4a',
        ], 'bonus_move');
    }

    async itsPlayerTurn(playerInfo) {
        this._interrupted = false;
        await this._playSequence('host', [
            this._playerName(playerInfo),
            'its_player_turn.m4a',
        ], 'its_player_turn', [player.name]);
    }

    async gameWon() {
        this._interrupted = false;
        await this._playSequence('music', [
            'game_win.m4a',
        ]);
        await this._playSequence('host', [
            'game_won.m4a',
        ], 'game_won');
    }

    async gameOver() {
        this._interrupted = false;
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
            await this._displayMessage(source, labelId, args);
        }
    }

    async _displayMessage(source, labelId, args) {
        if (this._messagePromise) {
            this._waitingForMessage++;
            await this._messagePromise;
            this._waitingForMessage--;
        }
        const container = document.getElementById('narrator-message-container');
        if (!container) return;

        // Wait for previous message to finish its minimum duration
        if (this._messagePromise) {
            await this._messagePromise;
        }

        // // If we were interrupted while waiting, don't show the new message
        // if (this._interrupted) {
        //     this._interrupted = false;
        //     return;
        // }

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
        if (this.audioManager.stopAll()) {
            interrupted = true;
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
        return interrupted && this._waitingForMessage > 0;
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
