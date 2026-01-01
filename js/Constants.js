const Constants = {
    GHOST_START_PROBABILITY: 0.1,
    GHOST_PROBABILITY_INCREMENT: 0.05,
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
};
