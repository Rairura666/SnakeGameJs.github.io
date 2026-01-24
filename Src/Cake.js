import { state } from "./State.js"
import * as C from "./Constants.js"
import { randomizeCell } from "./Utils.js"

export function drawCake(context, cake) {
    context.drawImage(
        C.cakeImg,
        cake.x * C.CELLSIZE,
        cake.y * C.CELLSIZE,
        C.CELLSIZE,
        C.CELLSIZE
    )
}

export function tryCakeAppear() {
    if (!state.game.cakeSpawnProhibited && Math.random() < state.chances.cakeChance) {
        spawnCake()
    }
}

export function spawnCake() {
    let x, y

    do {
        const pos = randomizeCell()
        x = pos.x
        y = pos.y
    } while (
        (state.food.foodX != null && state.food.foodY != null && x === state.food.foodX && y === state.food.foodY) ||
        state.cakes.some(cake => cake.x === x && cake.y === y) ||
        state.snake.snakeBody.some(seg => seg[0] === x && seg[1] === y)
    )

    state.cakes.push({
        id: crypto.randomUUID(),
        x, y
    })
}
