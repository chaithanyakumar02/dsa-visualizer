// ── State ─────────────────────────────────────────────────────────
let llSteps   = [];
let llStep    = 0;
let llTimer   = null;
let llSpeed   = 2;
let currentOp = 'insert-tail';
const LSPEEDS = [900, 500, 250, 120, 60];

// ── Linked List data structure ────────────────────────────────────
class LLNode {
  constructor(val) {
    this.val  = val;
    this.next = null;
  }
}

class LinkedList {
  constructor() { this.head = null; }

  toArray() {
    const arr = [];
    let cur = this.head;
    while (cur) { arr.push(cur.val); cur = cur.next; }
    return arr;
  }

  clone() {
    const ll = new LinkedList();
    const arr = this.toArray();
    for (let i = arr.length - 1; i >= 0; i--) {
      const n  = new LLNode(arr[i]);
      n.next   = ll.head;
      ll.head  = n;
    }
    return ll;
  }

  insertHead(val) {
    const n   = new LLNode(val);
    n.next    = this.head;
    this.head = n;
  }

  insertTail(val) {
    const n = new LLNode(val);
    if (!this.head) { this.head = n; return; }
    let cur = this.head;
    while (cur.next) cur = cur.next;
    cur.next = n;
  }

  insertAt(val, pos) {
    if (pos === 0) { this.insertHead(val); return; }
    const n = new LLNode(val);
    let cur = this.head;
    for (let i = 0; i < pos - 1 && cur; i++) cur = cur.next;
    if (!cur) { this.insertTail(val); return; }
    n.next   = cur.next;
    cur.next = n;
  }

  deleteVal(val) {
    if (!this.head) return;
    if (this.head.val === val) { this.head = this.head.next; return; }
    let cur = this.head;
    while (cur.next && cur.next.val !== val) cur = cur.next;
    if (cur.next) cur.next = cur.next.next;
  }

  reverse() {
    let prev = null, cur = this.head;
    while (cur) {
      const next = cur.next;
      cur.next   = prev;
      prev       = cur;
      cur        = next;
    }
    this.head = prev;
  }
}

// ── Step generators ───────────────────────────────────────────────
function makeStep(ll, active, connecting, desc, found = [], newNode = null) {
  return {
    list: ll.toArray(),
    active,
    connecting,
    found,
    newNode,
    desc
  };
}

function genInsertHead(ll, val) {
  const steps = [];
  steps.push(makeStep(ll, null, null, `Insert ${val} at head — create new node`));
  steps.push(makeStep(ll, 0, null, `New node ${val} will point to current head`, [], val));
  ll.insertHead(val);
  steps.push(makeStep(ll, 0, null, `Head updated — ${val} is now the head`, [0]));
  return steps;
}

function genInsertTail(ll, val) {
  const steps = [];
  const arr   = ll.toArray();
  steps.push(makeStep(ll, null, null, `Insert ${val} at tail — traverse to end`));
  for (let i = 0; i < arr.length; i++) {
    steps.push(makeStep(ll, i, null,
      `Visiting node ${arr[i]}${i === arr.length - 1 ? ' — this is the tail' : ' → move next'}`));
  }
  ll.insertTail(val);
  const newArr = ll.toArray();
  steps.push(makeStep(ll, newArr.length - 1,
    [newArr.length - 2, newArr.length - 1],
    `Tail now points to new node ${val}`, [newArr.length - 1]));
  steps.push(makeStep(ll, null, null, `${val} inserted at tail`, [newArr.length - 1]));
  return steps;
}

function genInsertAt(ll, val, pos) {
  const steps = [];
  const arr   = ll.toArray();
  steps.push(makeStep(ll, null, null, `Insert ${val} at position ${pos}`));
  for (let i = 0; i < Math.min(pos, arr.length); i++) {
    steps.push(makeStep(ll, i, null,
      `Traverse to position ${i}${i === pos - 1 ? ' — insert after this node' : ''}`));
  }
  ll.insertAt(val, pos);
  const newArr = ll.toArray();
  const idx    = Math.min(pos, newArr.length - 1);
  steps.push(makeStep(ll, idx, [idx - 1, idx], `${val} inserted at position ${pos}`, [idx]));
  return steps;
}

