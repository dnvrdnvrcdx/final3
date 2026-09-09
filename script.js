/*
  TIMING / EDITING
  ----------------
  The page follows the reference like a short scrapbook video.
  Change the lyric text below if you have permission to use it.
*/
const lyrics = [
  { time: 2.0, text: "I text a postcard sent to you" },
  { time: 4.0, text: "Did it go through?" },
  { time: 10.0, text: "Sendin' all my love to you" },
  { time: 15.0, text: "You are the moonlight of my life" },
  { time: 20.0, text: "Every night" },
  { time: 25.0, text: "Givin' all my love to you" }
];

// Approximate cuts from the reference video (about 32 seconds).
const timeline = [
  [2, 2.0, "postcardScene"],
  [2.0, 4.0, "sentScene"],
  [4.0, 8.0, "truckScene"],
  [8.0, 16.0, "phoneScene"],
  [16.0, 24.0, "boardScene"],
  [24.0, 31.8, "endingScene"]
];

const start = document.getElementById("start");
const song = document.getElementById("song");
const playPause = document.getElementById("playPause");
const progress = document.querySelector(".progress");
const progressBar = document.getElementById("progressBar");
const lyricsEl = document.getElementById("lyrics");
let started = false;
let lastScene = "postcardScene";

function showScene(id) {
  document.querySelectorAll(".scene").forEach(s => s.classList.toggle("is-active", s.id === id));
  if (id === "truckScene") document.getElementById("truck").classList.remove("drive");
  requestAnimationFrame(() => {
    if (id === "truckScene") document.getElementById("truck").classList.add("drive");
  });
}

function cleanLyrics() {
  return lyrics
    .filter(x => x && Number.isFinite(Number(x.time)) && typeof x.text === "string" && x.text.trim())
    .map(x => ({time:Number(x.time), text:x.text.trim()}))
    .sort((a,b) => a.time-b.time);
}

function renderLyric(t) {
  let active = "";
  for (const line of cleanLyrics()) {
    if (t >= line.time) active = line.text;
    else break;
  }
  lyricsEl.textContent = active;
}

function sceneForTime(t) {
  const found = timeline.find(([a,b]) => t >= a && t < b);
  return found ? found[2] : "endingScene";
}

function update() {
  const t = song.currentTime || 0;
  const d = Number.isFinite(song.duration) ? song.duration : 31.8;
  progressBar.style.width = `${Math.min(100, Math.max(0, (t/d)*100))}%`;
  renderLyric(t);

  const id = sceneForTime(t);
  if (id !== lastScene) {
    lastScene = id;
    showScene(id);
  }
}

async function begin() {
  if (started) return;
  started = true;
  start.classList.add("hide");
  showScene("postcardScene");
  song.currentTime = 0;
  try { await song.play(); } catch (e) { /* browser may require another click */ }
}

start.addEventListener("click", begin);
playPause.addEventListener("click", async () => {
  if (song.paused) {
    try { await song.play(); } catch (e) {}
  } else song.pause();
});

song.addEventListener("play", () => playPause.textContent = "Ⅱ");
song.addEventListener("pause", () => playPause.textContent = "▶");
song.addEventListener("timeupdate", update);
song.addEventListener("loadedmetadata", update);
song.addEventListener("ended", () => {
  playPause.textContent = "▶";
  started = false;
  start.classList.remove("hide");
  start.textContent = "click to play again";
  lastScene = "postcardScene";
  showScene("postcardScene");
});

progress.addEventListener("click", e => {
  if (!Number.isFinite(song.duration)) return;
  const r = progress.getBoundingClientRect();
  song.currentTime = ((e.clientX-r.left)/r.width) * song.duration;
  update();
});

document.addEventListener("keydown", e => {
  if (e.code === "Space") { e.preventDefault(); playPause.click(); }
});

showScene("postcardScene");
