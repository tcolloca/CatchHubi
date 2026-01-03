class MagicCompassView {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.compassElements = new Map();
        this.navClickCount = 0;
    }

    render() {
        this.container.innerHTML = '';

        // Main wrapper
        const wrapper = document.createElement('div');
        wrapper.className = 'magic-compass-wrapper';

        // Image Container
        const compassDiv = document.createElement('div');
        compassDiv.className = 'magic-compass';

        // Background Image
        const img = document.createElement('img');
        img.src = 'images/magic-compass.jpg';
        img.alt = 'Magic Compass';
        img.className = 'compass-bg';
        compassDiv.appendChild(img);

        // Buttons
        // We will define buttons with relative positions in CSS based on IDs or data-attributes
        // 9 buttons: 4 animals, 4 directions, 1 help
        const buttons = [
            { id: 'blue-rabbit-btn', type: 'animal-btn', label: 'Blue Rabbit', onClick: this.onBlueRabbitClick },
            { id: 'yellow-mouse-btn', type: 'animal-btn', label: 'Yellow Mouse', onClick: this.onYellowMouseClick },
            { id: 'green-rabbit-btn', type: 'animal-btn', label: 'Green Rabbit', onClick: this.onGreenRabbitClick },
            { id: 'red-mouse-btn', type: 'animal-btn', label: 'Red Mouse', onClick: this.onRedMouseClick },

            { id: 'north-btn', type: 'cardinal-btn', label: 'Ocean', onClick: this.onNorthClick }, // Top
            { id: 'east-btn', type: 'cardinal-btn', label: 'Forest', onClick: this.onEastClick }, // Right
            { id: 'south-btn', type: 'cardinal-btn', label: 'Mountains', onClick: this.onSouthClick }, // Bottom
            { id: 'west-btn', type: 'cardinal-btn', label: 'City', onClick: this.onWestClick },  // Left
            { id: 'help-btn', type: 'help-btn', label: '?', onClick: this.onHelpClick, onLongPress: this.onHelpLongPress } // Center
        ];

        buttons.forEach(btn => {
            const b = document.createElement('div');
            b.className = `compass-btn ${btn.type} ${btn.id}`;
            b.title = btn.label;

            if (btn.onLongPress) {
                this.setupLongPressHandler(b, () => btn.onClick && btn.onClick(), () => btn.onLongPress && btn.onLongPress());
            } else {
                b.onclick = () => btn.onClick && btn.onClick();
            }
            compassDiv.appendChild(b);
        });

        wrapper.appendChild(compassDiv);

        // Red Lights (Visual indicators)
        const lights = [
            { id: 'light-blue-rabbit', class: 'light-bottom-left' },
            { id: 'light-yellow-mouse', class: 'light-bottom-right' },
            { id: 'light-green-rabbit', class: 'light-top-left' },
            { id: 'light-red-mouse', class: 'light-top-right' }
        ];

        lights.forEach(l => {
            const light = document.createElement('div');
            light.className = `compass-light ${l.class}`;
            light.id = l.id;
            compassDiv.appendChild(light);
        });

        // Invisible Nav Button (Back to Board)
        const invBtn = document.createElement('div');
        invBtn.className = 'invisible-nav-btn';
        invBtn.onclick = () => {
            this.navClickCount++;
            if (this.navClickCount >= Constants.SWITCH_VIEW_CLICKS) {
                this.navClickCount = 0;
                this.switchToBoard && this.switchToBoard();
            }
        };
        wrapper.appendChild(invBtn);
        // this.container.appendChild(invBtn); // Should be in wrapper to be positioned correctly if wrapper is relative

        this.container.appendChild(wrapper);
    }

    show() {
        this.container.classList.remove('hidden');
    }

    hide() {
        this.container.classList.add('hidden');
    }

    bindHelpButtonClick(handler) {
        this.onHelpClick = handler;
    }

    bindHelpButtonLongPress(handler) {
        this.onHelpLongPress = handler;
    }

    bindBlueRabbitButtonClick(handler) {
        this.onBlueRabbitClick = handler;
    }

    bindYellowMouseButtonClick(handler) {
        this.onYellowMouseClick = handler;
    }

    bindGreenRabbitButtonClick(handler) {
        this.onGreenRabbitClick = handler;
    }

    bindRedMouseButtonClick(handler) {
        this.onRedMouseClick = handler;
    }

    bindNorthButtonClick(handler) {
        this.onNorthClick = handler;
    }

    bindEastButtonClick(handler) {
        this.onEastClick = handler;
    }

    bindSouthButtonClick(handler) {
        this.onSouthClick = handler;
    }

    bindWestButtonClick(handler) {
        this.onWestClick = handler;
    }

    bindSwitchToBoard(handler) {
        this.switchToBoard = handler;
    }

    togglePlayerLightsOff() {
        this._toggleBlueRabbitLight(false);
        this._toggleYellowMouseLight(false);
        this._toggleGreenRabbitLight(false);
        this._toggleRedMouseLight(false);
    }

    togglePlayerLightOn(playerInfo) {
        this._togglePlayerLight(playerInfo, true);
    }

    togglePlayerLightOff(playerInfo) {
        this._togglePlayerLight(playerInfo, false);
    }

    _togglePlayerLight(playerInfo, isOn) {
        if (playerInfo === Player.BLUE_RABBIT) {
            this._toggleBlueRabbitLight(isOn);
        } else if (playerInfo === Player.YELLOW_MOUSE) {
            this._toggleYellowMouseLight(isOn);
        } else if (playerInfo === Player.GREEN_RABBIT) {
            this._toggleGreenRabbitLight(isOn);
        } else if (playerInfo === Player.RED_MOUSE) {
            this._toggleRedMouseLight(isOn);
        } else {
            console.error(`Unknown playerInfo: ${playerInfo}`);
        }
    }

    _toggleBlueRabbitLight(isOn) {
        this._togglePlayerLightById('light-blue-rabbit', isOn);
    }

    _toggleYellowMouseLight(isOn) {
        this._togglePlayerLightById('light-yellow-mouse', isOn);
    }

    _toggleGreenRabbitLight(isOn) {
        this._togglePlayerLightById('light-green-rabbit', isOn);
    }

    _toggleRedMouseLight(isOn) {
        this._togglePlayerLightById('light-red-mouse', isOn);
    }

    _togglePlayerLightById(id, isOn) {
        const light = document.getElementById(id);
        if (light) {
            if (isOn) {
                light.classList.add('on');
            } else {
                light.classList.remove('on');
            }
        }
    }
    setupLongPressHandler(element, onClick, onLongPress) {
        let timer;
        let isLongPress = false;
        const longPressDuration = Constants.LONG_PRESS_DURATION;

        const start = (e) => {
            if (e.type === 'click' && e.button !== 0) return; // Only left click or touch
            isLongPress = false;
            timer = setTimeout(() => {
                isLongPress = true;
                if (navigator.vibrate) navigator.vibrate(50); // Optional feedback
                onLongPress();
            }, longPressDuration);
        };

        const cancel = () => {
            clearTimeout(timer);
        };

        const click = (e) => {
            if (isLongPress) {
                e.preventDefault();
                e.stopPropagation();
            } else {
                onClick();
            }
        }

        element.addEventListener('mousedown', start);
        element.addEventListener('touchstart', start, { passive: true });

        element.addEventListener('mouseup', cancel);
        element.addEventListener('mouseleave', cancel);
        element.addEventListener('touchend', cancel);

        element.addEventListener('click', click);
    }
}
