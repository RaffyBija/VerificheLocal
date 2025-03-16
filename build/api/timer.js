let timeLeft = 0;
let timer;

function startTimer(io, data) {
    if (timer) clearInterval(timer);

    timeLeft = data.minutes * 60 + data.seconds;
    io.emit("updateTimer", timeLeft);

    timer = setInterval(() => {
        if (timeLeft > 0) {
            timeLeft--;
            io.emit("updateTimer", timeLeft);
        } else {
            clearInterval(timer);
            io.emit("timerFinished");
        }
    }, 1000);
}

function stopTimer() {
    clearInterval(timer);
}

function resetTimer(io) {
    clearInterval(timer);
    timeLeft = 0;
    io.emit("updateTimer", timeLeft);
}

function restoreTimer(io) {
    timer = setInterval(() => {
        if (timeLeft > 0) {
            timeLeft--;
            io.emit("updateTimer", timeLeft);
        } else {
            clearInterval(timer);
            io.emit("timerFinished");
        }
    }, 1000);
}

module.exports = {
    startTimer,
    stopTimer,
    resetTimer,
    restoreTimer,
    getTimeLeft: () => timeLeft
};