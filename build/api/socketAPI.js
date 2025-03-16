const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);
const { startTimer, stopTimer, resetTimer, restoreTimer, getTimeLeft } = require('./timer');
const { cacheTest, sessionCache, containsObject, addSession, resetCache } = require('./cache');

module.exports = (io, sessionMiddleware) => {
    io.use(wrap(sessionMiddleware));

    io.on("connection", (socket) => {
        const session = { ...socket.request.session };

        // ----------------- TIMER ----------------
        socket.emit("updateTimer", getTimeLeft());

        socket.on("restoreTimer", () => {
            restoreTimer(io);
        });

        socket.on("startTimer", (data) => {
            startTimer(io, data);
        });

        socket.on("stopTimer", () => {
            stopTimer();
        });

        //------ TIMER END ----------------

        //------ INVIO VERIFICA ----------------

        function giveTest() {
            const foundObj = sessionCache.find(existingObj => parseInt(existingObj.userID) === parseInt(session.userID));
            if (foundObj && !foundObj.quizCompleted) {
                if (cacheTest.quizInfo.classeDestinataria && session.classe && cacheTest.quizInfo.classeDestinataria === session.classe) {
                    socket.emit("testReceived", cacheTest.quizData, cacheTest.quizInfo.title);
                } else {
                    if (session.userSurname && session.user && session.classe) console.log(session.surname, session.name, session.classe, "accessDenied", "You do not have access to this quiz.");
                }
            }
        }

        socket.on("sendTest", (data, info) => {
            try {
                sessionCache.forEach(obj => {
                    delete obj.quizCompleted;
                });

                if (!data || !info) {
                    throw new Error("Invalid data or info provided");
                }

                cacheTest.quizData = data;
                cacheTest.quizInfo = info;
                cacheTest.quizInfo.started = true;

                io.emit("testInfo", info);
                io.emit('sessionOpened');
            } catch (error) {
                console.error("Error in sendTest:", error.message);
                socket.emit("error", { message: "Failed to send test. Please try again." });
            }
        });

        socket.emit("testInfo", cacheTest.quizInfo);
        socket.emit('sendSessionCache', sessionCache);

        socket.on("enterInSession", () => {
            if (cacheTest.quizInfo.started && cacheTest.quizInfo.classeDestinataria === session.classe) {
                if (!containsObject(sessionCache, session) && session.isAuthenticated) {
                    addSession(session);
                }
                giveTest();
                io.emit('sendSessionCache', sessionCache);
            }
        });

        socket.on("quizCompleted", () => {
            const foundObj = sessionCache.find(existingObj => parseInt(existingObj.userID) === parseInt(session.userID));
            if (foundObj) {
                foundObj.quizCompleted = true;
            }
            io.emit('sendSessionCache', sessionCache);
        });

        socket.on('closeSession', () => {
            resetCache();
            resetTimer(io);
            console.log("Dopo chiusura sessione", cacheTest);
            io.emit("testReceived", cacheTest.quizData, cacheTest.quizInfo.title);
            io.emit("testInfo", cacheTest.quizInfo);
        });

        socket.on('getSessionCache', () => {
            io.emit('sendSessionCache', sessionCache);
        });
    });
};
