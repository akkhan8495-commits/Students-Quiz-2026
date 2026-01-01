import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, onSnapshot, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// YOUR CONFIGURATION
const firebaseConfig = {
  apiKey: "AIzaSyAfCfO9iIOxj3wNYcFSntqXaY_ESQ5pYOA",
  authDomain: "studentquiz2026.firebaseapp.com",
  projectId: "studentquiz2026",
  storageBucket: "studentquiz2026.firebasestorage.app",
  messagingSenderId: "31091552266",
  appId: "1:31091552266:web:a5b83f22e393a25abeaff3",
  measurementId: "G-NCM00Y177W"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// DOM Elements
const authBox = document.getElementById('auth-box');
const quizBox = document.getElementById('quiz-box');
const userDisplay = document.getElementById('user-display');

// 1. AUTH LOGIC: Manage Student Entry
window.handleSignup = () => {
    const email = document.getElementById('email').value;
    const pass = document.getElementById('password').value;
    createUserWithEmailAndPassword(auth, email, pass).catch(err => alert(err.message));
};

window.handleLogin = () => {
    const email = document.getElementById('email').value;
    const pass = document.getElementById('password').value;
    signInWithEmailAndPassword(auth, email, pass).catch(err => alert(err.message));
};

document.getElementById('signupBtn').onclick = window.handleSignup;
document.getElementById('loginBtn').onclick = window.handleLogin;
document.getElementById('logoutBtn').onclick = () => signOut(auth);

// 2. STATE LOGIC: Check if user is logged in
onAuthStateChanged(auth, (user) => {
    if (user) {
        authBox.style.display = 'none';
        quizBox.style.display = 'block';
        userDisplay.innerText = `Logged in: ${user.email}`;
        listenForQuestions();
    } else {
        authBox.style.display = 'block';
        quizBox.style.display = 'none';
    }
});

// 3. REAL-TIME LOGIC: Update quiz for 500+ students instantly
function listenForQuestions() {
    onSnapshot(doc(db, "quiz", "live"), (doc) => {
        if (doc.exists()) {
            const data = doc.data();
            document.getElementById('q-text').innerText = data.question;
            const optionsGrid = document.getElementById('options-grid');
            optionsGrid.innerHTML = ''; // Clear old buttons
            data.options.forEach(opt => {
                const btn = document.createElement('button');
                btn.innerText = opt;
                btn.onclick = () => submitAnswer(opt);
                optionsGrid.appendChild(btn);
            });
        }
    });
}

async function submitAnswer(choice) {
    const user = auth.currentUser;
    await setDoc(doc(db, "submissions", user.uid), {
        email: user.email,
        answer: choice,
        timestamp: new Date()
    });
    alert("Answer submitted!");
}
