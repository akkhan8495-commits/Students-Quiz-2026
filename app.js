import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

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
        // Listen for the test published by teacher
        onValue(ref(db, 'testSet'), (snapshot) => {
            allQuestions = snapshot.val() || [];
            showQuestion();
        });
    }
});

function showQuestion() {
    const qEl = document.getElementById('question');
    const optDiv = document.getElementById('options');
    const progEl = document.getElementById('q-progress');

    // 1. If no test is published yet
    if (allQuestions.length === 0) {
        qEl.innerText = "The test hasn't started yet. Please wait...";
        return;
    }

    // 2. If the student has finished all questions
    if (currentIndex >= allQuestions.length) {
        const percentage = Math.round((score / allQuestions.length) * 100);
        
        progEl.innerText = "Test Completed";
        qEl.innerText = "Congratulations!";
        
        // Show marks directly on the screen
        optDiv.innerHTML = `
            <div style="text-align: center; padding: 20px; border: 2px solid #2563eb; border-radius: 15px; background: #f0f9ff;">
                <h3 style="margin: 0; color: #1e293b;">Your Final Score</h3>
                <h1 style="font-size: 48px; color: #2563eb; margin: 10px 0;">${score} / ${allQuestions.length}</h1>
                <p style="font-weight: bold; color: #64748b;">Accuracy: ${percentage}%</p>
                <button onclick="location.reload()" style="margin-top: 15px; background: #2563eb; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Retake Test</button>
            </div>
        `;
        return;
    }

    // 3. Show the current question
    const currentQ = allQuestions[currentIndex];
    progEl.innerText = `Question ${currentIndex + 1} of ${allQuestions.length}`;
    qEl.innerText = currentQ.question;
    optDiv.innerHTML = "";

    currentQ.options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.innerText = opt;
        btn.className = "option-btn";
        btn.style.width = "100%"; btn.style.margin = "8px 0"; btn.style.padding = "12px";
        
        btn.onclick = () => {
            // Check if answer is correct and add to score
            if (idx == currentQ.correct) {
                score++;
            }
            
            // Move to the next question immediately
            currentIndex++;
            showQuestion();
        };
        optDiv.appendChild(btn);
    });
}
