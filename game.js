const ROUNDS_PER_GAME = 10;

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// --- State ---
let rounds = [];
let currentRound = 0;
let results = [];

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
const photoLoader   = $("#photo-loader");
const personName    = $("#person-name");
const finalScore    = $("#final-score");
const scoreLabel    = $("#score-label");
const resultsList   = $("#results-list");

// --- Wikipedia image cache ---
const imageCache = {};

async function fetchWikiImage(name) {
  if (imageCache[name]) return imageCache[name];

  // Clean name for Wikipedia lookup (remove parenthetical disambiguation)
  const wikiTitle = name.replace(/ \(.*\)$/, "");
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikiTitle)}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Not found");
    const data = await res.json();
    const imgUrl = data.thumbnail?.source || null;
    if (imgUrl) imageCache[name] = imgUrl;
    return imgUrl;
  } catch {
    return null;
  }
}

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

async function loadRound() {
  const r = rounds[currentRound];
  roundCounter.textContent = `${currentRound + 1} / ${ROUNDS_PER_GAME}`;

  // Reset UI
  btnGoy.disabled = true;
  btnJew.disabled = true;
  personName.textContent = "";
  personName.classList.remove("visible");
  photoImg.classList.remove("visible");
  photoLoader.classList.add("visible");

  // Fetch image
  const imgUrl = await fetchWikiImage(r.name);
  photoImg.src = imgUrl || "";
  photoImg.alt = r.name;

  if (imgUrl) {
    photoImg.onload = () => {
      photoLoader.classList.remove("visible");
      photoImg.classList.add("visible");
      btnGoy.disabled = false;
      btnJew.disabled = false;
    };
    photoImg.onerror = () => {
      photoLoader.classList.remove("visible");
      photoImg.classList.add("visible");
      btnGoy.disabled = false;
      btnJew.disabled = false;
    };
  } else {
    // No image found — skip this person, try next
    rounds.splice(currentRound, 1, shuffle(PEOPLE.filter(p => !rounds.includes(p)))[0] || rounds[currentRound]);
    photoLoader.classList.remove("visible");
    photoImg.classList.add("visible");
    btnGoy.disabled = false;
    btnJew.disabled = false;
  }

  // Preload next round image
  if (currentRound + 1 < ROUNDS_PER_GAME) {
    fetchWikiImage(rounds[currentRound + 1].name);
  }
}

function handleGuess(guess) {
  btnGoy.disabled = true;
  btnJew.disabled = true;

  const r = rounds[currentRound];
  const correct = guess === r.answer;
  results.push({
    name: r.name,
    guess,
    answer: r.answer,
    correct,
    imageUrl: photoImg.src,
  });

  // Show name
  personName.textContent = r.name;
  personName.classList.add("visible");

  setTimeout(() => showFeedback(correct), 600);
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
  scoreLabel.textContent =
    score >= 8 ? "Impressive!" : score >= 5 ? "Not bad!" : "Better luck next time!";

  resultsList.innerHTML = "";
  results.forEach((r, i) => {
    const row = document.createElement("div");
    row.className = "result-row " + (r.correct ? "correct-row" : "wrong-row");
    row.innerHTML = `
      <span class="round-num">${i + 1}</span>
      <img src="${r.imageUrl}" alt="${r.name}">
      <div class="guess-info">
        <strong>${r.name}</strong><br>
        <span class="label">You said:</span> ${r.guess}
        <span class="label">| Answer:</span> ${r.answer}
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
