const ROUNDS_PER_GAME = 10;

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// --- State ---
let rounds = [];      // selected rounds for this game
let currentRound = 0;
let results = [];     // { imageUrl, guess, answer, correct }

// --- DOM refs ---
const startScreen   = $("#start-screen");
const roundScreen   = $("#round-screen");
const resultsScreen = $("#results-screen");
const feedback      = $("#feedback");

const btnPlay       = $("#btn-play");
const btnPlayAgain  = $("#btn-play-again");
const btnGoy        = $("#btn-goy");
const btnJew        = $("#btn-jew");

const roundCounter  = $("#round-counter");
const photoImg      = $("#photo");
const finalScore    = $("#final-score");
const scoreLabel    = $("#score-label");
const resultsList   = $("#results-list");

// --- Helpers ---

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function showScreen(screen) {
  $$(".screen").forEach((s) => s.classList.remove("active"));
  screen.classList.add("active");
}

function showFeedback(correct) {
  feedback.textContent = correct ? "Correct!" : "Wrong!";
  feedback.className = "feedback show " + (correct ? "correct" : "wrong");

  setTimeout(() => {
    feedback.className = "feedback";
    nextRound();
  }, 700);
}

// --- Game logic ---

function startGame() {
  rounds = shuffle(PEOPLE).slice(0, ROUNDS_PER_GAME);
  currentRound = 0;
  results = [];
  showScreen(roundScreen);
  loadRound();
}

function loadRound() {
  const r = rounds[currentRound];
  roundCounter.textContent = `${currentRound + 1} / ${ROUNDS_PER_GAME}`;
  photoImg.src = r.imageUrl;
  btnGoy.disabled = false;
  btnJew.disabled = false;
}

function handleGuess(guess) {
  btnGoy.disabled = true;
  btnJew.disabled = true;

  const r = rounds[currentRound];
  const correct = guess === r.answer;
  results.push({
    imageUrl: r.imageUrl,
    guess,
    answer: r.answer,
    correct,
  });
  showFeedback(correct);
}

function nextRound() {
  currentRound++;
  if (currentRound < ROUNDS_PER_GAME) {
    loadRound();
  } else {
    showResults();
  }
}

function showResults() {
  const score = results.filter((r) => r.correct).length;
  finalScore.textContent = `${score} / ${ROUNDS_PER_GAME}`;
  scoreLabel.textContent = score >= 8 ? "Impressive!" : score >= 5 ? "Not bad!" : "Better luck next time!";

  resultsList.innerHTML = "";
  results.forEach((r, i) => {
    const row = document.createElement("div");
    row.className = "result-row " + (r.correct ? "correct-row" : "wrong-row");
    row.innerHTML = `
      <span class="round-num">${i + 1}</span>
      <img src="${r.imageUrl}" alt="Round ${i + 1}">
      <div class="guess-info">
        <span class="label">You said:</span> ${r.guess}<br>
        <span class="label">Answer:</span> ${r.answer}
      </div>
      <span class="result-icon">${r.correct ? "&#10003;" : "&#10007;"}</span>
    `;
    resultsList.appendChild(row);
  });

  showScreen(resultsScreen);
}

// --- Events ---

btnPlay.addEventListener("click", startGame);
btnPlayAgain.addEventListener("click", startGame);
btnGoy.addEventListener("click", () => handleGuess("Goy"));
btnJew.addEventListener("click", () => handleGuess("Jew"));
