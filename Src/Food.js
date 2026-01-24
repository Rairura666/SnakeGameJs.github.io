import { state } from "./State.js"
import * as C from "./Constants.js"
import { randomizeCell } from "./Utils.js"


export function drawFoodBox(context) {
    if (state.food.foodX != null && state.food.foodY != null) {
        context.drawImage(
            C.foodImg,
            state.food.foodX * C.CELLSIZE, state.food.foodY * C.CELLSIZE, C.CELLSIZE, C.CELLSIZE,
        )
    }
    else return
}

export function newFoodPos() {
    if (!state.game.foodSpawnProhibited) {
        let x, y
        do {
            const pos = randomizeCell()
            x = pos.x
            y = pos.y
        } while ((x == 0 && y == 0) ||
        (x == (C.COLS - 1) && y == 0) ||
        (x == 0 && y == (C.ROWS - 1)) ||
        (x == (C.COLS - 1) && y == (C.ROWS - 1)) || state.cakes.some(cake => cake.x == x && cake.y == y))
        state.food.foodX = x
        state.food.foodY = y
    } else {
        state.food.foodX = null
        state.food.foodY = null
    }
}

