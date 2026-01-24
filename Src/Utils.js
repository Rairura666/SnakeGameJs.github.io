import { state } from "./State.js"
import * as C from "./Constants.js"
import { completeAchievement } from "./Achievement.js"

export function randomizeCell() {
    const x = Math.floor(Math.random() * (C.ROWS - 1)) + 1
    const y = Math.floor(Math.random() * (C.COLS - 1)) + 1

    return { x, y }
}

export function isOpposite(a, b) {
    return (
        (a === "Up" && b === "Down") ||
        (a === "Down" && b === "Up") ||
        (a === "Left" && b === "Right") ||
        (a === "Right" && b === "Left")
    )
}


export function putNormalRules() {
    const newRules = [
        "▶ Eat eat eat eat eat eat.",
        "▶ Eat eat eat eat.",
        "▶ Eat eat eat eat eat eat eat eat eat eat eat.",
        "▶ Eat eat eat eat eat eat eat.",
        "▶ Eat eat eat eat eat eat eat eat eat eat eat eat eat eat eat eat eat.",
        "▶ Eat eat eat eat eat eat eat eat eat eat eat eat eat eat eat.",
        "▶ Eat eat eat eat eat eat eat eat eat eat eat eat eat eat eat eat eat eat eat eat eat eat eat.",
        "▶ Eat eat eat eat eat eat eat eat eat eat eat.",
        "▶ Eat eat eat eat eat eat eat.",
        "▶ Eat eat eat eat eat eat.",
    ]

    document.querySelectorAll("#Rules p").forEach((rule, i) => {
        if (newRules[i]) {
            rule.textContent = newRules[i]
            rule.style.color = "red"
        }
    })

    if (!state.achievements.ghostHunter) {
        C.elems.catchYourTailElem.classList.add("hidden")
        C.elems.hungerElem.classList.add("hidden")
        C.elems.pacifistElem.classList.add("hidden")
        const ach = document.createElement("div")
        ach.className = "boss"
        ach.id = "ghostHunter"

        const h2 = document.createElement("h2")
        h2.textContent = "Ghostbuster"
        h2.color = "red"

        const p = document.createElement("p")
        p.textContent = "Eat them all."
        p.color = "red"

        ach.append(h2, p)

        C.elems.ghostHunterElem = ach

        document.getElementById("achievementList").prepend(C.elems.ghostHunterElem)
    }
}

export function putBossRules() {
    const newRules = [
        "▶ Use arrows or WASD to move.",
        "▶ Cherry adds 1 point.",
        "▶ Cake is poisonous, cuts half of the snakeman.",
        "▶ Ghosts eat cherries too.",
        "▶ When a ghost eats a cherry there is a chance to spawn another ghost.",
        "▶ There is some chance that a ghost will eat a cake and die.",
        "▶ After eating a cherry the snakeman becomes strong and is able to eat ghosts for some time.",
        "▶ Weak snakeman dies if tries to eat a ghost.",
        "▶ An eated ghost adds 5 points.",
        "▶ Don't let 4 ghosts appear."
    ]

    document.querySelectorAll("#Rules p").forEach((rule, i) => {
        if (newRules[i]) {
            rule.textContent = newRules[i]
            rule.style.color = "#00FF00"
            if (i == (newRules.length - 1)) {
                rule.style.color = "#FF0000"
            }
        }
    })
}

export function updateSliderColor(value) {
    C.elems.volumeSliderElem.style.pointerEvents = C.bgMusic.muted ? "none" : "auto"
    C.elems.volumeSliderElem.style.opacity = C.bgMusic.muted ? "0.4" : "1"
    C.elems.volumeSliderElem.style.setProperty("--fill", `${value * 100}%`)
}

export function giveSnakeNewDirByKey(e) {
    let newDir = null

    if (e.code === "ArrowUp" || e.code === "KeyW") newDir = "Up"
    if (e.code === "ArrowDown" || e.code === "KeyS") newDir = "Down"
    if (e.code === "ArrowLeft" || e.code === "KeyA") newDir = "Left"
    if (e.code === "ArrowRight" || e.code === "KeyD") newDir = "Right"

    return newDir
}


export function tryIncreaseMaxScore() {
    if ((state.snake.snakeLength - 1) > state.game.maxScore) {
        state.game.maxScore = state.snake.snakeLength - 1
        C.elems.maxScoreElem.innerText = `Max score: ${state.game.maxScore}`
        localStorage.setItem("max_score", state.game.maxScore)
    }
}

export function tryCompleteHunger() {
    if (state.achievements.hungerCounter >= C.HUNGER_AMOUNT) {
        state.achievements.hunger = true
        completeAchievement(C.elems.hungerElem)
        try {
            const achRaw = localStorage.getItem("achievements")
            const ach = achRaw ? JSON.parse(achRaw) : {}
            ach.hunger = true
            localStorage.setItem("achievements", JSON.stringify(ach))
        }
        catch {
        }
    }
}

export function tryCompletePacifist() {
    if ((state.snake.snakeBody.length - 1) >= C.PACIFIST_AMOUNT && !state.achievements.pacifistFailed && !state.achievements.pacifist) {
        state.achievements.pacifist = true
        completeAchievement(C.elems.pacifistElem)
        try {
            const achRaw = localStorage.getItem("achievements")
            const ach = achRaw ? JSON.parse(achRaw) : {}
            ach.pacifist = true
            localStorage.setItem("achievements", JSON.stringify(ach))
        }
        catch {
        }
    }
}

export function tryCompleteCatchYourTail() {
    if (state.achievements.catchYourTail === false && state.snake.snakeBody.length > 1 && state.snake.snakeX === state.snake.previousTailX && state.snake.snakeY === state.snake.previousTailY) {
        state.achievements.catchYourTail = true
        completeAchievement(C.elems.catchYourTailElem)
        try {
            const achRaw = localStorage.getItem("achievements")
            const ach = achRaw ? JSON.parse(achRaw) : {}
            ach.catchYourTail = true
            localStorage.setItem("achievements", JSON.stringify(ach))
        }
        catch {
        }
    }
}


export function countPacmanFrame() {
    state.tickers.pacmanFrameTick++
    if (state.tickers.pacmanFrameTick >= C.PACMAN_DELAY) {
        state.frames.pacmanFrame = (state.frames.pacmanFrame + 1) % C.PACMAN_FRAMES
        state.tickers.pacmanFrameTick = 0
    }
}

export function countGameOverScreenFrame() {
    state.tickers.gameoverFrameTick++
    if (state.tickers.gameoverFrameTick >= C.GAMEOVER_DELAY) {
        state.frames.gameoverFrame = (state.frames.gameoverFrame + 1) % C.GAMEOVER_FRAMES
        state.tickers.gameoverFrameTick = 0
    }
}

export function countBossFrame() {
    state.tickers.bossFrameTick++
    if (state.tickers.bossFrameTick >= C.BOSS_DELAY) {
        state.frames.bossFrame = (state.frames.bossFrame + 1) % C.BOSS_FRAMES
        state.tickers.bossFrameTick = 0
    }
}

export function countPauseBeforeBossFrame() {
    state.tickers.pauseBossFrameTick++
    if (state.tickers.pauseBossFrameTick >= C.PAUSE_BOSS_DELAY) {
        state.frames.pauseBossFrame = (state.frames.pauseBossFrame + 1) % C.PAUSE_BOSS_FRAMES
        state.tickers.pauseBossFrameTick = 0
    }
}

