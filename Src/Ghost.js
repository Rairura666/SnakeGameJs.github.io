import { state } from "./State.js"
import * as C from "./Constants.js"
import { randomizeCell } from "./Utils.js"
import { newFoodPos } from "./Food.js"

export function drawGhost(context, ghost) {
    if (state.game.pauseBeforeBoss) {
        if (state.tickers.pauseBeforeBossTick % 2 == 0) {
            context.drawImage(
                C.ghostImg,
                ghost.x * C.CELLSIZE, ghost.y * C.CELLSIZE, C.CELLSIZE, C.CELLSIZE,
            )
        }
        else {
            context.drawImage(
                C.ghostRedImg,
                ghost.x * C.CELLSIZE, ghost.y * C.CELLSIZE, C.CELLSIZE, C.CELLSIZE,
            )
        }
    } else {
        context.drawImage(
            C.ghostImg,
            ghost.x * C.CELLSIZE, ghost.y * C.CELLSIZE, C.CELLSIZE, C.CELLSIZE,
        )
    }
}

export function handleBeingCloseToACake(ghost) {
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

        if (ghostTargetsCake && ghost.x === nearestCake.x && ghost.y === nearestCake.y) {
            if (state.ghosts.length > 1) {
                ghostActions.ghostEatsCake(ghost, nearestCake)
            }
        }
    }
}

export function ifGhostIsOnTheFoodCellItEatsFood(ghost) {
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

export function tryGhostAppear() {
    if (!state.game.ghostSpawnProhibited && Math.random() < state.chances.ghostChance) {
        const gh = spawnGhost(randomizeCell())
        ghostMovement.giveGhostSpeed(gh)
    }
}


export function spawnGhost({ x, y }) {
    const directions = ["Right", "Left", "Up", "Down"]
    const curDir = directions[Math.floor(Math.random() * directions.length)]

    const newGhost = {
        id: crypto.randomUUID(),
        x, y,
        curDir,
        ghostSpeedX: 0, ghostSpeedY: 0,
        changeTick: 0,
        changeDelay: Math.floor(Math.random() * (C.ghostMaxChangeDirDelay - C.ghostMinChangeDirDelay + 1)) + C.ghostMinChangeDirDelay,

    }

    newGhost.availableDirs = ghostMovement.getAvailableDirs(newGhost)
    state.ghosts.push(newGhost)

    return newGhost
}


function giveGhostSpeed(ghost) {

    if (ghost.curDir === "Up") {
        ghost.ghostSpeedY = -1
        ghost.ghostSpeedX = 0
    }
    if (ghost.curDir === "Down") {
        ghost.ghostSpeedY = 1
        ghost.ghostSpeedX = 0
    }
    if (ghost.curDir === "Left") {
        ghost.ghostSpeedX = -1
        ghost.ghostSpeedY = 0
    }
    if (ghost.curDir === "Right") {
        ghost.ghostSpeedX = 1
        ghost.ghostSpeedY = 0
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
    ghost.changeDelay = Math.floor(Math.random() * (C.ghostMaxChangeDirDelay - C.ghostMinChangeDirDelay + 1)) + C.ghostMinChangeDirDelay
    ghost.availableDirs = getAvailableDirs(ghost)
}

function checkIfTheFoodCloseToTheGhost(ghost) {
    if (state.food.foodX != null && state.food.foodY != null) {
        if ((Math.abs(ghost.x - state.food.foodX) <= 3) && (Math.abs(ghost.y - state.food.foodY) <= 3)) return true
    }
    return false
}

function changeGhostDirection(ghost) {

    if (checkIfTheFoodCloseToTheGhost(ghost)) {
        if (state.food.foodX != null && state.food.foodY != null) {
            if (ghost.x > state.food.foodX) giveGhostNewDir(ghost, "Left")
            else if (ghost.x < state.food.foodX) giveGhostNewDir(ghost, "Right")
            else if (ghost.y > state.food.foodY) giveGhostNewDir(ghost, "Up")
            else if (ghost.y < state.food.foodY) giveGhostNewDir(ghost, "Down")
        }
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
    if (ghost.x < C.COLS - 1) dirs.push("Right")
    if (ghost.y > 0) dirs.push("Up")
    if (ghost.y < C.ROWS - 1) dirs.push("Down")

    return dirs
}

function getNearestCake(ghost) {
    if (state.cakes.length === 0) return null

    let nearest = null
    let minDist = Infinity

    for (const cake of state.cakes) {
        const dist =
            Math.abs(cake.x - ghost.x) +
            Math.abs(cake.y - ghost.y)

        if (dist <= 2 && dist < minDist) {
            minDist = dist
            nearest = cake
        }
    }

    return nearest
}

function ghostEatsCake(ghost, cake) {
    state.cakes = state.cakes.filter(c => c.id !== cake.id)
    state.ghosts = state.ghosts.filter(g => g.id !== ghost.id)
}

export const ghostMovement = {
    getAvailableDirs,
    changeGhostDirection,
    giveGhostNewDir,
    giveGhostSpeed
}

export const ghostActions = {
    ghostEatsCake,
    getNearestCake,
    ghostGonnaEatACake,
    checkIfTheFoodCloseToTheGhost,
}