// Rank It — the ranking game: things show up above your head one by one.
// Tap a free slot on the left to rank it. No moving things once they're placed!
var LISTS = [
  { title: "Rank these snacks", items: ["🍕", "🍔", "🌮", "🍣", "🍩", "🍟", "🌭", "🍦"] },
  { title: "Rank these pets", items: ["🐶", "🐱", "🐹", "🐰", "🐍", "🐦", "🐠", "🐢"] },
  { title: "Rank these fruits", items: ["🍎", "🍌", "🍇", "🍓", "🍍", "🥝", "🍉", "🥭"] },
  { title: "Rank these sports", items: ["⚽", "🏀", "🏈", "🎾", "⚾", "🏐", "⛳", "🏒"] },
  { title: "Rank these drinks", items: ["☕", "🧋", "🥤", "🍵", "🧃", "🥛", "🍹", "💧"] }
];
var SLOTS = 5;

var list, queue, slots, current, doneTime;

function start(lens) { newRound(lens); }

function newRound(lens) {
  list = LISTS[Math.floor(lens.random(0, LISTS.length))];
  queue = list.items.slice();
  for (var i = queue.length - 1; i > 0; i--) {
    var j = Math.floor(lens.random(0, i + 1));
    var t = queue[i]; queue[i] = queue[j]; queue[j] = t;
  }
  queue = queue.slice(0, SLOTS);
  slots = [];
  for (var k = 0; k < SLOTS; k++) slots.push(null);
  current = queue.shift();
  doneTime = -1;
}

// Slot k's centre on screen.
function slotY(lens, k) {
  var top = lens.screen.top * 0.78, bottom = lens.screen.top * 0.4;
  return top - (top - bottom) * k / (SLOTS - 1);
}

function tap(lens, x, y) {
  if (!current) {
    if (lens.time - doneTime > 0.6) newRound(lens);
    return;
  }
  // The nearest free slot to the tap.
  var best = -1, bestD = 1e9;
  for (var k = 0; k < SLOTS; k++) {
    if (slots[k]) continue;
    var d = Math.abs(y - slotY(lens, k));
    if (d < bestD) { bestD = d; best = k; }
  }
  if (best < 0 || bestD > 0.2) return;
  slots[best] = current;
  lens.burst("✨", 0.3, slotY(lens, best), 8, "Explode", 0.04);
  current = queue.shift() || null;
  if (!current) { doneTime = lens.time; lens.flash(1, 0.95, 0.7); }
}

function update(lens, dt) {
  var s = lens.screen;
  lens.text(list.title, 0.5, s.top - 0.18, 0.065);
  for (var k = 0; k < SLOTS; k++) {
    var y = slotY(lens, k);
    lens.text((k + 1) + ".", 0.1, y, 0.08);
    lens.sprite("⬜", 0.3, y, 0.15, 0, 0.25);
    if (slots[k]) lens.sprite(slots[k], 0.3, y, 0.13);
  }
  if (current) {
    var f = lens.face;
    var x = f ? Math.max(0.55, f.x) : 0.68;
    var hy = f ? Math.min(f.y + f.width * 1.0, s.top - 0.36) : s.top * 0.6;
    var bob = Math.sin(lens.time * 4) * 0.01;
    lens.sprite(current, x, hy + bob, 0.18);
    lens.text("Tap a slot to rank it", 0.5, s.top - 0.27, 0.045, 0.85);
  } else {
    lens.text("Ranked! 🏆", 0.5, s.top - 0.27, 0.06);
    if (lens.time - doneTime > 0.6) lens.text("Tap for a new list", 0.5, s.top * 0.3, 0.05, 0.85);
  }
}
