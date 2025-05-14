const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);
const { startTimer, stopTimer, resetTimer, restoreTimer, getTimeLeft } = require('./timer');
const { getCacheTest, getSessionCache, containsObject, addSession, resetCache } = require('./cache');

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
            const sessionCache = getSessionCache();
            const cacheTest = getCacheTest();
            const foundObj = sessionCache.find(existingObj => parseInt(existingObj.user.ID) === parseInt(session.user.ID));
            if (foundObj && !foundObj.quizCompleted) {
                if (cacheTest.quizInfo.classeDestinataria && session.user.Classe && cacheTest.quizInfo.classeDestinataria === session.user.Classe) {
                    socket.emit("testReceived", cacheTest.quizData, cacheTest.quizInfo.title);
                } else {
                    if (session.user.Cognome && session.user.Nome && session.user.Classe) console.log(session.surname, session.name, session.classe, "accessDenied", "You do not have access to this quiz.");
                }
            }
        }

        socket.on("sendTest", (data, info) => {
            try {
                const sessionCache = getSessionCache();
                sessionCache.forEach(obj => {
                    delete obj.quizCompleted;
                });

                if (!data || !info) {
                    throw new Error("Invalid data or info provided");
                }

                const cacheTest = getCacheTest();
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

        socket.emit("testInfo", getCacheTest().quizInfo);
        socket.emit('sendSessionCache', getSessionCache());

        socket.on("enterInSession", () => {
            if(!session.user || !session.user.ID) {
                console.error("Session user or ID is not defined");
                //socket.emit("error", { message: "Session user or ID is not defined" });
                return;
            }
        
            const cacheTest = getCacheTest();
            if (cacheTest.quizInfo.started && cacheTest.quizInfo.classeDestinataria === session.user.Classe) {
                if (!containsObject(getSessionCache(), session) && session.isAuthenticated) {
                    addSession(session);
                }
                giveTest();
                io.emit('sendSessionCache', getSessionCache());
            }
        });

        socket.on("quizCompleted", () => {
            const sessionCache = getSessionCache();
            const foundObj = sessionCache.find(existingObj => parseInt(existingObj.user.ID) === parseInt(session.user.ID));
            if (foundObj) {
                foundObj.quizCompleted = true;
            }
            io.emit('sendSessionCache', sessionCache);
        });

        socket.on('closeSession', () => {
            //console.log("Closing session...");
            resetCache();
            resetTimer(io);
            io.emit("testReceived", getCacheTest().quizData, getCacheTest().quizInfo.title);
            io.emit("testInfo", getCacheTest().quizInfo);
        });

        socket.on('getSessionCache', () => {
            io.emit('sendSessionCache', getSessionCache());
        });
    });
};
