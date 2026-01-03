class GameController {
    constructor(game, boardView, selectionView, compassView, narrator) {
        this.game = game;
        this.boardView = boardView;
        this.selectionView = selectionView;
        this.compassView = compassView;
        this.narrator = narrator;
        this.selectedPlayer = null;
        this.gameState = game.gameState;
        this.debugViewAll = false;
        this.debugEditMode = false;
    }

    init() {
        this.selectionView.bindStartGame(async (data) => await this.handleSelectionView(data));
        this.boardView.bindEndTurn(() => this.handleEndTurn());

        this.compassView.bindSwitchToBoard(() => this.switchToBoard());
        this.boardView.bindGoBack(() => this.switchToCompass());

        // Debug bindings
        this.boardView.bindToggleDebugView(() => this.toggleDebugView());
        this.boardView.bindToggleEditMode(() => this.toggleEditMode());

        // Magic Compass bindings
        this.compassView.bindNorthButtonClick(() => this._handleNorthClick());
        this.compassView.bindEastButtonClick(() => this._handleEastClick());
        this.compassView.bindSouthButtonClick(() => this._handleSouthClick());
        this.compassView.bindWestButtonClick(() => this._handleWestClick());
        this.compassView.bindBlueRabbitButtonClick(() => this._handleBlueRabbitClick());
        this.compassView.bindYellowMouseButtonClick(() => this._handleYellowMouseClick());
        this.compassView.bindGreenRabbitButtonClick(() => this._handleGreenRabbitClick());
        this.compassView.bindRedMouseButtonClick(() => this._handleRedMouseClick());
        this.compassView.bindHelpButtonClick(() => this._handleHelpClick());
        this.compassView.bindHelpButtonClick(() => this._handleHelpClick());
        this.compassView.bindHelpButtonLongPress(() => this._handleHelpLongPress());

        // Render board immediately to allow setup, but keep hidden
        this.boardView.render(this.game, this);
        this.selectionView.render();

        // Start with Compass View
        this.compassView.render();
        this.compassView.show();

        // Ensure other views are hidden initially
        document.getElementById('board-container').classList.add('hidden');
        this.selectionView.hide();

        // Audio sequence will be triggered by start()
    }

    async start() {
        const popup = document.getElementById('start-popup');
        if (popup) popup.classList.add('hidden');
        await this.gameState.init();
    }

    async handleEndTurn() {
        this.compassView.togglePlayerLightOff(this.game.currentPlayer)
        await this.game.endTurn();
        this.selectedPlayer = null;
        this.boardView.render(this.game, this);
        this.compassView.togglePlayerLightOn(this.game.currentPlayer);
    }

    async handleSelectionView(data) {
        await data.players.forEach(async (player) => {
            await this.game.addPlayer(player);
        });
        await this.gameState.selectFirstPlayer();
        if (data.firstPlayer) {
            await this.game.setFirstPlayer(data.firstPlayer);
        }
        await this.gameState.startGame();
        this.selectionView.hide();
        this.boardView.render(this.game, this); // Re-render to show players
    }

    handlePlayerClick(player) {
        if (!this.gameState.isPlaying()) return;

        if (player !== this.game.currentPlayer) {
            this.narrator.itsPlayerTurn(player);
            return;
        }

        this.selectedPlayer = player;
        this.boardView.render(this.game, this);
    }

    async handleTileClick(tile) {
        if (!this.gameState.isPlaying() || !this.selectedPlayer) return;

        const player = this.game.currentPlayer;

        // Check adjacency (no diagonals)
        const direction = Direction.getDirection(tile.row - player.row, tile.col - player.col);

        this.compassView.togglePlayerLightOff(this.game.currentPlayer);
        await this.game.moveCurrentPlayer(direction);
        this.selectedPlayer = null;
        this.boardView.render(this.game, this);
        this.compassView.togglePlayerLightOn(this.game.currentPlayer);
    }

    handleWallClick(wall) {
        this.selectedPlayer = null;
        if (wall.isExternal) return;

        // Edit Mode Logic
        if (this.debugEditMode) {
            wall.cycleState();
            this.boardView.updateWall(wall);
        }
    }

    handleWallRightClick(wall) {
        this.selectedPlayer = null;
        if (wall.isExternal) return;

        if (this.debugEditMode) {
            if (wall.type === WallType.MAGIC_DOOR) {
                wall.toggleOpen();
                this.boardView.updateWall(wall);
            }
        }
    }

    toggleDebugView() {
        this.debugViewAll = !this.debugViewAll;
        this.boardView.setDebugState(this.debugViewAll, this.debugEditMode);
        this.boardView.render(this.game, this);
    }

    toggleEditMode() {
        this.debugEditMode = !this.debugEditMode;
        if (this.debugEditMode) {
            this.debugViewAll = true; // Edit mode implies seeing everything
        }
        this.boardView.setDebugState(this.debugViewAll, this.debugEditMode);
        this.boardView.render(this.game, this);
    }

    switchToCompass() {
        document.getElementById('board-container').classList.add('hidden');
        this.selectionView.hide();
        this.compassView.show();
    }

    handleGoBack() {
        // Go back to selection screen
        this.boardView.hide(); // Assuming BoardView has/needs a hide
        document.getElementById('board-container').classList.add('hidden');
        this.selectionView.show();
        // Reset game state? Maybe not necessary unless they want to restart
    }

    switchToBoard() {
        this.compassView.hide();
        const boardContainer = document.getElementById('board-container');
        if (boardContainer) boardContainer.classList.remove('hidden');

        if (this.gameState && this.gameState.is && this.gameState.is(GameStates.SELECTING_PLAYERS)) {
            this.selectionView.show();
        }
        this.boardView.render(this.game, this);
    }

    async _handleBlueRabbitClick() {
        await this._handlePlayerClick(Player.BLUE_RABBIT);
    }

    async _handleYellowMouseClick() {
        await this._handlePlayerClick(Player.YELLOW_MOUSE);
    }

    async _handleGreenRabbitClick() {
        await this._handlePlayerClick(Player.GREEN_RABBIT);
    }

    async _handleRedMouseClick() {
        await this._handlePlayerClick(Player.RED_MOUSE);
    }

    async _handlePlayerClick(playerInfo) {
        if (this._onInterruption()) {
            return;
        }
        if (this.gameState.is(GameStates.SELECTING_PLAYERS)) {
            await this._handleSelectPlayer(playerInfo);
            return;
        }

        if (this.gameState.is(GameStates.SELECTING_FIRST_PLAYER)) {
            await this._handleSelectFirstPlayer(playerInfo);
            return;
        }

        if (this.gameState.isPlaying()) {
            await this.game.givePlayerPosition(playerInfo);
            return;
        }
    }

    async _handleSelectPlayer(playerInfo) {
        if (await this.game.addPlayer(playerInfo)) {
            this.compassView.togglePlayerLightOn(playerInfo);
        }
    }

    async _handleSelectFirstPlayer(playerInfo) {
        if (await this.game.setFirstPlayer(playerInfo)) {
            this.compassView.togglePlayerLightOn(playerInfo);
            await this.gameState.startGame();
        }
    }

    async _handleNorthClick() {
        await this._handleDirectionClick(Direction.NORTH);
    }

    async _handleEastClick() {
        await this._handleDirectionClick(Direction.EAST);
    }

    async _handleSouthClick() {
        await this._handleDirectionClick(Direction.SOUTH);
    }

    async _handleWestClick() {
        await this._handleDirectionClick(Direction.WEST);
    }

    async _handleDirectionClick(direction) {
        if (this._onInterruption()) {
            return;
        }
        if (this.gameState.isOver()) {
            return;
        }
        if (!this.gameState.isPlaying()) {
            this.narrator.selectPlayers();
            return;
        }

        this.compassView.togglePlayerLightOff(this.game.currentPlayer);
        await this.game.moveCurrentPlayer(direction);
        if (!this.game.isOver()) {
            this.compassView.togglePlayerLightOn(this.game.currentPlayer);
        }
    }

    async _handleHelpClick() {
        if (this._onInterruption()) {
            return;
        }
        if (this.gameState.is(GameStates.SELECTING_PLAYERS)) {
            if (await this.gameState.selectFirstPlayer()) {
                this.compassView.togglePlayerLightsOff();
            }
            return;
        }
        if (this.gameState.is(GameStates.SELECTING_FIRST_PLAYER)) {
            // Transition via player button (selecting first player).
            return;
        }
        if (this.gameState.isPlaying()) {
            this.compassView.togglePlayerLightOff(this.game.currentPlayer);
            await this.game.giveHint();
            if (!this.game.isOver()) {
                this.compassView.togglePlayerLightOn(this.game.currentPlayer);
            } return;
        }
    }

    async _handleHelpLongPress() {
        if (this._onInterruption()) {
            return;
        }
        if (this.gameState.isOver()) {
            return;
        }
        if (!this.gameState.isPlaying()) {
            this.narrator.selectPlayers();
            return;
        }
        if (!this.game.previousPlayer) {
            return;
        }
        this.compassView.togglePlayerLightOff(this.game.currentPlayer);
        this.compassView.togglePlayerLightOn(this.game.previousPlayer);
        await this.narrator.replayLastTurn();
        this.compassView.togglePlayerLightOff(this.game.previousPlayer);
        this.compassView.togglePlayerLightOn(this.game.currentPlayer);
    }

    _onInterruption() {
        return this.narrator.interrupt();
    }
}
