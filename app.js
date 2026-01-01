import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getDatabase, ref, onValue, set, push } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyAfCfO9iIOxj3wNYcFSntqXaY_ESQ5pYOA",
  authDomain: "studentquiz2026.firebaseapp.com",
  projectId: "studentquiz2026",
  storageBucket: "studentquiz2026.firebasestorage.app",
  messagingSenderId: "31091552266",
  appId: "1:31091552266:web:a5b83f22e393a25abeaff3"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// Auth Logic
window.handleLogin = () => {
    const email = document.getElementById('email').value;
    const pass = document.getElementById('password').value;
    signInWithEmailAndPassword(auth, email, pass).catch(err => alert(err.message));
};

window.handleSignup = () => {
    const email = document.getElementById('email').value;
    const pass = document.getElementById('password').value;
    createUserWithEmailAndPassword(auth, email, pass).catch(err => alert(err.message));
};

// UI Logic
onAuthStateChanged(auth, (user) => {
    if (user) {
        document.getElementById('auth-box').style.display = 'none';
        document.getElementById('quiz-box').style.display = 'block';
        listenForQuestions();
    } else {
        document.getElementById('auth-box').style.display = 'block';
        document.getElementById('quiz-box').style.display = 'none';
    }
});

// Real-time Quiz Logic
function listenForQuestions() {
    const quizRef = ref(db, 'liveQuiz');
    onValue(quizRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            document.getElementById('q-text').innerText = data.question;
            const grid = document.getElementById('options-grid');
            grid.innerHTML = '';
            data.options.forEach(opt => {
                const btn = document.createElement('button');
                btn.innerText = opt;
                btn.onclick = () => submitAnswer(opt);
                grid.appendChild(btn);
            });
        }
    });
}

async function submitAnswer(choice) {
    const user = auth.currentUser;
    // Push adds a new entry to a list so 500 answers don't overwrite each other
    const answerRef = ref(db, 'submissions/' + user.uid);
    set(answerRef, {
        email: user.email,
        answer: choice,
        time: new Date().toISOString()
    });
    alert("Answer sent!");
}
