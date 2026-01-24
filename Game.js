import * as C from "./Src/Constants.js";
import { state } from "./Src/State.js"
import { ghostMovement, ghostActions, drawGhost, spawnGhost, tryGhostAppear } from "./Src/Ghost.js"
import { drawFoodBox, newFoodPos } from "./Src/Food.js"
import { randomizeCell, isOpposite } from "./Src/Utils.js"
import { drawCake, tryCakeAppear } from "./Src/Cake.js"
import {completeAchievement, failAchievement} from "./Src/Achievement.js"
import { drawSnake, cutTail } from "./Src/Snake.js"

let scoreElem
let maxScoreElem

let catchYourTailElem
let hungerElem
let pacifistElem
let ghostHunterElem
let achievementList

let volumeSlider



function setNewGame() {
    state.game.gameStarted = false
    scoreElem = document.getElementById("scoreText")
    scoreElem.innerText = "Score: 0"
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
    pacifistElem.classList.remove("failed")
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



function startBossStage() {
    state.food.foodX = null
    state.food.foodY = null

    state.tickers.bossStartTick = 0
    state.tickers.tailCuttingTick = 0

    state.game.isBossStage = true
    state.game.foodSpawnProhibited = true
    state.game.cakeSpawnProhibited = true
    state.game.ghostSpawnProhibited = true
    state.snake.unlimitedPower = true
    state.cakes.length = 0

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
        catchYourTailElem.classList.add("hidden")
        hungerElem.classList.add("hidden")
        pacifistElem.classList.add("hidden")
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

        ghostHunterElem = ach

        document.getElementById("achievementList").prepend(ghostHunterElem)
    }

}

