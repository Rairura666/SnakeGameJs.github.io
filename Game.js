import * as C from "./Src/Constants.js";
import { state } from "./Src/State.js"
import { ghostMovement, ghostActions, drawGhost, spawnGhost, tryGhostAppear, ifGhostIsOnTheFoodCellItEatsFood, handleBeingCloseToACake } from "./Src/Ghost.js"
import { drawFoodBox, newFoodPos } from "./Src/Food.js"
import { randomizeCell, isOpposite, putBossRules, putNormalRules, updateSliderColor, giveSnakeNewDirByKey, tryIncreaseMaxScore, tryCompleteHunger, tryCompletePacifist, tryCompleteCatchYourTail, countPacmanFrame, countGameOverScreenFrame, countBossFrame, countPauseBeforeBossFrame } from "./Src/Utils.js"
import { drawCake, tryCakeAppear } from "./Src/Cake.js"
import { completeAchievement, failAchievement } from "./Src/Achievement.js"
import { drawSnake, cutTail, giveSnakeSpeedByDirection, tpSnake, ifSnakeIsOnTheFoodCellItEatsFood, ifSnakeIsOnTheCakeCellItEatsCake, handlePoisonedStateIfNeeded } from "./Src/Snake.js"


function setNewGame() {
    state.game.gameStarted = false
    C.elems.scoreElem = document.getElementById("scoreText")
    C.elems.scoreElem.innerText = "Score: 0"
    state.snake.speedX = 0
    state.snake.speedY = 0
    state.snake.snakeX = 5
    state.snake.snakeY = 5
    state.snake.snakeLength = 1
    state.game.gameOver = false
    state.snake.snakeBody = []
    state.cakes.length = 0
    state.ghosts.length = 0
    state.snake.curDirection = null
    state.snake.nextDirection = null
    state.snake.directionLocked = false
    state.tickers.poisonedTick = 0
    state.snake.poisoned = false
    state.chances.ghostChance = 0.4
    state.snake.isPacmanStrong = false
    state.game.gameOverStartTime = 0
    state.game.isBossStage = false
    state.game.foodSpawnProhibited = false
    state.game.cakeSpawnProhibited = false
    state.game.ghostSpawnProhibited = false
    state.snake.unlimitedPower = false
    state.tickers.poisonedBossTick = 0
    stopBossStage()

    state.achievements.hungerCounter = 0
    state.achievements.pacifistFailed = false
    C.elems.pacifistElem.classList.remove("failed")
    tryCakeAppear()
    spawnGhost(randomizeCell())

    const { x: startSnakeX, y: startSnakeY } = randomizeCell()
    state.snake.snakeX = startSnakeX
    state.snake.snakeY = startSnakeY
    state.snake.snakeBody.push([state.snake.snakeX, state.snake.snakeY])

    const { x: startFoodX, y: startFoodY } = randomizeCell()
    state.food.foodX = startFoodX
    state.food.foodY = startFoodY
}

function startGame() {
    state.game.gameStarted = true
    state.ghosts.forEach(gh => ghostMovement.giveGhostSpeed(gh))
}

function tryStartBossStage() {
    state.tickers.pauseBeforeBossTick++
    if (state.tickers.pauseBeforeBossTick >= C.PAUSE_BEFORE_BOSS_TICKS) {
        state.game.pauseBeforeBoss = false
        state.tickers.pauseBeforeBossTick = 0
        startBossStage()
    }
}

function startBossStage() {
    state.food.foodX = null
    state.food.foodY = null
    state.cakes.length = 0

    state.tickers.bossStartTick = 0
    state.tickers.tailCuttingTick = 0

    state.game.isBossStage = true
    state.game.foodSpawnProhibited = true
    state.game.cakeSpawnProhibited = true
    state.game.ghostSpawnProhibited = true
    state.snake.unlimitedPower = true

    putNormalRules()
}

function stopBossStage() {
    state.game.isBossStage = false
    state.game.foodSpawnProhibited = false
    state.game.cakeSpawnProhibited = false
    state.game.ghostSpawnProhibited = false
    state.snake.unlimitedPower = false
    C.elems.catchYourTailElem.classList.remove("hidden")
    C.elems.hungerElem.classList.remove("hidden")
    C.elems.pacifistElem.classList.remove("hidden")

    newFoodPos()
    putBossRules()

    C.elems.ghostHunterElem = document.getElementById("ghostHunter")
    if (!state.achievements.ghostHunter && C.elems.ghostHunterElem) {
        C.elems.ghostHunterElem.remove()
    }
}


