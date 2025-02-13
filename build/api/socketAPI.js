
// Funzione per condividere la sessione con Socket.io
const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);

let timeLeft = 0;
let timer;

let cacheTest = {
    quizInfo: {
        type: "",
        title: ""
    },
    quizData: []
};

let sessionCashe = [];

//Funzione per controllare se una sessione è già presente nella cache
function containsObject(arr,obj){
    return arr.some(existingObj =>{
       return parseInt(existingObj.userID) === parseInt(obj.userID)
    });
}

module.exports = (io,sessionMiddleware) => {

        io.use(wrap(sessionMiddleware));

    io.on("connection", (socket) => {

        const session = {...socket.request.session};


        // ----------------- TIMER ----------------
        socket.emit("updateTimer", timeLeft);

        socket.on("restoreTimer", () => {
            timer = setInterval(() => {
                if (timeLeft > 0) {
                    timeLeft--;
                    io.emit("updateTimer", timeLeft);
                } else {
                    clearInterval(timer);
                    io.emit("timerFinished",cacheTest.quizInfo.type);
                }
            }, 1000);
        });

        socket.on("startTimer", (data) => {
            if (timer) clearInterval(timer);

            timeLeft = data.minutes * 60 + data.seconds;
            io.emit("updateTimer", timeLeft);

            timer = setInterval(() => {
                if (timeLeft > 0) {
                    timeLeft--;
                    io.emit("updateTimer", timeLeft);
                } else {
                    //Ripristino le informazioni della verifica
                    io.emit('closeSession');
                    // cacheTest = {
                    //     quizInfo: {
                    //         type: "",
                    //         title: ""
                    //     },
                    //     quizData: []
                    // };
                    clearInterval(timer);
                    io.emit("timerFinished");
                }
            }, 1000);
        });

        socket.on("stopTimer", () => {
            clearInterval(timer);
        });

        function resetTimer() {
            clearInterval(timer);
            timeLeft = 0;
            io.emit("updateTimer", timeLeft);
        }

        //------ TIMER END ----------------

        //------ INVIO VERIFICA ----------------

        function giveTest(){
            
            //Se la sessione ha terminato il quiz non puó ripeterlo
            const foundObj = sessionCashe.find(existingObj => parseInt(existingObj.userID) === parseInt(session.userID));
            if (foundObj && !foundObj.quizCompleted) {
                // Controllo se la sessione appartiene alla classe a cui è destinata la verifica
                if (cacheTest.quizInfo.classeDestinataria && session.classe && cacheTest.quizInfo.classeDestinataria === session.classe) {
                    socket.emit("testReceived", cacheTest.quizData, cacheTest.quizInfo.title);
                } else {
                    if(session.userSurname && session.user && session.classe) console.log(session.surname,session.name,session.classe,"accessDenied", "You do not have access to this quiz.");
                }
            }
    }

        socket.on("sendTest", (data, info) => {
            try {
                // Ripristinare lo stato quizCompleted all'invio di un nuovo Test
                sessionCashe.forEach(obj => {
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
        socket.emit('sendSessionCache',sessionCashe);     

        socket.on("enterInSession", () => {
            if (cacheTest.quizInfo.started && cacheTest.quizInfo.classeDestinataria === session.classe) {
                if (!containsObject(sessionCashe, session) && session.isAuthenticated) {
                    sessionCashe.push(session);
                }
                giveTest();
                io.emit('sendSessionCache', sessionCashe);
            }
        });

                    

        socket.on("quizCompleted",()=>{
            const foundObj = sessionCashe.find(existingObj => parseInt(existingObj.userID) === parseInt(session.userID));
            if(foundObj){
                foundObj.quizCompleted = true;
            }
            io.emit('sendSessionCache',sessionCashe);
            
        });

        //Endpoint per chiudere l'intera sessione del quiz/test
        socket.on('closeSession',()=>{
            //Pulisco le cache
            cacheTest = {
                quizInfo: {type: "",title: ""},
                quizData: []
            };

            sessionCashe = [];

            resetTimer();
            io.emit("testReceived",cacheTest.quizData,cacheTest.quizInfo.title);
            io.emit("testInfo",cacheTest.quizInfo);
        });

        socket.on('getSessionCache',()=>{
            io.emit('sendSessionCache',sessionCashe);
        });
    });
};
