import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  serverTimestamp,
  collection,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCICTIdyskpbyUkeEyxBEmKUbC4fh1fhA8",
  authDomain: "daily-word-cloud.firebaseapp.com",
  projectId: "daily-word-cloud",
  storageBucket: "daily-word-cloud.firebasestorage.app",
  messagingSenderId: "852550846522",
  appId: "1:852550846522:web:1c9baff2def6fbce968d03"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const submitBtn = document.getElementById("submitBtn");
const wordInput = document.getElementById("wordInput");
const message = document.getElementById("message");
const wordCloud = document.getElementById("wordCloud");
const wordStats = document.getElementById("wordStats");
const answerBox = document.getElementById("answerBox");
const results = document.getElementById("results");
const totalReactions = document.getElementById("totalReactions");
const unlockText = document.getElementById("unlockText");

const today = new Date().toISOString().slice(0, 10);
let hasAnswered = localStorage.getItem(`answered-${today}`) === "true";

if (hasAnswered) {
  answerBox.style.display = "none";
  unlockText.innerText = "Chart unlocked";
  results.style.display = "block";
}

submitBtn.addEventListener("click", async () => {
  const word = wordInput.value.trim().toLowerCase();

  if (!word) {
    message.innerText = "Please enter a word";
    return;
  }

  const wordRef = doc(db, "daily_words", today, "words", word);

  try {
    const wordSnap = await getDoc(wordRef);

    if (wordSnap.exists()) {
      await updateDoc(wordRef, {
        count: increment(1),
        updatedAt: serverTimestamp()
      });
    } else {
      await setDoc(wordRef, {
        word: word,
        count: 1,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }

    localStorage.setItem(`answered-${today}`, "true");
    hasAnswered = true;

    answerBox.style.display = "none";
    message.innerText = "";
    unlockText.innerText = "Chart unlocked";
    results.style.display = "block";
  } catch (error) {
    console.error(error);
    message.innerText = "Error saving word";
  }
});

function randomColor() {
  const colors = ["#e63946", "#457b9d", "#2a9d8f", "#f4a261", "#8338ec", "#ff006e"];
  return colors[Math.floor(Math.random() * colors.length)];
}

const wordsRef = collection(db, "daily_words", today, "words");

onSnapshot(wordsRef, (snapshot) => {
  wordCloud.innerHTML = "";
  wordStats.innerHTML = "";

  const words = [];
  let total = 0;

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    words.push(data);
    total += data.count || 0;
  });

  totalReactions.innerText = `Today people already reacted: ${total}`;

  if (!hasAnswered) {
    return;
  }

  words.sort((a, b) => b.count - a.count);

  words.forEach((data) => {
    const span = document.createElement("span");
    span.className = "word-item";
    span.innerText = data.word;

    const size = 16 + data.count * 8;
    span.style.fontSize = `${size}px`;
    span.style.color = randomColor();

    wordCloud.appendChild(span);

    const row = document.createElement("div");
    row.className = "stat-row";
    row.innerHTML = `
    <span dir="auto">${data.word}</span>: ${data.count}
    `;
    wordStats.appendChild(row);
  });
});
