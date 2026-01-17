const pacmanImg = new Image()
pacmanImg.src = "./src/pacman.png"

const pacmanPoisonImg = new Image()
pacmanPoisonImg.src = "./src/pacman_poison.png"

const foodImg = new Image()
foodImg.src = "./src/cherry.png"

const cakeImg = new Image()
cakeImg.src = "./src/cake.png"

const ghostImg = new Image()
ghostImg.src = "./src/ghost.png"

let speedX = 0
let speedY = 0
let snakeX
let snakeY
let snakeLength = 1
let gameOver = false
let foodX = null
let foodY = null
let cakeX = null
let cakeY = null
let cakeExists = false
let scoreElem
let snakeBody = []
let curDirection = "Right"
let cakeChance = 0.5
let ghostChance = 0.2
let ghosts = []

let pacmanFrame = 0
let pacmanFrameTick = 0
let poisonedTick = 0
let poisoned = false
const PACMAN_FRAMES = 6
const PACMAN_DELAY = 1
const POISONED_TICKS = 12
const ghostMinChangeDirDelay = 3
const ghostMaxChangeDirDelay = 20

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
    foodX = null
    foodY = null
    scoreElem
    snakeBody = []
    ghosts.length = 0
    curDirection = "Right"
    poisonedTick = 0
    poisoned = false
    cakeExists = false
    ghostChance = 0.2
    tryCakeAppear()
    spawnGhost()

    const { x: startSnakeX, y: startSnakeY } = randomizeCell()
    snakeX = startSnakeX
    snakeY = startSnakeY
    snakeBody.push([snakeX, snakeY])

    const { x: startFoodX, y: startFoodY } = randomizeCell()
    foodX = startFoodX
    foodY = startFoodY

}

function spawnGhost() {
    const { x, y } = randomizeCell()
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
    const { x, y } = randomizeCell()
    while ((x == 0 && y == 0) || (x == cols - 1 && y == 0) || (x == 0 && y == rows - 1) || (x == cols - 1 && y == rows - 1)) {
        x, y = randomizeCell()
    }
    foodX = x
    foodY = y
}

function newCakePos() {
    const { x, y } = randomizeCell()
    cakeX = x
    cakeY = y
}

function drawCake(context) {
    context.drawImage(
        cakeImg,
        cakeX * cellsize, cakeY * cellsize, cellsize, cellsize
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

    } else {
        for (let i = 0; i < snakeBody.length; i++) {

            let angle = 0

            if (snakeBody[i][2] === "Right") angle = 0
            if (snakeBody[i][2] === "Left") angle = Math.PI
            if (snakeBody[i][2] === "Up") angle = -Math.PI / 2
            if (snakeBody[i][2] === "Down") angle = Math.PI / 2

            drawRotatedSegment(context, pacmanImg, snakeBody[i][0] * cellsize, snakeBody[i][1] * cellsize, cellsize, angle, pacmanFrame)
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

function getAvailableDirs(ghost) {
    const dirs = []

    if (ghost.x > 0) dirs.push("Left")
    if (ghost.x < cols - 1) dirs.push("Right")
    if (ghost.y > 0) dirs.push("Up")
    if (ghost.y < rows - 1) dirs.push("Down")

    return dirs
}

function updateBoard(context) {
    context.fillStyle = "black"
    context.fillRect(0, 0, context.canvas.width, context.canvas.height)

    const poisonCount = (Math.floor((snakeBody.length) / 2) >= 1) ? Math.ceil((snakeBody.length) / 2) : 0

    if (gameOver) {
        context.fillStyle = "white"
        context.font = "40px Arial"
        context.textAlign = "center"
        context.textBaseline = "middle"

        context.fillText("Game Over", context.canvas.width / 2, context.canvas.height / 2)

        context.font = "20px Arial"
        context.fillText(
            "Press any key to restart",
            context.canvas.width / 2,
            context.canvas.height / 2 + 40
        )
    } else {

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
            }
        }

        if (snakeX == foodX && snakeY == foodY) {
            newFoodPos()
            snakeLength += 1
            scoreElem.innerText = `Score: ${snakeLength - 1}`
            if (cakeExists == false) {
                tryCakeAppear()
            }
        }

        if (snakeX == cakeX && snakeY == cakeY) {
            poisoned = true
            poisonedTick = 0

            cakeExists = false
            cakeX = null
            cakeY = null
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

                if (ghost.x == foodX && ghost.y == foodY) {
                    newFoodPos()
                    if (Math.random() <= ghostChance) {
                        spawnGhost()
                        ghostChance /= 2
                    }
                }
            }

            if (ghost.changeTick >= ghost.changeDelay) {
                changeGhostDirection(ghost)
            }
            ghost.changeTick++
            drawGhost(context, ghost)
            ghost.x += ghost.ghostSpeedX
            ghost.y += ghost.ghostSpeedY

        });

        drawFoodBox(context)
        drawSnake(context)


        if (cakeX != null && cakeY != null) {
            drawCake(context)
        }
    }
}


function tryCakeAppear() {
    if (Math.random() < cakeChance) {
        cakeExists = true
        newCakePos()
    }
}

function randomizeCell() {
    const x = Math.floor(Math.random() * (rows - 1)) + 1
    const y = Math.floor(Math.random() * (cols - 1)) + 1

    return { x, y }
}

function handlePressedKey(e) {

    if (gameOver) {
        setNewGame()

        return
    }

    if (e.code == "ArrowUp") {
        if (speedY != 1) {
            speedX = 0
            speedY = -1
            curDirection = "Up"
        } else gameOver = true

    } else
        if (e.code == "ArrowDown") {
            if (speedY != -1) {
                speedX = 0
                speedY = 1
                curDirection = "Down"
            } else gameOver = true

        } else
            if (e.code == "ArrowLeft") {
                if (speedX != 1) {
                    speedX = -1
                    speedY = 0
                    curDirection = "Left"
                } else gameOver = true

            } else
                if (e.code == "ArrowRight") {
                    if (speedX != -1) {
                        speedX = 1
                        speedY = 0
                        curDirection = "Right"
                    } else gameOver = true

                }
}

window.onload = function () {

    const boardElem = document.getElementById("board")
    boardElem.width = cellsize * cols
    boardElem.height = cellsize * rows
    const context = boardElem.getContext("2d")
    scoreElem = this.document.getElementById("scoreText")

    setNewGame()

    document.addEventListener("keyup", handlePressedKey)
    this.setInterval(() => updateBoard(context), 1000 / 10)
}
