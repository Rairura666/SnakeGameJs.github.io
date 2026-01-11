const cellsize = 25
const rows = 25
const cols = 25

let speedX = 0
let speedY = 0
let snakeX = 5
let snakeY = 5
let snakeLength = 1 

let foodX
let foodY

function drawFoodBox(context) {
    context.fillStyle = "crimson"
    context.fillRect(foodX * cellsize, foodY * cellsize, cellsize, cellsize)
}

function newFoodPos() {
    const { x, y } = randomizeCell()
    foodX = x
    foodY = y
}

function drawSnakeHead(context) {
    context.fillStyle = "yellow"
    context.fillRect(snakeX * cellsize, snakeY * cellsize, cellsize, cellsize)

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
}

function updateBoard(context) {
    context.fillStyle = "blue"
    context.fillRect(0, 0, context.canvas.width, context.canvas.height)

    snakeX += speedX
    snakeY += speedY

    drawFoodBox(context)
    drawSnakeHead(context)

    if(snakeX == foodX && snakeY == foodY)
    {
        newFoodPos()
        snakeLength +=1
    }
}


function randomizeCell() {
    const x = Math.floor(Math.random() * (rows - 1)) + 1
    const y = Math.floor(Math.random() * (cols - 1)) + 1

    return { x, y }
}

function changeDirection(e) {
    if (e.code == "ArrowUp") {
        speedX = 0
        speedY = -1
    } else
        if (e.code == "ArrowDown") {
            speedX = 0
            speedY = 1
        } else
            if (e.code == "ArrowLeft") {
                speedX = -1
                speedY = 0
            } else
                if (e.code == "ArrowRight") {
                    speedX = 1
                    speedY = 0
                }

}

window.onload = function () {
    const boardElem = document.getElementById("board")
    boardElem.width = cellsize * cols
    boardElem.height = cellsize * rows
    const context = boardElem.getContext("2d")

    document.addEventListener("keyup", changeDirection)

    const {x:startX, y:startY} = randomizeCell()
    foodX = startX
    foodY = startY

    this.setInterval(() => updateBoard(context), 1000/10 )

}

