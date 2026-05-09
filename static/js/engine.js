// ── State ────────────────────────────────────────────────────────
const SPEEDS = [800, 500, 300, 150, 60];
let currentAlgo = 'bubble';
let steps = [];
let currentStep = 0;
let playTimer = null;
let speedIdx = 2;

const COMPLEXITY = {
  bubble:    { time: 'O(n²)', space: 'O(1)', best: 'O(n) with flag' },
  selection: { time: 'O(n²)', space: 'O(1)', best: 'O(n²)' },
  insertion: { time: 'O(n²)', space: 'O(1)', best: 'O(n)' },
};

// ── Array helpers ─────────────────────────────────────────────────
function getArray() {
  const raw = document.getElementById('arr-input').value;
  return raw.split(',')
    .map(s => parseInt(s.trim()))
    .filter(n => !isNaN(n) && n > 0)
    .slice(0, 14);
}

function randomArray() {
  const n = 8 + Math.floor(Math.random() * 4);
  const arr = Array.from({ length: n }, () => 5 + Math.floor(Math.random() * 90));
  document.getElementById('arr-input').value = arr.join(', ');
  buildSteps();
}

// ── Algorithm step generators ─────────────────────────────────────

function genBubble(arr) {
  const steps = [];
  const a = [...arr];
  const n = a.length;
  const sorted = [];
  let cmps = 0, swps = 0;

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      cmps++;
      steps.push({
        arr: [...a], comparing: [j, j + 1], swapping: null,
        sorted: [...sorted], selected: null, pivot: null,
        desc: `Comparing a[${j}] = ${a[j]}  vs  a[${j+1}] = ${a[j+1]}`,
        cmps, swps
      });
      if (a[j] > a[j + 1]) {
        swps++;
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        steps.push({
          arr: [...a], comparing: null, swapping: [j, j + 1],
          sorted: [...sorted], selected: null, pivot: null,
          desc: `Swap → a[${j}] = ${a[j]},  a[${j+1}] = ${a[j+1]}`,
          cmps, swps
        });
      }
    }
    sorted.unshift(n - 1 - i);
    steps.push({
      arr: [...a], comparing: null, swapping: null,
      sorted: [...sorted], selected: null, pivot: null,
      desc: `Pass ${i + 1} done — ${a[n-1-i]} is in its final position`,
      cmps, swps
    });
  }
  sorted.unshift(0);
  steps.push({
    arr: [...a], comparing: null, swapping: null,
    sorted: [...sorted], selected: null, pivot: null,
    desc: `Sorted! ${cmps} comparisons, ${swps} swaps total.`,
    cmps, swps
  });
  return steps;
}

function genSelection(arr) {
  const steps = [];
  const a = [...arr];
  const n = a.length;
  const sorted = [];
  let cmps = 0, swps = 0;

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    steps.push({
      arr: [...a], comparing: null, swapping: null,
      sorted: [...sorted], selected: minIdx, pivot: null,
      desc: `Pass ${i + 1}: scanning for minimum starting at index ${i}`,
      cmps, swps
    });
    for (let j = i + 1; j < n; j++) {
      cmps++;
      steps.push({
        arr: [...a], comparing: [j, minIdx], swapping: null,
        sorted: [...sorted], selected: minIdx, pivot: null,
        desc: `Is a[${j}] = ${a[j]}  <  current min a[${minIdx}] = ${a[minIdx]}?`,
        cmps, swps
      });
      if (a[j] < a[minIdx]) {
        minIdx = j;
        steps.push({
          arr: [...a], comparing: null, swapping: null,
          sorted: [...sorted], selected: minIdx, pivot: null,
          desc: `New minimum found: a[${minIdx}] = ${a[minIdx]}`,
          cmps, swps
        });
      }
    }
    if (minIdx !== i) {
      swps++;
      [a[i], a[minIdx]] = [a[minIdx], a[i]];
      steps.push({
        arr: [...a], comparing: null, swapping: [i, minIdx],
        sorted: [...sorted], selected: null, pivot: null,
        desc: `Swap a[${i}] and a[${minIdx}]`,
        cmps, swps
      });
    }
    sorted.push(i);
    steps.push({
      arr: [...a], comparing: null, swapping: null,
      sorted: [...sorted], selected: null, pivot: null,
      desc: `${a[i]} placed at index ${i} — final position`,
      cmps, swps
    });
  }
  sorted.push(n - 1);
  steps.push({
    arr: [...a], comparing: null, swapping: null,
    sorted: [...sorted], selected: null, pivot: null,
    desc: `Sorted! ${cmps} comparisons, ${swps} swaps total.`,
    cmps, swps
  });
  return steps;
}