function stopBossStage() {
    state.game.isBossStage = false
    state.game.foodSpawnProhibited = false
    state.game.cakeSpawnProhibited = false
    state.game.ghostSpawnProhibited = false
    state.snake.unlimitedPower = false
    catchYourTailElem.classList.remove("hidden")
    hungerElem.classList.remove("hidden")
    pacifistElem.classList.remove("hidden")
    newFoodPos()

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

    ghostHunterElem = document.getElementById("ghostHunter")
    if (!state.achievements.ghostHunter && ghostHunterElem) {
        ghostHunterElem.remove()
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


        state.tickers.pacmanFrameTick++
        if (state.tickers.pacmanFrameTick >= C.PACMAN_DELAY) {
            state.frames.pacmanFrame = (state.frames.pacmanFrame + 1) % C.PACMAN_FRAMES
            state.tickers.pacmanFrameTick = 0
        }

        drawFoodBox(context)
        drawSnake(context)
        drawGhost(context, state.ghosts.at(0))
        state.cakes.forEach(cake => drawCake(context, cake))
    } else {



        if (state.game.gameOver) {

            state.tickers.gameoverFrameTick++
            if (state.tickers.gameoverFrameTick >= C.GAMEOVER_DELAY) {
                state.frames.gameoverFrame = (state.frames.gameoverFrame + 1) % C.GAMEOVER_FRAMES
                state.tickers.gameoverFrameTick = 0
            }

            context.drawImage(
                C.gameOverImg,
                state.frames.gameoverFrame * 500, 0,
                500, 500,
                0, 0,
                context.canvas.width, context.canvas.height
            )

            return

        } else if (state.game.pauseBeforeBoss) {
            state.tickers.pauseBossFrameTick++
            if (state.tickers.pauseBossFrameTick >= C.PAUSE_BOSS_DELAY) {
                state.frames.pauseBossFrame = (state.frames.pauseBossFrame + 1) % C.PAUSE_BOSS_FRAMES
                state.tickers.pauseBossFrameTick = 0
            }

            context.drawImage(
                C.pauseBossImg,
                state.frames.pauseBossFrame * 500, 0,
                500, 500,
                0, 0,
                context.canvas.width, context.canvas.height
            )
            state.tickers.pauseBeforeBossTick++
            drawFoodBox(context)
            drawSnake(context)
            state.ghosts.forEach(ghost => drawGhost(context, ghost))
            state.cakes.forEach(cake => drawCake(context, cake))
            if (state.tickers.pauseBeforeBossTick >= C.PAUSE_BEFORE_BOSS_TICKS) {
                state.game.pauseBeforeBoss = false
                state.tickers.pauseBeforeBossTick = 0
                startBossStage()
            }
        }
        else {

            if (state.game.isBossStage) {

                state.tickers.bossFrameTick++
                if (state.tickers.bossFrameTick >= C.BOSS_DELAY) {
                    state.frames.bossFrame = (state.frames.bossFrame + 1) % C.BOSS_FRAMES
                    state.tickers.bossFrameTick = 0
                }

                context.drawImage(
                    C.bossImg,
                    state.frames.bossFrame * 500, 0,
                    500, 500,
                    0, 0,
                    context.canvas.width, context.canvas.height
                )

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




                if (state.snake.poisoned) {
                    state.tickers.poisonedTick++

                    if (state.tickers.poisonedTick >= C.POISONED_TICKS) {
                        state.snake.poisoned = false
                        state.tickers.poisonedTick = 0

                        state.snake.snakeBody.splice(0, poisonCount)
                        state.snake.snakeLength = state.snake.snakeBody.length
                    }
                }

                if (state.snake.snakeLength === 0) {
                    state.game.gameOver = true
                    state.game.gameOverStartTime = Date.now()
                }
            }


            if (state.snake.nextDirection != null) {
                state.snake.curDirection = state.snake.nextDirection
            }


            if (state.snake.curDirection === "Up") {
                state.snake.speedX = 0
                state.snake.speedY = -1
            }
            if (state.snake.curDirection === "Down") {
                state.snake.speedX = 0
                state.snake.speedY = 1
            }
            if (state.snake.curDirection === "Left") {
                state.snake.speedX = -1
                state.snake.speedY = 0
            }
            if (state.snake.curDirection === "Right") {
                state.snake.speedX = 1
                state.snake.speedY = 0
            }

            state.snake.directionLocked = false

            const prevSnakeX = state.snake.snakeX
            const prevSnakeY = state.snake.snakeY
            state.snake.snakeX += state.snake.speedX
            state.snake.snakeY += state.snake.speedY

            if (state.achievements.catchYourTail === false && state.snake.snakeBody.length > 1 && state.snake.snakeX === state.snake.previousTailX && state.snake.snakeY === state.snake.previousTailY) {
                state.achievements.catchYourTail = true
                completeAchievement(catchYourTailElem)
                try {
                    const achRaw = localStorage.getItem("achievements")
                    const ach = achRaw ? JSON.parse(achRaw) : {}
                    ach.catchYourTail = true
                    localStorage.setItem("achievements", JSON.stringify(ach))
                }
                catch {
                }
            }


            if (state.snake.snakeX < 0) {
                state.snake.snakeX = C.COLS - 1
            }
            if (state.snake.snakeX > (C.COLS - 1)) {
                state.snake.snakeX = 0
            }
            if (state.snake.snakeY < 0) {
                state.snake.snakeY = C.ROWS - 1
            }
            if (state.snake.snakeY > (C.ROWS - 1)) {
                state.snake.snakeY = 0
            }

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
            if (state.tickers.strongTick == 0) {
                state.snake.isPacmanStrong = false
                state.achievements.hungerCounter = 0
            }

            if (state.food.foodX != null && state.food.foodY != null && state.snake.snakeX == state.food.foodX && state.snake.snakeY == state.food.foodY) {
                tryCakeAppear()
                newFoodPos()
                state.snake.snakeLength += 1
                state.snake.isPacmanStrong = true
                state.achievements.hungerCounter += 1
                state.tickers.strongTick = C.STRONG_TICKS
                if (state.snake.poisoned)
                    scoreElem.innerText = `Score: ${state.snake.snakeLength - poisonCount - 1}`
                else
                    scoreElem.innerText = `Score: ${state.snake.snakeLength - 1}`
            }


            const eatenCakeIndex = state.cakes.findIndex(
                cake => cake.x === state.snake.snakeX && cake.y === state.snake.snakeY
            )

            if (eatenCakeIndex !== -1) {
                state.snake.poisoned = true
                state.tickers.poisonedTick = 0
                scoreElem.innerText = `Score: ${state.snake.snakeLength - poisonCount - 1}`
                state.cakes.splice(eatenCakeIndex, 1)
            }

            if (state.snake.poisoned) {
                state.tickers.poisonedTick++

                if (state.tickers.poisonedTick >= C.POISONED_TICKS) {
                    state.snake.poisoned = false
                    state.tickers.poisonedTick = 0

                    state.snake.snakeBody.splice(0, poisonCount)
                    state.snake.snakeLength = state.snake.snakeBody.length
                }
            }

            state.tickers.pacmanFrameTick++
            if (state.tickers.pacmanFrameTick >= C.PACMAN_DELAY) {
                state.frames.pacmanFrame = (state.frames.pacmanFrame + 1) % C.PACMAN_FRAMES
                state.tickers.pacmanFrameTick = 0
            }



            state.ghosts.forEach(ghost => {

                ghost.age++
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

                    if (ghostActions.checkIfTheFoodCloseToTheGhost(ghost)) {
                        ghostMovement.changeGhostDirection(ghost)
                    }


                    const nearestCake = ghostActions.getNearestCake(ghost)
                    let ghostTargetsCake = false
                    if (nearestCake != null) {
                        if (state.ghosts.length == 1) {
                            if ((state.ghosts[0].curDir == "Up" && state.ghosts[0].y == nearestCake.y + 2) ||
                                (state.ghosts[0].curDir == "Down" && state.ghosts[0].y == nearestCake.y - 2) ||
                                (state.ghosts[0].curDir == "Right" && state.ghosts[0].x == nearestCake.x - 2) ||
                                (state.ghosts[0].curDir == "Left" && state.ghosts[0].x == nearestCake.x + 2)
                            )
                                ghostMovement.changeGhostDirection(ghost)
                        } else if (nearestCake && (Math.random() <= state.chances.ghostChanceToEatCake)) {
                            ghostActions.ghostGonnaEatACake(ghost, nearestCake)
                            ghostTargetsCake = true

                        }
                        if (ghostTargetsCake && ghost.x === nearestCake.x && ghost.y === nearestCake.y && ghost.age > 10) {
                            if (state.ghosts.length > 1) {
                                ghostActions.ghostEatsCake(ghost, nearestCake)
                            }
                        }

                    }

                    if (state.food.foodX != null && state.food.foodY != null && ghost.x == state.food.foodX && ghost.y == state.food.foodY) {
                        newFoodPos()
                        if (Math.random() <= state.chances.ghostChance) {
                            const gh = spawnGhost({ x: ghost.x, y: ghost.y })
                            ghostMovement.giveGhostSpeed(gh)
                            if (state.ghosts.length >= C.GHOSTS_BOSS_AMOUNT) {
                                state.game.pauseBeforeBoss = true
                            }
                            state.chances.ghostChance /= 2
                        }
                    }
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
                        failAchievement(pacifistElem)
                        if (state.snake.poisoned)
                            scoreElem.innerText = `Score: ${state.snake.snakeLength - poisonCount - 1}`
                        else
                            scoreElem.innerText = `Score: ${state.snake.snakeLength - 1}`
                        state.ghosts = state.ghosts.filter(g => g.id !== ghost.id)
                        state.chances.ghostChance *= 2
                        if (state.ghosts.length === 0 && state.game.isBossStage) {
                            state.achievements.ghostHunter = true
                            ghostHunterElem = document.getElementById("ghostHunter")
                            completeAchievement(ghostHunterElem)
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

            if ((state.snake.snakeLength - 1) > state.game.maxScore) {
                state.game.maxScore = state.snake.snakeLength - 1
                maxScoreElem.innerText = `Max score: ${state.game.maxScore}`
                localStorage.setItem("max_score", state.game.maxScore)
            }

            if (state.achievements.hungerCounter >= C.HUNGER_AMOUNT) {
                state.achievements.hunger = true
                completeAchievement(hungerElem)
                try {
                    const achRaw = localStorage.getItem("achievements")
                    const ach = achRaw ? JSON.parse(achRaw) : {}
                    ach.hunger = true
                    localStorage.setItem("achievements", JSON.stringify(ach))
                }
                catch {
                }
            }

            if ((state.snake.snakeBody.length - 1) >= C.PACIFIST_AMOUNT && !state.achievements.pacifistFailed && !state.achievements.pacifist) {
                state.achievements.pacifist = true
                completeAchievement(pacifistElem)
                try {
                    const achRaw = localStorage.getItem("achievements")
                    const ach = achRaw ? JSON.parse(achRaw) : {}
                    ach.pacifist = true
                    localStorage.setItem("achievements", JSON.stringify(ach))
                }
                catch {
                }
            }

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

    let newDir = null

    if (e.code === "ArrowUp" || e.code === "KeyW") newDir = "Up"
    if (e.code === "ArrowDown" || e.code === "KeyS") newDir = "Down"
    if (e.code === "ArrowLeft" || e.code === "KeyA") newDir = "Left"
    if (e.code === "ArrowRight" || e.code === "KeyD") newDir = "Right"

    if (!newDir) return

    if (isOpposite(state.snake.curDirection, newDir)) return

    state.snake.nextDirection = newDir
    state.snake.directionLocked = true
}

function updateSliderColor(value) {
    volumeSlider.style.pointerEvents = C.bgMusic.muted ? "none" : "auto"
    volumeSlider.style.opacity = C.bgMusic.muted ? "0.4" : "1"
    volumeSlider.style.setProperty("--fill", `${value * 100}%`)
}


window.onload = function () {
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
    scoreElem = document.getElementById("scoreText")
    maxScoreElem = document.getElementById("maxScoreText")

    const lastMaxScore = Number(localStorage.getItem("max_score"))
    state.game.maxScore = Number.isFinite(lastMaxScore) ? lastMaxScore : 0
    maxScoreElem.innerText = `Max score: ${state.game.maxScore}`


    try {
        const achievements = localStorage.getItem("achievements")
        achObj = JSON.parse(achievements) ?? {}
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




    achievementList = document.getElementById("achievementList")
    catchYourTailElem = document.getElementById("catchYourTail")
    hungerElem = document.getElementById("hunger")
    pacifistElem = document.getElementById("pacifist")



    if (state.achievements.catchYourTail) {
        catchYourTailElem.classList.add("achDone")
        achievementList.append(catchYourTailElem)
    }
    if (state.achievements.pacifist) {
        pacifistElem.classList.add("achDone")
        achievementList.append(pacifistElem)
    }
    if (state.achievements.hunger) {
        hungerElem.classList.add("achDone")
        achievementList.append(hungerElem)
    }
    if (state.achievements.ghostHunter) {
        ghostHunterElem = document.createElement("div")
        ghostHunterElem.className = "boss"
        ghostHunterElem.id = "ghostHunter"

        const h2 = document.createElement("h2")
        h2.textContent = "Ghostbuster"

        const p = document.createElement("p")
        p.textContent = "Eat them all."

        ghostHunterElem.append(h2, p)

        ghostHunterElem.classList.add("achDone")
        achievementList.append(ghostHunterElem)
    }


    document.addEventListener("keyup", handlePressedKey)


    const soundBtn = document.getElementById("soundBtn")
    document.addEventListener("keydown", () => {
        if (!state.music.musicStarted) {
            C.bgMusic.play().catch(() => { })
            state.music.musicStarted = true
        }
    })
    const savedVolume = Number(localStorage.getItem("game_volume"))
    state.music.lastVolume = Number.isFinite(savedVolume) ? savedVolume : 0.4
    C.bgMusic.muted = localStorage.getItem("game_muted") === "true"
    if (C.bgMusic.muted) {
        soundBtn.classList.toggle("muted", C.bgMusic.muted)
        soundBtn.innerText = C.bgMusic.muted ? "Unmute" : "Mute"

    }
    volumeSlider = document.getElementById("volumeSlider")
    volumeSlider.value = state.music.lastVolume
    C.bgMusic.volume = volumeSlider.value
    updateSliderColor(volumeSlider.value)

    soundBtn.addEventListener("click", () => {
        if (!C.bgMusic.muted) {
            C.bgMusic.muted = true
            state.music.lastVolume = C.bgMusic.volume
        } else {
            C.bgMusic.muted = false
            C.bgMusic.volume = state.music.lastVolume ?? localStorage.getItem("game_volume") ?? 1
            volumeSlider.value = C.bgMusic.volume
        }

        updateSliderColor(volumeSlider.value)

        soundBtn.classList.toggle("muted", C.bgMusic.muted)
        soundBtn.innerText = C.bgMusic.muted ? "Unmute" : "Mute"

        localStorage.setItem("game_muted", String(C.bgMusic.muted))
    });



    volumeSlider.addEventListener("input", () => {
        C.bgMusic.volume = volumeSlider.value
        state.music.lastVolume = C.bgMusic.volume

        updateSliderColor(volumeSlider.value)

        localStorage.setItem("game_volume", String(state.music.lastVolume))
    })

    setNewGame()

    this.setInterval(() => updateBoard(context), 1000 / 10)
}
