// ── State ─────────────────────────────────────────────────────────
const SPEEDS = [800, 500, 300, 150, 60];
let currentAlgo = 'bubble';
let steps = [];
let currentStep = 0;
let playTimer = null;
let speedIdx = 2;

const COMPLEXITY = {
  bubble:    { time: 'O(n²)',      space: 'O(1)' },
  selection: { time: 'O(n²)',      space: 'O(1)' },
  insertion: { time: 'O(n²)',      space: 'O(1)' },
  quick:     { time: 'O(n log n)', space: 'O(log n)' },
  merge:     { time: 'O(n log n)', space: 'O(n)' },
  binary:    { time: 'O(log n)',   space: 'O(1)' },
  two:       { time: 'O(n)',       space: 'O(1)' },
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
  const algo = currentAlgo;
  let arr;
  if (algo === 'binary') {
    // binary search needs sorted array
    const n = 8 + Math.floor(Math.random() * 4);
    arr = Array.from({ length: n }, (_, i) => (i + 1) * (3 + Math.floor(Math.random() * 5)));
  } else if (algo === 'two') {
    // two pointers needs sorted array
    const n = 8 + Math.floor(Math.random() * 4);
    arr = Array.from({ length: n }, (_, i) => (i + 1) * 2 + Math.floor(Math.random() * 4));
  } else {
    const n = 8 + Math.floor(Math.random() * 4);
    arr = Array.from({ length: n }, () => 5 + Math.floor(Math.random() * 90));
  }
  document.getElementById('arr-input').value = arr.join(', ');
  buildSteps();
}

// ── Bubble Sort ───────────────────────────────────────────────────
function genBubble(arr) {
  const steps = [];
  const a = [...arr];
  const n = a.length;
  const sorted = [];
  let cmps = 0, swps = 0;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      cmps++;
      steps.push({ arr: [...a], comparing: [j, j+1], swapping: null, sorted: [...sorted], selected: null, pivot: null, left: null, right: null, target: null, desc: `Compare a[${j}]=${a[j]} vs a[${j+1}]=${a[j+1]}`, cmps, swps });
      if (a[j] > a[j+1]) {
        swps++;
        [a[j], a[j+1]] = [a[j+1], a[j]];
        steps.push({ arr: [...a], comparing: null, swapping: [j, j+1], sorted: [...sorted], selected: null, pivot: null, left: null, right: null, target: null, desc: `Swap → a[${j}]=${a[j]}, a[${j+1}]=${a[j+1]}`, cmps, swps });
      }
    }
    sorted.unshift(n - 1 - i);
    steps.push({ arr: [...a], comparing: null, swapping: null, sorted: [...sorted], selected: null, pivot: null, left: null, right: null, target: null, desc: `Pass ${i+1} done — ${a[n-1-i]} in final position`, cmps, swps });
  }
  sorted.unshift(0);
  steps.push({ arr: [...a], comparing: null, swapping: null, sorted: [...sorted], selected: null, pivot: null, left: null, right: null, target: null, desc: `Sorted! ${cmps} comparisons, ${swps} swaps.`, cmps, swps });
  return steps;
}

