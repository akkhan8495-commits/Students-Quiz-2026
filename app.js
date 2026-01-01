import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getDatabase, ref, get, goOffline } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyAfCfO9iIOxj3wNYcFSntqXaY_ESQ5pYOA",
    authDomain: "studentquiz2026.firebaseapp.com",
    projectId: "studentquiz2026",
    databaseURL: "https://studentquiz2026-default-rtdb.firebaseio.com",
    appId: "1:31091552266:web:a5b83f22e393a25abeaff3"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

let allQuestions = [];
let currentIndex = 0;
let score = 0;

onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.replace("index.html");
    } else {
        document.getElementById('user-email').innerText = user.email;
        
        // --- THE EFFICIENCY TRICK ---
        // We use get() instead of onValue to download ONCE
        get(ref(db, 'testSet')).then((snapshot) => {
            if (snapshot.exists()) {
                allQuestions = snapshot.val();
                
                // DISCONNECT FROM FIREBASE IMMEDIATELY
                // This frees up the connection "slot" for the next student
                goOffline(db); 
                console.log("Disconnected from Firebase. Test loaded locally.");
                
                showQuestion();
            } else {
                document.getElementById('question').innerText = "No test available.";
            }
        }).catch((error) => {
            console.error("Download error:", error);
            alert("Failed to load test. Please refresh.");
        });
    }
});

function showQuestion() {
    const qEl = document.getElementById('question');
    const optDiv = document.getElementById('options');
    const progEl = document.getElementById('q-progress');

    // FINAL MARKS SCREEN
    if (currentIndex >= allQuestions.length) {
        progEl.innerText = "Test Finished!";
        qEl.innerText = "Well Done!";
        
        optDiv.innerHTML = `
            <div style="text-align: center; background: #fffbeb; padding: 30px; border-radius: 15px; border: 3px solid #f59e0b; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                <h2 style="color: #92400e; margin-top: 0;">Your Final Marks</h2>
                <div style="font-size: 64px; font-weight: bold; color: #d97706; margin: 10px 0;">${score} / ${allQuestions.length}</div>
                
                <hr style="border: 0; border-top: 1px solid #fde68a; margin: 20px 0;">
                
                <div style="background: #ef4444; color: white; padding: 15px; border-radius: 8px; animation: pulse 2s infinite;">
                    <strong style="font-size: 18px; display: block; margin-bottom: 5px;">⚠️ IMPORTANT ACTION REQUIRED:</strong>
                    <span style="font-size: 16px;">Please <strong>TAKE A SCREENSHOT</strong> of this screen now. 
                    This is your only proof of completion to show your teacher.</span>
                </div>

                <button onclick="location.reload()" style="margin-top: 20px; background: #d97706; color: white; border: none; padding: 12px 25px; border-radius: 8px; cursor: pointer; font-weight: bold; width: 100%;">
                    Retake Test
                </button>
            </div>

            <style>
                @keyframes pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.02); }
                    100% { transform: scale(1); }
                }
            </style>
        `;
        return;
    }

    const currentQ = allQuestions[currentIndex];
    progEl.innerText = `Question ${currentIndex + 1} of ${allQuestions.length}`;
    qEl.innerText = currentQ.question;
    optDiv.innerHTML = "";

    currentQ.options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.innerText = opt;
        btn.className = "option-btn";
        btn.style.cssText = "width:100%; margin:8px 0; padding:15px; border-radius:10px; border:1px solid #cbd5e1; background:white; cursor:pointer;";
        
        btn.onclick = () => {
            if (idx == currentQ.correct) score++;
            currentIndex++;
            showQuestion();
        };
        optDiv.appendChild(btn);
    });
}
