import { Difficulty } from './models/Difficulty';

export const Constants = {
    GHOST_START_PROBABILITY: {
        [Difficulty.EASY]: 0.1,
        [Difficulty.MEDIUM]: 0.15,
        [Difficulty.HARD]: 0.2,
    },
    GHOST_PROBABILITY_INCREMENT: {
        [Difficulty.EASY]: 0.05,
        [Difficulty.MEDIUM]: 0.05,
        [Difficulty.HARD]: 0.05,
    },
    SWITCH_VIEW_CLICKS: 10,
    NARRATOR_MESSAGE_DURATION: 3000,
    // Maximum number of magic doors per difficulty
    MAGIC_DOOR_MAX_COUNT_BY_DIFFICULTY: {
        [Difficulty.EASY]: 1,
        [Difficulty.MEDIUM]: 2,
        [Difficulty.HARD]: 3
    },
    // If true, required count is random between 1 and max; if false, exactly max
    MAGIC_DOOR_USE_RANDOM_COUNT: false,
    SUNSET_PERCENTAGE: 0.5,
    EVENING_PERCENTAGE: 0.7,
    CLOSE_TO_MIDNIGHT_PERCENTAGE: 0.9,
    MOVES_UNTIL_MIDNIGHT: {
        [Difficulty.EASY]: 100,
        [Difficulty.MEDIUM]: 70,
        [Difficulty.HARD]: 50,
    },
    ALLOW_GAME_OVER: {
        [Difficulty.EASY]: false,
        [Difficulty.MEDIUM]: false,
        [Difficulty.HARD]: true,
    },
    LONG_PRESS_DURATION: 3000,
    AVERAGE_WPM: 250,
    MESSAGE_BUFFER_SECONDS: 1.5,
};
