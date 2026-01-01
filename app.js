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

    if (currentIndex >= allQuestions.length) {
        progEl.innerText = "Test Finished!";
        qEl.innerText = "Well Done!";
        optDiv.innerHTML = `
            <div style="text-align: center; background: #e0f2fe; padding: 30px; border-radius: 15px; border: 2px solid #0369a1;">
                <h2 style="color: #0c4a6e; margin-top: 0;">Your Marks</h2>
                <div style="font-size: 64px; font-weight: bold; color: #0284c7;">${score} / ${allQuestions.length}</div>
                <button onclick="location.reload()" style="background: #0284c7; color: white; border: none; padding: 12px 25px; border-radius: 8px; cursor: pointer;">Retake</button>
            </div>
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
