const cellsize = 25
const rows = 25
const cols = 25

let speedX = 0
let speedY = 0
let snakeX = 5
let snakeY = 5
let snakeLength = 1
let gameOver = false
let foodX
let foodY
let scoreElem
let snakeBody = []

function drawFoodBox(context) {
    context.fillStyle = "crimson"
    context.fillRect(foodX * cellsize, foodY * cellsize, cellsize, cellsize)
}

function newFoodPos() {
    const { x, y } = randomizeCell()
    foodX = x
    foodY = y
}

function drawSnake(context) {
    context.fillStyle = "yellow"

    for (let i = 0; i < snakeBody.length; i++) {
        context.fillRect(snakeBody[i][0] * cellsize, snakeBody[i][1] * cellsize, cellsize, cellsize)
    }

    if (snakeX < 0) {
        snakeX = cols - 1
    }
    if (snakeX > (cols-1)) {
        snakeX = -1
    }
    if (snakeY < 0) {
        snakeY = rows -1
    }
    if (snakeY > (rows-1)) {
        snakeY = -1
    }
}

function updateBoard(context) {
    context.fillStyle = "blue"
    context.fillRect(0, 0, context.canvas.width, context.canvas.height)

    if (gameOver) {
        context.fillStyle = "white"
        context.font = "40px Arial"
        context.textAlign = "center"
        context.textBaseline = "middle"

        context.fillText("Game Over", context.canvas.width / 2, context.canvas.height / 2)
    } else {

        snakeX += speedX
        snakeY += speedY

        snakeBody.push([snakeX, snakeY])

        if (snakeBody.length > snakeLength) {
            snakeBody.shift()
        }

        drawFoodBox(context)
        drawSnake(context)

        if (snakeX == foodX && snakeY == foodY) {
            newFoodPos()
            snakeLength += 1
            scoreElem.innerText = `Score: ${snakeLength - 1}`
        }
    }
}



function randomizeCell() {
    const x = Math.floor(Math.random() * (rows - 1)) + 1
    const y = Math.floor(Math.random() * (cols - 1)) + 1

    return { x, y }
}

function changeDirection(e) {
    if (e.code == "ArrowUp") {
        if (speedY != 1) {
            speedX = 0
            speedY = -1
        } else gameOver = true

    } else
        if (e.code == "ArrowDown") {
            if (speedY != -1) {
                speedX = 0
                speedY = 1
            } else gameOver = true

        } else
            if (e.code == "ArrowLeft") {
                if (speedX != 1) {
                    speedX = -1
                    speedY = 0
                } else gameOver = true

            } else
                if (e.code == "ArrowRight") {
                    if (speedX != -1) {
                        speedX = 1
                        speedY = 0
                    } else gameOver = true

                }
    console.log(snakeBody)
}

window.onload = function start() {
    const boardElem = document.getElementById("board")
    boardElem.width = cellsize * cols
    boardElem.height = cellsize * rows
    const context = boardElem.getContext("2d")
    scoreElem = this.document.getElementById("scoreText")

    document.addEventListener("keyup", changeDirection)

    const { x: startSnakeX, y: startSnakeY } = randomizeCell()
    snakeX = startSnakeX
    snakeY = startSnakeY
    snakeBody.push([snakeX, snakeY])

    const { x: startFoodX, y: startFoodY } = randomizeCell()
    foodX = startFoodX
    foodY = startFoodY

    this.setInterval(() => updateBoard(context), 1000 / 10)

}