// ── Selection Sort ────────────────────────────────────────────────
function genSelection(arr) {
  const steps = [];
  const a = [...arr];
  const n = a.length;
  const sorted = [];
  let cmps = 0, swps = 0;
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    steps.push({ arr: [...a], comparing: null, swapping: null, sorted: [...sorted], selected: minIdx, pivot: null, left: null, right: null, target: null, desc: `Pass ${i+1}: scanning for minimum from index ${i}`, cmps, swps });
    for (let j = i + 1; j < n; j++) {
      cmps++;
      steps.push({ arr: [...a], comparing: [j, minIdx], swapping: null, sorted: [...sorted], selected: minIdx, pivot: null, left: null, right: null, target: null, desc: `Is a[${j}]=${a[j]} < current min a[${minIdx}]=${a[minIdx]}?`, cmps, swps });
      if (a[j] < a[minIdx]) {
        minIdx = j;
        steps.push({ arr: [...a], comparing: null, swapping: null, sorted: [...sorted], selected: minIdx, pivot: null, left: null, right: null, target: null, desc: `New minimum: a[${minIdx}]=${a[minIdx]}`, cmps, swps });
      }
    }
    if (minIdx !== i) {
      swps++;
      [a[i], a[minIdx]] = [a[minIdx], a[i]];
      steps.push({ arr: [...a], comparing: null, swapping: [i, minIdx], sorted: [...sorted], selected: null, pivot: null, left: null, right: null, target: null, desc: `Swap a[${i}] and a[${minIdx}]`, cmps, swps });
    }
    sorted.push(i);
    steps.push({ arr: [...a], comparing: null, swapping: null, sorted: [...sorted], selected: null, pivot: null, left: null, right: null, target: null, desc: `${a[i]} placed at index ${i}`, cmps, swps });
  }
  sorted.push(n - 1);
  steps.push({ arr: [...a], comparing: null, swapping: null, sorted: [...sorted], selected: null, pivot: null, left: null, right: null, target: null, desc: `Sorted! ${cmps} comparisons, ${swps} swaps.`, cmps, swps });
  return steps;
}

// ── Insertion Sort ────────────────────────────────────────────────
function genInsertion(arr) {
  const steps = [];
  const a = [...arr];
  const n = a.length;
  let cmps = 0, swps = 0;
  steps.push({ arr: [...a], comparing: null, swapping: null, sorted: [0], selected: null, pivot: null, left: null, right: null, target: null, desc: `a[0]=${a[0]} trivially sorted`, cmps, swps });
  for (let i = 1; i < n; i++) {
    const key = a[i];
    steps.push({ arr: [...a], comparing: null, swapping: null, sorted: Array.from({length:i},(_,k)=>k), selected: null, pivot: i, left: null, right: null, target: null, desc: `Pick key = a[${i}] = ${key}`, cmps, swps });
    let j = i - 1;
    while (j >= 0 && a[j] > key) {
      cmps++;
      steps.push({ arr: [...a], comparing: [j, j+1], swapping: null, sorted: Array.from({length:i},(_,k)=>k), selected: null, pivot: j+1, left: null, right: null, target: null, desc: `a[${j}]=${a[j]} > key ${key}, shift right`, cmps, swps });
      swps++;
      a[j+1] = a[j]; a[j] = key;
      steps.push({ arr: [...a], comparing: null, swapping: [j, j+1], sorted: Array.from({length:i},(_,k)=>k), selected: null, pivot: j, left: null, right: null, target: null, desc: `Shift a[${j+1}] ← ${a[j+1]}`, cmps, swps });
      j--;
    }
    if (j >= 0) cmps++;
    steps.push({ arr: [...a], comparing: null, swapping: null, sorted: Array.from({length:i+1},(_,k)=>k), selected: null, pivot: null, left: null, right: null, target: null, desc: `${key} inserted at index ${j+1}`, cmps, swps });
  }
  steps.push({ arr: [...a], comparing: null, swapping: null, sorted: Array.from({length:n},(_,k)=>k), selected: null, pivot: null, left: null, right: null, target: null, desc: `Sorted! ${cmps} comparisons, ${swps} swaps.`, cmps, swps });
  return steps;
}

