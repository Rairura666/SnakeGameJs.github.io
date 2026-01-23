export const state = {

    snake: {
        x: null,
        y: null,
        speedX: 0,
        speedY: 0,
        snakeBody: [],
        snakeLength: 1,
        poisoned: false,
        isPacmanStrong: true,
        unlimitedPower: false,
        previousTailX: 0,
        previousTailY: 0,
        curDirection: null,
        nextDirection: null,
        directionLocked: false,
    },

    ghosts: [],

    cakes: [],

    food: {
        x: null,
        y: null
    },

    game: {
        gameOver: false,
        maxScore: 0,
        gameOverStartTime: 0,
        gameStarted: false,
        pauseBeforeBoss: false,
        foodSpawnProhibited: false,
        cakeSpawnProhibited: false,
        ghostSpawnProhibited: false,
        isBossStage: false,
    },

    music: {
        lastVolume: 100,
        musicStarted: false
    },

    chances: {
        ghostChance: 0.4,
        cakeChance: 0.2,
        ghostChanceToEatCake: 0.1
    },

    tickers: {
        bossFrameTick: 0,
        poisonedBossTick: 0,
        tailCuttingTick: 0,
        pauseBeforeBossTick: 0,
        pauseBossFrameTick: 0,
        bossStartTick: 0,
        strongTick: 0,
        pacmanFrameTick: 0,
        poisonedTick: 0,
        gameoverFrameTick: 0,
    },

    frames: {
        bossFrame: 0,
        pauseBossFrame: 0,
        pacmanFrame: 0,
        gameoverFrame: 0,
    },

    achievements: {
        pacifist: false,
        pacifistFailed: false,
        hunger: false,
        hungerCounter: 0,
        ghostHunter: false,
        catchYourTail: false
    }

}