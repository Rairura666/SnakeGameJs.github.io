export function completeAchievement(elem) {
    if (!elem || !achievementList) return
    if (elem.classList.contains("achDone")) return

    elem.classList.add("achFlash")

    setTimeout(() => {
        elem.classList.remove("achFlash")
        elem.classList.add("achDone")
        achievementList.append(elem)
    }, 1000)
}

export function failAchievement(elem) {
    if (!elem || !achievementList) return
    if (elem.classList.contains("achDone")) return

    elem.classList.add("failed")
}