// ── Quick Sort ────────────────────────────────────────────────────
function genQuick(arr) {
  const steps = [];
  const a = [...arr];
  let cmps = 0, swps = 0;
  const sorted = new Set();

  function partition(low, high) {
    const pivotVal = a[high];
    steps.push({ arr: [...a], comparing: null, swapping: null, sorted: [...sorted], selected: null, pivot: high, left: low, right: high-1, target: null, desc: `Pivot = a[${high}] = ${pivotVal}, partition [${low}..${high}]`, cmps, swps });
    let i = low - 1;
    for (let j = low; j < high; j++) {
      cmps++;
      steps.push({ arr: [...a], comparing: [j, high], swapping: null, sorted: [...sorted], selected: null, pivot: high, left: i+1, right: j, target: null, desc: `Compare a[${j}]=${a[j]} with pivot ${pivotVal}`, cmps, swps });
      if (a[j] <= pivotVal) {
        i++;
        if (i !== j) {
          swps++;
          [a[i], a[j]] = [a[j], a[i]];
          steps.push({ arr: [...a], comparing: null, swapping: [i, j], sorted: [...sorted], selected: null, pivot: high, left: null, right: null, target: null, desc: `a[${j}]=${a[j+1]} ≤ pivot, swap with a[${i}]`, cmps, swps });
        }
      }
    }
    swps++;
    [a[i+1], a[high]] = [a[high], a[i+1]];
    sorted.add(i+1);
    steps.push({ arr: [...a], comparing: null, swapping: [i+1, high], sorted: [...sorted], selected: null, pivot: null, left: null, right: null, target: null, desc: `Place pivot at index ${i+1}`, cmps, swps });
    return i + 1;
  }

  function quickSort(low, high) {
    if (low < high) {
      const pi = partition(low, high);
      quickSort(low, pi - 1);
      quickSort(pi + 1, high);
    } else if (low === high) {
      sorted.add(low);
    }
  }

  quickSort(0, a.length - 1);
  steps.push({ arr: [...a], comparing: null, swapping: null, sorted: Array.from({length:a.length},(_,k)=>k), selected: null, pivot: null, left: null, right: null, target: null, desc: `Sorted! ${cmps} comparisons, ${swps} swaps.`, cmps, swps });
  return steps;
}

// ── Merge Sort ────────────────────────────────────────────────────
function genMerge(arr) {
  const steps = [];
  const a = [...arr];
  let cmps = 0, swps = 0;

  function merge(left, mid, right) {
    const L = a.slice(left, mid + 1);
    const R = a.slice(mid + 1, right + 1);
    let i = 0, j = 0, k = left;
    steps.push({ arr: [...a], comparing: null, swapping: null, sorted: [], selected: null, pivot: null, left, right, target: mid, desc: `Merge [${left}..${mid}] and [${mid+1}..${right}]`, cmps, swps });
    while (i < L.length && j < R.length) {
      cmps++;
      steps.push({ arr: [...a], comparing: [left+i, mid+1+j], swapping: null, sorted: [], selected: null, pivot: null, left, right, target: null, desc: `Compare ${L[i]} vs ${R[j]}`, cmps, swps });
      if (L[i] <= R[j]) { a[k++] = L[i++]; }
      else               { a[k++] = R[j++]; }
      swps++;
      steps.push({ arr: [...a], comparing: null, swapping: null, sorted: [], selected: null, pivot: null, left, right, target: null, desc: `Place ${a[k-1]} at index ${k-1}`, cmps, swps });
    }
    while (i < L.length) { a[k++] = L[i++]; swps++; steps.push({ arr: [...a], comparing: null, swapping: null, sorted: [], selected: null, pivot: null, left, right, target: null, desc: `Copy remaining left: ${a[k-1]}`, cmps, swps }); }
    while (j < R.length) { a[k++] = R[j++]; swps++; steps.push({ arr: [...a], comparing: null, swapping: null, sorted: [], selected: null, pivot: null, left, right, target: null, desc: `Copy remaining right: ${a[k-1]}`, cmps, swps }); }
  }

  function mergeSort(left, right) {
    if (left < right) {
      const mid = Math.floor((left + right) / 2);
      mergeSort(left, mid);
      mergeSort(mid + 1, right);
      merge(left, mid, right);
    }
  }

  mergeSort(0, a.length - 1);
  steps.push({ arr: [...a], comparing: null, swapping: null, sorted: Array.from({length:a.length},(_,k)=>k), selected: null, pivot: null, left: null, right: null, target: null, desc: `Sorted! ${cmps} comparisons, ${swps} moves.`, cmps, swps });
  return steps;
}

