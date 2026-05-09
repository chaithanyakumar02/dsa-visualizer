// ── Tree data structure ───────────────────────────────────────────
class Node {
  constructor(val) {
    this.val = val;
    this.left = null;
    this.right = null;
    this.x = 0;
    this.y = 0;
  }
}

class BST {
  constructor() { this.root = null; }

  insert(val) {
    const node = new Node(val);
    if (!this.root) { this.root = node; return; }
    let cur = this.root;
    while (true) {
      if (val < cur.val) {
        if (!cur.left)  { cur.left  = node; return; }
        cur = cur.left;
      } else {
        if (!cur.right) { cur.right = node; return; }
        cur = cur.right;
      }
    }
  }

  clone() {
    const cloneNode = (n) => {
      if (!n) return null;
      const c = new Node(n.val);
      c.left  = cloneNode(n.left);
      c.right = cloneNode(n.right);
      return c;
    };
    const b = new BST();
    b.root = cloneNode(this.root);
    return b;
  }
}

// ── Layout: assign x,y to each node ──────────────────────────────
function layoutTree(root) {
  if (!root) return;
  const NODE_H = 70;
  let counter = 0;

  function assignX(node) {
    if (!node) return;
    assignX(node.left);
    node.x = counter++ * 60 + 40;
    assignX(node.right);
  }

  function assignY(node, depth) {
    if (!node) return;
    node.y = depth * NODE_H + 50;
    assignY(node.left,  depth + 1);
    assignY(node.right, depth + 1);
  }

  assignX(root);
  assignY(root, 0);
}

// ── Collect all nodes as flat list ────────────────────────────────
function collectNodes(root) {
  const nodes = [];
  function dfs(n) {
    if (!n) return;
    nodes.push(n);
    dfs(n.left);
    dfs(n.right);
  }
  dfs(root);
  return nodes;
}

function collectEdges(root) {
  const edges = [];
  function dfs(n) {
    if (!n) return;
    if (n.left)  { edges.push([n, n.left]);  dfs(n.left);  }
    if (n.right) { edges.push([n, n.right]); dfs(n.right); }
  }
  dfs(root);
  return edges;
}

// ── Step generators ───────────────────────────────────────────────
let treeSteps = [];
let treeStep  = 0;
let treeTimer = null;
let treeSpeed = 2;
const TSPEEDS = [900, 500, 250, 120, 60];

function genInsertSteps(values) {
  const steps = [];
  const bst = new BST();

  for (const val of values) {
    // show path to insertion point
    const path = [];
    let cur = bst.root;
    while (cur) {
      path.push(cur.val);
      steps.push({
        tree: bst.clone(),
        highlight: [...path],
        inserted: null,
        traversal: [],
        desc: cur
          ? `Insert ${val}: compare with ${cur.val} → go ${val < cur.val ? 'left' : 'right'}`
          : `Insert ${val}`
      });
      if (val < cur.val) cur = cur.left;
      else               cur = cur.right;
    }

    bst.insert(val);
    steps.push({
      tree: bst.clone(),
      highlight: [],
      inserted: val,
      traversal: [],
      desc: `Inserted ${val} into the tree`
    });
  }
  return steps;
}

function genTraversalSteps(bst, mode) {
  const steps = [];
  const visited = [];

  function inorder(n) {
    if (!n) return;
    inorder(n.left);
    visited.push(n.val);
    steps.push({ tree: bst.clone(), highlight: [n.val], inserted: null, traversal: [...visited], desc: `Inorder: visit ${n.val}` });
    inorder(n.right);
  }

  function preorder(n) {
    if (!n) return;
    visited.push(n.val);
    steps.push({ tree: bst.clone(), highlight: [n.val], inserted: null, traversal: [...visited], desc: `Preorder: visit ${n.val}` });
    preorder(n.left);
    preorder(n.right);
  }

  function postorder(n) {
    if (!n) return;
    postorder(n.left);
    postorder(n.right);
    visited.push(n.val);
    steps.push({ tree: bst.clone(), highlight: [n.val], inserted: null, traversal: [...visited], desc: `Postorder: visit ${n.val}` });
  }

  function bfs(root) {
    if (!root) return;
    const queue = [root];
    while (queue.length) {
      const n = queue.shift();
      visited.push(n.val);
      steps.push({ tree: bst.clone(), highlight: [n.val], inserted: null, traversal: [...visited], desc: `BFS: visit ${n.val}` });
      if (n.left)  queue.push(n.left);
      if (n.right) queue.push(n.right);
    }
  }

  if      (mode === 'inorder')   inorder(bst.root);
  else if (mode === 'preorder')  preorder(bst.root);
  else if (mode === 'postorder') postorder(bst.root);
  else if (mode === 'bfs')       bfs(bst.root);

  steps.push({ tree: bst.clone(), highlight: [], inserted: null, traversal: [...visited], desc: `${mode} traversal complete: [${visited.join(', ')}]` });
  return steps;
}

