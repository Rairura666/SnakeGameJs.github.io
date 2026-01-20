const bgMusic = new Audio("Src/music.mp3");
bgMusic.loop = true
bgMusic.volume = 0.4


const gameOverImg = new Image()
gameOverImg.src = "Src/GameoverScreen.png"

const pacmanImg = new Image()
pacmanImg.src = "Src/pacman.png"

const pacmanPoisonImg = new Image()
pacmanPoisonImg.src = "Src/pacmanPoison.png"

const pacmanStrongImg = new Image()
pacmanStrongImg.src = "Src/pacmanStrong.png"

const foodImg = new Image()
foodImg.src = "Src/cherry.png"

const cakeImg = new Image()
cakeImg.src = "Src/cake.png"

const ghostImg = new Image()
ghostImg.src = "Src/ghost.png"

let musicStarted = false
let speedX = 0
let speedY = 0
let snakeX
let snakeY
let snakeLength = 1
let gameOver = false
let foodX = null
let foodY = null
let cakes = []
let scoreElem
let maxScoreElem

let lastVolume

let snakeBody = []
let curDirection = null
let nextDirection = null
let directionLocked = false
let cakeChance = 0.5
let ghostChance = 0.4
let ghostChanceToEatCake = 0.1
let ghosts = []
let maxScore = 0


let catchYourTailElem
let hungerElem
let pacifistElem
let achievementList

let catchYourTail = false
let previousTailX = 0
let previousTailY = 0

let hunger = false
let hungerCounter = 0
const HUNGER_AMOUNT = 10

let pacifist = false
let pacifistFailed = false
const PACIFIST_AMOUNT = 5


let isPacmanStrong = false
let strongTick = 0
const STRONG_TICKS = 50
let pacmanFrame = 0
let pacmanFrameTick = 0
let poisonedTick = 0
let poisoned = false
const PACMAN_FRAMES = 6
const PACMAN_DELAY = 1
const POISONED_TICKS = 12
const ghostMinChangeDirDelay = 3
const ghostMaxChangeDirDelay = 20

let gameOverStartTime = 0
const GAMEOVER_BLOCK_DURATION = 1000

let gameoverFrame = 0
let gameoverFrameTick = 0
const GAMEOVER_FRAMES = 6
const GAMEOVER_DELAY = 5

let volumeSlider

const cellsize = 25
const rows = 20
const cols = 20

function setNewGame() {
    scoreElem = this.document.getElementById("scoreText")
    scoreElem.innerText = "Score: 0"
    speedX = 0
    speedY = 0
    snakeX = 5
    snakeY = 5
    snakeLength = 1
    gameOver = false
    snakeBody = []
    cakes.length = 0
    ghosts.length = 0
    curDirection = null
    nextDirection = null
    directionLocked = false
    poisonedTick = 0
    poisoned = false
    ghostChance = 0.4
    isPacmanStrong = false
    gameOverStartTime = 0

    hungerCounter = 0
    pacifistFailed = false
    pacifistElem.classList.remove("failed")
    tryCakeAppear()
    spawnGhost(randomizeCell())

    const { x: startSnakeX, y: startSnakeY } = randomizeCell()
    snakeX = startSnakeX
    snakeY = startSnakeY
    snakeBody.push([snakeX, snakeY])

    const { x: startFoodX, y: startFoodY } = randomizeCell()
    foodX = startFoodX
    foodY = startFoodY

}

function spawnCake() {
    let x, y

    do {
        const pos = randomizeCell()
        x = pos.x
        y = pos.y
    } while (
        (x === foodX && y === foodY) ||
        cakes.some(cake => cake.x === x && cake.y === y) ||
        snakeBody.some(seg => seg[0] === x && seg[1] === y)
    )

    cakes.push({
        id: crypto.randomUUID(),
        x, y
    })
}

function spawnGhost({ x, y }) {
    const directions = ["Right", "Left", "Up", "Down"]
    const curDir = directions[Math.floor(Math.random() * directions.length)]

    let ghostSpeedX = 0
    let ghostSpeedY = 0

    if (curDir === "Up") {
        ghostSpeedY = -1
        ghostSpeedX = 0
    }
    if (curDir === "Down") {
        ghostSpeedY = 1
        ghostSpeedX = 0
    }
    if (curDir === "Left") {
        ghostSpeedX = -1
        ghostSpeedY = 0
    }
    if (curDir === "Right") {
        ghostSpeedX = 1
        ghostSpeedY = 0
    }

    const newGhost = {
        id: crypto.randomUUID(),
        x, y,
        curDir,
        ghostSpeedX, ghostSpeedY,
        changeTick: 0,
        changeDelay: Math.floor(Math.random() * (ghostMaxChangeDirDelay - ghostMinChangeDirDelay + 1)) + ghostMinChangeDirDelay,

    }

    newGhost.availableDirs = getAvailableDirs(newGhost)
    ghosts.push(newGhost)
}