// ── Binary Search ─────────────────────────────────────────────────
function genBinary(arr) {
  const steps = [];
  const a = [...arr].sort((x, y) => x - y);
  const target = parseInt(document.getElementById('search-target').value) || a[Math.floor(a.length / 2)];
  let cmps = 0;
  let low = 0, high = a.length - 1;
  let found = -1;

  steps.push({ arr: [...a], comparing: null, swapping: null, sorted: [], selected: null, pivot: null, left: low, right: high, target, desc: `Search for ${target} in sorted array`, cmps, swps: 0 });

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    cmps++;
    steps.push({ arr: [...a], comparing: [mid], swapping: null, sorted: [], selected: null, pivot: mid, left: low, right: high, target, desc: `mid = ${mid}, a[${mid}] = ${a[mid]}`, cmps, swps: 0 });
    if (a[mid] === target) {
      found = mid;
      steps.push({ arr: [...a], comparing: null, swapping: null, sorted: [mid], selected: mid, pivot: null, left: null, right: null, target, desc: `Found ${target} at index ${mid}!`, cmps, swps: 0 });
      break;
    } else if (a[mid] < target) {
      steps.push({ arr: [...a], comparing: null, swapping: null, sorted: [], selected: null, pivot: null, left: mid+1, right: high, target, desc: `${a[mid]} < ${target}, search right half`, cmps, swps: 0 });
      low = mid + 1;
    } else {
      steps.push({ arr: [...a], comparing: null, swapping: null, sorted: [], selected: null, pivot: null, left: low, right: mid-1, target, desc: `${a[mid]} > ${target}, search left half`, cmps, swps: 0 });
      high = mid - 1;
    }
  }

  if (found === -1) {
    steps.push({ arr: [...a], comparing: null, swapping: null, sorted: [], selected: null, pivot: null, left: null, right: null, target, desc: `${target} not found in array`, cmps, swps: 0 });
  }
  return steps;
}

// ── Two Pointers ──────────────────────────────────────────────────
function genTwo(arr) {
  const steps = [];
  const a = [...arr].sort((x, y) => x - y);
  const target = parseInt(document.getElementById('search-target').value) || Math.floor((a[0] + a[a.length-1]) * 0.7);
  let cmps = 0;
  let left = 0, right = a.length - 1;
  let found = false;

  steps.push({ arr: [...a], comparing: null, swapping: null, sorted: [], selected: null, pivot: null, left, right, target, desc: `Find pair summing to ${target}. L=${left}, R=${right}`, cmps, swps: 0 });

  while (left < right) {
    const sum = a[left] + a[right];
    cmps++;
    steps.push({ arr: [...a], comparing: [left, right], swapping: null, sorted: [], selected: null, pivot: null, left, right, target, desc: `a[${left}] + a[${right}] = ${a[left]} + ${a[right]} = ${sum}`, cmps, swps: 0 });
    if (sum === target) {
      found = true;
      steps.push({ arr: [...a], comparing: null, swapping: null, sorted: [left, right], selected: null, pivot: null, left, right, target, desc: `Found pair! (${a[left]}, ${a[right]}) sums to ${target}`, cmps, swps: 0 });
      break;
    } else if (sum < target) {
      steps.push({ arr: [...a], comparing: null, swapping: null, sorted: [], selected: null, pivot: null, left: left+1, right, target, desc: `${sum} < ${target}, move left pointer right`, cmps, swps: 0 });
      left++;
    } else {
      steps.push({ arr: [...a], comparing: null, swapping: null, sorted: [], selected: null, pivot: null, left, right: right-1, target, desc: `${sum} > ${target}, move right pointer left`, cmps, swps: 0 });
      right--;
    }
  }

  if (!found) {
    steps.push({ arr: [...a], comparing: null, swapping: null, sorted: [], selected: null, pivot: null, left: null, right: null, target, desc: `No pair found that sums to ${target}`, cmps, swps: 0 });
  }
  return steps;
}

