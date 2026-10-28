// ---------- Data: array of objects with question + answer ----------
const BASE = [
  {c:'HTML',q:'What does <!DOCTYPE html> do?',a:'It tells the browser to use <b>standards mode</b> instead of quirks mode, so layout follows modern specs.'},
  {c:'HTML',q:'Why should every <img> have an alt attribute?',a:'It describes the image to screen readers, shows if the image fails to load, and helps search engines.'},
  {c:'HTML',q:'What is semantic HTML?',a:'Using elements that describe meaning, like <code>&lt;nav&gt;</code> and <code>&lt;article&gt;</code>, instead of generic <code>&lt;div&gt;</code>s. Better for accessibility and SEO.'},
  {c:'HTML',q:'What is the difference between defer and async on a script?',a:'Both download without blocking parsing. <code>defer</code> runs in order after the HTML is parsed; <code>async</code> runs as soon as it arrives, in any order.'},
  {c:'CSS',q:'Which properties create a 3D flip effect?',a:'<code>perspective</code> on the parent, <code>transform-style: preserve-3d</code> on the card, and <code>rotateY(180deg)</code> to flip it.'},
  {c:'CSS',q:'What does backface-visibility: hidden do?',a:'It hides an element’s reverse side when rotated away, so the front and back faces never overlap.'},
  {c:'CSS',q:'Flexbox or Grid: what’s the difference?',a:'Flexbox lays out in <b>one dimension</b> (row or column). Grid handles <b>two dimensions</b> at once.'},
  {c:'CSS',q:'What are the box model layers, inside out?',a:'Content, padding, border, then margin.'},
  {c:'CSS',q:'What is CSS specificity?',a:'The rule that decides which style wins: inline styles beat IDs, IDs beat classes, and classes beat element selectors.'},
  {c:'JavaScript',q:'What is the difference between let and const?',a:'Both are block-scoped. <code>const</code> can’t be reassigned (its object contents can still change). <code>let</code> can be reassigned.'},
  {c:'JavaScript',q:'What does Array.map() return?',a:'A <b>new array</b> of the same length, with each item replaced by your function’s result. The original is unchanged.'},
  {c:'JavaScript',q:'What’s the difference between == and ===?',a:'<code>==</code> converts types first (<code>"5" == 5</code> is true). <code>===</code> checks value and type. Prefer <code>===</code>.'},
  {c:'JavaScript',q:'What is a closure?',a:'A function that remembers variables from the scope where it was created, even after that outer function has finished.'},
  {c:'JavaScript',q:'How do you shuffle an array fairly?',a:'Use <b>Fisher–Yates</b>: loop from the end and swap each item with a random item at or before it. <code>sort(() =&gt; Math.random() - .5)</code> is biased.'},
  {c:'JavaScript',q:'What is event delegation?',a:'Attaching one listener to a parent and using <code>event.target</code> to handle clicks on its children. It works for elements added later.'}
].map((c, i) => ({...c, id: 'b' + i}));

// ---------- State ----------
const $ = id => document.getElementById(id);
const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch (e) { return d; } };
const store = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };

let custom = load('flip-custom', []);
let known = new Set(load('flip-known', []));
let stars = new Set(load('flip-stars', []));
let cards = [...BASE, ...custom];
let order = cards.map(c => c.id);
let deck = [], pos = 0, flipped = false, filter = 'All';
let session = {tried: 0, right: 0, streak: 0, start: Date.now()};
const FILTERS = ['All', 'HTML', 'CSS', 'JavaScript', 'Custom', 'Bookmarked', 'To review'];
const byId = id => cards.find(c => c.id === id);

// ---------- Deck logic ----------
function build() {
  order = order.filter(id => byId(id));
  cards.forEach(c => { if (!order.includes(c.id)) order.push(c.id); });
  deck = order.filter(id => {
    const c = byId(id);
    if (filter === 'All') return true;
    if (filter === 'Bookmarked') return stars.has(id);
    if (filter === 'To review') return !known.has(id);
    return c.c === filter;
  });
  pos = 0;
}
const say = t => $('status').textContent = t;
function setFlip(v) { flipped = v; $('card').classList.toggle('flipped', v); $('card').setAttribute('aria-pressed', v); }
function showPanel(title, text, btn, fn) {
  $('pTitle').textContent = title; $('pText').textContent = text;
  $('pBtn').textContent = btn; $('pBtn').onclick = fn; $('panel').hidden = false;
}

function render(swap) {
  const has = deck.length > 0;
  $('scene').style.display = $('controls').style.display = $('rate').style.display = has ? '' : 'none';
  if (has) $('panel').hidden = true;
  $('chips').querySelectorAll('.chip').forEach(b => b.setAttribute('aria-pressed', b.dataset.f === filter));
  updateStats();
  if (!has) {
    $('count').textContent = 'No cards'; $('pct').textContent = ''; $('bar').style.width = '0';
    const msg = filter === 'To review' ? ['All caught up', 'You have learned every card.']
      : filter === 'Bookmarked' ? ['No bookmarks yet', 'Tap the star on a card to save it here.']
      : ['Nothing here yet', 'Add your own card to fill this category.'];
    showPanel(msg[0], msg[1], 'Show all cards', () => { filter = 'All'; build(); render(true); });
    return;
  }
  const id = deck[pos], c = byId(id), pct = Math.round((pos + 1) / deck.length * 100);
  $('card').classList.add('noanim'); setFlip(false);
  $('q').textContent = c.q; $('a').innerHTML = c.a; $('tag').textContent = c.c + (known.has(id) ? ' · Learned' : '');
  const s = $('star'); s.textContent = stars.has(id) ? '★' : '☆'; s.classList.toggle('on', stars.has(id));
  $('del').hidden = !id.startsWith('c');
  void $('card').offsetWidth; $('card').classList.remove('noanim');
  $('count').textContent = `Card ${pos + 1} of ${deck.length}`;
  $('pct').textContent = pct + '%'; $('bar').style.width = pct + '%'; $('barwrap').setAttribute('aria-valuenow', pct);
  $('prev').disabled = pos === 0; $('next').disabled = pos === deck.length - 1;
  if (swap) { const sc = $('scene'); sc.classList.remove('swap'); void sc.offsetWidth; sc.classList.add('swap'); }
}

