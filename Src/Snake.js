import { state } from "./State.js"
import * as C from "./Constants.js"

export function cutTail() {
    if (state.snake.snakeBody.length >= 1) {
        state.snake.snakeBody.splice(0, 1)
        state.snake.snakeLength = state.snake.snakeBody.length
        C.elems.scoreElem.innerText = state.snake.snakeLength >= 1 ? `Score: ${state.snake.snakeLength - 1}` : "Score: 0"
    }
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

export function drawSnake(context) {
    const poisonCount = (Math.floor((state.snake.snakeBody.length) / 2) >= 1) ? Math.ceil((state.snake.snakeBody.length) / 2) : 0

    if (!state.game.gameStarted) {

        let angle = 0

        if (state.snake.snakeBody[0][2] === "Right") angle = 0
        if (state.snake.snakeBody[0][2] === "Left") angle = Math.PI
        if (state.snake.snakeBody[0][2] === "Up") angle = -Math.PI / 2
        if (state.snake.snakeBody[0][2] === "Down") angle = Math.PI / 2

        drawRotatedSegment(context, C.pacmanImg, state.snake.snakeBody[0][0] * C.CELLSIZE, state.snake.snakeBody[0][1] * C.CELLSIZE, C.CELLSIZE, angle, state.frames.pacmanFrame)

    } else {

        if (state.game.pauseBeforeBoss) {
            for (let i = 0; i < state.snake.snakeBody.length; i++) {
                if (state.tickers.pauseBeforeBossTick < C.PAUSE_BEFORE_BOSS_TICKS) {
                    let angle = 0

                    if (state.snake.snakeBody[i][2] === "Right") angle = 0
                    if (state.snake.snakeBody[i][2] === "Left") angle = Math.PI
                    if (state.snake.snakeBody[i][2] === "Up") angle = -Math.PI / 2
                    if (state.snake.snakeBody[i][2] === "Down") angle = Math.PI / 2
                    if (state.tickers.pauseBeforeBossTick % 2 == 0) {
                        drawRotatedSegment(context, C.pacmanStrongImg, state.snake.snakeBody[i][0] * C.CELLSIZE, state.snake.snakeBody[i][1] * C.CELLSIZE, C.CELLSIZE, angle, state.frames.pacmanFrame)
                    }
                    else {
                        drawRotatedSegment(context, C.pacmanImg, state.snake.snakeBody[i][0] * C.CELLSIZE, state.snake.snakeBody[i][1] * C.CELLSIZE, C.CELLSIZE, angle, state.frames.pacmanFrame)
                    }
                }
            }
        } else {



            if (!state.snake.isPacmanStrong && !state.snake.unlimitedPower) {
                if (state.snake.poisoned) {

                    for (let i = state.snake.snakeBody.length - 1; i >= poisonCount; i--) {

                        let angle = 0

                        if (state.snake.snakeBody[i][2] === "Right") angle = 0
                        if (state.snake.snakeBody[i][2] === "Left") angle = Math.PI
                        if (state.snake.snakeBody[i][2] === "Up") angle = -Math.PI / 2
                        if (state.snake.snakeBody[i][2] === "Down") angle = Math.PI / 2

                        drawRotatedSegment(context, C.pacmanImg, state.snake.snakeBody[i][0] * C.CELLSIZE, state.snake.snakeBody[i][1] * C.CELLSIZE, C.CELLSIZE, angle, state.frames.pacmanFrame)
                    }
                    drawPoisonedTail(context)

                }
                else {
                    for (let i = 0; i < state.snake.snakeBody.length; i++) {

                        let angle = 0

                        if (state.snake.snakeBody[i][2] === "Right") angle = 0
                        if (state.snake.snakeBody[i][2] === "Left") angle = Math.PI
                        if (state.snake.snakeBody[i][2] === "Up") angle = -Math.PI / 2
                        if (state.snake.snakeBody[i][2] === "Down") angle = Math.PI / 2

                        drawRotatedSegment(context, C.pacmanImg, state.snake.snakeBody[i][0] * C.CELLSIZE, state.snake.snakeBody[i][1] * C.CELLSIZE, C.CELLSIZE, angle, state.frames.pacmanFrame)
                    }
                }
            } else {
                if (state.snake.poisoned) {


                    for (let i = state.snake.snakeBody.length - 1; i >= poisonCount; i--) {

                        let angle = 0

                        if (state.snake.snakeBody[i][2] === "Right") angle = 0
                        if (state.snake.snakeBody[i][2] === "Left") angle = Math.PI
                        if (state.snake.snakeBody[i][2] === "Up") angle = -Math.PI / 2
                        if (state.snake.snakeBody[i][2] === "Down") angle = Math.PI / 2

                        if (state.tickers.strongTick < 20 && !state.snake.unlimitedPower) {
                            if (state.tickers.strongTick % 2 == 0) {
                                drawRotatedSegment(context, C.pacmanStrongImg, state.snake.snakeBody[i][0] * C.CELLSIZE, state.snake.snakeBody[i][1] * C.CELLSIZE, C.CELLSIZE, angle, state.frames.pacmanFrame)
                            }
                            else {
                                drawRotatedSegment(context, C.pacmanImg, state.snake.snakeBody[i][0] * C.CELLSIZE, state.snake.snakeBody[i][1] * C.CELLSIZE, C.CELLSIZE, angle, state.frames.pacmanFrame)
                            }
                        } else {
                            drawRotatedSegment(context, C.pacmanStrongImg, state.snake.snakeBody[i][0] * C.CELLSIZE, state.snake.snakeBody[i][1] * C.CELLSIZE, C.CELLSIZE, angle, state.frames.pacmanFrame)
                        }


                    }
                    drawPoisonedTail(context)
                    if (state.tickers.poisonedBossTick < C.POISONED_BOSS_TICKS && state.game.isBossStage) {
                        let angle = 0

                        if (state.snake.snakeBody[0][2] === "Right") angle = 0
                        if (state.snake.snakeBody[0][2] === "Left") angle = Math.PI
                        if (state.snake.snakeBody[0][2] === "Up") angle = -Math.PI / 2
                        if (state.snake.snakeBody[0][2] === "Down") angle = Math.PI / 2

                        drawRotatedSegment(context, C.pacmanPoisonImg, state.snake.snakeBody[0][0] * C.CELLSIZE, state.snake.snakeBody[0][1] * C.CELLSIZE, C.CELLSIZE, angle, state.frames.pacmanFrame)
                    }

                }
                else {
                    for (let i = 0; i < state.snake.snakeBody.length; i++) {

                        let angle = 0

                        if (state.snake.snakeBody[i][2] === "Right") angle = 0
                        if (state.snake.snakeBody[i][2] === "Left") angle = Math.PI
                        if (state.snake.snakeBody[i][2] === "Up") angle = -Math.PI / 2
                        if (state.snake.snakeBody[i][2] === "Down") angle = Math.PI / 2

                        if (state.tickers.strongTick < 20 && !state.snake.unlimitedPower) {
                            if (state.tickers.strongTick % 2 == 0) {
                                drawRotatedSegment(context, C.pacmanStrongImg, state.snake.snakeBody[i][0] * C.CELLSIZE, state.snake.snakeBody[i][1] * C.CELLSIZE, C.CELLSIZE, angle, state.frames.pacmanFrame)
                            }
                            else {
                                drawRotatedSegment(context, C.pacmanImg, state.snake.snakeBody[i][0] * C.CELLSIZE, state.snake.snakeBody[i][1] * C.CELLSIZE, C.CELLSIZE, angle, state.frames.pacmanFrame)
                            }
                        }
                        else {
                            drawRotatedSegment(context, C.pacmanStrongImg, state.snake.snakeBody[i][0] * C.CELLSIZE, state.snake.snakeBody[i][1] * C.CELLSIZE, C.CELLSIZE, angle, state.frames.pacmanFrame)
                        }
                    }
                    if (state.tickers.poisonedBossTick < C.POISONED_BOSS_TICKS && state.game.isBossStage) {
                        let angle = 0

                        if (state.snake.snakeBody[0][2] === "Right") angle = 0
                        if (state.snake.snakeBody[0][2] === "Left") angle = Math.PI
                        if (state.snake.snakeBody[0][2] === "Up") angle = -Math.PI / 2
                        if (state.snake.snakeBody[0][2] === "Down") angle = Math.PI / 2
                        if (state.tickers.poisonedBossTick > 0) {
                            drawRotatedSegment(context, C.pacmanPoisonImg, state.snake.snakeBody[0][0] * C.CELLSIZE, state.snake.snakeBody[0][1] * C.CELLSIZE, C.CELLSIZE, angle, state.frames.pacmanFrame)
                        }
                        else {
                            drawRotatedSegment(context, C.pacmanStrongImg, state.snake.snakeBody[0][0] * C.CELLSIZE, state.snake.snakeBody[0][1] * C.CELLSIZE, C.CELLSIZE, angle, state.frames.pacmanFrame)
                        }
                    }
                }
            }
        }
    }
}

function drawPoisonedTail(context) {

    const poisonCount = (Math.floor((state.snake.snakeBody.length) / 2) >= 1) ? Math.ceil((state.snake.snakeBody.length) / 2) : 0

    for (let i = 0; i < poisonCount; i++) {
        let angle = 0

        if (state.snake.snakeBody[i][2] === "Right") angle = 0
        if (state.snake.snakeBody[i][2] === "Left") angle = Math.PI
        if (state.snake.snakeBody[i][2] === "Up") angle = -Math.PI / 2
        if (state.snake.snakeBody[i][2] === "Down") angle = Math.PI / 2

        drawRotatedSegment(context, C.pacmanPoisonImg, state.snake.snakeBody[i][0] * C.CELLSIZE, state.snake.snakeBody[i][1] * C.CELLSIZE, C.CELLSIZE, angle, state.frames.pacmanFrame)
    }
}