function drawGhost(context, ghost) {
    context.drawImage(
        ghostImg,
        ghost.x * cellsize, ghost.y * cellsize, cellsize, cellsize,
    )
}


function drawFoodBox(context) {
    context.drawImage(
        foodImg,
        foodX * cellsize, foodY * cellsize, cellsize, cellsize,
    )
}

function newFoodPos() {
    let x, y
    do {
        const pos = randomizeCell()
        x = pos.x
        y = pos.y
    } while ((x === 0 && y === 0) ||
    (x === cols - 1 && y === 0) ||
    (x === 0 && y === rows - 1) ||
    (x === cols - 1 && y === rows - 1) || cakes.some(cake => cake.x === x && cake.y === y))
    foodX = x
    foodY = y
}


function drawCake(context, cake) {
    context.drawImage(
        cakeImg,
        cake.x * cellsize,
        cake.y * cellsize,
        cellsize,
        cellsize
    )
}

function drawRotatedSegment(context, image, x, y, cellsize, angle, frame) {
    context.save();
    context.translate(x + cellsize / 2, y + cellsize / 2);

    if (angle === Math.PI) {
        context.scale(-1, 1)
    } else {
        context.rotate(angle);
    }

    context.drawImage(
        image,
        frame * cellsize, 0,
        cellsize, cellsize,
        -cellsize / 2, -cellsize / 2,
        cellsize, cellsize
    );
    context.restore();
}

function drawSnake(context) {
    const poisonCount = (Math.floor((snakeBody.length) / 2) >= 1) ? Math.ceil((snakeBody.length) / 2) : 0

    if (!isPacmanStrong) {
        if (poisoned) {

            for (let i = snakeBody.length - 1; i >= poisonCount; i--) {

                let angle = 0

                if (snakeBody[i][2] === "Right") angle = 0
                if (snakeBody[i][2] === "Left") angle = Math.PI
                if (snakeBody[i][2] === "Up") angle = -Math.PI / 2
                if (snakeBody[i][2] === "Down") angle = Math.PI / 2

                drawRotatedSegment(context, pacmanImg, snakeBody[i][0] * cellsize, snakeBody[i][1] * cellsize, cellsize, angle, pacmanFrame)
            }
            drawPoisonedTail(context)

        }
        else {
            for (let i = 0; i < snakeBody.length; i++) {

                let angle = 0

                if (snakeBody[i][2] === "Right") angle = 0
                if (snakeBody[i][2] === "Left") angle = Math.PI
                if (snakeBody[i][2] === "Up") angle = -Math.PI / 2
                if (snakeBody[i][2] === "Down") angle = Math.PI / 2

                drawRotatedSegment(context, pacmanImg, snakeBody[i][0] * cellsize, snakeBody[i][1] * cellsize, cellsize, angle, pacmanFrame)
            }
        }
    } else {
        if (poisoned) {


            for (let i = snakeBody.length - 1; i >= poisonCount; i--) {

                let angle = 0

                if (snakeBody[i][2] === "Right") angle = 0
                if (snakeBody[i][2] === "Left") angle = Math.PI
                if (snakeBody[i][2] === "Up") angle = -Math.PI / 2
                if (snakeBody[i][2] === "Down") angle = Math.PI / 2

                if (strongTick < 20) {
                    if (strongTick % 2 == 0) {
                        drawRotatedSegment(context, pacmanStrongImg, snakeBody[i][0] * cellsize, snakeBody[i][1] * cellsize, cellsize, angle, pacmanFrame)
                    }
                    else {
                        drawRotatedSegment(context, pacmanImg, snakeBody[i][0] * cellsize, snakeBody[i][1] * cellsize, cellsize, angle, pacmanFrame)
                    }
                } else {
                    drawRotatedSegment(context, pacmanStrongImg, snakeBody[i][0] * cellsize, snakeBody[i][1] * cellsize, cellsize, angle, pacmanFrame)
                }


            }
            drawPoisonedTail(context)

        }
        else {
            for (let i = 0; i < snakeBody.length; i++) {

                let angle = 0

                if (snakeBody[i][2] === "Right") angle = 0
                if (snakeBody[i][2] === "Left") angle = Math.PI
                if (snakeBody[i][2] === "Up") angle = -Math.PI / 2
                if (snakeBody[i][2] === "Down") angle = Math.PI / 2

                if (strongTick < 20) {
                    if (strongTick % 2 == 0) {
                        drawRotatedSegment(context, pacmanStrongImg, snakeBody[i][0] * cellsize, snakeBody[i][1] * cellsize, cellsize, angle, pacmanFrame)
                    }
                    else {
                        drawRotatedSegment(context, pacmanImg, snakeBody[i][0] * cellsize, snakeBody[i][1] * cellsize, cellsize, angle, pacmanFrame)
                    }
                }
                else {
                    drawRotatedSegment(context, pacmanStrongImg, snakeBody[i][0] * cellsize, snakeBody[i][1] * cellsize, cellsize, angle, pacmanFrame)
                }
            }
        }
    }

}

