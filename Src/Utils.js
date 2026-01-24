import { state } from "./State.js"
import * as C from "./Constants.js"

export function randomizeCell() {
    const x = Math.floor(Math.random() * (C.ROWS - 1)) + 1
    const y = Math.floor(Math.random() * (C.COLS - 1)) + 1

    return { x, y }
}