function genDelete(ll, val) {
  const steps = [];
  const arr   = ll.toArray();
  const idx   = arr.indexOf(val);
  steps.push(makeStep(ll, null, null, `Delete node with value ${val}`));

  if (idx === -1) {
    steps.push(makeStep(ll, null, null, `${val} not found in list`));
    return steps;
  }

  for (let i = 0; i <= idx; i++) {
    steps.push(makeStep(ll, i, null,
      `Visiting ${arr[i]}${arr[i] === val ? ' — found target!' : ''}`));
  }

  if (idx === 0) {
    steps.push(makeStep(ll, 0, null,
      `Head node ${val} removed — head moves to next`));
  } else {
    steps.push(makeStep(ll, idx, [idx - 1, idx + 1],
      `${arr[idx - 1]} now points to ${arr[idx + 1] ?? 'null'} — bypassing ${val}`));
  }

  ll.deleteVal(val);
  steps.push(makeStep(ll, null, null, `${val} deleted successfully`));
  return steps;
}

function genSearch(ll, val) {
  const steps = [];
  const arr   = ll.toArray();
  steps.push(makeStep(ll, null, null, `Search for ${val} — start at head`));

  for (let i = 0; i < arr.length; i++) {
    steps.push(makeStep(ll, i, null,
      `Check node ${arr[i]} — ${arr[i] === val ? 'found!' : 'not a match, move next'}`));
    if (arr[i] === val) {
      steps.push(makeStep(ll, i, null, `${val} found at position ${i}!`, [i]));
      return steps;
    }
  }
  steps.push(makeStep(ll, null, null, `${val} not found in list`));
  return steps;
}

function genReverse(ll) {
  const steps = [];
  const arr   = ll.toArray();
  const n     = arr.length;
  steps.push(makeStep(ll, null, null, `Reverse — use prev, cur, next pointers`));

  for (let i = 0; i < n; i++) {
    steps.push(makeStep(ll, i, null, `cur = ${arr[i]}, reverse its pointer`));
    if (i > 0) {
      steps.push(makeStep(ll, i, [i, i - 1], `${arr[i]} → ${arr[i - 1]} (pointer reversed)`));
    } else {
      steps.push(makeStep(ll, i, null, `${arr[i]} → null (becomes new tail)`));
    }
  }

  ll.reverse();
  steps.push(makeStep(ll, null, null,
    `List reversed! New head = ${ll.head?.val}`,
    Array.from({ length: n }, (_, k) => k)));
  return steps;
}

// ── Current list state ────────────────────────────────────────────
let currentLL = new LinkedList();

function initList() {
  const raw  = document.getElementById('ll-input').value;
  const vals = raw.split(',')
    .map(s => parseInt(s.trim()))
    .filter(n => !isNaN(n))
    .slice(0, 12);
  currentLL = new LinkedList();
  vals.forEach(v => currentLL.insertTail(v));
}

function showInitialList(msg) {
  initList();
  llSteps = [{
    list:       currentLL.toArray(),
    active:     null,
    connecting: null,
    found:      [],
    newNode:    null,
    desc:       msg || 'Enter a value → pick an operation → press Run or Play.'
  }];
  llStep = 0;
  renderLL(0);
}

