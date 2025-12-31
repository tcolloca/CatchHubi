class BoardView {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.wallElements = new Map(); // Map 'r,c' to DOM element
        this.navClickCount = 0;
    }

    render(game, controller) {
        this.container.innerHTML = ''; // Clear existing
        this.wallElements.clear();

        // Create message box
        this.messageBox = document.createElement('div');
        this.messageBox.className = 'message-box';
        this.container.appendChild(this.messageBox);

        // Create Debug Panel
        this.createDebugPanel(controller);

        const boardDiv = document.createElement('div');
        boardDiv.className = 'board';
        if (this.debugEditMode) boardDiv.classList.add('edit-mode');
        this.container.appendChild(boardDiv);

        // Invisible Nav Button (To Magic Compass)
        const invBtn = document.createElement('div');
        invBtn.className = 'invisible-nav-btn';
        invBtn.onclick = () => {
            this.navClickCount++;
            if (this.navClickCount >= Constants.SWITCH_VIEW_CLICKS) {
                this.navClickCount = 0;
                this.onNavigateToCompass && this.onNavigateToCompass();
            }
        };
        this.container.appendChild(invBtn);

        // Go Back Button
        const backBtn = document.createElement('button');
        backBtn.className = 'go-back-btn';
        backBtn.textContent = 'Go Back';
        backBtn.onclick = () => this.onGoBack && this.onGoBack();
        this.container.appendChild(backBtn);

        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                const isRowWall = r % 2 === 0;
                const isColWall = c % 2 === 0;

                if (isRowWall && isColWall) {
                    // Intersection/Corner
                    const div = document.createElement('div');
                    div.className = 'corner';
                    boardDiv.appendChild(div);
                } else if (isRowWall) {
                    // Horizontal Wall
                    this.createWallElement(game.board.horizontalWalls[r / 2][Math.floor(c / 2)], controller, boardDiv);
                } else if (isColWall) {
                    // Vertical Wall
                    this.createWallElement(game.board.verticalWalls[Math.floor(r / 2)][c / 2], controller, boardDiv);
                } else {
                    // Tile
                    const tileRow = Math.floor(r / 2);
                    const tileCol = Math.floor(c / 2);
                    this.createTileElement(game.board.getCell(tileRow, tileCol), game, controller, boardDiv);
                }
            }
        }

        // this.updateWalls(game.board);
        if (game.currentPlayer) {
            this.updateTurnInfo(game.currentPlayer);
        }
        this.renderEndTurnButton();
    }

    createDebugPanel(controller) {
        const pan = document.createElement('div');
        pan.className = 'debug-panel';

        const viewBtn = document.createElement('button');
        viewBtn.className = `debug-btn ${this.debugViewAll ? 'active' : ''}`;
        viewBtn.innerHTML = '👁️';
        viewBtn.title = "Toggle God Mode (View All)";
        viewBtn.onclick = () => this.onToggleDebugView && this.onToggleDebugView();

        const editBtn = document.createElement('button');
        editBtn.className = `debug-btn ${this.debugEditMode ? 'active' : ''}`;
        editBtn.innerHTML = '✏️'; // Pencil
        editBtn.title = "Toggle Edit Mode";
        editBtn.onclick = () => this.onToggleEditMode && this.onToggleEditMode();

        pan.appendChild(viewBtn);
        pan.appendChild(editBtn);
        this.container.appendChild(pan);
    }

    bindToggleDebugView(handler) {
        this.onToggleDebugView = handler;
    }

    bindToggleEditMode(handler) {
        this.onToggleEditMode = handler;
    }

    bindNavigateToCompass(handler) {
        this.onNavigateToCompass = handler;
    }

    bindGoBack(handler) {
        this.onGoBack = handler;
    }

    setDebugState(viewAll, editMode) {
        this.debugViewAll = viewAll;
        this.debugEditMode = editMode;
    }

    showMessage(text) {
        this.messageBox.textContent = text;
        setTimeout(() => {
            if (this.messageBox.textContent === text) {
                this.messageBox.textContent = '';
            }
        }, 3000);
    }

    createTileElement(tile, game, controller, container) {
        const div = document.createElement('div');
        div.className = 'tile';
        div.dataset.row = tile.row;
        div.dataset.col = tile.col;

        // Animal Image
        if (tile.flipped) {
            div.classList.add('flipped');
        }
        const img = document.createElement('img');
        img.src = `images/${tile.color}_${tile.type}.png`;
        div.appendChild(img);

        // Render Ghost (Only if Active AND (DebugView OR Revealed? No, ghost is invisible generally?))
        // User request: "ghost shouldn't be visible... eye one displays position of ghost"
        if (game.ghost && game.ghost.active && game.ghost.row === tile.row && game.ghost.col === tile.col) {
            if (this.debugViewAll) {
                const ghostDiv = document.createElement('div');
                ghostDiv.className = 'ghost-npc';
                ghostDiv.textContent = '👻';
                div.appendChild(ghostDiv);
            }
        }

        // Render Players on this tile
        if (game.players) {
            const players = game.players.values().filter(p => p.row === tile.row && p.col === tile.col).toArray();
            const playerCount = players.length;

            players.forEach((p, index) => {
                const pDiv = document.createElement('div');
                pDiv.className = `player-token ${p.color}`;
                pDiv.textContent = p.type === 'rabbit' ? '🐰' : '🐭';

                // Positioning Logic
                if (playerCount > 1) {
                    pDiv.classList.add('small');

                    if (playerCount === 2) {
                        // 2 Players: Top-Left and Bottom-Right
                        if (index === 0) pDiv.classList.add('pos-top-left');
                        else pDiv.classList.add('pos-bottom-right');
                    } else {
                        // 3 or 4 Players: Corners based on color
                        // Green: TL, Red: TR, Blue: BL, Yellow: BR
                        switch (p.color) {
                            case 'green': pDiv.classList.add('pos-top-left'); break;
                            case 'red': pDiv.classList.add('pos-top-right'); break;
                            case 'blue': pDiv.classList.add('pos-bottom-left'); break;
                            case 'yellow': pDiv.classList.add('pos-bottom-right'); break;
                        }
                    }
                }

                // Highlight if selected
                if (controller.selectedPlayer === p) {
                    pDiv.classList.add('selected');
                }

                pDiv.addEventListener('click', (e) => {
                    e.stopPropagation(); // Prevent tile click
                    controller.handlePlayerClick(p);
                });
                div.appendChild(pDiv);
            });
        }

        div.addEventListener('click', () => controller.handleTileClick(tile));

        container.appendChild(div);
    }

    createWallElement(wall, controller, container) {
        const div = document.createElement('div');
        div.className = `wall ${wall.type}`;
        if (wall.isExternal) {
            div.classList.add('external');
        } else {
            // Visibility Logic
            // If !revealed and !debugView, show as "hidden" (no state class, or specific hidden class)
            // But we need to handle clicks?

            const isVisible = wall.isRevealed || this.debugViewAll;

            if (isVisible) {
                div.dataset.type = wall.type;
                if (wall.isOpen) div.classList.add('open');
            } else {
                div.classList.add('hidden-wall');
                // No data-state, essentially invisible/unknown
            }

            if (this.debugEditMode) {
                div.classList.add('editable');
            }

            div.addEventListener('click', () => controller.handleWallClick(wall));
            div.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                controller.handleWallRightClick(wall);
            });
        }

        container.appendChild(div);
        this.wallElements.set(`${wall.orientation},${wall.row},${wall.col}`, div);
    }

    updateWalls(board) {
        board.horizontalWalls.forEach(row => row.forEach(cell => {
            this.updateWall(cell);
        }));

        board.verticalWalls.forEach(row => row.forEach(cell => {
            this.updateWall(cell);
        }));
    }

    updateWall(wall) {
        const key = `${wall.orientation},${wall.row},${wall.col}`;
        const div = this.wallElements.get(key);

        if (div) {
            const isVisible = wall.isRevealed || this.debugViewAll;

            if (isVisible) {
                div.classList.remove('hidden-wall');
                div.dataset.type = wall.type;
                if (wall.isOpen) {
                    div.classList.add('open');
                } else {
                    div.classList.remove('open');
                }
            } else {
                div.classList.add('hidden-wall');
                div.removeAttribute('data-state');
                div.classList.remove('open');
            }
        }
    }

    renderEndTurnButton() {
        const endBtn = document.createElement('button');
        endBtn.textContent = "End Turn";
        endBtn.onclick = () => this.onEndTurn && this.onEndTurn();
        this.container.appendChild(endBtn);
    }

    updateTurnInfo(player) {
        // Create or update turn info display
        let infoDiv = document.getElementById('turn-info');
        if (!infoDiv) {
            infoDiv = document.createElement('div');
            infoDiv.id = 'turn-info';
            infoDiv.className = 'turn-info';
            this.container.appendChild(infoDiv);
        }

        infoDiv.innerHTML = `Current Turn: <span style="color:${player.color}; font-weight:bold; text-transform:capitalize;">${player.color} ${player.type === 'rabbit' ? '🐰' : '🐭'}</span>`;
    }

    bindEndTurn(handler) {
        this.onEndTurn = handler;
    }

    show() {
        this.container.classList.remove('hidden');
    }

    hide() {
        this.container.classList.add('hidden');
    }
}
