const Constants = {
    GHOST_START_PROBABILITY: {
        'easy': 0.1,
        'medium': 0.15,
        'hard': 0.2,
    },
    GHOST_PROBABILITY_INCREMENT: {
        'easy': 0.05,
        'medium': 0.05,
        'hard': 0.05,
    },
    SWITCH_VIEW_CLICKS: 10,
    NARRATOR_MESSAGE_DURATION: 3000,
    // Maximum number of magic doors per difficulty
    MAGIC_DOOR_MAX_COUNT_BY_DIFFICULTY: {
        'easy': 1,
        'medium': 2,
        'hard': 3
    },
    // If true, required count is random between 1 and max; if false, exactly max
    MAGIC_DOOR_USE_RANDOM_COUNT: false,
    SUNSET_PERCENTAGE: 0.5,
    EVENING_PERCENTAGE: 0.7,
    CLOSE_TO_MIDNIGHT_PERCENTAGE: 0.9,
    MOVES_UNTIL_MIDNIGHT: {
        'easy': 100,
        'medium': 70,
        'hard': 50,
    },
    ALLOW_GAME_OVER: {
        'easy': false,
        'medium': false,
        'hard': true,
    },
    LONG_PRESS_DURATION: 3000,
};
