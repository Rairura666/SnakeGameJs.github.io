const bgMusic = new Audio("Src/music.mp3");
bgMusic.loop = true;
bgMusic.volume = 0.4;

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

let musicStarted = false;
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
let snakeBody = []
let curDirection = "Right"
let cakeChance = 0.5
let ghostChance = 0.4
let ghostChanceToEatCake = 0.1
let ghosts = []
let maxScore = 0


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
    scoreElem
    snakeBody = []
    cakes.length = 0
    ghosts.length = 0
    curDirection = "Right"
    poisonedTick = 0
    poisoned = false
    ghostChance = 0.4
    isPacmanStrong = false
    gameOverStartTime = 0
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
    if (Math.random() >= cakeChance) return

    const { x, y } = randomizeCell()

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
        const prevSnakeX = snakeX
        const prevSnakeY = snakeY
        snakeX += speedX
        snakeY += speedY

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
        }

        if (snakeX == foodX && snakeY == foodY) {
            tryCakeAppear()
            newFoodPos()
            snakeLength += 1
            isPacmanStrong = true
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

function handlePressedKey(e) {

    if (gameOver) {
        if (Date.now() - gameOverStartTime < GAMEOVER_BLOCK_DURATION) {
            return
        }

        setNewGame()
        return
    }

    if (e.code == "ArrowUp" || e.code === "KeyW") {
        if (speedY != 1) {
            speedX = 0
            speedY = -1
            curDirection = "Up"
        }

    } else
        if (e.code == "ArrowDown" || e.code === "KeyS") {
            if (speedY != -1) {
                speedX = 0
                speedY = 1
                curDirection = "Down"
            }

        } else
            if (e.code == "ArrowLeft" || e.code === "KeyA") {
                if (speedX != 1) {
                    speedX = -1
                    speedY = 0
                    curDirection = "Left"
                }

            } else
                if (e.code == "ArrowRight" || e.code === "KeyD") {
                    if (speedX != -1) {
                        speedX = 1
                        speedY = 0
                        curDirection = "Right"
                    }

                }
}

window.onload = function () {

    const boardElem = document.getElementById("board")
    boardElem.width = cellsize * cols
    boardElem.height = cellsize * rows
    const context = boardElem.getContext("2d")
    scoreElem = this.document.getElementById("scoreText")
    maxScoreElem = this.document.getElementById("maxScoreText")
    document.addEventListener("keydown", () => {
        if (!musicStarted) {
            bgMusic.play();
            musicStarted = true;
        }
    });
    setNewGame()

    document.addEventListener("keyup", handlePressedKey)
    this.setInterval(() => updateBoard(context), 1000 / 10)
}