// ── Build operation ───────────────────────────────────────────────
function buildOp(op) {
  currentOp = op;
  stopLL();

  // highlight active tab
  document.querySelectorAll('.ll-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.op === op);
  });

  // reverse needs no value
  if (op === 'reverse') {
    initList();
    llSteps = genReverse(currentLL.clone());
    llStep  = 0;
    renderLL(0);
    return;
  }

  const val = parseInt(document.getElementById('ll-val').value);
  const pos = parseInt(document.getElementById('ll-pos').value) || 0;

  if (isNaN(val)) {
    showInitialList(`Enter a value in the "Value" box, then click Run or Play.`);
    return;
  }

  initList();
  const ll = currentLL.clone();

  if      (op === 'insert-head') llSteps = genInsertHead(ll, val);
  else if (op === 'insert-tail') llSteps = genInsertTail(ll, val);
  else if (op === 'insert-at')   llSteps = genInsertAt(ll, val, pos);
  else if (op === 'delete')      llSteps = genDelete(ll, val);
  else if (op === 'search')      llSteps = genSearch(ll, val);

  llStep = 0;
  renderLL(0);
}

function runCurrentOp() {
  buildOp(currentOp);
}

// ── SVG renderer ──────────────────────────────────────────────────
function renderLL(idx) {
  if (!llSteps.length) return;
  const s      = llSteps[idx];
  const svg    = document.getElementById('ll-svg');
  const list   = s.list;
  const n      = list.length;

  const NODE_W  = 60;
  const NODE_H  = 40;
  const GAP     = 48;
  const START_X = 40;
  const Y       = 80;

  const totalW = n * (NODE_W + GAP) + 80;
  svg.setAttribute('viewBox', `0 0 ${Math.max(totalW, 400)} 180`);

  let html = '';

  list.forEach((val, i) => {
    const x            = START_X + i * (NODE_W + GAP);
    const isActive     = s.active === i;
    const isFound      = s.found && s.found.includes(i);
    const isNew        = s.newNode === val && i === 0;
    const isConnecting = s.connecting &&
      (s.connecting[0] === i || s.connecting[1] === i);

    let fill   = '#22263a';
    let stroke = '#2e3248';
    let color  = '#e4e6f0';

    if (isFound)      { fill = '#0f6e56'; stroke = '#1d9e75'; }
    if (isActive)     { fill = '#534ab7'; stroke = '#7f77dd'; }
    if (isNew)        { fill = '#1d9e75'; stroke = '#5dcaa5'; }
    if (isConnecting) { fill = '#7a4f0d'; stroke = '#ef9f27'; }

    // value box
    html += `<rect x="${x}" y="${Y}" width="${NODE_W - 16}" height="${NODE_H}"
      rx="6" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>`;

    // pointer box
    html += `<rect x="${x + NODE_W - 16}" y="${Y}" width="16" height="${NODE_H}"
      rx="0" fill="${stroke}" opacity="0.5"/>`;

    // value text
    html += `<text x="${x + (NODE_W - 16) / 2}" y="${Y + NODE_H / 2 + 5}"
      text-anchor="middle" fill="${color}"
      font-size="13" font-family="monospace" font-weight="600">${val}</text>`;

    // index label
    html += `<text x="${x + (NODE_W - 16) / 2}" y="${Y + NODE_H + 18}"
      text-anchor="middle" fill="#7b82a0"
      font-size="11" font-family="monospace">[${i}]</text>`;

    // arrow to next
    if (i < n - 1) {
      const ax = x + NODE_W;
      const ay = Y + NODE_H / 2;
      const bx = ax + GAP - 8;
      const isHighlight = s.connecting &&
        ((s.connecting[0] === i && s.connecting[1] === i + 1) ||
         (s.connecting[0] === i + 1 && s.connecting[1] === i));
      const arrowColor = isHighlight ? '#ef9f27' : '#2e3248';
      html += `<line x1="${ax}" y1="${ay}" x2="${bx}" y2="${ay}"
        stroke="${arrowColor}" stroke-width="2"
        marker-end="url(#arrowhead)"/>`;
    }

    // null label at tail
    if (i === n - 1) {
      html += `<text x="${x + NODE_W + 10}" y="${Y + NODE_H / 2 + 5}"
        fill="#7b82a0" font-size="12" font-family="monospace">null</text>`;
    }
  });

  // head label + arrow
  if (n > 0) {
    const hx = START_X + (NODE_W - 16) / 2;
    html += `<text x="${hx}" y="${Y - 14}" text-anchor="middle"
      fill="#7f77dd" font-size="11" font-family="monospace">head</text>`;
    html += `<line x1="${hx}" y1="${Y - 9}" x2="${hx}" y2="${Y}"
      stroke="#7f77dd" stroke-width="1.5"
      marker-end="url(#arrowhead-purple)"/>`;
  }

  // empty list
  if (n === 0) {
    html += `<text x="200" y="90" text-anchor="middle"
      fill="#7b82a0" font-size="14" font-family="monospace">Empty list — null</text>`;
  }

  svg.innerHTML = `
    <defs>
      <marker id="arrowhead" viewBox="0 0 10 10" refX="8" refY="5"
        markerWidth="6" markerHeight="6" orient="auto">
        <path d="M2 1L8 5L2 9" fill="none" stroke="#2e3248"
          stroke-width="1.5" stroke-linecap="round"/>
      </marker>
      <marker id="arrowhead-purple" viewBox="0 0 10 10" refX="8" refY="5"
        markerWidth="6" markerHeight="6" orient="auto">
        <path d="M2 1L8 5L2 9" fill="none" stroke="#7f77dd"
          stroke-width="1.5" stroke-linecap="round"/>
      </marker>
    </defs>
    ${html}`;

  document.getElementById('ll-step-badge').textContent =
    `step ${idx} / ${llSteps.length - 1}`;
  document.getElementById('ll-step-desc').textContent = s.desc;
  document.getElementById('ll-btn-back').disabled = idx === 0;
  document.getElementById('ll-btn-fwd').disabled  = idx === llSteps.length - 1;
}