function updateStats() {
  $('sLearned').textContent = `${known.size}/${cards.length}`;
  $('sAcc').textContent = session.tried ? Math.round(session.right / session.tried * 100) + '%' : '0%';
  $('sStreak').textContent = session.streak;
}

// ---------- Actions ----------
function go(d) { const n = pos + d; if (n < 0 || n >= deck.length) return; pos = n; say(''); render(true); }
function mark(ok) {
  if (!deck.length) return;
  const id = deck[pos];
  ok ? known.add(id) : known.delete(id); store('flip-known', [...known]);
  session.tried++; ok ? (session.right++, session.streak++) : session.streak = 0;
  if (pos < deck.length - 1) { pos++; say(ok ? 'Nice, marked as learned.' : 'Saved for another round.'); render(true); }
  else {
    render(false);
    const acc = Math.round(session.right / session.tried * 100);
    $('scene').style.display = $('controls').style.display = $('rate').style.display = 'none';
    showPanel('Deck complete', `${session.right} of ${session.tried} answers right (${acc}%). ${known.size} of ${cards.length} cards learned.`,
      known.size < cards.length ? 'Review what’s left' : 'Study again',
      () => { filter = known.size < cards.length ? 'To review' : 'All'; build(); say(''); render(true); });
  }
}
function shuffle() {
  for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
  build(); say('Deck shuffled.'); render(true);
}
function toggleStar() {
  if (!deck.length) return;
  const id = deck[pos]; stars.has(id) ? stars.delete(id) : stars.add(id);
  store('flip-stars', [...stars]); say(stars.has(id) ? 'Bookmarked.' : 'Bookmark removed.');
  const s = $('star'); s.textContent = stars.has(id) ? '★' : '☆'; s.classList.toggle('on', stars.has(id));
}
function resetAll() {
  known.clear(); stars.clear(); store('flip-known', []); store('flip-stars', []);
  session = {tried: 0, right: 0, streak: 0, start: Date.now()}; filter = 'All'; build(); say('Progress reset.'); render(true);
}
function addCard(cat, q, a) {
  const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const c = {id: 'c' + Date.now(), c: cat, q: q.trim(), a: esc(a.trim())};
  custom.push(c); store('flip-custom', custom); cards.push(c); order.push(c.id);
  filter = 'All'; build(); pos = deck.indexOf(c.id); say('Card added.'); render(true);
}
function delCard() {
  const id = deck[pos]; if (!id.startsWith('c')) return;
  custom = custom.filter(c => c.id !== id); store('flip-custom', custom);
  cards = cards.filter(c => c.id !== id); known.delete(id); stars.delete(id);
  const p = pos; build(); pos = Math.min(p, Math.max(deck.length - 1, 0)); say('Card deleted.'); render(true);
}

// ---------- Events ----------
$('chips').innerHTML = FILTERS.map(f => `<button class="chip" data-f="${f}" aria-pressed="false">${f}</button>`).join('');
$('chips').onclick = e => { const b = e.target.closest('.chip'); if (!b) return; filter = b.dataset.f; build(); say(''); render(true); };
$('card').onclick = e => { if (e.target.closest('#star,#del')) return; setFlip(!flipped); };
$('star').onclick = toggleStar;
$('del').onclick = delCard;
$('flip').onclick = () => setFlip(!flipped);
$('prev').onclick = () => go(-1); $('next').onclick = () => go(1);
$('yes').onclick = () => mark(true); $('no').onclick = () => mark(false);
$('shuffle').onclick = shuffle; $('reset').onclick = resetAll;
$('add').onclick = () => { $('form').reset(); $('dlg').showModal(); $('fQ').focus(); };
$('form').onsubmit = e => { if (e.submitter && e.submitter.value === 'save') addCard($('fCat').value, $('fQ').value, $('fA').value); };
$('theme').onclick = () => {
  const r = document.documentElement;
  const dark = r.dataset.theme ? r.dataset.theme === 'dark' : !matchMedia('(prefers-color-scheme: light)').matches;
  r.dataset.theme = dark ? 'light' : 'dark';
};
document.addEventListener('keydown', e => {
  if (e.target.closest('input,textarea,select,dialog')) return;
  if (e.target.closest('button') && (e.key === ' ' || e.key === 'Enter')) return;
  const k = e.key.toLowerCase();
  if (k === 'arrowright') go(1);
  else if (k === 'arrowleft') go(-1);
  else if (k === ' ' || k === 'enter') { e.preventDefault(); if (deck.length) setFlip(!flipped); }
  else if (k === 's') shuffle();
  else if (k === 'b') toggleStar();
  else if (k === 'y' && flipped) mark(true);
  else if (k === 'n' && flipped) mark(false);
});
setInterval(() => {
  const t = Math.floor((Date.now() - session.start) / 1000);
  $('sTime').textContent = Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0');
}, 1000);

build(); render(false);
