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

// 1. Setup the Login Button
document.getElementById('loginBtn').addEventListener('click', () => {
    const email = document.getElementById('email').value;
    const pass = document.getElementById('password').value;
    
    if(!email || !pass) return alert("Please fill all fields");

    signInWithEmailAndPassword(auth, email, pass)
        .then(() => {
            console.log("Login Successful");
        })
        .catch((error) => {
            alert("Login Error: " + error.message);
        });
});

// 2. Setup the Signup Button
document.getElementById('signupBtn').addEventListener('click', () => {
    const email = document.getElementById('email').value;
    const pass = document.getElementById('password').value;

    if(!email || !pass) return alert("Please fill all fields");

    createUserWithEmailAndPassword(auth, email, pass)
        .then(() => {
            console.log("Account Created");
        })
        .catch((error) => {
            alert("Signup Error: " + error.message);
        });
});

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

// Add this at the bottom of app.js
const logoutBtn = document.getElementById('logoutBtn');

if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        signOut(auth).then(() => {
            console.log("User signed out");
            // Your onAuthStateChanged function will automatically 
            // handle hiding the quiz and showing the login box now.
        }).catch((error) => {
            alert("Error logging out: " + error.message);
        });
    });
}
// --- LOGOUT SYSTEM ---
// This makes the function accessible to the HTML button directly
window.handleLogout = () => {
    signOut(auth).then(() => {
        console.log("Logged out successfully");
        window.location.reload(); // Force refresh to show login screen
    }).catch((error) => {
        alert("Logout failed: " + error.message);
    });
};
// --- EMERGENCY LOGOUT OVERRIDE ---
const logoutBtn = document.getElementById('logoutBtn');

if (logoutBtn) {
    logoutBtn.onclick = () => {
        console.log("Forcing logout...");
        
        // 1. Attempt Firebase signout (even if it errors, we move to step 2)
        signOut(auth).catch(() => console.log("Firebase sync failed, forcing local reset."));
        
        // 2. Clear any saved session data
        localStorage.clear();
        sessionStorage.clear();
        
        // 3. FORCE THE PAGE TO RELOAD
        // This will trigger your onAuthStateChanged to show the login box
        window.location.href = window.location.pathname; 
    };
}