function genInsertion(arr) {
  const steps = [];
  const a = [...arr];
  const n = a.length;
  let cmps = 0, swps = 0;

  steps.push({
    arr: [...a], comparing: null, swapping: null,
    sorted: [0], selected: null, pivot: null,
    desc: `a[0] = ${a[0]} — single element, trivially sorted`,
    cmps, swps
  });

  for (let i = 1; i < n; i++) {
    const key = a[i];
    steps.push({
      arr: [...a], comparing: null, swapping: null,
      sorted: Array.from({ length: i }, (_, k) => k),
      selected: null, pivot: i,
      desc: `Pick key = a[${i}] = ${key} — insert into sorted portion`,
      cmps, swps
    });
    let j = i - 1;
    while (j >= 0 && a[j] > key) {
      cmps++;
      steps.push({
        arr: [...a], comparing: [j, j + 1], swapping: null,
        sorted: Array.from({ length: i }, (_, k) => k),
        selected: null, pivot: j + 1,
        desc: `a[${j}] = ${a[j]}  >  key ${key} — shift right`,
        cmps, swps
      });
      swps++;
      a[j + 1] = a[j];
      a[j] = key;
      steps.push({
        arr: [...a], comparing: null, swapping: [j, j + 1],
        sorted: Array.from({ length: i }, (_, k) => k),
        selected: null, pivot: j,
        desc: `Shift: a[${j + 1}] ← ${a[j + 1]}`,
        cmps, swps
      });
      j--;
    }
    if (j >= 0) cmps++;
    const newSorted = Array.from({ length: i + 1 }, (_, k) => k);
    steps.push({
      arr: [...a], comparing: null, swapping: null,
      sorted: newSorted, selected: null, pivot: null,
      desc: `key ${key} inserted at index ${j + 1}`,
      cmps, swps
    });
  }
  steps.push({
    arr: [...a], comparing: null, swapping: null,
    sorted: Array.from({ length: n }, (_, k) => k),
    selected: null, pivot: null,
    desc: `Sorted! ${cmps} comparisons, ${swps} swaps total.`,
    cmps, swps
  });
  return steps;
}

// ── Build & render ────────────────────────────────────────────────

function buildSteps() {
  stopPlay();
  const arr = getArray();
  if (arr.length === 0) return;
  if      (currentAlgo === 'bubble')    steps = genBubble(arr);
  else if (currentAlgo === 'selection') steps = genSelection(arr);
  else                                  steps = genInsertion(arr);
  currentStep = 0;
  renderStep(0);
}

function renderStep(idx) {
  if (!steps.length) return;
  const s = steps[idx];
  const container = document.getElementById('bars-container');
  const maxVal = Math.max(...s.arr);
  const MAX_H = 160;

  container.innerHTML = s.arr.map((val, i) => {
    let cls = 'default';
    if (s.sorted   && s.sorted.includes(i))   cls = 'sorted';
    if (s.selected === i)                      cls = 'selected';
    if (s.pivot    === i)                      cls = 'pivot';
    if (s.comparing && s.comparing.includes(i)) cls = 'comparing';
    if (s.swapping  && s.swapping.includes(i))  cls = 'swapping';

    const h = Math.max(14, Math.round((val / maxVal) * MAX_H));
    const ptr = getPointerLabel(s, i);

    return `<div class="bar-col">
      <div class="bar ${cls}" style="height:${h}px"></div>
      <div class="bar-val">${val}</div>
      <div class="bar-ptr">${ptr}</div>
    </div>`;
  }).join('');

  document.getElementById('step-badge').textContent =
    `step ${idx} / ${steps.length - 1}`;
  document.getElementById('step-desc').textContent = s.desc;
  document.getElementById('step-stats').textContent =
    `cmps: ${s.cmps}   swaps: ${s.swps}`;

  document.getElementById('btn-back').disabled = idx === 0;
  document.getElementById('btn-fwd').disabled  = idx === steps.length - 1;
}