function drawPoisonedTail(context) {

    const poisonCount = (Math.floor((snakeBody.length) / 2) >= 1) ? Math.ceil((snakeBody.length) / 2) : 0

    for (let i = 0; i < poisonCount; i++) {
        let angle = 0

        if (snakeBody[i][2] === "Right") angle = 0
        if (snakeBody[i][2] === "Left") angle = Math.PI
        if (snakeBody[i][2] === "Up") angle = -Math.PI / 2
        if (snakeBody[i][2] === "Down") angle = Math.PI / 2

        drawRotatedSegment(context, pacmanPoisonImg, snakeBody[i][0] * cellsize, snakeBody[i][1] * cellsize, cellsize, angle, pacmanFrame)
    }
}

function giveGhostNewDir(ghost, newDir) {
    ghost.curDir = newDir
    if (newDir === "Up") {
        ghost.ghostSpeedY = -1
        ghost.ghostSpeedX = 0
    }
    if (newDir === "Down") {
        ghost.ghostSpeedY = 1
        ghost.ghostSpeedX = 0
    }
    if (newDir === "Left") {
        ghost.ghostSpeedX = -1
        ghost.ghostSpeedY = 0
    }
    if (newDir === "Right") {
        ghost.ghostSpeedX = 1
        ghost.ghostSpeedY = 0
    }
    ghost.changeTick = 0
    ghost.changeDelay = Math.floor(Math.random() * (ghostMaxChangeDirDelay - ghostMinChangeDirDelay + 1)) + ghostMinChangeDirDelay
    ghost.availableDirs = getAvailableDirs(ghost)
}

function checkIfTheFoodCloseToTheGhost(ghost) {
    if ((Math.abs(ghost.x - foodX) <= 3) && (Math.abs(ghost.y - foodY) <= 3)) return true
    return false
}

function changeGhostDirection(ghost) {
    if (checkIfTheFoodCloseToTheGhost(ghost)) {
        if (ghost.x > foodX) giveGhostNewDir(ghost, "Left")
        else if (ghost.x < foodX) giveGhostNewDir(ghost, "Right")
        else if (ghost.y > foodY) giveGhostNewDir(ghost, "Up")
        else if (ghost.y < foodY) giveGhostNewDir(ghost, "Down")
    }
    else {
        const directions = ghost.availableDirs
        giveGhostNewDir(ghost, directions[Math.floor(Math.random() * directions.length)])
    }
}

function ghostGonnaEatACake(ghost, cake) {
    if (ghost.x > cake.x) giveGhostNewDir(ghost, "Left")
    else if (ghost.x < cake.x) giveGhostNewDir(ghost, "Right")
    else if (ghost.y > cake.y) giveGhostNewDir(ghost, "Up")
    else if (ghost.y < cake.y) giveGhostNewDir(ghost, "Down")
}

function getAvailableDirs(ghost) {
    const dirs = []

    if (ghost.x > 0) dirs.push("Left")
    if (ghost.x < cols - 1) dirs.push("Right")
    if (ghost.y > 0) dirs.push("Up")
    if (ghost.y < rows - 1) dirs.push("Down")

    return dirs
}

function getNearestCake(ghost) {
    if (cakes.length === 0) return null

    return cakes.reduce((best, cake) => {
        const dist = Math.abs(cake.x - ghost.x) + Math.abs(cake.y - ghost.y)
        if (!best || dist < best.dist) {
            return { cake, dist }
        }
        return best
    }, null)?.cake
}

