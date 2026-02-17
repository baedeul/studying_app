const timerDisplay = document.querySelector('#timer-display');
const totalDisplay = document.querySelector('#total-display');
const sessionList = document.querySelector('#session-list');
const startBtn = document.querySelector('#start-btn');
const pauseBtn = document.querySelector('#pause-btn');
const resetBtn = document.querySelector('#reset-btn');

const STORAGE_KEY = 'study-timer-history-v1';

let timerId = null;
let startTimestamp = null;
let elapsedSeconds = 0;

const appState = {
  totalSeconds: 0,
  sessions: [],
};

function formatTime(totalSeconds) {
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;

  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed.totalSeconds === 'number' && Array.isArray(parsed.sessions)) {
      appState.totalSeconds = parsed.totalSeconds;
      appState.sessions = parsed.sessions;
    }
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
}

function renderSessions() {
  sessionList.innerHTML = '';
  if (appState.sessions.length === 0) {
    const emptyItem = document.createElement('li');
    emptyItem.className = 'empty';
    emptyItem.textContent = '아직 기록된 학습 세션이 없습니다.';
    sessionList.append(emptyItem);
    return;
  }

  appState.sessions.slice().reverse().forEach((session, index) => {
    const item = document.createElement('li');
    item.textContent = `${appState.sessions.length - index}회차 · ${session.date} · ${session.duration}`;
    sessionList.append(item);
  });
}

function render() {
  timerDisplay.textContent = formatTime(elapsedSeconds);
  totalDisplay.textContent = formatTime(appState.totalSeconds);
  renderSessions();
}

function tick() {
  const now = Date.now();
  elapsedSeconds = Math.floor((now - startTimestamp) / 1000);
  timerDisplay.textContent = formatTime(elapsedSeconds);
}

function startTimer() {
  if (timerId) return;

  startTimestamp = Date.now() - elapsedSeconds * 1000;
  timerId = window.setInterval(tick, 250);

  startBtn.disabled = true;
  pauseBtn.disabled = false;
}

function pauseTimer() {
  if (!timerId) return;

  window.clearInterval(timerId);
  timerId = null;
  tick();

  if (elapsedSeconds > 0) {
    appState.totalSeconds += elapsedSeconds;
    appState.sessions.push({
      date: new Date().toLocaleString('ko-KR'),
      duration: formatTime(elapsedSeconds),
    });
    saveState();
  }

  elapsedSeconds = 0;
  startBtn.disabled = false;
  pauseBtn.disabled = true;
  render();
}

function resetAll() {
  if (timerId) {
    window.clearInterval(timerId);
    timerId = null;
  }

  startTimestamp = null;
  elapsedSeconds = 0;
  appState.totalSeconds = 0;
  appState.sessions = [];
  saveState();

  startBtn.disabled = false;
  pauseBtn.disabled = true;
  render();
}

startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetAll);

loadState();
render();