// ── SVG renderer ──────────────────────────────────────────────────
function renderTree(idx) {
  if (!treeSteps.length) return;
  const s = treeSteps[idx];
  const svg = document.getElementById('tree-svg');

  if (!s.tree.root) {
    svg.innerHTML = `<text x="340" y="100" text-anchor="middle" fill="#7b82a0" font-size="14">Tree is empty</text>`;
    return;
  }

  layoutTree(s.tree.root);
  const nodes = collectNodes(s.tree.root);
  const edges = collectEdges(s.tree.root);

  // auto-size svg height
  const maxY = Math.max(...nodes.map(n => n.y)) + 80;
  const maxX = Math.max(...nodes.map(n => n.x)) + 60;
  svg.setAttribute('viewBox', `0 0 ${Math.max(maxX, 400)} ${maxY}`);

  let html = '';

  // edges
  edges.forEach(([p, c]) => {
    html += `<line x1="${p.x}" y1="${p.y}" x2="${c.x}" y2="${c.y}"
      stroke="#2e3248" stroke-width="2" stroke-linecap="round"/>`;
  });

  // nodes
  nodes.forEach(n => {
    const isHighlight = s.highlight && s.highlight.includes(n.val);
    const isInserted  = s.inserted  === n.val;
    const isTraversal = s.traversal && s.traversal.includes(n.val);
    const isLatest    = s.traversal && s.traversal[s.traversal.length - 1] === n.val;

    let fill   = '#22263a';
    let stroke = '#2e3248';
    let color  = '#e4e6f0';

    if (isTraversal) { fill = '#0f6e56'; stroke = '#1d9e75'; }
    if (isHighlight) { fill = '#534ab7'; stroke = '#7f77dd'; }
    if (isInserted)  { fill = '#1d9e75'; stroke = '#5dcaa5'; }
    if (isLatest)    { fill = '#ef9f27'; stroke = '#fac775'; color = '#0f1117'; }

    html += `
      <circle cx="${n.x}" cy="${n.y}" r="22"
        fill="${fill}" stroke="${stroke}" stroke-width="2"/>
      <text x="${n.x}" y="${n.y + 5}" text-anchor="middle"
        fill="${color}" font-size="13" font-family="monospace" font-weight="600">${n.val}</text>`;
  });

  svg.innerHTML = html;

  // update step info
  document.getElementById('tree-step-badge').textContent = `step ${idx} / ${treeSteps.length - 1}`;
  document.getElementById('tree-step-desc').textContent  = s.desc;

  if (s.traversal && s.traversal.length) {
    document.getElementById('traversal-output').textContent = `Order: [${s.traversal.join(' → ')}]`;
  } else {
    document.getElementById('traversal-output').textContent = '';
  }

  document.getElementById('tree-btn-back').disabled = idx === 0;
  document.getElementById('tree-btn-fwd').disabled  = idx === treeSteps.length - 1;
}

// ── Controls ──────────────────────────────────────────────────────
function treeBuildInsert() {
  stopTree();
  const raw = document.getElementById('tree-input').value;
  const vals = raw.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n)).slice(0, 15);
  if (!vals.length) return;
  treeSteps = genInsertSteps(vals);
  treeStep  = 0;
  renderTree(0);
}

function treeBuildTraversal(mode) {
  stopTree();
  const raw = document.getElementById('tree-input').value;
  const vals = raw.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n)).slice(0, 15);
  if (!vals.length) return;

  // build full tree silently
  const bst = new BST();
  vals.forEach(v => bst.insert(v));
  layoutTree(bst.root);

  treeSteps = genTraversalSteps(bst, mode);
  treeStep  = 0;
  renderTree(0);

  // highlight active tab
  document.querySelectorAll('.tree-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.mode === mode);
  });
}

function treeStepFwd() {
  if (treeStep < treeSteps.length - 1) { treeStep++; renderTree(treeStep); }
  else stopTree();
}

function treeStepBack() {
  if (treeStep > 0) { treeStep--; renderTree(treeStep); }
}

function treeTogglePlay() {
  if (treeTimer) stopTree();
  else startTree();
}

function startTree() {
  if (treeStep >= treeSteps.length - 1) treeStep = 0;
  document.getElementById('tree-play-icon').className = 'ti ti-player-pause';
  treeTimer = setInterval(() => {
    if (treeStep < treeSteps.length - 1) { treeStep++; renderTree(treeStep); }
    else stopTree();
  }, TSPEEDS[treeSpeed]);
}

function stopTree() {
  clearInterval(treeTimer); treeTimer = null;
  const icon = document.getElementById('tree-play-icon');
  if (icon) icon.className = 'ti ti-player-play';
}

function treeUpdateSpeed(v) {
  treeSpeed = parseInt(v) - 1;
  document.getElementById('tree-speed-label').textContent = `×${v}`;
  if (treeTimer) { stopTree(); startTree(); }
}

function treeRandom() {
  const n = 7 + Math.floor(Math.random() * 4);
  const vals = new Set();
  while (vals.size < n) vals.add(5 + Math.floor(Math.random() * 90));
  document.getElementById('tree-input').value = [...vals].join(', ');
  treeBuildInsert();
}

document.addEventListener('DOMContentLoaded', () => {
  treeBuildInsert();
});