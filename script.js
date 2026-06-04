import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";

const firebaseConfig = {
  apiKey: "AIzaSyCICTIdyskpbyUkeEyxBEmKUbC4fh1fhA8",
  authDomain: "daily-word-cloud.firebaseapp.com",
  projectId: "daily-word-cloud",
  storageBucket: "daily-word-cloud.firebasestorage.app",
  messagingSenderId: "852550846522",
  appId: "1:852550846522:web:1c9baff2def6fbce968d03"
};

const app = initializeApp(firebaseConfig);

console.log("Firebase Connected!");