function handleCutTail() {
    state.tickers.bossStartTick++
    if (state.tickers.bossStartTick > C.BOSS_START_SAFE_TICKS) {
        state.tickers.tailCuttingTick++
        if (state.tickers.tailCuttingTick >= C.TAIL_CUTTING_DELAY) {
            state.tickers.poisonedBossTick++
            if (state.tickers.poisonedBossTick >= C.POISONED_BOSS_TICKS) {
                cutTail()
                state.tickers.poisonedBossTick = 0
                state.tickers.tailCuttingTick = 0
            }
        }
    }
}



function updateBoard(context) {
    context.fillStyle = "black"
    context.fillRect(0, 0, context.canvas.width, context.canvas.height)

    const poisonCount = (Math.floor((state.snake.snakeBody.length) / 2) >= 1) ? Math.ceil((state.snake.snakeBody.length) / 2) : 0

    if (!state.game.gameStarted) {

        context.drawImage(
            C.startGameImg,
            0, 0,
            500, 500,
            0, 0,
            context.canvas.width, context.canvas.height
        )

        countPacmanFrame()

        drawFoodBox(context)
        drawSnake(context)
        drawGhost(context, state.ghosts.at(0))
        state.cakes.forEach(cake => drawCake(context, cake))
    } else {

        if (state.game.gameOver) {

            countGameOverScreenFrame()

            context.drawImage(
                C.gameOverImg,
                state.frames.gameoverFrame * 500, 0,
                500, 500,
                0, 0,
                context.canvas.width, context.canvas.height
            )

            return

        } else if (state.game.pauseBeforeBoss) {

            countPauseBeforeBossFrame()

            context.drawImage(
                C.pauseBossImg,
                state.frames.pauseBossFrame * 500, 0,
                500, 500,
                0, 0,
                context.canvas.width, context.canvas.height
            )

            tryStartBossStage()

            drawFoodBox(context)
            drawSnake(context)
            state.ghosts.forEach(ghost => drawGhost(context, ghost))
            state.cakes.forEach(cake => drawCake(context, cake))
        }
        else {

            if (state.game.isBossStage) {

                countBossFrame()

                context.drawImage(
                    C.bossImg,
                    state.frames.bossFrame * 500, 0,
                    500, 500,
                    0, 0,
                    context.canvas.width, context.canvas.height
                )

                handleCutTail()

                if (state.snake.snakeLength === 0) {
                    state.game.gameOver = true
                    state.game.gameOverStartTime = Date.now()
                }
            }

            if (state.snake.nextDirection != null) {
                state.snake.curDirection = state.snake.nextDirection
            }

            giveSnakeSpeedByDirection()

            state.snake.directionLocked = false

            const prevSnakeX = state.snake.snakeX
            const prevSnakeY = state.snake.snakeY
            state.snake.snakeX += state.snake.speedX
            state.snake.snakeY += state.snake.speedY

            tryCompleteCatchYourTail()

            tpSnake()

            state.snake.snakeBody.push([state.snake.snakeX, state.snake.snakeY, state.snake.curDirection])

            if (state.snake.snakeBody.length > state.snake.snakeLength) {
                state.snake.snakeBody.shift()
            }

            state.snake.previousTailX = state.snake.snakeBody[0][0]
            state.snake.previousTailY = state.snake.snakeBody[0][1]

            for (let i = 0; i < state.snake.snakeBody.length - 1; i++) {
                if (state.snake.snakeX == state.snake.snakeBody[i][0] && state.snake.snakeY == state.snake.snakeBody[i][1]) {
                    state.game.gameOver = true
                    state.game.gameOverStartTime = Date.now()
                }
            }

            if (state.tickers.strongTick > 0) {
                state.tickers.strongTick--
            }
            if (state.tickers.strongTick <= 0) {
                state.snake.isPacmanStrong = false
                state.achievements.hungerCounter = 0
            }

            ifSnakeIsOnTheFoodCellItEatsFood(poisonCount)

            ifSnakeIsOnTheCakeCellItEatsCake(poisonCount)

            handlePoisonedStateIfNeeded(poisonCount)

            countPacmanFrame()

            state.ghosts.forEach(ghost => {

                if ((ghost.x <= 0 && ghost.y <= 0) ||
                    (ghost.x <= 0 && ghost.y >= C.ROWS - 1) ||
                    (ghost.x >= C.COLS - 1 && ghost.y <= 0) ||
                    (ghost.x >= C.COLS - 1 && ghost.y >= C.ROWS - 1) ||
                    ((ghost.x <= 0) && ghost.curDir === "Left") ||
                    ((ghost.x >= (C.COLS - 1)) && ghost.curDir === "Right") ||
                    ((ghost.y <= 0) && ghost.curDir === "Up") ||
                    ((ghost.y >= (C.ROWS - 1)) && ghost.curDir === "Down")
                ) {
                    ghost.availableDirs = ghostMovement.getAvailableDirs(ghost)
                    ghostMovement.giveGhostNewDir(ghost, ghost.availableDirs[Math.floor(Math.random() * ghost.availableDirs.length)])
                }
                else {
                    handleBeingCloseToACake(ghost)
                    ifGhostIsOnTheFoodCellItEatsFood(ghost)
                }

                if (ghost.changeTick >= ghost.changeDelay) {
                    ghostMovement.changeGhostDirection(ghost)
                }
                ghost.changeTick++
                drawGhost(context, ghost)

                const prevGhostX = ghost.x
                const prevGhostY = ghost.y

                const pacmanHitsGhostFromSide =
                    state.snake.snakeX === prevGhostX &&
                    state.snake.snakeY === prevGhostY &&
                    !(ghost.x === prevSnakeX && ghost.y === prevSnakeY)

                ghost.x += ghost.ghostSpeedX
                ghost.y += ghost.ghostSpeedY


                const crossed =
                    state.snake.snakeX === prevGhostX &&
                    state.snake.snakeY === prevGhostY &&
                    ghost.x === prevSnakeX &&
                    ghost.y === prevSnakeY

                const sameCell = state.snake.snakeX === ghost.x && state.snake.snakeY === ghost.y

                if (sameCell || crossed || pacmanHitsGhostFromSide) {
                    if (!state.snake.isPacmanStrong && !state.snake.unlimitedPower) {
                        state.game.gameOver = true
                        state.game.gameOverStartTime = Date.now()

                    } else {
                        state.snake.snakeLength += 5
                        state.achievements.pacifistFailed = true
                        failAchievement(C.elems.pacifistElem)
                        if (state.snake.poisoned)
                            C.elems.scoreElem.innerText = `Score: ${state.snake.snakeLength - poisonCount - 1}`
                        else
                            C.elems.scoreElem.innerText = `Score: ${state.snake.snakeLength - 1}`
                        state.ghosts = state.ghosts.filter(g => g.id !== ghost.id)
                        state.chances.ghostChance *= 2
                        if (state.ghosts.length === 0 && state.game.isBossStage) {
                            state.achievements.ghostHunter = true
                            C.elems.ghostHunterElem = document.getElementById("ghostHunter")
                            completeAchievement(C.elems.ghostHunterElem)
                            try {
                                const achRaw = localStorage.getItem("achievements")
                                const ach = achRaw ? JSON.parse(achRaw) : {}
                                ach.ghostHunter = true
                                localStorage.setItem("achievements", JSON.stringify(ach))
                            }
                            catch {
                            }
                            stopBossStage()
                        }
                    }
                }
            });

            if (state.ghosts.length === 0 && !state.game.isBossStage) {
                tryGhostAppear()
            }

            tryIncreaseMaxScore()

            tryCompleteHunger()
            tryCompletePacifist()

            drawFoodBox(context)
            drawSnake(context)
            state.cakes.forEach(cake => drawCake(context, cake))
        }
    }
}