function getPointerLabel(s, i) {
  if (s.comparing && s.comparing[0] === i) return 'i';
  if (s.comparing && s.comparing[1] === i) return 'j';
  if (s.swapping  && s.swapping[0]  === i) return 'i↔';
  if (s.swapping  && s.swapping[1]  === i) return '↔j';
  if (s.selected === i)                    return 'min';
  if (s.pivot    === i)                    return 'key';
  return '';
}

// ── Playback controls ─────────────────────────────────────────────

function stepForward() {
  if (currentStep < steps.length - 1) { currentStep++; renderStep(currentStep); }
  else stopPlay();
}

function stepBack() {
  if (currentStep > 0) { currentStep--; renderStep(currentStep); }
}

function togglePlay() {
  if (playTimer) stopPlay();
  else startPlay();
}

function startPlay() {
  if (currentStep >= steps.length - 1) currentStep = 0;
  document.getElementById('play-icon').className = 'ti ti-player-pause';
  playTimer = setInterval(() => {
    if (currentStep < steps.length - 1) {
      currentStep++;
      renderStep(currentStep);
    } else {
      stopPlay();
    }
  }, SPEEDS[speedIdx]);
}

function stopPlay() {
  clearInterval(playTimer);
  playTimer = null;
  const icon = document.getElementById('play-icon');
  if (icon) icon.className = 'ti ti-player-play';
}

function resetVis() {
  stopPlay();
  currentStep = 0;
  buildSteps();
}

function setAlgo(name) {
  currentAlgo = name;
  document.querySelectorAll('.algo-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.algo === name);
  });
  const c = COMPLEXITY[name];
  document.getElementById('complexity-time').textContent = `Time: ${c.time}`;
  document.getElementById('complexity-space').textContent = `Space: ${c.space}`;
  buildSteps();
}

function updateSpeed(v) {
  speedIdx = parseInt(v) - 1;
  document.getElementById('speed-label').textContent = `×${v}`;
  if (playTimer) { stopPlay(); startPlay(); }
}

// ── Init ──────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', buildSteps);
// ── Phase 2: Gemini integration ───────────────────────────────────

async function runGemini() {
  const code   = document.getElementById('user-code').value.trim();
  const input  = document.getElementById('gemini-input').value.trim();
  const status = document.getElementById('gemini-status');
  const btn    = document.getElementById('gemini-btn');

  if (!code)  { status.textContent = 'Please paste your code first.'; return; }
  if (!input) { status.textContent = 'Please enter a test input array.'; return; }

  // loading state
  btn.disabled     = true;
  btn.textContent  = 'Parsing with Gemini...';
  status.textContent = 'Sending to Gemini — this takes 3-5 seconds...';
  status.style.color = 'var(--amber)';

  try {
    const res = await fetch('/api/trace', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, input })
    });

    const data = await res.json();

    if (data.error) {
      status.textContent = 'Error: ' + data.error;
      status.style.color = 'var(--coral)';
      return;
    }

    // load Gemini steps into the visualizer
    steps        = data.steps;
    currentStep  = 0;

    // update array input to reflect what Gemini parsed
    if (steps.length > 0) {
      document.getElementById('arr-input').value = steps[0].arr.join(', ');
    }

    stopPlay();
    renderStep(0);

    status.textContent = `Gemini generated ${steps.length} steps. Use the controls above to step through.`;
    status.style.color = 'var(--green)';

  } catch (err) {
    status.textContent = 'Network error: ' + err.message;
    status.style.color = 'var(--coral)';
  } finally {
    btn.disabled    = false;
    btn.textContent = 'Visualize My Code';
  }
}