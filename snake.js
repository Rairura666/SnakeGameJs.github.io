const cellsize = 25
const rows = 25
const cols=25

function drawFoodBox(context) {
    const {x,y} = randomizeFood()
    context.fillStyle = "crimson"
    context.fillRect(x*cellsize,y*cellsize, cellsize, cellsize)
}

function drawSnake() {

}

function updateBoard(context) {
    context.fillStyle = "blue"
    context.fillRect(0, 0, board.width, board.height)

    drawFoodBox(context)

    
}


function randomizeFood () {
    const x = Math.floor(Math.random()*(rows-1))+1
    const y = Math.floor(Math.random()*(cols-1))+1
    
    return{x,y}
}



window.onload = function () {

    const boardElem = document.getElementById("board")
    boardElem.width = cellsize*cols
    boardElem.height = cellsize*rows
    const context = boardElem.getContext("2d")

    updateBoard(context)

}