// ── Playback ──────────────────────────────────────────────────────
function llStepFwd() {
  if (llSteps.length <= 1) { buildOp(currentOp); return; }
  if (llStep < llSteps.length - 1) { llStep++; renderLL(llStep); }
  else stopLL();
}

function llStepBack() {
  if (llStep > 0) { llStep--; renderLL(llStep); }
}

function llTogglePlay() {
  if (llSteps.length <= 1) {
    buildOp(currentOp);
    if (llSteps.length <= 1) return;
  }
  if (llTimer) stopLL();
  else startLL();
}

function startLL() {
  if (llStep >= llSteps.length - 1) llStep = 0;
  document.getElementById('ll-play-icon').className = 'ti ti-player-pause';
  llTimer = setInterval(() => {
    if (llStep < llSteps.length - 1) { llStep++; renderLL(llStep); }
    else stopLL();
  }, LSPEEDS[llSpeed]);
}

function stopLL() {
  clearInterval(llTimer);
  llTimer = null;
  const icon = document.getElementById('ll-play-icon');
  if (icon) icon.className = 'ti ti-player-play';
}

function llUpdateSpeed(v) {
  llSpeed = parseInt(v) - 1;
  document.getElementById('ll-speed-label').textContent = `×${v}`;
  if (llTimer) { stopLL(); startLL(); }
}

function llRandom() {
  const n   = 5 + Math.floor(Math.random() * 4);
  const arr = Array.from({ length: n }, () => 1 + Math.floor(Math.random() * 99));
  document.getElementById('ll-input').value = arr.join(', ');
  showInitialList('Random list loaded. Pick an operation and press Run.');
}

// ── Groq integration ──────────────────────────────────────────────
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

    if (data.type === 'linkedlist') {
      llSteps = data.steps;
      llStep  = 0;
      renderLL(0);
    } else {
      status.textContent = `${data.type} code detected — switch to the right page.`;
      status.style.color = 'var(--amber)';
      return;
    }

    status.textContent = `Groq generated ${data.steps.length} steps.`;
    status.style.color = 'var(--green)';

  } catch (err) {
    status.textContent = 'Network error: ' + err.message;
    status.style.color = 'var(--coral)';
  } finally {
    btn.disabled    = false;
    btn.textContent = 'Visualize My Code';
  }
}

// ── Init ──────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  showInitialList('Enter a value → pick an operation → press Run or Play.');
});