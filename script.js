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

const today = new Date().toISOString().slice(0, 10);

let currentLanguage = localStorage.getItem("language") || "en";
let hasAnswered = localStorage.getItem(`answered-${today}`) === "true";

let currentQuestionHe = "";
let currentQuestionEn = "";

const submitBtn = document.getElementById("submitBtn");
const wordInput = document.getElementById("wordInput");
const message = document.getElementById("message");
const wordCloud = document.getElementById("wordCloud");
const wordStats = document.getElementById("wordStats");
const answerBox = document.getElementById("answerBox");
const results = document.getElementById("results");
const totalReactions = document.getElementById("totalReactions");
const unlockText = document.getElementById("unlockText");
const langEn = document.getElementById("langEn");
const langHe = document.getElementById("langHe");
const mainTitle = document.getElementById("mainTitle");
const questionTitle = document.getElementById("questionTitle");
const dailyTopicLabel = document.getElementById("dailyTopicLabel");

function setUnlockState() {
  if (hasAnswered) {
    answerBox.style.display = "none";
    results.style.display = "block";
  } else {
    answerBox.style.display = "block";
    results.style.display = "none";
  }
}

function applyLanguage(total = null) {
  questionTitle.innerText =
    currentLanguage === "he" ? currentQuestionHe : currentQuestionEn;

  if (currentLanguage === "he") {
    document.documentElement.lang = "he";
    document.body.dir = "rtl";

    mainTitle.innerText = "ענן מילים יומי";
    dailyTopicLabel.innerText = "הנושא היומי: ";
    unlockText.innerText = hasAnswered ? "התרשים נפתח" : "תגיב כדי לפתוח את התרשים";
    wordInput.placeholder = "כתוב את המחשבה הראשונה שלך...";
    submitBtn.innerText = "שלח";
    message.innerText = "";

    if (total !== null) {
      totalReactions.innerText = `היום הגיבו כבר: ${total} אנשים`;
    }
  } else {
    document.documentElement.lang = "en";
    document.body.dir = "ltr";

    mainTitle.innerText = "Daily Word Cloud";
    dailyTopicLabel.innerText = "Today's Topic: ";
    unlockText.innerText = hasAnswered ? "Chart unlocked" : "React to unlock the chart";
    wordInput.placeholder = "Enter your first thought...";
    submitBtn.innerText = "Submit";
    message.innerText = "";

    if (total !== null) {
      totalReactions.innerText = `Today people already reacted: ${total}`;
    }
  }
}

async function loadQuestion() {
  const questionRef = doc(db, "daily_questions", today);
  const questionSnap = await getDoc(questionRef);

  if (questionSnap.exists()) {
    const data = questionSnap.data();
    currentQuestionHe = data.question_he;
    currentQuestionEn = data.question_en;
  } else {
    currentQuestionHe = "לא הוגדרה שאלה";
    currentQuestionEn = "No question defined";
  }

  applyLanguage();
}

langEn.addEventListener("click", () => {
  currentLanguage = "en";
  localStorage.setItem("language", "en");
  applyLanguage();
});

langHe.addEventListener("click", () => {
  currentLanguage = "he";
  localStorage.setItem("language", "he");
  applyLanguage();
});

submitBtn.addEventListener("click", async () => {
  const word = wordInput.value.trim().toLowerCase();

  if (!word) {
    message.innerText = currentLanguage === "he" ? "נא לכתוב מילה" : "Please enter a word";
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

    wordInput.value = "";
    setUnlockState();
    applyLanguage();
  } catch (error) {
    console.error(error);
    message.innerText = currentLanguage === "he" ? "שגיאה בשמירת המילה" : "Error saving word";
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

  applyLanguage(total);

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
      <span class="word-name" dir="auto">${data.word}</span>
      <span class="word-count">${data.count}</span>
    `;

    wordStats.appendChild(row);
  });
});

setUnlockState();
loadQuestion();