// ── Build & render ────────────────────────────────────────────────
function buildSteps() {
  stopPlay();
  const arr = getArray();
  if (arr.length === 0) return;

  // show/hide target input
  const targetRow = document.getElementById('target-row');
  if (currentAlgo === 'binary' || currentAlgo === 'two') {
    targetRow.style.display = 'flex';
  } else {
    targetRow.style.display = 'none';
  }

  if      (currentAlgo === 'bubble')    steps = genBubble(arr);
  else if (currentAlgo === 'selection') steps = genSelection(arr);
  else if (currentAlgo === 'insertion') steps = genInsertion(arr);
  else if (currentAlgo === 'quick')     steps = genQuick(arr);
  else if (currentAlgo === 'merge')     steps = genMerge(arr);
  else if (currentAlgo === 'binary')    steps = genBinary(arr);
  else if (currentAlgo === 'two')       steps = genTwo(arr);

  currentStep = 0;
  renderStep(0);
  saveSession('array', currentAlgo, document.getElementById('arr-input').value, steps.length, false);
}

function renderStep(idx) {
  if (!steps.length) return;
  const s = steps[idx];
  const container = document.getElementById('bars-container');
  const maxVal = Math.max(...s.arr);
  const MAX_H = 160;

  container.innerHTML = s.arr.map((val, i) => {
    let cls = 'default';
    if (s.sorted   && s.sorted.includes(i))    cls = 'sorted';
    if (s.selected === i)                       cls = 'selected';
    if (s.pivot    === i)                       cls = 'pivot';
    if (s.comparing && s.comparing.includes(i)) cls = 'comparing';
    if (s.swapping  && s.swapping.includes(i))  cls = 'swapping';

    // highlight active window for merge/quick/binary/two
    const inWindow = s.left !== null && s.right !== null && i >= s.left && i <= s.right;
    const borderStyle = inWindow && cls === 'default' ? 'border: 1px solid var(--accent);' : '';

    const h = Math.max(14, Math.round((val / maxVal) * MAX_H));
    const ptr = getPointerLabel(s, i);

    return `<div class="bar-col">
      <div class="bar ${cls}" style="height:${h}px; ${borderStyle}"></div>
      <div class="bar-val">${val}</div>
      <div class="bar-ptr">${ptr}</div>
    </div>`;
  }).join('');

  document.getElementById('step-badge').textContent  = `step ${idx} / ${steps.length - 1}`;
  document.getElementById('step-desc').textContent   = s.desc;
  document.getElementById('step-stats').textContent  = `cmps: ${s.cmps}   swaps: ${s.swps}`;
  document.getElementById('btn-back').disabled = idx === 0;
  document.getElementById('btn-fwd').disabled  = idx === steps.length - 1;
}

function getPointerLabel(s, i) {
  if (s.comparing && s.comparing[0] === i) return 'i';
  if (s.comparing && s.comparing[1] === i) return 'j';
  if (s.swapping  && s.swapping[0]  === i) return 'i↔';
  if (s.swapping  && s.swapping[1]  === i) return '↔j';
  if (s.selected  === i)                   return 'min';
  if (s.pivot     === i)                   return 'pivot';
  if (s.left      === i)                   return 'L';
  if (s.right     === i)                   return 'R';
  return '';
}

// ── Playback ──────────────────────────────────────────────────────
function stepForward() {
  if (currentStep < steps.length - 1) {
    currentStep++;
    renderStep(currentStep);
    if (currentStep === steps.length - 1) {
      saveSession('array', currentAlgo, document.getElementById('arr-input').value, steps.length, true);
    }
  } else stopPlay();
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
    if (currentStep < steps.length - 1) { currentStep++; renderStep(currentStep); }
    else stopPlay();
  }, SPEEDS[speedIdx]);
}

