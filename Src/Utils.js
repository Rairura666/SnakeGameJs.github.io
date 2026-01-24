import { state } from "./State.js"
import * as C from "./Constants.js"

export function randomizeCell() {
    const x = Math.floor(Math.random() * (C.ROWS - 1)) + 1
    const y = Math.floor(Math.random() * (C.COLS - 1)) + 1

    return { x, y }
}

export function isOpposite(a, b) {
    return (
        (a === "Up" && b === "Down") ||
        (a === "Down" && b === "Up") ||
        (a === "Left" && b === "Right") ||
        (a === "Right" && b === "Left")
    )
}


export function putNormalRules() {
    const newRules = [
        "▶ Eat eat eat eat eat eat.",
        "▶ Eat eat eat eat.",
        "▶ Eat eat eat eat eat eat eat eat eat eat eat.",
        "▶ Eat eat eat eat eat eat eat.",
        "▶ Eat eat eat eat eat eat eat eat eat eat eat eat eat eat eat eat eat.",
        "▶ Eat eat eat eat eat eat eat eat eat eat eat eat eat eat eat.",
        "▶ Eat eat eat eat eat eat eat eat eat eat eat eat eat eat eat eat eat eat eat eat eat eat eat.",
        "▶ Eat eat eat eat eat eat eat eat eat eat eat.",
        "▶ Eat eat eat eat eat eat eat.",
        "▶ Eat eat eat eat eat eat.",
    ]

    document.querySelectorAll("#Rules p").forEach((rule, i) => {
        if (newRules[i]) {
            rule.textContent = newRules[i]
            rule.style.color = "red"
        }
    })

    if (!state.achievements.ghostHunter) {
        C.elems.catchYourTailElem.classList.add("hidden")
        C.elems.hungerElem.classList.add("hidden")
        C.elems.pacifistElem.classList.add("hidden")
        const ach = document.createElement("div")
        ach.className = "boss"
        ach.id = "ghostHunter"

        const h2 = document.createElement("h2")
        h2.textContent = "Ghostbuster"
        h2.color = "red"

        const p = document.createElement("p")
        p.textContent = "Eat them all."
        p.color = "red"

        ach.append(h2, p)

        C.elems.ghostHunterElem = ach

        document.getElementById("achievementList").prepend(C.elems.ghostHunterElem)
    }
}

export function putBossRules() {
    const newRules = [
        "▶ Use arrows or WASD to move.",
        "▶ Cherry adds 1 point.",
        "▶ Cake is poisonous, cuts half of the snakeman.",
        "▶ Ghosts eat cherries too.",
        "▶ When a ghost eats a cherry there is a chance to spawn another ghost.",
        "▶ There is some chance that a ghost will eat a cake and die.",
        "▶ After eating a cherry the snakeman becomes strong and is able to eat ghosts for some time.",
        "▶ Weak snakeman dies if tries to eat a ghost.",
        "▶ An eated ghost adds 5 points.",
        "▶ Don't let 4 ghosts appear."
    ]

    document.querySelectorAll("#Rules p").forEach((rule, i) => {
        if (newRules[i]) {
            rule.textContent = newRules[i]
            rule.style.color = "#00FF00"
            if (i == (newRules.length - 1)) {
                rule.style.color = "#FF0000"
            }
        }
    })
}
