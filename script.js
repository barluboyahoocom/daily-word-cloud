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

const today = new Date().toISOString().slice(0, 10);

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

    message.innerText = `Saved: ${word}`;
    wordInput.value = "";
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

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();

    const span = document.createElement("span");
    span.className = "word-item";
    span.innerText = data.word;

    const size = 16 + data.count * 8;
    span.style.fontSize = `${size}px`;
    span.style.color = randomColor();

    wordCloud.appendChild(span);
  });
});