function stopPlay() {
  clearInterval(playTimer);
  playTimer = null;
  const icon = document.getElementById('play-icon');
  if (icon) icon.className = 'ti ti-player-play';
  if (steps.length > 0 && currentStep >= steps.length - 1) {
    saveSession('array', currentAlgo, document.getElementById('arr-input').value, steps.length, true);
  }
}

function resetVis() {
  stopPlay(); currentStep = 0; buildSteps();
}

function setAlgo(name) {
  currentAlgo = name;
  document.querySelectorAll('.algo-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.algo === name);
  });
  const c = COMPLEXITY[name];
  document.getElementById('complexity-time').textContent  = `Time: ${c.time}`;
  document.getElementById('complexity-space').textContent = `Space: ${c.space}`;
  buildSteps();
}

function updateSpeed(v) {
  speedIdx = parseInt(v) - 1;
  document.getElementById('speed-label').textContent = `×${v}`;
  if (playTimer) { stopPlay(); startPlay(); }
}

// ── Phase 2: Groq integration ─────────────────────────────────────
async function runGroq() {
  const code   = document.getElementById('user-code').value.trim();
  const input  = document.getElementById('gemini-input').value.trim();
  const status = document.getElementById('gemini-status');
  const btn    = document.getElementById('gemini-btn');

  if (!code)  { status.textContent = 'Please paste your code first.'; return; }
  if (!input) { status.textContent = 'Please enter a test input.';    return; }

  btn.disabled       = true;
  btn.textContent    = 'Parsing with Groq...';
  status.textContent = 'Sending to Groq — this takes 3-5 seconds...';
  status.style.color = 'var(--amber)';

  try {
    const res = await fetch('/api/trace', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ code, input })
    });

    const data = await res.json();

    if (data.error) {
      status.textContent = 'Error: ' + data.error;
      status.style.color = 'var(--coral)';
      return;
    }

    // route to the right visualizer based on detected type
    if (data.type === 'array') {
      if (typeof steps !== 'undefined') {
        steps = data.steps;
        currentStep = 0;
        if (steps.length > 0) {
          document.getElementById('arr-input').value = steps[0].arr.join(', ');
        }
        stopPlay();
        renderStep(0);
      } else {
        window.location.href = '/?groq=' + encodeURIComponent(JSON.stringify(data));
      }

    } else if (data.type === 'tree') {
      if (typeof treeSteps !== 'undefined') {
        // convert Groq tree steps to our format
        treeSteps = data.steps.map(s => ({
          tree:      buildBSTFromArray(s.tree),
          highlight: s.highlight || [],
          inserted:  s.inserted  || null,
          traversal: s.traversal || [],
          desc:      s.desc
        }));
        treeStep = 0;
        renderTree(0);
      } else {
        status.textContent = 'Tree code detected — switch to the Trees page to visualize it.';
        status.style.color = 'var(--amber)';
        return;
      }

    } else if (data.type === 'linkedlist') {
      if (typeof llSteps !== 'undefined') {
        llSteps = data.steps;
        llStep  = 0;
        renderLL(0);
      } else {
        status.textContent = 'Linked list code detected — switch to the Linked List page.';
        status.style.color = 'var(--amber)';
        return;
      }
    }

    status.textContent = `Groq detected: ${data.type} — ${data.steps.length} steps generated.`;
    status.style.color = 'var(--green)';

  } catch (err) {
    status.textContent = 'Network error: ' + err.message;
    status.style.color = 'var(--coral)';
  } finally {
    btn.disabled    = false;
    btn.textContent = 'Visualize My Code';
  }
}

// helper used by tree page to rebuild BST from value array
function buildBSTFromArray(values) {
  if (!values || !values.length) return new BST();
  const bst = new BST();
  values.forEach(v => bst.insert(v));
  return bst;
}
async function saveSession(type, algorithm, inputData, stepsCount, completed) {
  try {
    await fetch('/api/save-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type,
        algorithm,
        input_data: inputData,
        steps_count: stepsCount,
        completed
      })
    });
  } catch (e) {
    console.log('Session save failed:', e);
  }
}
// ── Init ──────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', buildSteps);