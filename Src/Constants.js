export const CELLSIZE = 25
export const ROWS = 20
export const COLS = 20

export const PACMAN_FRAMES = 6
export const PACMAN_DELAY = 1
export const POISONED_TICKS = 12
export const ghostMinChangeDirDelay = 3
export const ghostMaxChangeDirDelay = 20

export const GHOSTS_BOSS_AMOUNT = 4

export const BOSS_START_SAFE_TICKS = 10
export const PAUSE_BEFORE_BOSS_TICKS = 20
export const PAUSE_BOSS_FRAMES = 4
export const PAUSE_BOSS_DELAY = 5
export const BOSS_FRAMES = 12
export const BOSS_DELAY = 5

export const PACIFIST_AMOUNT = 20
export const HUNGER_AMOUNT = 10


export const TAIL_CUTTING_DELAY = 35
export const POISONED_BOSS_TICKS = 12

export const STRONG_TICKS = 50

export const GAMEOVER_BLOCK_DURATION = 1000

export const GAMEOVER_FRAMES = 6
export const GAMEOVER_DELAY = 5

export const bgMusic = new Audio("Src/Assets/music.mp3");
bgMusic.loop = true
bgMusic.volume = 0.4

export const bossImg = new Image()
bossImg.src = "Src/Assets/boss.png"

export const pauseBossImg = new Image()
pauseBossImg.src = "Src/Assets/pauseBoss.png"

export const gameOverImg = new Image()
gameOverImg.src = "Src/Assets/GameoverScreen.png"

export const startGameImg = new Image()
startGameImg.src = "Src/Assets/startGameScreen.png"

export const pacmanImg = new Image()
pacmanImg.src = "Src/Assets/pacman.png"

export const pacmanPoisonImg = new Image()
pacmanPoisonImg.src = "Src/Assets/pacmanPoison.png"

export const pacmanStrongImg = new Image()
pacmanStrongImg.src = "Src/Assets/pacmanStrong.png"

export const foodImg = new Image()
foodImg.src = "Src/Assets/cherry.png"

export const cakeImg = new Image()
cakeImg.src = "Src/Assets/cake.png"

export const ghostImg = new Image()
ghostImg.src = "Src/Assets/ghost.png"

export const ghostRedImg = new Image()
ghostRedImg.src = "Src/Assets/ghostRed.png"

export let elems = {}

export function initElems() {
  elems = {
    scoreElem: document.getElementById("scoreText"),
    maxScoreElem: document.getElementById("maxScoreText"),
    catchYourTailElem: document.getElementById("catchYourTail"),
    hungerElem: document.getElementById("hunger"),
    pacifistElem: document.getElementById("pacifist"),
    ghostHunterElem: null,
    achievementListElem: document.getElementById("achievementList"),
    volumeSliderElem: document.getElementById("volumeSlider"),
    restartBtnElem: document.getElementById("restartBtn"),
  }
}