function handlePressedKey(e) {
    if (!state.game.gameStarted) startGame()
    if (state.game.gameOver) {
        if (Date.now() - state.game.gameOverStartTime < C.GAMEOVER_BLOCK_DURATION) {
            return
        }

        setNewGame()
        startGame()
        return
    }
    if (state.snake.directionLocked) return

    const newDir = giveSnakeNewDirByKey(e)
    if (!newDir) return

    if (isOpposite(state.snake.curDirection, newDir)) return

    state.snake.nextDirection = newDir
    state.snake.directionLocked = true
}

window.onload = function () {

    C.initElems()

    window.addEventListener(
        "keydown",
        (e) => {
            const blockedKeys = [
                "ArrowUp",
                "ArrowDown",
                "ArrowLeft",
                "ArrowRight",
                " ",
                "PageUp",
                "PageDown",
                "Home",
                "End"
            ]

            if (blockedKeys.includes(e.key)) {
                e.preventDefault()
            }
        },
        { passive: false }
    )

    const boardElem = document.getElementById("board")
    boardElem.width = C.CELLSIZE * C.COLS
    boardElem.height = C.CELLSIZE * C.ROWS
    const context = boardElem.getContext("2d")

    const lastMaxScore = Number(localStorage.getItem("max_score"))
    state.game.maxScore = Number.isFinite(lastMaxScore) ? lastMaxScore : 0
    C.elems.maxScoreElem.innerText = `Max score: ${state.game.maxScore}`

    C.elems.restartBtnElem.addEventListener("click", () => {
        setNewGame()
        startGame()
    })

    try {

        const raw = localStorage.getItem("achievements")

        const achObj = raw ? JSON.parse(raw) : {}
        console.log("achObj")
        state.achievements.catchYourTail = achObj?.catchYourTail ?? false
        state.achievements.pacifist = achObj?.pacifist ?? false
        state.achievements.hunger = achObj?.hunger ?? false
        state.achievements.ghostHunter = achObj?.ghostHunter ?? false
    }
    catch {
        state.achievements.catchYourTail = false
        state.achievements.pacifist = false
        state.achievements.hunger = false
        state.achievements.ghostHunter = false
    }

    if (state.achievements.catchYourTail) {

        C.elems.catchYourTailElem.classList.add("achDone")
        C.elems.achievementListElem.append(C.elems.catchYourTailElem)
    }
    if (state.achievements.pacifist) {
        C.elems.pacifistElem.classList.add("achDone")
        C.elems.achievementListElem.append(C.elems.pacifistElem)
    }
    if (state.achievements.hunger) {
        C.elems.hungerElem.classList.add("achDone")
        C.elems.achievementListElem.append(C.elems.hungerElem)
    }
    if (state.achievements.ghostHunter) {
        C.elems.ghostHunterElem = document.createElement("div")
        C.elems.ghostHunterElem.className = "boss"
        C.elems.ghostHunterElem.id = "ghostHunter"

        const h2 = document.createElement("h2")
        h2.textContent = "Ghostbuster"

        const p = document.createElement("p")
        p.textContent = "Eat them all."

        C.elems.ghostHunterElem.append(h2, p)

        C.elems.ghostHunterElem.classList.add("achDone")
        C.elems.achievementListElem.append(C.elems.ghostHunterElem)
    }

    document.addEventListener("keyup", handlePressedKey)

    const soundBtn = document.getElementById("soundBtn")
    document.addEventListener("keydown", () => {
        if (!state.music.musicStarted) {
            C.bgMusic.play().catch(() => { })
            state.music.musicStarted = true
        }
    })

    const savedVolume = localStorage.getItem("game_volume")
    state.music.lastVolume = savedVolume !== null ? Number(savedVolume) : 0.4
    C.bgMusic.muted = localStorage.getItem("game_muted") === "true"
    if (C.bgMusic.muted) {
        soundBtn.classList.toggle("muted", C.bgMusic.muted)
        soundBtn.innerText = C.bgMusic.muted ? "Unmute" : "Mute"
    }

    C.elems.volumeSliderElem.value = state.music.lastVolume
    C.bgMusic.volume = C.elems.volumeSliderElem.value
    updateSliderColor(C.elems.volumeSliderElem.value)

    soundBtn.addEventListener("click", () => {
        if (!C.bgMusic.muted) {
            C.bgMusic.muted = true
            state.music.lastVolume = C.bgMusic.volume
        } else {
            C.bgMusic.muted = false
            C.bgMusic.volume = state.music.lastVolume ?? localStorage.getItem("game_volume") ?? 1
            C.elems.volumeSliderElem.value = C.bgMusic.volume
        }

        updateSliderColor(C.elems.volumeSliderElem.value)

        soundBtn.classList.toggle("muted", C.bgMusic.muted)
        soundBtn.innerText = C.bgMusic.muted ? "Unmute" : "Mute"

        localStorage.setItem("game_muted", String(C.bgMusic.muted))
    })

    C.elems.volumeSliderElem.addEventListener("input", () => {
        C.bgMusic.volume = C.elems.volumeSliderElem.value
        state.music.lastVolume = C.bgMusic.volume

        updateSliderColor(C.elems.volumeSliderElem.value)

        localStorage.setItem("game_volume", String(state.music.lastVolume))
    })

    setNewGame()

    this.setInterval(() => updateBoard(context), 1000 / 10)
}