function ghostEatsCake(ghost, cake) {
    cakes = cakes.filter(c => c.id !== cake.id)
    ghosts = ghosts.filter(g => g.id !== ghost.id)
}

function updateBoard(context) {
    context.fillStyle = "black"
    context.fillRect(0, 0, context.canvas.width, context.canvas.height)



    const poisonCount = (Math.floor((snakeBody.length) / 2) >= 1) ? Math.ceil((snakeBody.length) / 2) : 0

    if (gameOver) {

        gameoverFrameTick++
        if (gameoverFrameTick >= GAMEOVER_DELAY) {
            gameoverFrame = (gameoverFrame + 1) % GAMEOVER_FRAMES
            gameoverFrameTick = 0
        }

        context.drawImage(
            gameOverImg,
            gameoverFrame * 500, 0,
            500, 500,
            0, 0,
            context.canvas.width, context.canvas.height
        );

        return

    } else {

        if (nextDirection != null) {
            curDirection = nextDirection
        }


        if (curDirection === "Up") {
            speedX = 0
            speedY = -1
        }
        if (curDirection === "Down") {
            speedX = 0
            speedY = 1
        }
        if (curDirection === "Left") {
            speedX = -1
            speedY = 0
        }
        if (curDirection === "Right") {
            speedX = 1
            speedY = 0
        }

        directionLocked = false

        const prevSnakeX = snakeX
        const prevSnakeY = snakeY
        snakeX += speedX
        snakeY += speedY

        if (catchYourTail === false && snakeBody.length > 1 && snakeX === previousTailX && snakeY === previousTailY) {
            catchYourTail = true
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


        if (snakeX < 0) {
            snakeX = cols - 1
        }
        if (snakeX > (cols - 1)) {
            snakeX = 0
        }
        if (snakeY < 0) {
            snakeY = rows - 1
        }
        if (snakeY > (rows - 1)) {
            snakeY = 0
        }

        snakeBody.push([snakeX, snakeY, curDirection])

        if (snakeBody.length > snakeLength) {
            snakeBody.shift()
        }

        previousTailX = snakeBody[0][0]
        previousTailY = snakeBody[0][1]

        for (let i = 0; i < snakeBody.length - 1; i++) {
            if (snakeX == snakeBody[i][0] && snakeY == snakeBody[i][1]) {
                gameOver = true
                gameOverStartTime = Date.now()
            }
        }

        if (strongTick > 0) {
            strongTick--
        }
        if (strongTick == 0) {
            isPacmanStrong = false
            hungerCounter = 0
        }

        if (snakeX == foodX && snakeY == foodY) {
            tryCakeAppear()
            newFoodPos()
            snakeLength += 1
            isPacmanStrong = true
            hungerCounter += 1
            strongTick = STRONG_TICKS
            if (poisoned)
                scoreElem.innerText = `Score: ${snakeLength - poisonCount - 1}`
            else
                scoreElem.innerText = `Score: ${snakeLength - 1}`
        }


        const eatenCakeIndex = cakes.findIndex(
            cake => cake.x === snakeX && cake.y === snakeY
        )

        if (eatenCakeIndex !== -1) {
            poisoned = true
            poisonedTick = 0
            scoreElem.innerText = `Score: ${snakeLength - poisonCount - 1}`
            cakes.splice(eatenCakeIndex, 1)
        }

        if (poisoned) {
            poisonedTick++

            if (poisonedTick >= POISONED_TICKS) {
                poisoned = false
                poisonedTick = 0

                snakeBody.splice(0, poisonCount)
                snakeLength = snakeBody.length
            }
        }

        pacmanFrameTick++
        if (pacmanFrameTick >= PACMAN_DELAY) {
            pacmanFrame = (pacmanFrame + 1) % PACMAN_FRAMES
            pacmanFrameTick = 0
        }



        ghosts.forEach(ghost => {

            if ((ghost.x <= 0 && ghost.y <= 0) ||
                (ghost.x <= 0 && ghost.y >= rows - 1) ||
                (ghost.x >= cols - 1 && ghost.y <= 0) ||
                (ghost.x >= cols - 1 && ghost.y >= rows - 1) ||
                ((ghost.x <= 0) && ghost.curDir === "Left") ||
                ((ghost.x >= (cols - 1)) && ghost.curDir === "Right") ||
                ((ghost.y <= 0) && ghost.curDir === "Up") ||
                ((ghost.y >= (rows - 1)) && ghost.curDir === "Down")
            ) {
                ghost.availableDirs = getAvailableDirs(ghost)
                giveGhostNewDir(ghost, ghost.availableDirs[Math.floor(Math.random() * ghost.availableDirs.length)])
            }
            else {

                if (checkIfTheFoodCloseToTheGhost(ghost)) {
                    changeGhostDirection(ghost)
                }


                const nearestCake = getNearestCake(ghost)
                if (nearestCake != null) {
                    if (ghosts.length == 1) {
                        if ((ghosts[0].curDir == "Up" && ghosts[0].y == nearestCake.y + 2) ||
                            (ghosts[0].curDir == "Down" && ghosts[0].y == nearestCake.y - 2) ||
                            (ghosts[0].curDir == "Right" && ghosts[0].x == nearestCake.x - 2) ||
                            (ghosts[0].curDir == "Left" && ghosts[0].x == nearestCake.x + 2)
                        )
                            changeGhostDirection(ghost)
                    } else if (nearestCake && Math.random() <= ghostChanceToEatCake) {
                        ghostGonnaEatACake(ghost, nearestCake)
                    }

                    if (nearestCake && ghost.x === nearestCake.x && ghost.y === nearestCake.y) {
                        if (ghosts.length > 1) {
                            ghostEatsCake(ghost, nearestCake)
                        }
                    }
                }

                if (ghost.x == foodX && ghost.y == foodY) {
                    newFoodPos()
                    if (Math.random() <= ghostChance) {
                        spawnGhost({ x: ghost.x, y: ghost.y })
                        ghostChance /= 2
                    }
                }
            }

            if (ghost.changeTick >= ghost.changeDelay) {
                changeGhostDirection(ghost)
            }
            ghost.changeTick++
            drawGhost(context, ghost)

            const prevGhostX = ghost.x
            const prevGhostY = ghost.y

            const pacmanHitsGhostFromSide =
                snakeX === prevGhostX &&
                snakeY === prevGhostY &&
                !(ghost.x === prevSnakeX && ghost.y === prevSnakeY)

            ghost.x += ghost.ghostSpeedX
            ghost.y += ghost.ghostSpeedY


            const crossed =
                snakeX === prevGhostX &&
                snakeY === prevGhostY &&
                ghost.x === prevSnakeX &&
                ghost.y === prevSnakeY


            const sameCell = snakeX === ghost.x && snakeY === ghost.y

            if (sameCell || crossed || pacmanHitsGhostFromSide) {
                if (!isPacmanStrong) {
                    gameOver = true
                    gameOverStartTime = Date.now()

                } else {
                    snakeLength += 5
                    pacifistFailed = true
                    failAchievement(pacifistElem)
                    if (poisoned)
                        scoreElem.innerText = `Score: ${snakeLength - poisonCount - 1}`
                    else
                        scoreElem.innerText = `Score: ${snakeLength - 1}`
                    ghosts = ghosts.filter(g => g.id !== ghost.id)
                    ghostChance *= 2
                }
            }
        });

        if (ghosts.length == 0) {
            tryGhostAppear()
        }

        if ((snakeLength - 1) > maxScore) {
            maxScore = snakeLength - 1
            maxScoreElem.innerText = `Max score: ${maxScore}`
            localStorage.setItem("max_score", maxScore)
        }

        if (hungerCounter >= HUNGER_AMOUNT) {
            hunger = true
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

        if ((snakeBody.length - 1) >= PACIFIST_AMOUNT && !pacifistFailed && !pacifist) {
            pacifist = true
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
        cakes.forEach(cake => drawCake(context, cake))
    }
}


function tryCakeAppear() {
    if (Math.random() < cakeChance) {
        spawnCake()
    }
}

function tryGhostAppear() {
    if (Math.random() < ghostChance) {
        spawnGhost(randomizeCell())
    }
}

function randomizeCell() {
    const x = Math.floor(Math.random() * (rows - 1)) + 1
    const y = Math.floor(Math.random() * (cols - 1)) + 1

    return { x, y }
}

function isOpposite(a, b) {
    return (
        (a === "Up" && b === "Down") ||
        (a === "Down" && b === "Up") ||
        (a === "Left" && b === "Right") ||
        (a === "Right" && b === "Left")
    )
}

function handlePressedKey(e) {

    if (gameOver) {
        if (Date.now() - gameOverStartTime < GAMEOVER_BLOCK_DURATION) {
            return
        }

        setNewGame()
        return
    }
    if (directionLocked) return

    let newDir = null

    if (e.code === "ArrowUp" || e.code === "KeyW") newDir = "Up"
    if (e.code === "ArrowDown" || e.code === "KeyS") newDir = "Down"
    if (e.code === "ArrowLeft" || e.code === "KeyA") newDir = "Left"
    if (e.code === "ArrowRight" || e.code === "KeyD") newDir = "Right"

    if (!newDir) return

    if (isOpposite(curDirection, newDir)) return

    nextDirection = newDir
    directionLocked = true
}

function updateSliderColor(value) {
    volumeSlider.style.pointerEvents = bgMusic.muted ? "none" : "auto"
    volumeSlider.style.opacity = bgMusic.muted ? "0.4" : "1"
    volumeSlider.style.setProperty("--fill", `${value * 100}%`)
}

function completeAchievement(elem) {
    if (!elem || !achievementList) return
    if (elem.classList.contains("achDone")) return

    elem.classList.add("achFlash")

    setTimeout(() => {
        elem.classList.remove("achFlash")
        elem.classList.add("achDone")
        achievementList.append(elem)
    }, 1000)
}

function failAchievement(elem) {
    if (!elem || !achievementList) return
    if (elem.classList.contains("achDone")) return

    elem.classList.add("failed")
}

window.onload = function () {

    const boardElem = document.getElementById("board")
    boardElem.width = cellsize * cols
    boardElem.height = cellsize * rows
    const context = boardElem.getContext("2d")
    scoreElem = document.getElementById("scoreText")
    maxScoreElem = document.getElementById("maxScoreText")

    const lastMaxScore = Number(localStorage.getItem("max_score"))
    maxScore = Number.isFinite(lastMaxScore) ? lastMaxScore : 0
    maxScoreElem.innerText = `Max score: ${maxScore}`


    try {
        const achievements = localStorage.getItem("achievements")
        achObj = JSON.parse(achievements) ?? {}
        catchYourTail = achObj?.catchYourTail ?? false
        pacifist = achObj?.pacifist ?? false
        hunger = achObj?.hunger ?? false
    }
    catch {
        catchYourTail = false
        pacifist = false
        hunger = false
    }


    achievementList = document.getElementById("achievementList")
    catchYourTailElem = document.getElementById("catchYourTail")
    hungerElem = document.getElementById("hunger")
    pacifistElem = document.getElementById("pacifist")


    if (catchYourTail) {
        catchYourTailElem.classList.add("achDone")
        achievementList.append(catchYourTailElem)
    }
    if (pacifist) {
        pacifistElem.classList.add("achDone")
        achievementList.append(pacifistElem)
    }
    if (hunger) {
        hungerElem.classList.add("achDone")
        achievementList.append(hungerElem)
    }



    document.addEventListener("keyup", handlePressedKey)


    const soundBtn = document.getElementById("soundBtn")
    document.addEventListener("keydown", () => {
        if (!musicStarted) {
            bgMusic.play().catch(() => { })
            musicStarted = true
        }
    })
    const savedVolume = Number(localStorage.getItem("game_volume"))
    lastVolume = Number.isFinite(savedVolume) ? savedVolume : 0.4
    bgMusic.muted = localStorage.getItem("game_muted") === "true"
    if (bgMusic.muted) {
        soundBtn.classList.toggle("muted", bgMusic.muted)
        soundBtn.innerText = bgMusic.muted ? "Unmute" : "Mute"

    }
    volumeSlider = document.getElementById("volumeSlider")
    volumeSlider.value = lastVolume
    bgMusic.volume = volumeSlider.value
    updateSliderColor(volumeSlider.value)

    soundBtn.addEventListener("click", () => {
        if (!bgMusic.muted) {
            bgMusic.muted = true
            lastVolume = bgMusic.volume
        } else {
            bgMusic.muted = false
            bgMusic.volume = lastVolume ?? localStorage.getItem("game_volume") ?? 1
            volumeSlider.value = bgMusic.volume
        }

        updateSliderColor(volumeSlider.value)

        soundBtn.classList.toggle("muted", bgMusic.muted)
        soundBtn.innerText = bgMusic.muted ? "Unmute" : "Mute"

        localStorage.setItem("game_muted", String(bgMusic.muted))
    });



    volumeSlider.addEventListener("input", () => {
        bgMusic.volume = volumeSlider.value
        lastVolume = bgMusic.volume

        updateSliderColor(volumeSlider.value)

        localStorage.setItem("game_volume", String(lastVolume))
    })

    setNewGame()

    this.setInterval(() => updateBoard(context), 1000 / 10)
}
