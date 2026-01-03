import { Constants } from '../Constants';
import { Player } from '../models/Player';

export class MagicCompassView {
    container: HTMLElement;
    compassElements: Map<string, HTMLElement>;
    navClickCount: number;

    onHelpClick?: () => void;
    onHelpLongPress?: () => void;
    onBlueRabbitClick?: () => void;
    onYellowMouseClick?: () => void;
    onGreenRabbitClick?: () => void;
    onRedMouseClick?: () => void;
    onNorthClick?: () => void;
    onEastClick?: () => void;
    onSouthClick?: () => void;
    onWestClick?: () => void;
    switchToBoard?: () => void;

    constructor(containerId: string) {
        this.container = document.getElementById(containerId) as HTMLElement;
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
        interface ButtonDef {
            id: string;
            type: string;
            label: string;
        }


        const buttons: ButtonDef[] = [
            { id: 'blue-rabbit-btn', type: 'animal-btn', label: 'Blue Rabbit' },
            { id: 'yellow-mouse-btn', type: 'animal-btn', label: 'Yellow Mouse' },
            { id: 'green-rabbit-btn', type: 'animal-btn', label: 'Green Rabbit' },
            { id: 'red-mouse-btn', type: 'animal-btn', label: 'Red Mouse' },

            { id: 'north-btn', type: 'cardinal-btn', label: 'Ocean' }, // Top
            { id: 'east-btn', type: 'cardinal-btn', label: 'Forest' }, // Right
            { id: 'south-btn', type: 'cardinal-btn', label: 'Mountains' }, // Bottom
            { id: 'west-btn', type: 'cardinal-btn', label: 'City' },  // Left
            { id: 'help-btn', type: 'help-btn', label: '?' } // Center
        ];

        buttons.forEach(btn => {
            const b = document.createElement('div');
            b.className = `compass-btn ${btn.type} ${btn.id}`;
            b.title = btn.label;

            if (btn.id === 'help-btn') {
                // Special handling for help button which supports long press
                this.setupLongPressHandler(b,
                    () => {
                        if (btn.id === 'help-btn' && this.onHelpClick) this.onHelpClick();
                    },
                    () => {
                        if (btn.id === 'help-btn' && this.onHelpLongPress) this.onHelpLongPress();
                    }
                );
            } else {
                b.onclick = () => {
                    if (btn.id === 'blue-rabbit-btn' && this.onBlueRabbitClick) this.onBlueRabbitClick();
                    if (btn.id === 'yellow-mouse-btn' && this.onYellowMouseClick) this.onYellowMouseClick();
                    if (btn.id === 'green-rabbit-btn' && this.onGreenRabbitClick) this.onGreenRabbitClick();
                    if (btn.id === 'red-mouse-btn' && this.onRedMouseClick) this.onRedMouseClick();
                    if (btn.id === 'north-btn' && this.onNorthClick) this.onNorthClick();
                    if (btn.id === 'east-btn' && this.onEastClick) this.onEastClick();
                    if (btn.id === 'south-btn' && this.onSouthClick) this.onSouthClick();
                    if (btn.id === 'west-btn' && this.onWestClick) this.onWestClick();
                    if (btn.id === 'help-btn' && this.onHelpClick) this.onHelpClick();
                };
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

    bindHelpButtonClick(handler: () => void) {
        this.onHelpClick = handler;
    }

    bindHelpButtonLongPress(handler: () => void) {
        this.onHelpLongPress = handler;
    }

    bindBlueRabbitButtonClick(handler: () => void) {
        this.onBlueRabbitClick = handler;
    }

    bindYellowMouseButtonClick(handler: () => void) {
        this.onYellowMouseClick = handler;
    }

    bindGreenRabbitButtonClick(handler: () => void) {
        this.onGreenRabbitClick = handler;
    }

    bindRedMouseButtonClick(handler: () => void) {
        this.onRedMouseClick = handler;
    }

    bindNorthButtonClick(handler: () => void) {
        this.onNorthClick = handler;
    }

    bindEastButtonClick(handler: () => void) {
        this.onEastClick = handler;
    }

    bindSouthButtonClick(handler: () => void) {
        this.onSouthClick = handler;
    }

    bindWestButtonClick(handler: () => void) {
        this.onWestClick = handler;
    }

    bindSwitchToBoard(handler: () => void) {
        this.switchToBoard = handler;
    }

    togglePlayerLightsOff() {
        this._toggleBlueRabbitLight(false);
        this._toggleYellowMouseLight(false);
        this._toggleGreenRabbitLight(false);
        this._toggleRedMouseLight(false);
    }

    togglePlayerLightOn(playerInfo: Player) {
        this._togglePlayerLight(playerInfo, true);
    }

    togglePlayerLightOff(playerInfo: Player) {
        this._togglePlayerLight(playerInfo, false);
    }

    _togglePlayerLight(playerInfo: Player, isOn: boolean) {
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

    _toggleBlueRabbitLight(isOn: boolean) {
        this._togglePlayerLightById('light-blue-rabbit', isOn);
    }

    _toggleYellowMouseLight(isOn: boolean) {
        this._togglePlayerLightById('light-yellow-mouse', isOn);
    }

    _toggleGreenRabbitLight(isOn: boolean) {
        this._togglePlayerLightById('light-green-rabbit', isOn);
    }

    _toggleRedMouseLight(isOn: boolean) {
        this._togglePlayerLightById('light-red-mouse', isOn);
    }

    _togglePlayerLightById(id: string, isOn: boolean) {
        const light = document.getElementById(id);
        if (light) {
            if (isOn) {
                light.classList.add('on');
            } else {
                light.classList.remove('on');
            }
        }
    }
    setupLongPressHandler(element: HTMLElement, onClick: () => void, onLongPress: () => void) {
        let timer: ReturnType<typeof setTimeout> | undefined;
        let isLongPress = false;
        const longPressDuration = Constants.LONG_PRESS_DURATION;

        const start = (e: Event) => {
            if (e.type === 'click' && (e as MouseEvent).button !== 0) return; // Only left click or touch
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

        const click = (e: Event) => {
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
